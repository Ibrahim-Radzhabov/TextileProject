from fastapi import APIRouter, Depends, HTTPException, status

from ..domain.loaders import get_loader
from ..domain.models import CatalogConfig, Product
from .admin_auth import require_admin_token

router = APIRouter(prefix="/catalog", tags=["catalog"])


def _is_active(product: Product) -> bool:
    return product.is_active is not False


def _sort_key(product: Product) -> tuple[int, str, str]:
    return (
        product.sort_order or 0,
        product.name.casefold(),
        product.id.casefold(),
    )


def _build_catalog(products: list[Product]) -> CatalogConfig:
    return CatalogConfig(products=sorted(products, key=_sort_key))


def _find_product_index_by_id(catalog: CatalogConfig, product_id: str) -> int:
    for index, product in enumerate(catalog.products):
        if product.id == product_id:
            return index
    return -1


def _find_product_by_slug(catalog: CatalogConfig, slug: str, *, include_inactive: bool = False) -> Product | None:
    for product in catalog.products:
        if not include_inactive and not _is_active(product):
            continue
        if product.slug == slug:
            return product
    return None


def _ensure_unique_product(catalog: CatalogConfig, payload: Product, *, ignore_product_id: str | None = None) -> None:
    for product in catalog.products:
        if ignore_product_id and product.id == ignore_product_id:
            continue
        if product.id == payload.id:
            raise HTTPException(status_code=409, detail=f'Product with id "{payload.id}" already exists')
        if product.slug == payload.slug:
            raise HTTPException(status_code=409, detail=f'Product with slug "{payload.slug}" already exists')


@router.get("", response_model=CatalogConfig)
def list_catalog() -> CatalogConfig:
    loader = get_loader()
    catalog = loader.load_catalog()
    active_products = [product for product in catalog.products if _is_active(product)]
    return _build_catalog(active_products)


@router.get("/products", response_model=CatalogConfig)
def list_catalog_products() -> CatalogConfig:
    loader = get_loader()
    return _build_catalog(loader.load_catalog().products)


@router.get("/products/{product_id}", response_model=Product)
def get_product_by_id(product_id: str) -> Product:
    loader = get_loader()
    catalog = loader.load_catalog()
    index = _find_product_index_by_id(catalog, product_id)
    if index < 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return catalog.products[index]


@router.post(
    "/products",
    response_model=Product,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin_token)],
)
def create_product(payload: Product) -> Product:
    loader = get_loader()
    catalog = loader.load_catalog()
    _ensure_unique_product(catalog, payload)
    catalog.products.append(payload)
    loader.save_catalog(catalog)
    return payload


@router.put(
    "/products/{product_id}",
    response_model=Product,
    dependencies=[Depends(require_admin_token)],
)
def update_product(product_id: str, payload: Product) -> Product:
    if payload.id != product_id:
        raise HTTPException(status_code=422, detail='"id" in payload must match product_id in URL')

    loader = get_loader()
    catalog = loader.load_catalog()
    index = _find_product_index_by_id(catalog, product_id)
    if index < 0:
        raise HTTPException(status_code=404, detail="Product not found")

    _ensure_unique_product(catalog, payload, ignore_product_id=product_id)
    catalog.products[index] = payload
    loader.save_catalog(catalog)
    return payload


@router.delete(
    "/products/{product_id}",
    dependencies=[Depends(require_admin_token)],
)
def delete_product(product_id: str) -> dict[str, bool]:
    loader = get_loader()
    catalog = loader.load_catalog()
    index = _find_product_index_by_id(catalog, product_id)
    if index < 0:
        raise HTTPException(status_code=404, detail="Product not found")

    del catalog.products[index]
    loader.save_catalog(catalog)
    return {"ok": True}


@router.get("/{slug}", response_model=Product)
def get_product(slug: str) -> Product:
    loader = get_loader()
    product = _find_product_by_slug(loader.load_catalog(), slug)
    if product:
        return product
    raise HTTPException(status_code=404, detail="Product not found")
