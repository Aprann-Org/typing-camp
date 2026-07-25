import Image from "next/image";

/**
 * The Aprann house mark, and optionally the wordmark beside it.
 *
 * The mark is a four-color logo built for light backgrounds: its right-hand
 * panel is the same navy as this app's surfaces, so on a dark screen the
 * roofline loses its edge and the silhouette breaks. It therefore always
 * sits on a cream tile — that's a constraint of the artwork, not a styling
 * preference, so don't render the mark bare on the app background.
 *
 * The wordmark IS single-color, so it ships in two versions and the cream
 * one is used here.
 */

type BrandMarkProps = {
  /** Height of the cream tile in px. The mark is inset within it. */
  size?: number;
  /** Show the "aprann" wordmark to the right of the tile. */
  withWordmark?: boolean;
};

export function BrandMark({ size = 36, withWordmark = false }: BrandMarkProps) {
  const inner = Math.round(size * 0.68);

  return (
    <div className="flex items-center gap-3" aria-label="Aprann">
      <div
        className="flex shrink-0 items-center justify-center bg-[var(--accent-action)]"
        style={{ width: size, height: size, borderRadius: Math.round(size * 0.26) }}
      >
        <Image
          src="/brand/aprann-mark.webp"
          alt=""
          width={inner}
          height={Math.round((inner * 761) / 854)}
          priority
        />
      </div>
      {withWordmark && (
        <Image
          src="/brand/aprann-wordmark-cream.webp"
          alt=""
          width={Math.round(size * 2.6)}
          height={Math.round((size * 2.6 * 128) / 600)}
          priority
        />
      )}
    </div>
  );
}
