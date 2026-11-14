/** Heading block with the brand's yellow light, used at the top of auth forms. */
export function AuthHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-8">
      <span
        aria-hidden
        className="mb-5 block size-2.5 rounded-full bg-brand-yellow shadow-[0_0_0_5px_rgb(247_196_0/0.2)] motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:fade-in motion-safe:duration-500 motion-safe:delay-300 motion-safe:fill-mode-both"
      />
      <h1 className="text-3xl font-semibold tracking-tight text-balance">
        {title}
      </h1>
      <p className="mt-2 text-base text-pretty text-muted-foreground">
        {subtitle}
      </p>
    </div>
  );
}
