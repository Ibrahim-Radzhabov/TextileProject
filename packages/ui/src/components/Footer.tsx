import * as React from "react";
import { FooterTrustGlowCard } from "./FooterTrustGlowCard";

export type FooterLink = {
  label: string;
  href: string;
};

export type FooterColumn = {
  title: string;
  links: FooterLink[];
};

export type FooterTrustItem = {
  title: string;
  text: string;
};

export type FooterProps = {
  brandName: string;
  description?: string;
  cta?: FooterLink;
  socialLinks?: FooterLink[];
  columns: FooterColumn[];
  contacts: {
    phoneLabel?: string;
    phoneHref?: string;
    emailLabel?: string;
    emailHref?: string;
    address?: string;
  };
  trustItems: FooterTrustItem[];
  legalLinks?: FooterLink[];
};

export const Footer: React.FC<FooterProps> = ({
  brandName,
  description,
  cta,
  socialLinks = [],
  columns,
  contacts,
  trustItems,
  legalLinks = []
}) => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-border/45 bg-card/52">
      <div className="space-y-8 px-1 py-8 sm:space-y-10 sm:py-10">
        <section className="grid gap-3 md:grid-cols-3 md:gap-4">
          {trustItems.map((item) => (
            <FooterTrustGlowCard key={item.title} title={item.title} text={item.text} />
          ))}
        </section>

        <section className="grid gap-8 border-t border-border/40 pt-8 md:grid-cols-2 lg:grid-cols-[1.4fr_0.9fr_0.9fr_1fr]">
          <div>
            <h3 className="ui-title-serif text-[1.25rem] leading-none text-foreground">{brandName}</h3>
            {description ? (
              <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-muted-foreground">{description}</p>
            ) : null}

            {socialLinks.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <a
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center rounded-full border border-border/45 bg-card/72 px-3 text-sm transition-colors hover:border-border/70 hover:bg-card/96 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            {cta && (
              <a
                href={cta.href}
                className="mt-5 inline-flex h-10 items-center rounded-full border border-accent/70 bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {cta.label}
              </a>
            )}
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="ui-kicker text-[10px] text-muted-foreground">{column.title}</p>
              <ul className="mt-3 space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <a
                      href={link.href}
                      className="text-sm text-foreground/92 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="ui-kicker text-[10px] text-muted-foreground">Контакты</p>
            <div className="mt-3 space-y-2.5 text-sm">
              {contacts.phoneLabel && contacts.phoneHref && (
                <a
                  href={contacts.phoneHref}
                  className="block text-foreground/92 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {contacts.phoneLabel}
                </a>
              )}
              {contacts.emailLabel && contacts.emailHref && (
                <a
                  href={contacts.emailHref}
                  className="block text-foreground/92 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {contacts.emailLabel}
                </a>
              )}
              {contacts.address && (
                <p className="text-muted-foreground">{contacts.address}</p>
              )}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3 border-t border-border/40 pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>{`© ${year} ${brandName}. Все права защищены.`}</p>
          {legalLinks.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {legalLinks.map((link) => (
                <a
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </footer>
  );
};
