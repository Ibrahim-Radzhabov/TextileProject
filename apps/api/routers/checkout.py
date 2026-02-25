from fastapi import APIRouter

from ..domain.models import CheckoutRequest, CheckoutResponse

router = APIRouter(prefix="/checkout", tags=["checkout"])


@router.post("", response_model=CheckoutResponse)
def checkout(payload: CheckoutRequest) -> CheckoutResponse:
    # MVP: возвращаем заглушку заказа без реального Stripe
    return CheckoutResponse(
        order_id="order_mock",
        status="confirmed",
        stripe_session_id=None,
    )

