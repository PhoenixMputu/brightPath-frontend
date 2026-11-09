import Image from "next/image";

type BrandLogoProps = {
  /** Rendered width in pixels. The brand guide sets 120px as the minimum. */
  width?: number;
  priority?: boolean;
  className?: string;
};

// Aspect ratio of the horizontal lockup (viewBox 868 x 256).
const LOCKUP_RATIO = 256 / 868;

/**
 * Horizontal BrightPath lockup. Shows the blue version on light backgrounds
 * and the white version in dark mode, as the brand guide requires.
 */
export function BrandLogo({
  width = 160,
  priority = false,
  className,
}: BrandLogoProps) {
  const height = Math.round(width * LOCKUP_RATIO);

  return (
    <span className={["inline-flex", className].filter(Boolean).join(" ")}>
      <Image
        src="/brand/lockup-horizontal.svg"
        alt="BrightPath"
        width={width}
        height={height}
        priority={priority}
        className="dark:hidden"
      />
      <Image
        src="/brand/lockup-horizontal-white.svg"
        alt="BrightPath"
        width={width}
        height={height}
        priority={priority}
        className="hidden dark:block"
      />
    </span>
  );
}
