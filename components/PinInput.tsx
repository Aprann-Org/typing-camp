"use client";

type PinInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
};

/**
 * A 4-digit code entry, shared by the "choose a code" and "enter your code"
 * steps in StartScreen — digits only (anything else typed is stripped), big
 * and spaced out so it reads clearly on a classroom screen.
 */
export function PinInput({ value, onChange, onSubmit, placeholder }: PinInputProps) {
  return (
    <input
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      maxLength={4}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSubmit();
      }}
      aria-label="4-digit code"
      className="w-36 rounded-xl border border-border-subtle bg-background-raised px-4 py-3 text-center font-[family-name:var(--font-typing)] text-3xl tracking-[0.5em] text-foreground outline-none"
      autoFocus
    />
  );
}
