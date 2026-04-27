import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Публичная оферта"
};

export default function OfferPage(): JSX.Element {
  return (
    <section className="space-y-4 rounded-[10px] border border-border/35 bg-card/84 p-5 sm:p-7">
      <h1 className="ui-title-display text-[clamp(1.6rem,3.4vw,2.5rem)] leading-[1.02]">
        Публичная оферта
      </h1>
      <p className="ui-subtle max-w-3xl text-sm sm:text-base">
        На этой странице размещаются условия продажи, оплаты, доставки и возврата товаров. Для
        подтверждения заказа пользователь соглашается с действующей редакцией оферты.
      </p>
    </section>
  );
}
