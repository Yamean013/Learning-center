import Image from "next/image";

// Renders the official MTCC logo from /public/mtcc-logo.png.
// next/image handles optimization + responsive sizing automatically.
export function MtccMark({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/mtcc-logo.png"
      alt="MTCC"
      width={size}
      height={size}
      priority
      className={className}
    />
  );
}
