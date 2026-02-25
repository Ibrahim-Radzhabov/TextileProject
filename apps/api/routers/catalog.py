from fastapi import APIRouter, HTTPException

from ..domain.loaders import get_loader
from ..domain.models import CatalogConfig, Product

router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get("", response_model=CatalogConfig)
def list_catalog() -> CatalogConfig:
    loader = get_loader()
    return loader.load_catalog()


@router.get("/{slug}", response_model=Product)
def get_product(slug: str) -> Product:
    loader = get_loader()
    catalog = loader.load_catalog()
    for product in catalog.products:
        if product.slug == slug:
            return product
    raise HTTPException(status_code=404, detail="Product not found")

