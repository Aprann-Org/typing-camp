import { getFingerForChar } from "@/content/layouts";
import { FINGERS, THUMB_COLOR } from "@/content/fingers";
import styles from "./NameLivePreview.module.css";

type NameLivePreviewProps = {
  name: string;
};

function colorFor(char: string): string {
  const finger = getFingerForChar(char);
  if (!finger) return THUMB_COLOR;
  return finger === "thumb" ? THUMB_COLOR : FINGERS[finger].hex;
}

// A small preview of the Name Animator game (see NameAnimatorGame.tsx) shown
// live as the child types their name on the start screen — each letter
// bounces in in its own finger color, the same visual language they'll see
// again in Day 1's game, so the app feels alive before the session even
// starts.
export function NameLivePreview({ name }: NameLivePreviewProps) {
  if (!name) return null;
  return (
    <div className={styles.row} aria-hidden="true">
      {Array.from(name).map((char, i) => (
        <span key={i} className={styles.letter} style={{ "--letter-color": colorFor(char) } as React.CSSProperties}>
          {char}
        </span>
      ))}
    </div>
  );
}
