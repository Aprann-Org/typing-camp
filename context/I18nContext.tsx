"use client";

import { createContext, useContext, useMemo } from "react";
import en, { type Strings } from "@/content/i18n/en";
import ht from "@/content/i18n/ht";
import { useAppSettings } from "./AppSettingsContext";

const DICTIONARIES: Record<"en" | "ht", Strings> = { en, ht };

type I18nContextValue = {
  strings: Strings;
  t: (path: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in params ? String(params[key]) : match));
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { language } = useAppSettings();
  const strings = DICTIONARIES[language];

  const t = useMemo(() => {
    return (path: string, params?: Record<string, string | number>) => {
      const value = getByPath(strings, path);
      if (typeof value !== "string") {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`i18n: missing or non-string key "${path}"`);
        }
        return path;
      }
      return interpolate(value, params);
    };
  }, [strings]);

  return <I18nContext.Provider value={{ strings, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
