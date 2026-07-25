"use client";

import { useState } from "react";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useI18n } from "@/context/I18nContext";

type TeacherControlsProps = {
  onSkipStage?: () => void;
};

// Deliberately tiny and low-contrast — a discreet teacher control, not
// something a child would notice or mash. Opens a small panel on tap.
export function TeacherControls({ onSkipStage }: TeacherControlsProps) {
  const { t } = useI18n();
  const { calmMode, setCalmMode } = useAppSettings();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-3 right-3 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-background-raised p-3 shadow-lg">
          {onSkipStage && (
            <button
              className="text-left font-[family-name:var(--font-ui)] text-xs text-foreground-muted hover:text-foreground"
              onClick={onSkipStage}
            >
              {t("teacherControls.skipStage")}
            </button>
          )}
          <button
            className="text-left font-[family-name:var(--font-ui)] text-xs text-foreground-muted hover:text-foreground"
            onClick={() => setCalmMode(!calmMode)}
          >
            {calmMode ? t("teacherControls.calmModeOff") : t("teacherControls.calmModeOn")}
          </button>
        </div>
      )}
      <button
        aria-label="Teacher controls"
        className="h-3 w-3 rounded-full bg-border-subtle opacity-40 hover:opacity-100"
        onClick={() => setOpen((o) => !o)}
      />
    </div>
  );
}
