"use client";

/**
 * Country picker with search — an ARIA 1.2 combobox over a listbox. Typing
 * filters by the localised name or the ISO code ("tr", "Türk", "土耳其"),
 * arrows move, Enter picks, Escape closes. Leaving the box with text that
 * names no country is reported through onUnresolved, so the form can say so
 * right away instead of on submit.
 */
import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { CountryOption } from "../lib/countries";
import s from "./OfferForm.module.css";

interface CountrySelectProps {
  id: string;
  label: string;
  placeholder: string;
  empty: string;
  options: CountryOption[];
  value: string;
  onChange: (code: string) => void;
  /** true: the visitor left typed text that matched nothing; false: resolved or cleared. */
  onUnresolved?: (typed: boolean) => void;
  invalid: boolean;
  describedBy?: string;
}

/** Case- and accent-insensitive: "turkiye" finds "Türkiye". */
const norm = (v: string) => v.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase();

export default function CountrySelect({
  id, label, placeholder, empty, options, value, onChange, onUnresolved, invalid, describedBy,
}: CountrySelectProps) {
  const listId = useId();
  const selected = options.find((o) => o.code === value);
  const [query, setQuery] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const list = useRef<HTMLUListElement>(null);

  const text = query ?? selected?.name ?? "";
  // Best first: the name starts with exactly what was typed ("Türk" → Türkiye),
  // then it starts with it ignoring accents ("Turk" → Turks ve Caicos too),
  // then the typed text appears anywhere. Ties keep alphabetical order.
  const matches = useMemo(() => {
    const raw = (query ?? "").trim().toLocaleLowerCase();
    const q = norm(raw);
    if (!q) return options;
    const rank = (o: CountryOption) => {
      if (o.code.toLowerCase() === q || o.name.toLocaleLowerCase().startsWith(raw)) return 0;
      return norm(o.name).startsWith(q) ? 1 : 2;
    };
    return options
      .filter((o) => norm(o.name).includes(q) || o.code.toLowerCase() === q)
      .map((o) => ({ o, r: rank(o) }))
      .sort((a, b) => a.r - b.r)
      .map(({ o }) => o);
  }, [options, query]);

  const pick = (option: CountryOption) => {
    onChange(option.code);
    onUnresolved?.(false);
    setQuery(null);
    setOpen(false);
  };

  const move = (to: number) => {
    const next = Math.max(0, Math.min(matches.length - 1, to));
    setCursor(next);
    list.current?.children[next]?.scrollIntoView({ block: "nearest" });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) setOpen(true);
      else move(cursor + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(cursor - 1);
    } else if (event.key === "Enter" && open) {
      event.preventDefault();
      const option = matches[cursor];
      if (option) pick(option);
    } else if (event.key === "Escape") {
      setOpen(false);
      setQuery(null);
    }
  };

  // Leaving the field with an exact name typed out counts as picking it.
  const onBlur = () => {
    window.setTimeout(() => setOpen(false), 120);
    if (query === null) return;
    const exact = options.find((o) => norm(o.name) === norm(query.trim()));
    if (exact) pick(exact);
    else if (!query.trim()) { onChange(""); onUnresolved?.(false); setQuery(null); }
    else {
      // Keep what was typed on screen, but do not let an earlier pick stand
      // behind text that now says something else.
      onChange("");
      onUnresolved?.(true);
    }
  };

  const activeId = open && matches[cursor] ? `${listId}-${matches[cursor].code}` : undefined;

  return (
    <div className={s.combo}>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        placeholder={placeholder}
        className={`${s.input} ${invalid ? s.inputInvalid : ""}`}
        value={text}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setCursor(0); if (!e.target.value) onChange(""); }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
      <span className={s.comboChevron} aria-hidden="true" />
      <ul id={listId} ref={list} role="listbox" aria-label={label} className={s.options} hidden={!open}>
        {matches.length === 0 && <li className={s.optionEmpty} role="presentation">{empty}</li>}
        {matches.map((o, i) => (
          <li
            key={o.code}
            id={`${listId}-${o.code}`}
            role="option"
            aria-selected={o.code === value}
            className={`${s.option} ${i === cursor ? s.optionActive : ""}`}
            onMouseDown={(e) => { e.preventDefault(); pick(o); }}
            onMouseMove={() => cursor !== i && setCursor(i)}
          >
            {o.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
