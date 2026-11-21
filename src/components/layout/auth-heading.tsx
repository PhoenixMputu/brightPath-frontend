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
        className="mb-4 block size-2.5 rounded-full bg-brand-yellow"
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
