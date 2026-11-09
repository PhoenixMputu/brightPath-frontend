import Image from "next/image";
import { getTranslations } from "next-intl/server";

// Geometry of the BrightPath symbol (public/brand/symbol.svg, viewBox 256x256).
const SYMBOL_PATH =
  "M80.0 163V33A14.0 14.0 0 0 0 52.0 33V163ZM52.0 161A72.0 72.0 0 1 0 124 89.0L124 117.0A44.0 44.0 0 1 1 80.0 161ZM126 89.0H100A14.0 14.0 0 0 0 100 117.0H126Z";

const POINTS = [
  "brandPointProfiles",
  "brandPointOptions",
  "brandPointReports",
] as const;

/** Left-hand brand panel of the login page (large screens only). */
export async function BrandPanel() {
  const t = await getTranslations("auth.login");
  const tCommon = await getTranslations("common");

  return (
    <aside className="relative hidden overflow-hidden bg-brand-blue text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      {/* Depth: deep-blue gradient, dotted grid and two drifting lights. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_0%_100%,var(--color-brand-blue-deep)_0%,transparent_60%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.14)_1px,transparent_1px)] bg-[size:22px_22px] [mask-image:radial-gradient(70%_60%_at_70%_35%,black,transparent)]"
      />
      <div
        aria-hidden
        className="absolute -top-24 -right-24 size-112 rounded-full bg-white/10 blur-3xl motion-safe:animate-drift"
      />
      <div
        aria-hidden
        className="absolute -bottom-32 left-1/4 size-96 rounded-full bg-brand-yellow/15 blur-3xl motion-safe:animate-drift [animation-delay:-9s]"
      />

      <Image
        src="/brand/lockup-horizontal-white.svg"
        alt="BrightPath"
        width={168}
        height={50}
        priority
        className="relative motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700"
      />

      <div className="relative max-w-lg">
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
            className="brand-halo blur-md"
          />
          <circle
            cx={180}
            cy={49}
            r={24}
            fill="var(--color-brand-yellow)"
            className="brand-light"
          />
        </svg>

        <p className="flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-white/90 uppercase before:h-0.5 before:w-6 before:rounded-full before:bg-brand-yellow motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-700 motion-safe:delay-300 motion-safe:fill-mode-both">
          {t("brandEyebrow")}
        </p>
        <p className="mt-4 text-4xl leading-[1.1] font-semibold tracking-tight text-balance xl:text-5xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700 motion-safe:delay-[450ms] motion-safe:fill-mode-both">
          {t("brandTitle")}
        </p>
        <p className="mt-5 text-lg leading-relaxed text-pretty text-white/85 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700 motion-safe:delay-[600ms] motion-safe:fill-mode-both">
          {t("brandDescription")}
        </p>

        <ul className="mt-10 space-y-4">
          {POINTS.map((key, index) => (
            <li
              key={key}
              className="flex items-center gap-3.5 text-base text-white/90 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-3 motion-safe:duration-500 motion-safe:fill-mode-both"
              style={{ animationDelay: `${800 + index * 120}ms` }}
            >
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-full bg-brand-yellow shadow-[0_0_0_4px_rgb(247_196_0/0.18)]"
              />
              {t(key)}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-sm text-white/75">
        {tCommon("copyright", { year: new Date().getFullYear() })}
      </p>
    </aside>
  );
}
