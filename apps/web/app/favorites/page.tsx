import Link from "next/link";
import { Surface, Button } from "@store-platform/ui";

export default function FavoritesPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-4 sm:space-y-5">
      <Surface tone="elevated" className="space-y-3 rounded-xl px-5 py-6 sm:px-6 sm:py-7">
        <p className="ui-kicker">Избранное</p>
        <h1 className="ui-title text-2xl sm:text-3xl">Сохраненные позиции</h1>
        <p className="ui-subtle text-sm sm:text-base">
          Здесь будут товары, которые вы отметили сердцем. Сейчас список пуст.
        </p>
        <Button asChild>
          <Link href="/catalog">Перейти в каталог</Link>
        </Button>
      </Surface>
    </section>
  );
}
