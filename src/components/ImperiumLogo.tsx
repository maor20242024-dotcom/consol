import Image from "next/image";

export function ImperiumLogo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/imperiumgate-logo.svg"
        alt="Imperium Gate"
        width={40}
        height={40}
        priority
      />
      <span className="text-lg font-semibold tracking-wide">
        Imperium Gate
      </span>
    </div>
  );
}