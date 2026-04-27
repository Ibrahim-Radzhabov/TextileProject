from fastapi import APIRouter

from ..domain.models import Cart, PriceCartRequest
from ..domain.services import price_cart

router = APIRouter(prefix="/cart", tags=["cart"])


@router.post("/price", response_model=Cart)
def price(payload: PriceCartRequest) -> Cart:
    return price_cart(payload)

