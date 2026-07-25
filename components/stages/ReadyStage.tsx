"use client";

import { useEffect, useState } from "react";
import { HandMap } from "@/components/HandMap";
import { useI18n } from "@/context/I18nContext";

type ReadyStageProps = {
  onContinue: () => void;
};

export function ReadyStage({ onContinue }: ReadyStageProps) {
  const { t } = useI18n();
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setShowRight((v) => !v), 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-6 text-center">
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">{t("stages.ready.title")}</h2>
      <HandMap
        activeFinger={showRight ? "rightIndex" : "leftIndex"}
        activeLabel={showRight ? t("fingerNames.rightIndex") : t("fingerNames.leftIndex")}
      />
      <div className="flex max-w-md flex-col gap-2 font-[family-name:var(--font-ui)] text-foreground">
        <p>{t("stages.ready.findLeftBump")}</p>
        <p>{t("stages.ready.findRightBump")}</p>
        <p className="text-foreground-muted">{t("stages.ready.restOfFingers")}</p>
        <p className="text-foreground-muted">{t("stages.ready.posture")}</p>
      </div>
      <button
        className="rounded-full bg-[var(--finger-left-index)] px-8 py-3 font-[family-name:var(--font-ui)] text-lg font-semibold text-[#14162a]"
        onClick={onContinue}
      >
        {t("stages.ready.continueButton")}
      </button>
    </div>
  );
}
