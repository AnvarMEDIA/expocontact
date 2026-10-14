"use client";

/**
 * The organiser enquiry. Posts to the same /api/contact as every form of the
 * main site, with source "offer" — the same bot, the same chat, the same leads
 * list. Validation is the shared validateOrganiser(), run here for instant
 * feedback and again on the server, which is the one that counts.
 *
 * - Honeypot: an off-screen "website" field people never fill.
 * - One submission at a time; after success the form is replaced, so a double
 *   click or a second Enter cannot send the enquiry twice.
 * - The Meta Pixel / GA4 / LinkedIn conversion fires only after the server
 *   has confirmed the lead.
 * - A failed submit puts a summary at the top of the form, one link per
 *   problem, and moves focus there; the errors under the fields stay too.
 *   Before that, a field is only checked when the visitor leaves it with
 *   something typed in, so tabbing through an empty form raises nothing.
 * - Answers survive a reload as a draft in sessionStorage — this tab only,
 *   never the consent box, gone once the enquiry is sent.
 */
import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import useMarketing from "@/components/useMarketing";
import CountrySelect from "./CountrySelect";
import { IconArrow, IconCheck, IconTelegram, IconWhatsApp } from "./Icons";
import { AREA_KEYS, PACKAGE_NAMES, validateOrganiser, type Field, type FieldError, type FormatKey } from "../lib/lead";
import { CHOOSE_FORMAT } from "../lib/events";
import { openPrivacy } from "../lib/privacy";
import { trackLeadSubmit } from "../lib/track";
import { CONTACTS } from "../lib/content";
import type { CountryOption } from "../lib/countries";
import { fill, type OfferDict } from "../i18n";
import base from "../styles/base.module.css";
import s from "./OfferForm.module.css";

interface OfferFormProps {
  lang: string;
  form: OfferDict["form"];
  chosenTemplate: string;
  countries: CountryOption[];
  months: string[];
  startYear: number;
  defaultDial: string;
}

type Values = {
  name: string; company: string; country: string; email: string; phone: string;
  showName: string; month: string; year: string; area: string; format: string;
  message: string; consent: boolean; website: string;
};

const FORMAT_OPTIONS: FormatKey[] = ["local_partner", "turnkey_build", "full_house", "consult"];

const DRAFT_KEY = "offer-form-draft";
/** What a draft may hold: the visitor's answers, never consent or the honeypot. */
const DRAFT_FIELDS = [
  "name", "company", "country", "email", "phone", "showName", "month", "year", "area", "format", "message",
] as const satisfies readonly (keyof Values)[];
type Draft = Partial<Pick<Values, (typeof DRAFT_FIELDS)[number]>>;

function readDraft(): Draft | null {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    const data: unknown = raw ? JSON.parse(raw) : null;
    if (!data || typeof data !== "object") return null;
    const draft: Draft = {};
    for (const key of DRAFT_FIELDS) {
      const v = (data as Record<string, unknown>)[key];
      if (typeof v === "string") draft[key] = v.slice(0, 2000);
    }
    return draft;
  } catch {
    return null;
  }
}

function writeDraft(values: Values | null) {
  try {
    if (!values) { window.sessionStorage.removeItem(DRAFT_KEY); return; }
    const draft: Draft = {};
    for (const key of DRAFT_FIELDS) draft[key] = values[key];
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Private mode or storage switched off: the form works, it just forgets.
  }
}

/** Fields the validator can complain about, in the order they appear. */
const CHECKED: readonly Field[] = ["name", "company", "country", "email", "phone", "consent"];

export default function OfferForm({
  lang, form, chosenTemplate, countries, months, startYear, defaultDial,
}: OfferFormProps) {
  const getMarketing = useMarketing();
  const [values, setValues] = useState<Values>({
    name: "", company: "", country: "", email: "", phone: defaultDial,
    showName: "", month: "", year: "", area: "", format: "",
    message: "", consent: false, website: "",
  });
  const [errors, setErrors] = useState<Partial<Record<Field, FieldError>>>({});
  const [summary, setSummary] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [announce, setAnnounce] = useState("");
  const [year0, setYear0] = useState(startYear);
  const sending = useRef(false);
  const restored = useRef(false);
  const countryTyped = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Bring back what this tab typed before a reload. After mount, so the
  // server and the first client render agree.
  useEffect(() => {
    const draft = readDraft();
    if (draft) setValues((v) => ({ ...v, ...draft }));
    restored.current = true;
  }, []);

  useEffect(() => {
    if (restored.current && state !== "done") writeDraft(values);
  }, [values, state]);

  // A static page can outlive New Year; the list starts at the visitor's year.
  useEffect(() => {
    const now = new Date().getFullYear();
    if (now > startYear) setYear0(now);
  }, [startYear]);

  // «Выбрать» in the formats table fills this in.
  useEffect(() => {
    const onChoose = (event: Event) => {
      const format = (event as CustomEvent<FormatKey>).detail;
      setValues((v) => ({ ...v, format }));
      setAnnounce(fill(chosenTemplate, { name: format === "consult" ? form.formatConsult : PACKAGE_NAMES[format] }));
      window.setTimeout(() => formRef.current?.querySelector<HTMLInputElement>("#of-name")?.focus({ preventScroll: true }), 700);
    };
    window.addEventListener(CHOOSE_FORMAT, onChoose);
    return () => window.removeEventListener(CHOOSE_FORMAT, onChoose);
  }, [chosenTemplate, form.formatConsult]);

  useEffect(() => {
    if (state === "done") doneRef.current?.focus();
  }, [state]);

  const failed = (found: Partial<Record<Field, FieldError>>) => {
    setErrors(found);
    setSummary(true);
    setAnnounce("");
    // After the summary has rendered.
    window.requestAnimationFrame(() => summaryRef.current?.focus());
  };

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // The phone follows the chosen country while the visitor has not typed a number yet.
  const pickCountry = (code: string) => {
    const dial = countries.find((c) => c.code === code)?.dial;
    setValues((v) => {
      const untouched = !v.phone.replace(/[^\d]/g, "") || v.phone.trim() === defaultDial.trim();
      return { ...v, country: code, phone: dial && untouched ? `${dial} ` : v.phone };
    });
    if (errors.country) setErrors((e) => ({ ...e, country: undefined }));
  };

  const dates = values.year ? (values.month ? `${values.year}-${values.month}` : values.year) : "";

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending.current || state === "done") return;

    const payload = {
      name: values.name, company: values.company, country: values.country, email: values.email,
      phone: values.phone, showName: values.showName, dates, area: values.area, format: values.format,
      message: values.message, consent: values.consent,
    };
    const check = validateOrganiser(payload);
    if (!check.ok) {
      // Text in the country box that matched nothing reads better as «choose
      // from the list» than as «fill in the field».
      if (check.errors.country === "required" && countryTyped.current) check.errors.country = "country";
      failed(check.errors);
      return;
    }

    sending.current = true;
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, source: "offer", lang, website: values.website, marketing: getMarketing() }),
      });
      if (res.status === 400) {
        const data: { fields?: Partial<Record<Field, FieldError>> } = await res.json().catch(() => ({}));
        if (data.fields) {
          setState("idle");
          failed(data.fields);
          return;
        }
      }
      if (!res.ok) throw new Error(String(res.status));
      setState("done");
      writeDraft(null);
      trackLeadSubmit(lang);
    } catch {
      setState("error");
    } finally {
      sending.current = false;
    }
  };

  if (state === "done") {
    return (
      <div className={s.card}>
        <div className={s.success} role="status">
          <span className={s.successIcon} aria-hidden="true"><IconCheck /></span>
          <h3 ref={doneRef} tabIndex={-1} className={s.successTitle}>{form.successTitle}</h3>
          <p className={s.successText}>{form.successText}</p>
          <p className={s.successAlt}>{form.successAlt}</p>
          <div className={s.successLinks}>
            <a href={CONTACTS.whatsapp} target="_blank" rel="noopener noreferrer" data-track="click_whatsapp"
              className={`${base.btn} ${s.whatsapp}`}><IconWhatsApp />WhatsApp</a>
            <a href={CONTACTS.telegram} target="_blank" rel="noopener noreferrer" data-track="click_telegram"
              className={`${base.btn} ${s.telegram}`}><IconTelegram />Telegram</a>
          </div>
        </div>
      </div>
    );
  }

  const err = (field: Field) => errors[field];
  const errText = (field: Field) => {
    const e = err(field);
    return e ? form.errors[e] : "";
  };
  const fieldProps = (field: Field) => ({
    id: `of-${field}`,
    "aria-invalid": err(field) ? true : undefined,
    "aria-describedby": err(field) ? `of-${field}-error` : undefined,
    onBlur: () => checkOnBlur(field),
  });

  // Leaving a field with something typed in checks that one field. An empty
  // field is left alone until submit: nobody wants «required» for a box they
  // simply have not reached yet.
  function checkOnBlur(field: Field) {
    if (field === "consent") return;
    // The phone starts out holding a dial code; that alone is still empty.
    const raw = field === "phone"
      ? values.phone.replace(/^\+\d{1,4}\s*$/, "")
      : values[field as "name" | "company" | "email"];
    if (!raw.trim()) return;
    const check = validateOrganiser({ ...values, consent: true });
    const found = check.ok ? undefined : check.errors[field];
    if (found && found !== "required") setErrors((e) => ({ ...e, [field]: found }));
  }

  const summaryLabel = (field: Field) =>
    field === "consent" ? "" : `${form[field as "name" | "company" | "country" | "email" | "phone"]} — `;
  const summaryItems = summary ? CHECKED.filter((f) => errors[f]) : [];
  const toField = (field: Field) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const el = formRef.current?.querySelector<HTMLElement>(`#of-${field}`);
    el?.focus();
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  };
  const errorLine = (field: Field) =>
    err(field) ? <p id={`of-${field}-error`} className={s.error}>{errText(field)}</p> : null;
  const req = <span className={s.req} aria-hidden="true">*</span>;

  return (
    <div className={s.card}>
      <form ref={formRef} noValidate onSubmit={onSubmit} className={s.form} aria-labelledby="of-form-title">
        <h3 id="of-form-title" className={s.title}>{form.title}</h3>

        {summaryItems.length > 0 && (
          <div ref={summaryRef} tabIndex={-1} className={s.summary} role="group" aria-labelledby="of-summary-title">
            <p id="of-summary-title" className={s.summaryTitle}>{form.errors.summary}</p>
            <ul className={s.summaryList}>
              {summaryItems.map((field) => (
                <li key={field}>
                  <a href={`#of-${field}`} onClick={toField(field)}>{summaryLabel(field)}{errText(field)}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Off-screen trap for bots. Not focusable, not announced. */}
        <div className={s.trap} aria-hidden="true">
          <label htmlFor="of-website">Website</label>
          <input id="of-website" name="website" type="text" tabIndex={-1} autoComplete="off"
            value={values.website} onChange={(e) => set("website", e.target.value)} />
        </div>

        <div className={s.grid}>
          <div className={s.field}>
            <label htmlFor="of-name" className={s.label}>{form.name}{req}</label>
            <input {...fieldProps("name")} name="name" type="text" autoComplete="name" required
              className={`${s.input} ${err("name") ? s.inputInvalid : ""}`}
              value={values.name} onChange={(e) => set("name", e.target.value)} />
            {errorLine("name")}
          </div>

          <div className={s.field}>
            <label htmlFor="of-company" className={s.label}>{form.company}{req}</label>
            <input {...fieldProps("company")} name="company" type="text" autoComplete="organization" required
              className={`${s.input} ${err("company") ? s.inputInvalid : ""}`}
              value={values.company} onChange={(e) => set("company", e.target.value)} />
            {errorLine("company")}
          </div>

          <div className={`${s.field} ${s.full}`}>
            <label htmlFor="of-country" className={s.label}>{form.country}{req}</label>
            <CountrySelect id="of-country" label={form.country} placeholder={form.countryPlaceholder}
              empty={form.countryEmpty} options={countries} value={values.country} onChange={pickCountry}
              onUnresolved={(typed) => {
                countryTyped.current = typed;
                if (typed) setErrors((e) => ({ ...e, country: "country" }));
              }}
              invalid={Boolean(err("country"))} describedBy={err("country") ? "of-country-error" : undefined} />
            {errorLine("country")}
          </div>

          <div className={s.field}>
            <label htmlFor="of-email" className={s.label}>{form.email}{req}</label>
            <input {...fieldProps("email")} name="email" type="email" inputMode="email" autoComplete="email" required
              className={`${s.input} ${err("email") ? s.inputInvalid : ""}`}
              value={values.email} onChange={(e) => set("email", e.target.value)} />
            {errorLine("email")}
          </div>

          <div className={s.field}>
            <label htmlFor="of-phone" className={s.label}>{form.phone}{req}</label>
            <input {...fieldProps("phone")} name="phone" type="tel" inputMode="tel" autoComplete="tel" required
              placeholder="+44 20 7123 4567"
              className={`${s.input} ${err("phone") ? s.inputInvalid : ""}`}
              value={values.phone} onChange={(e) => set("phone", e.target.value)} />
            {errorLine("phone")}
          </div>

          {/* Who is asking above the line, what the show is below it. */}
          <hr className={`${s.divider} ${s.full}`} />

          <div className={`${s.field} ${s.full}`}>
            <label htmlFor="of-showName" className={s.label}>{form.showName}</label>
            <input id="of-showName" name="showName" type="text" autoComplete="off" className={s.input}
              value={values.showName} onChange={(e) => set("showName", e.target.value)} />
          </div>

          <div role="group" aria-labelledby="of-dates-label" className={s.field}>
            <span id="of-dates-label" className={s.label}>{form.dates}</span>
            <div className={s.pair}>
              <select id="of-dates" aria-label={form.month} className={s.input} value={values.month}
                onChange={(e) => set("month", e.target.value)}>
                <option value="">{form.month}</option>
                {months.map((m, i) => <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>)}
              </select>
              <select aria-label={form.year} className={s.input} value={values.year}
                onChange={(e) => set("year", e.target.value)}>
                <option value="">{form.year}</option>
                {[0, 1, 2, 3].map((d) => <option key={d} value={String(year0 + d)}>{year0 + d}</option>)}
              </select>
            </div>
          </div>

          <div className={s.field}>
            <label htmlFor="of-area" className={s.label}>{form.area}</label>
            <select id="of-area" name="area" className={s.input} value={values.area}
              onChange={(e) => set("area", e.target.value)}>
              <option value="">{form.choose}</option>
              {AREA_KEYS.map((key, i) => <option key={key} value={key}>{form.areas[i]}</option>)}
            </select>
          </div>

          <div className={`${s.field} ${s.full}`}>
            <label htmlFor="of-format" className={s.label}>{form.format}</label>
            <select id="of-format" name="format" className={s.input} value={values.format}
              onChange={(e) => set("format", e.target.value)}>
              <option value="">{form.choose}</option>
              {FORMAT_OPTIONS.map((key) => (
                <option key={key} value={key}>{key === "consult" ? form.formatConsult : PACKAGE_NAMES[key]}</option>
              ))}
            </select>
          </div>

          <div className={`${s.field} ${s.full}`}>
            <label htmlFor="of-message" className={s.label}>{form.message}</label>
            <textarea id="of-message" name="message" rows={4} className={`${s.input} ${s.textarea}`}
              placeholder={form.messagePlaceholder}
              value={values.message} onChange={(e) => set("message", e.target.value)} />
          </div>

          <div className={`${s.field} ${s.full}`}>
            <div className={s.consent}>
              <input {...fieldProps("consent")} type="checkbox" name="consent" required className={s.checkbox}
                checked={values.consent} onChange={(e) => set("consent", e.target.checked)} />
              <label htmlFor="of-consent" className={s.consentText}>
                {form.consent.split("{link}")[0]}
                <button type="button" className={s.linkButton} onClick={openPrivacy}>{form.consentLink}</button>
                {form.consent.split("{link}")[1]}
                {req}
              </label>
            </div>
            {errorLine("consent")}
          </div>
        </div>

        <div className={s.actions}>
          <button type="submit" className={`${base.btn} ${base.btnPrimary} ${s.submit}`}
            disabled={state === "sending"} aria-disabled={state === "sending"}>
            {state === "sending" ? <span className={s.spinner} aria-hidden="true" /> : null}
            {state === "sending" ? form.sending : form.submit}
            {state !== "sending" && <IconArrow />}
          </button>
          <p className={s.requiredNote}>{form.required}</p>
        </div>

        <p className={s.live} aria-live="polite">{announce}</p>
        {state === "error" && (
          <p className={s.networkError} role="alert">
            {form.errors.network}{" "}
            <a href={CONTACTS.whatsapp} target="_blank" rel="noopener noreferrer" data-track="click_whatsapp">WhatsApp</a>
          </p>
        )}
      </form>
    </div>
  );
}
