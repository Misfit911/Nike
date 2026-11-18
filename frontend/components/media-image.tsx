import { resolveImageSrc } from "@/lib/images";

export function MediaImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  if (!src) return null;
  return <img src={resolveImageSrc(src)} alt={alt} className={className} />;
}
