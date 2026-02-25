from __future__ import annotations

import uuid
from typing import List

from .loaders import get_loader
from .models import Cart, CartItem, CartItemInput, CartTotals, Money, PriceCartRequest, Product


def _find_product(products: List[Product], product_id: str) -> Product | None:
    for p in products:
        if p.id == product_id:
            return p
    return None


def price_cart(payload: PriceCartRequest) -> Cart:
    loader = get_loader()
    catalog = loader.load_catalog()
    currency = catalog.products[0].price.currency if catalog.products else "USD"

    items: List[CartItem] = []
    subtotal_amount = 0.0

    for item in payload.items:
        product = _find_product(catalog.products, item.product_id)
        if not product:
            continue
        quantity = max(item.quantity, 1)
        unit_price = product.price
        line_amount = unit_price.amount * quantity
        subtotal_amount += line_amount

        items.append(
            CartItem(
                id=str(uuid.uuid4()),
                product_id=product.id,
                quantity=quantity,
                unit_price=Money(currency=unit_price.currency, amount=unit_price.amount),
                line_total=Money(currency=unit_price.currency, amount=line_amount),
                product_snapshot={
                    "name": product.name,
                    "slug": product.slug,
                    "media": [m.model_dump() for m in product.media],
                },
            )
        )

    subtotal = Money(currency=currency, amount=subtotal_amount)
    grand_total = Money(currency=currency, amount=subtotal_amount)
    totals = CartTotals(subtotal=subtotal, grand_total=grand_total)

    return Cart(id=str(uuid.uuid4()), items=items, totals=totals, currency=currency)

