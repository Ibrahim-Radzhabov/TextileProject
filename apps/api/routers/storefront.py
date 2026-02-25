from fastapi import APIRouter

from ..domain.loaders import get_loader
from ..domain.models import StorefrontConfig

router = APIRouter(tags=["storefront"])


@router.get("/storefront/config", response_model=StorefrontConfig)
def get_storefront_config() -> StorefrontConfig:
    loader = get_loader()
    return loader.load_storefront_config()

