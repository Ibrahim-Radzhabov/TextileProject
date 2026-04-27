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
    <footer className="border-t border-border">
      <div className="py-12 sm:py-14 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-8">
            <h3 className="ui-title-display text-[clamp(2rem,4vw,3.5rem)] text-foreground">{brandName}</h3>

            {trustItems.length > 0 && (
              <div className="space-y-4 max-w-md">
                {trustItems.map((item) => (
                  <p key={item.title} className="text-sm leading-relaxed text-muted-foreground">
                    <span className="text-foreground">{item.title}.</span> {item.text}
                  </p>
                ))}
              </div>
            )}

            {cta && (
              <a
                href={cta.href}
                className="ui-button inline-flex items-center border-b border-foreground pb-1 text-foreground transition-opacity hover:opacity-60"
              >
                {cta.label}
              </a>
            )}
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="ui-kicker text-muted-foreground">{column.title}</p>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={`${link.href}-${link.label}`}>
                      <a
                        href={link.href}
                        className="text-sm text-foreground transition-opacity hover:opacity-60"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <p className="ui-kicker text-muted-foreground">Контакты</p>
              <div className="mt-4 space-y-3 text-sm">
                {contacts.emailLabel && contacts.emailHref && (
                  <a href={contacts.emailHref} className="block text-foreground transition-opacity hover:opacity-60">
                    {contacts.emailLabel}
                  </a>
                )}
                {contacts.phoneLabel && contacts.phoneHref && (
                  <a href={contacts.phoneHref} className="block text-foreground transition-opacity hover:opacity-60">
                    {contacts.phoneLabel}
                  </a>
                )}
                {contacts.address && (
                  <p className="text-muted-foreground">{contacts.address}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-[11px] tracking-wide text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{`© ${year} ${brandName}`}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <a
                key={`${link.href}-${link.label}`}
                href={link.href}
                className="transition-opacity hover:opacity-60"
              >
                {link.label}
              </a>
            ))}
            {socialLinks.map((link) => (
              <a
                key={`${link.href}-${link.label}`}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="transition-opacity hover:opacity-60"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
