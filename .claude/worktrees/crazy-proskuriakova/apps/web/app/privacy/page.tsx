import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика конфиденциальности"
};

export default function PrivacyPage(): JSX.Element {
  return (
    <section className="space-y-4 rounded-[10px] border border-border/35 bg-card/84 p-5 sm:p-7">
      <h1 className="ui-title-display text-[clamp(1.6rem,3.4vw,2.5rem)] leading-[1.02]">
        Политика конфиденциальности
      </h1>
      <p className="ui-subtle max-w-3xl text-sm sm:text-base">
        Мы используем контактные данные только для обработки заказов и обратной связи. Персональные данные
        не передаются третьим лицам вне сценариев, необходимых для доставки, оплаты и клиентской поддержки.
      </p>
    </section>
  );
}
