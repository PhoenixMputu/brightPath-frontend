import { BrandLogo } from "@/components/shared/brand-logo";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-background px-4">
      <BrandLogo width={320} priority />
    </main>
  );
}
