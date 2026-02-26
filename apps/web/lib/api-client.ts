import type {
  Cart,
  CatalogConfig,
  Product,
  StorefrontConfig
} from "@store-platform/shared-types";

const API_URL = process.env.NEXT_PUBLIC_STORE_API_URL ?? "http://localhost:8000";

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function fetchStorefrontConfig(): Promise<StorefrontConfig> {
  const res = await fetch(`${API_URL}/storefront/config`, {
    next: { revalidate: 30 }
  });
  return handleJson<StorefrontConfig>(res);
}

export type CartPricePayload = {
  items: { productId: string; quantity: number }[];
};

export async function priceCart(payload: CartPricePayload): Promise<Cart> {
  const res = await fetch(`${API_URL}/cart/price`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      items: payload.items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity
      }))
    })
  });

  return handleJson<Cart>(res);
}

export async function fetchCatalog(): Promise<CatalogConfig> {
  const res = await fetch(`${API_URL}/catalog`);
  return handleJson<CatalogConfig>(res);
}

export async function fetchProduct(slug: string): Promise<Product> {
  const res = await fetch(`${API_URL}/catalog/${slug}`);
  return handleJson<Product>(res);
}

export type CheckoutPayload = {
  cart: CartPricePayload;
  customer: {
    email: string;
    name?: string;
    address_line1?: string;
    address_city?: string;
    address_country?: string;
    postal_code?: string;
  };
};

export type CheckoutResponse = {
  order_id: string;
  status: "pending" | "redirect" | "confirmed";
  stripe_session_id?: string | null;
  redirect_url?: string | null;
};

export async function checkout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  const res = await fetch(`${API_URL}/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return handleJson<CheckoutResponse>(res);
}

