from fastapi import APIRouter, Request

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/stripe")
async def stripe_webhook(request: Request) -> dict:
  # Заглушка для Stripe webhook
  _ = await request.body()
  return {"received": True}


@router.post("/telegram")
async def telegram_webhook(request: Request) -> dict:
  # Заглушка для Telegram webhook / нотификаций
  _ = await request.body()
  return {"received": True}

