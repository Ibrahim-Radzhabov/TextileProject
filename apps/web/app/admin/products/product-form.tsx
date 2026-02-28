import { Button, Input, Surface } from "@store-platform/ui";

export type AdminProductFormDefaults = {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  priceAmount: string;
  priceCurrency: string;
  comparePriceAmount: string;
  comparePriceCurrency: string;
  sortOrder: string;
  tags: string;
  isActive: boolean;
  isFeatured: boolean;
  mediaId: string;
  mediaUrl: string;
  mediaAlt: string;
  mediaJson: string;
  badgesJson: string;
  metadataJson: string;
};

type AdminProductFormProps = {
  action: string;
  submitLabel: string;
  defaults: AdminProductFormDefaults;
  readOnlyId?: boolean;
  returnTo?: string;
};

function FormFieldLabel({ children, htmlFor }: { children: string; htmlFor: string }) {
  return (
    <label className="space-y-1" htmlFor={htmlFor}>
      <span className="text-xs text-muted-foreground">{children}</span>
    </label>
  );
}

export function AdminProductForm({
  action,
  submitLabel,
  defaults,
  readOnlyId = false,
  returnTo,
}: AdminProductFormProps) {
  return (
    <Surface tone="subtle" className="space-y-4 rounded-2xl px-4 py-4">
      <form action={action} method="post" className="grid gap-4 sm:grid-cols-2">
        {returnTo && <input type="hidden" name="return_to" value={returnTo} />}

        <div className="space-y-1">
          <FormFieldLabel htmlFor="product-id">ID</FormFieldLabel>
          <Input id="product-id" name="id" defaultValue={defaults.id} required readOnly={readOnlyId} />
        </div>

        <div className="space-y-1">
          <FormFieldLabel htmlFor="product-slug">Slug</FormFieldLabel>
          <Input id="product-slug" name="slug" defaultValue={defaults.slug} required />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <FormFieldLabel htmlFor="product-name">Название</FormFieldLabel>
          <Input id="product-name" name="name" defaultValue={defaults.name} required />
        </div>

        <div className="space-y-1">
          <FormFieldLabel htmlFor="product-price-amount">Цена</FormFieldLabel>
          <Input
            id="product-price-amount"
            name="price_amount"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={defaults.priceAmount}
            required
          />
        </div>

        <div className="space-y-1">
          <FormFieldLabel htmlFor="product-price-currency">Валюта</FormFieldLabel>
          <Input id="product-price-currency" name="price_currency" defaultValue={defaults.priceCurrency} required />
        </div>

        <div className="space-y-1">
          <FormFieldLabel htmlFor="product-compare-amount">Compare price</FormFieldLabel>
          <Input
            id="product-compare-amount"
            name="compare_price_amount"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={defaults.comparePriceAmount}
          />
        </div>

        <div className="space-y-1">
          <FormFieldLabel htmlFor="product-compare-currency">Валюта compare</FormFieldLabel>
          <Input
            id="product-compare-currency"
            name="compare_price_currency"
            defaultValue={defaults.comparePriceCurrency}
          />
        </div>

        <div className="space-y-1">
          <FormFieldLabel htmlFor="product-sort-order">Sort order</FormFieldLabel>
          <Input id="product-sort-order" name="sort_order" type="number" defaultValue={defaults.sortOrder} />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <FormFieldLabel htmlFor="product-short-description">Короткое описание</FormFieldLabel>
          <Input
            id="product-short-description"
            name="short_description"
            defaultValue={defaults.shortDescription}
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <FormFieldLabel htmlFor="product-description">Описание</FormFieldLabel>
          <textarea
            id="product-description"
            name="description"
            defaultValue={defaults.description}
            rows={4}
            className="w-full rounded-md border border-border/65 bg-input/80 px-3 py-2 text-sm text-foreground shadow-inset outline-none transition-all duration-[var(--motion-fast)] placeholder:text-muted-foreground focus:border-accent/55 focus:ring-2 focus:ring-ring/60"
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <FormFieldLabel htmlFor="product-tags">Теги (через запятую)</FormFieldLabel>
          <Input id="product-tags" name="tags" defaultValue={defaults.tags} />
        </div>

        <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={defaults.isActive}
              className="h-4 w-4 rounded border-border/65 bg-input/80"
            />
            <span className="text-sm text-muted-foreground">Товар активен</span>
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={defaults.isFeatured}
              className="h-4 w-4 rounded border-border/65 bg-input/80"
            />
            <span className="text-sm text-muted-foreground">Показывать как featured</span>
          </label>
        </div>

        <div className="space-y-1">
          <FormFieldLabel htmlFor="product-media-id">ID медиа</FormFieldLabel>
          <Input id="product-media-id" name="media_id" defaultValue={defaults.mediaId} />
        </div>

        <div className="space-y-1">
          <FormFieldLabel htmlFor="product-media-url">URL изображения</FormFieldLabel>
          <Input id="product-media-url" name="media_url" defaultValue={defaults.mediaUrl} />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <FormFieldLabel htmlFor="product-media-alt">ALT изображения</FormFieldLabel>
          <Input id="product-media-alt" name="media_alt" defaultValue={defaults.mediaAlt} />
        </div>

        <details className="rounded-lg border border-border/55 bg-card/35 px-3 py-2 sm:col-span-2">
          <summary className="cursor-pointer text-xs text-muted-foreground">
            Расширенные JSON-поля (опционально)
          </summary>
          <div className="mt-3 space-y-3">
            <div className="space-y-1">
              <FormFieldLabel htmlFor="product-media-json">media_json</FormFieldLabel>
              <textarea
                id="product-media-json"
                name="media_json"
                defaultValue={defaults.mediaJson}
                rows={6}
                className="w-full rounded-md border border-border/65 bg-input/80 px-3 py-2 font-mono text-xs text-foreground shadow-inset outline-none transition-all duration-[var(--motion-fast)] focus:border-accent/55 focus:ring-2 focus:ring-ring/60"
              />
            </div>
            <div className="space-y-1">
              <FormFieldLabel htmlFor="product-badges-json">badges_json</FormFieldLabel>
              <textarea
                id="product-badges-json"
                name="badges_json"
                defaultValue={defaults.badgesJson}
                rows={4}
                className="w-full rounded-md border border-border/65 bg-input/80 px-3 py-2 font-mono text-xs text-foreground shadow-inset outline-none transition-all duration-[var(--motion-fast)] focus:border-accent/55 focus:ring-2 focus:ring-ring/60"
              />
            </div>
            <div className="space-y-1">
              <FormFieldLabel htmlFor="product-metadata-json">metadata_json</FormFieldLabel>
              <textarea
                id="product-metadata-json"
                name="metadata_json"
                defaultValue={defaults.metadataJson}
                rows={4}
                className="w-full rounded-md border border-border/65 bg-input/80 px-3 py-2 font-mono text-xs text-foreground shadow-inset outline-none transition-all duration-[var(--motion-fast)] focus:border-accent/55 focus:ring-2 focus:ring-ring/60"
              />
            </div>
          </div>
        </details>

        <div className="sm:col-span-2">
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </Surface>
  );
}
