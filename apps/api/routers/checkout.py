from fastapi import APIRouter

from ..domain.models import CheckoutRequest, CheckoutResponse
from ..domain.services import create_checkout

router = APIRouter(prefix="/checkout", tags=["checkout"])


@router.post("", response_model=CheckoutResponse)
def checkout(payload: CheckoutRequest) -> CheckoutResponse:
  return create_checkout(payload)

