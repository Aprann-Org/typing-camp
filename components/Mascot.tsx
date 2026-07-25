import styles from "./Mascot.module.css";

type MascotProps = {
  /** "wave" greets on the start screen; "celebrate" is the report stage's arms-up finish. */
  pose?: "wave" | "celebrate";
  size?: number;
};

// A small friendly robot, drawn in SVG rather than an image asset — a nod to
// the two robots already in the workbook cover art (see BrandMark/splash),
// built entirely from the app's own palette so it never introduces a color
// the rest of the UI doesn't already use.
export function Mascot({ pose = "wave", size = 64 }: MascotProps) {
  const rightArmClass = pose === "wave" ? styles.armWave : styles.armUpRight;
  const leftArmClass = pose === "celebrate" ? styles.armUpLeft : undefined;

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={styles.root}>
      <line x1="32" y1="6" x2="32" y2="14" stroke="var(--brand-pale)" strokeWidth="2" />
      <circle cx="32" cy="5" r="2.5" fill="var(--accent-celebrate)" />

      <rect x="18" y="14" width="28" height="22" rx="6" fill="var(--brand-slate)" stroke="var(--brand-pale)" strokeWidth="1.5" />
      <circle cx="27" cy="25" r="2.6" fill="var(--background)" />
      <circle cx="37" cy="25" r="2.6" fill="var(--background)" />
      <path d="M26 30 Q32 35 38 30" stroke="var(--background)" strokeWidth="2" fill="none" strokeLinecap="round" />

      <rect x="21" y="38" width="22" height="18" rx="5" fill="var(--brand-navy)" stroke="var(--brand-pale)" strokeWidth="1.5" />
      <circle cx="32" cy="47" r="3.5" fill="var(--accent-celebrate)" />

      <g style={{ transformOrigin: "21px 42px" }} className={leftArmClass}>
        <line x1="21" y1="42" x2="12" y2="48" stroke="var(--brand-slate)" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g style={{ transformOrigin: "43px 42px" }} className={rightArmClass}>
        <line x1="43" y1="42" x2="52" y2="48" stroke="var(--brand-slate)" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}
