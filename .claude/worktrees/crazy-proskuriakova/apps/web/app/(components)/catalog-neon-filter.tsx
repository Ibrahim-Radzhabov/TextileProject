"use client";

import styles from "./catalog-neon-filter.module.css";

export type CatalogNeonFilterIntensity = "balanced" | "vivid";

type CatalogNeonFilterProps = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  onFilterClick?: () => void;
  filterActive?: boolean;
  intensity?: CatalogNeonFilterIntensity;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
};

export function CatalogNeonFilter({
  value,
  onChange,
  placeholder = "Поиск по названию, фактуре и тегам...",
  onFilterClick,
  filterActive = false,
  intensity = "balanced",
  className,
  ariaLabel = "Поиск по каталогу",
  disabled = false
}: CatalogNeonFilterProps) {
  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-intensity={intensity}
      aria-disabled={disabled}
    >
      <div className={styles.frame}>
        <span className={styles.glow} aria-hidden="true" />
        <span className={styles.darkBorderBg} aria-hidden="true" />
        <span className={styles.lightBorder} aria-hidden="true" />
        <span className={styles.fineBorder} aria-hidden="true" />
        <span className={styles.orbs} aria-hidden="true" />

        <div className={styles.inner}>
          <span className={styles.searchIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11 5a6 6 0 1 0 3.87 10.58L19 19.7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>

          <input
            type="search"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            aria-label={ariaLabel}
            className={styles.input}
            disabled={disabled}
          />

          <span className={styles.inputMask} aria-hidden="true" />
          <span className={styles.accentMask} aria-hidden="true" />

          {value.trim().length > 0 && (
            <button
              type="button"
              onClick={() => onChange("")}
              className={styles.clearBtn}
              aria-label="Очистить поиск"
              disabled={disabled}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={onFilterClick}
            className={[styles.filterBtn, filterActive ? styles.filterBtnActive : ""].join(" ")}
            aria-pressed={filterActive}
            aria-label="Показать или скрыть фильтры"
            disabled={disabled}
          >
            <svg preserveAspectRatio="none" height={16} width={16} viewBox="4.8 4.56 14.832 15.408" fill="none" aria-hidden="true">
              <path
                d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeMiterlimit={10}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <span className={styles.filterBorder} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
