from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routers import cart, catalog, checkout, storefront, webhooks, metrics, orders


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="store-platform API", version="0.1.0")

    if settings.cors_allow_origins or settings.frontend_origin:
        origins = settings.cors_allow_origins or [settings.frontend_origin]  # type: ignore[list-item]
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    @app.get("/health", tags=["health"])
    def health() -> dict:
        return {"status": "ok", "clientId": settings.client_id}

    app.include_router(storefront.router)
    app.include_router(catalog.router)
    app.include_router(cart.router)
    app.include_router(checkout.router)
    app.include_router(orders.router)
    app.include_router(webhooks.router)
    app.include_router(metrics.router)

    return app


app = create_app()
