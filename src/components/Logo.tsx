import Image from "next/image";
import Link from "next/link";

export function Logo({ size = 36, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 select-none">
      <Image src="/logo.png" alt="NWSmartInvitation" width={size} height={size} priority />
      {withText && (
        <span className="font-semibold text-lg tracking-tight">
          NWSmart<span className="text-brand-green">Invitation</span>
        </span>
      )}
    </Link>
  );
}
