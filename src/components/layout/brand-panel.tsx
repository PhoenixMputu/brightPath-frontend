import Image from "next/image";
import { getTranslations } from "next-intl/server";

// Geometry of the BrightPath symbol (public/brand/symbol.svg, viewBox 256x256).
const SYMBOL_PATH =
  "M80.0 163V33A14.0 14.0 0 0 0 52.0 33V163ZM52.0 161A72.0 72.0 0 1 0 124 89.0L124 117.0A44.0 44.0 0 1 1 80.0 161ZM126 89.0H100A14.0 14.0 0 0 0 100 117.0H126Z";

const POINTS = [
  "pointProfiles",
  "pointOptions",
  "pointReports",
] as const;

/** Left-hand brand panel of the login page (large screens only). */
export async function BrandPanel() {
  const t = await getTranslations("auth.brand");
  const tCommon = await getTranslations("common");

  return (
    <aside className="hidden bg-brand-blue text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      <Image
        src="/brand/lockup-horizontal-white.svg"
        alt="BrightPath"
        width={168}
        height={50}
        priority
      />

      <div className="max-w-lg motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-safe:fill-mode-both">
        {/* The "b" draws itself, then the yellow light switches on. */}
        <svg
          viewBox="0 0 256 256"
          className="mb-10 size-36 xl:size-40"
          aria-hidden
        >
          <path
            d={SYMBOL_PATH}
            pathLength={1}
            fill="white"
            stroke="white"
            strokeWidth={1.5}
            strokeLinejoin="round"
            className="brand-path"
          />
          <circle
            cx={180}
            cy={49}
            r={24}
            fill="var(--color-brand-yellow)"
            className="brand-light"
          />
        </svg>

        <p className="text-sm font-medium text-white/80">{t("eyebrow")}</p>
        <p className="mt-4 text-4xl leading-[1.1] font-semibold tracking-tight text-balance xl:text-5xl">
          {t("title")}
        </p>
        <p className="mt-4 text-lg leading-relaxed text-pretty text-white/80">
          {t("description")}
        </p>

        <ul className="mt-10 space-y-3">
          {POINTS.map((key) => (
            <li
              key={key}
              className="flex items-center gap-3 text-base text-white/80"
            >
              <span
                aria-hidden
                className="size-1.5 shrink-0 rounded-full bg-white/60"
              />
              {t(key)}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-white/70">
        {tCommon("copyright", { year: new Date().getFullYear() })}
      </p>
    </aside>
  );
}
