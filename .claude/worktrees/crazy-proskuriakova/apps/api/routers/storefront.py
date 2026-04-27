from fastapi import APIRouter

from ..domain.loaders import get_loader
from ..domain.models import Product, StorefrontConfig

router = APIRouter(tags=["storefront"])


def _is_active(product: Product) -> bool:
    return product.is_active is not False


def _sort_key(product: Product) -> tuple[int, str, str]:
    return (
        product.sort_order or 0,
        product.name.casefold(),
        product.id.casefold(),
    )


@router.get("/storefront/config", response_model=StorefrontConfig)
def get_storefront_config() -> StorefrontConfig:
    loader = get_loader()
    config = loader.load_storefront_config()
    config.catalog.products = sorted(
        [product for product in config.catalog.products if _is_active(product)],
        key=_sort_key,
    )
    return config
