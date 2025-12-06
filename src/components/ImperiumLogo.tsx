import Image from "next/image";

export function ImperiumLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10 overflow-hidden rounded-full border border-primary/20 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
        <Image
          src="/hero-fallback.png"
          alt="Imperium Gate"
          fill
          className="object-cover"
          priority
        />
      </div>
      <span className="text-xl font-bold tracking-wider text-gradient-gold">
        IMPERIUM GATE
      </span>
    </div>
  );
}