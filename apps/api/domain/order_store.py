from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
from typing import Any, Literal, Optional

from ..config import get_settings


@dataclass
class IdempotencyRecord:
    request_hash: str
    response_payload: dict[str, Any]
    order_id: str


class OrderStore:
    def __init__(self, db_path: Path) -> None:
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS orders (
                    order_id TEXT PRIMARY KEY,
                    client_id TEXT NOT NULL,
                    status TEXT NOT NULL,
                    currency TEXT NOT NULL,
                    amount REAL NOT NULL,
                    stripe_session_id TEXT,
                    redirect_url TEXT,
                    cart_json TEXT NOT NULL,
                    customer_json TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS checkout_idempotency (
                    client_id TEXT NOT NULL,
                    idempotency_key TEXT NOT NULL,
                    request_hash TEXT NOT NULL,
                    response_json TEXT NOT NULL,
                    order_id TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    PRIMARY KEY (client_id, idempotency_key)
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS stripe_events (
                    event_id TEXT PRIMARY KEY,
                    created_at TEXT NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS order_status_audit (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    order_id TEXT NOT NULL,
                    client_id TEXT NOT NULL,
                    from_status TEXT,
                    to_status TEXT NOT NULL,
                    reason TEXT,
                    actor_type TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS stripe_webhook_audit (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_id TEXT NOT NULL,
                    livemode INTEGER NOT NULL,
                    account_id TEXT NOT NULL,
                    client_id TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    order_id TEXT,
                    stripe_session_id TEXT,
                    processing_status TEXT NOT NULL,
                    order_status TEXT,
                    error_text TEXT,
                    raw_payload_json TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    UNIQUE (event_id, livemode, account_id, client_id)
                )
                """
            )
            self._ensure_column(
                conn=conn,
                table_name="stripe_webhook_audit",
                column_name="client_id",
                definition="TEXT NOT NULL DEFAULT ''",
            )
            self._ensure_webhook_audit_unique_constraint(conn=conn)
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_orders_client_created ON orders(client_id, created_at DESC)"
            )
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_webhook_audit_created ON stripe_webhook_audit(created_at DESC)"
            )
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_webhook_audit_client_created ON stripe_webhook_audit(client_id, created_at DESC)"
            )
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_order_status_audit_client_order_created ON order_status_audit(client_id, order_id, created_at DESC)"
            )

    def _ensure_column(
        self,
        *,
        conn: sqlite3.Connection,
        table_name: str,
        column_name: str,
        definition: str,
    ) -> None:
        table_info = conn.execute(f"PRAGMA table_info({table_name})").fetchall()
        if any(row["name"] == column_name for row in table_info):
            return
        conn.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {definition}")

    def _ensure_webhook_audit_unique_constraint(self, *, conn: sqlite3.Connection) -> None:
        """
        Migration safety: older DBs may have a UNIQUE constraint without client_id.
        Rebuild the table once so deduplication is tenant-scoped.
        """

        indexes = conn.execute("PRAGMA index_list(stripe_webhook_audit)").fetchall()
        for index_row in indexes:
            if not bool(index_row["unique"]):
                continue
            index_name = index_row["name"]
            index_columns = conn.execute(f"PRAGMA index_info({index_name})").fetchall()
            columns = [column["name"] for column in index_columns]
            if columns == ["event_id", "livemode", "account_id", "client_id"]:
                return

        conn.execute(
            """
            CREATE TABLE stripe_webhook_audit_next (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id TEXT NOT NULL,
                livemode INTEGER NOT NULL,
                account_id TEXT NOT NULL,
                client_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                order_id TEXT,
                stripe_session_id TEXT,
                processing_status TEXT NOT NULL,
                order_status TEXT,
                error_text TEXT,
                raw_payload_json TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE (event_id, livemode, account_id, client_id)
            )
            """
        )
        conn.execute(
            """
            INSERT OR IGNORE INTO stripe_webhook_audit_next (
                id,
                event_id,
                livemode,
                account_id,
                client_id,
                event_type,
                order_id,
                stripe_session_id,
                processing_status,
                order_status,
                error_text,
                raw_payload_json,
                created_at,
                updated_at
            )
            SELECT
                id,
                event_id,
                livemode,
                account_id,
                COALESCE(client_id, ''),
                event_type,
                order_id,
                stripe_session_id,
                processing_status,
                order_status,
                error_text,
                raw_payload_json,
                created_at,
                updated_at
            FROM stripe_webhook_audit
            ORDER BY id ASC
            """
        )
        conn.execute("DROP TABLE stripe_webhook_audit")
        conn.execute("ALTER TABLE stripe_webhook_audit_next RENAME TO stripe_webhook_audit")

    def _insert_order_status_audit(
        self,
        *,
        conn: sqlite3.Connection,
        order_id: str,
        client_id: str,
        from_status: Optional[str],
        to_status: str,
        reason: Optional[str],
        actor_type: str,
        created_at: Optional[str] = None,
    ) -> None:
        timestamp = created_at or datetime.now(timezone.utc).isoformat()
        conn.execute(
            """
            INSERT INTO order_status_audit (
                order_id,
                client_id,
                from_status,
                to_status,
                reason,
                actor_type,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                order_id,
                client_id,
                from_status,
                to_status,
                reason,
                actor_type,
                timestamp,
            ),
        )

    def save_order(
        self,
        *,
        order_id: str,
        client_id: str,
        status: str,
        currency: str,
        amount: float,
        cart_payload: dict[str, Any],
        customer_payload: dict[str, Any],
        stripe_session_id: Optional[str],
        redirect_url: Optional[str],
    ) -> None:
        now = datetime.now(timezone.utc).isoformat()
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO orders (
                    order_id,
                    client_id,
                    status,
                    currency,
                    amount,
                    stripe_session_id,
                    redirect_url,
                    cart_json,
                    customer_json,
                    created_at,
                    updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    order_id,
                    client_id,
                    status,
                    currency,
                    amount,
                    stripe_session_id,
                    redirect_url,
                    json.dumps(cart_payload, ensure_ascii=False),
                    json.dumps(customer_payload, ensure_ascii=False),
                    now,
                    now,
                ),
            )
            self._insert_order_status_audit(
                conn=conn,
                order_id=order_id,
                client_id=client_id,
                from_status=None,
                to_status=status,
                reason="order_created",
                actor_type="checkout",
                created_at=now,
            )

    def get_order(self, *, order_id: str, client_id: str) -> Optional[dict[str, Any]]:
        with self._connect() as conn:
            row = conn.execute(
                """
                SELECT
                    order_id,
                    client_id,
                    status,
                    currency,
                    amount,
                    stripe_session_id,
                    redirect_url,
                    cart_json,
                    customer_json,
                    created_at,
                    updated_at
                FROM orders
                WHERE order_id = ? AND client_id = ?
                """,
                (order_id, client_id),
            ).fetchone()

        if row is None:
            return None

        return {
            "order_id": row["order_id"],
            "client_id": row["client_id"],
            "status": row["status"],
            "currency": row["currency"],
            "amount": row["amount"],
            "stripe_session_id": row["stripe_session_id"],
            "redirect_url": row["redirect_url"],
            "cart": json.loads(row["cart_json"]),
            "customer": json.loads(row["customer_json"]),
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
        }

    def list_orders(
        self,
        *,
        client_id: str,
        status: Optional[str],
        payment_state: Optional[Literal["awaiting", "paid", "failed", "cancelled"]],
        search_query: Optional[str],
        created_from_iso: Optional[str],
        created_to_exclusive_iso: Optional[str],
        limit: int,
        offset: int,
    ) -> tuple[list[dict[str, Any]], int]:
        where_parts = ["client_id = ?"]
        params: list[Any] = [client_id]

        if status:
            where_parts.append("status = ?")
            params.append(status)

        if payment_state:
            if payment_state == "awaiting":
                awaiting_statuses = ("pending", "redirect", "confirmed")
                placeholders = ", ".join(["?"] * len(awaiting_statuses))
                where_parts.append(f"status IN ({placeholders})")
                params.extend(awaiting_statuses)
            elif payment_state == "paid":
                paid_statuses = ("paid", "processing", "shipped")
                placeholders = ", ".join(["?"] * len(paid_statuses))
                where_parts.append(f"status IN ({placeholders})")
                params.extend(paid_statuses)
            elif payment_state == "failed":
                where_parts.append("status = ?")
                params.append("failed")
            elif payment_state == "cancelled":
                where_parts.append("status = ?")
                params.append("cancelled")

        if search_query:
            normalized_query = search_query.strip().lower()
            if normalized_query:
                like_query = f"%{normalized_query}%"
                where_parts.append(
                    """
                    (
                        LOWER(order_id) LIKE ?
                        OR LOWER(COALESCE(json_extract(customer_json, '$.email'), '')) LIKE ?
                    )
                    """
                )
                params.extend([like_query, like_query])

        if created_from_iso:
            where_parts.append("created_at >= ?")
            params.append(created_from_iso)

        if created_to_exclusive_iso:
            where_parts.append("created_at < ?")
            params.append(created_to_exclusive_iso)

        where_sql = " AND ".join(where_parts)

        with self._connect() as conn:
            count_row = conn.execute(
                f"""
                SELECT COUNT(*) AS total
                FROM orders
                WHERE {where_sql}
                """,
                params,
            ).fetchone()

            rows = conn.execute(
                f"""
                SELECT
                    order_id,
                    client_id,
                    status,
                    currency,
                    amount,
                    stripe_session_id,
                    redirect_url,
                    cart_json,
                    customer_json,
                    created_at,
                    updated_at
                FROM orders
                WHERE {where_sql}
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
                """,
                [*params, limit, offset],
            ).fetchall()

        items = [
            {
                "order_id": row["order_id"],
                "client_id": row["client_id"],
                "status": row["status"],
                "currency": row["currency"],
                "amount": row["amount"],
                "stripe_session_id": row["stripe_session_id"],
                "redirect_url": row["redirect_url"],
                "cart": json.loads(row["cart_json"]),
                "customer": json.loads(row["customer_json"]),
                "created_at": row["created_at"],
                "updated_at": row["updated_at"],
            }
            for row in rows
        ]
        total = int(count_row["total"]) if count_row else 0
        return items, total

    def update_order_status(
        self,
        *,
        order_id: str,
        client_id: str,
        status: str,
        stripe_session_id: Optional[str] = None,
        reason: Optional[str] = None,
        actor_type: str = "system",
    ) -> bool:
        now = datetime.now(timezone.utc).isoformat()
        with self._connect() as conn:
            existing_row = conn.execute(
                """
                SELECT status
                FROM orders
                WHERE order_id = ? AND client_id = ?
                """,
                (order_id, client_id),
            ).fetchone()

            if existing_row is None:
                return False

            previous_status = existing_row["status"]
            if stripe_session_id:
                conn.execute(
                    """
                    UPDATE orders
                    SET status = ?, stripe_session_id = ?, updated_at = ?
                    WHERE order_id = ? AND client_id = ?
                    """,
                    (status, stripe_session_id, now, order_id, client_id),
                )
            else:
                conn.execute(
                    """
                    UPDATE orders
                    SET status = ?, updated_at = ?
                    WHERE order_id = ? AND client_id = ?
                    """,
                    (status, now, order_id, client_id),
                )

            if previous_status != status:
                self._insert_order_status_audit(
                    conn=conn,
                    order_id=order_id,
                    client_id=client_id,
                    from_status=previous_status,
                    to_status=status,
                    reason=reason,
                    actor_type=actor_type,
                    created_at=now,
                )

        return True

    def get_idempotency_record(
        self, *, client_id: str, idempotency_key: str
    ) -> Optional[IdempotencyRecord]:
        with self._connect() as conn:
            row = conn.execute(
                """
                SELECT request_hash, response_json, order_id
                FROM checkout_idempotency
                WHERE client_id = ? AND idempotency_key = ?
                """,
                (client_id, idempotency_key),
            ).fetchone()

        if row is None:
            return None

        return IdempotencyRecord(
            request_hash=row["request_hash"],
            response_payload=json.loads(row["response_json"]),
            order_id=row["order_id"],
        )

    def save_idempotency_record(
        self,
        *,
        client_id: str,
        idempotency_key: str,
        request_hash: str,
        order_id: str,
        response_payload: dict[str, Any],
    ) -> None:
        now = datetime.now(timezone.utc).isoformat()
        with self._connect() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO checkout_idempotency (
                    client_id,
                    idempotency_key,
                    request_hash,
                    response_json,
                    order_id,
                    created_at
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    client_id,
                    idempotency_key,
                    request_hash,
                    json.dumps(response_payload, ensure_ascii=False),
                    order_id,
                    now,
                ),
            )

    def list_order_status_audit(
        self,
        *,
        order_id: str,
        client_id: str,
        to_status: Optional[str] = None,
        actor_type: Optional[str] = None,
        limit: int,
        offset: int,
    ) -> tuple[list[dict[str, Any]], int]:
        where_parts: list[str] = ["order_id = ?", "client_id = ?"]
        params: list[Any] = [order_id, client_id]

        if to_status:
            where_parts.append("to_status = ?")
            params.append(to_status)

        if actor_type:
            where_parts.append("actor_type = ?")
            params.append(actor_type)

        where_sql = " AND ".join(where_parts)

        with self._connect() as conn:
            count_row = conn.execute(
                f"""
                SELECT COUNT(*) AS total
                FROM order_status_audit
                WHERE {where_sql}
                """,
                params,
            ).fetchone()

            rows = conn.execute(
                f"""
                SELECT
                    id,
                    order_id,
                    client_id,
                    from_status,
                    to_status,
                    reason,
                    actor_type,
                    created_at
                FROM order_status_audit
                WHERE {where_sql}
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
                """,
                [*params, limit, offset],
            ).fetchall()

        items = [
            {
                "id": row["id"],
                "order_id": row["order_id"],
                "client_id": row["client_id"],
                "from_status": row["from_status"],
                "to_status": row["to_status"],
                "reason": row["reason"],
                "actor_type": row["actor_type"],
                "created_at": row["created_at"],
            }
            for row in rows
        ]
        total = int(count_row["total"]) if count_row else 0
        return items, total

    def start_stripe_webhook_event(
        self,
        *,
        event_id: str,
        livemode: bool,
        account_id: Optional[str],
        client_id: str,
        event_type: str,
        order_id: Optional[str],
        stripe_session_id: Optional[str],
        raw_payload: dict[str, Any],
    ) -> bool:
        now = datetime.now(timezone.utc).isoformat()
        normalized_account_id = (account_id or "").strip()
        with self._connect() as conn:
            try:
                conn.execute(
                    """
                    INSERT INTO stripe_webhook_audit (
                        event_id,
                        livemode,
                        account_id,
                        client_id,
                        event_type,
                        order_id,
                        stripe_session_id,
                        processing_status,
                        raw_payload_json,
                        created_at,
                        updated_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        event_id,
                        1 if livemode else 0,
                        normalized_account_id,
                        client_id,
                        event_type,
                        order_id,
                        stripe_session_id,
                        "processing",
                        json.dumps(raw_payload, ensure_ascii=False),
                        now,
                        now,
                    ),
                )
                return True
            except sqlite3.IntegrityError:
                return False

    def finish_stripe_webhook_event(
        self,
        *,
        event_id: str,
        livemode: bool,
        account_id: Optional[str],
        client_id: str,
        processing_status: str,
        order_status: Optional[str] = None,
        error_text: Optional[str] = None,
    ) -> None:
        now = datetime.now(timezone.utc).isoformat()
        normalized_account_id = (account_id or "").strip()
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE stripe_webhook_audit
                SET processing_status = ?, order_status = ?, error_text = ?, updated_at = ?
                WHERE event_id = ? AND livemode = ? AND account_id = ? AND client_id = ?
                """,
                (
                    processing_status,
                    order_status,
                    error_text,
                    now,
                    event_id,
                    1 if livemode else 0,
                    normalized_account_id,
                    client_id,
                ),
            )

    def list_stripe_webhook_audit(
        self,
        *,
        client_id: str,
        order_id: Optional[str],
        processing_status: Optional[str],
        limit: int,
        offset: int,
    ) -> tuple[list[dict[str, Any]], int]:
        where_parts: list[str] = ["client_id = ?"]
        params: list[Any] = [client_id]

        if order_id:
            where_parts.append("order_id = ?")
            params.append(order_id)
        if processing_status:
            where_parts.append("processing_status = ?")
            params.append(processing_status)

        where_sql = " AND ".join(where_parts) if where_parts else "1=1"

        with self._connect() as conn:
            count_row = conn.execute(
                f"""
                SELECT COUNT(*) AS total
                FROM stripe_webhook_audit
                WHERE {where_sql}
                """,
                params,
            ).fetchone()

            rows = conn.execute(
                f"""
                SELECT
                    id,
                    event_id,
                    livemode,
                    account_id,
                    client_id,
                    event_type,
                    order_id,
                    stripe_session_id,
                    processing_status,
                    order_status,
                    error_text,
                    created_at,
                    updated_at
                FROM stripe_webhook_audit
                WHERE {where_sql}
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
                """,
                [*params, limit, offset],
            ).fetchall()

        items = [
            {
                "id": row["id"],
                "event_id": row["event_id"],
                "livemode": bool(row["livemode"]),
                "account_id": row["account_id"],
                "event_type": row["event_type"],
                "client_id": row["client_id"],
                "order_id": row["order_id"],
                "stripe_session_id": row["stripe_session_id"],
                "processing_status": row["processing_status"],
                "order_status": row["order_status"],
                "error_text": row["error_text"],
                "created_at": row["created_at"],
                "updated_at": row["updated_at"],
            }
            for row in rows
        ]
        total = int(count_row["total"]) if count_row else 0
        return items, total


@lru_cache(maxsize=1)
def get_order_store() -> OrderStore:
    settings = get_settings()
    configured_path = settings.order_db_path
    if configured_path:
        db_path = Path(configured_path).expanduser().resolve()
    else:
        db_path = Path(__file__).resolve().parents[1] / "data" / "orders.sqlite3"
    return OrderStore(db_path=db_path)
