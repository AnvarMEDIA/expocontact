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
 */
import { useEffect, useRef, useState, type FormEvent } from "react";
import useMarketing from "@/components/useMarketing";
import CountrySelect from "./CountrySelect";
import { IconArrow, IconTelegram, IconWhatsApp } from "./Icons";
import { AREA_KEYS, FIELDS, PACKAGE_NAMES, validateOrganiser, type Field, type FieldError, type FormatKey } from "../lib/lead";
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
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [announce, setAnnounce] = useState("");
  const [year0, setYear0] = useState(startYear);
  const sending = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

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
      setErrors(check.errors);
      setAnnounce(form.errors.summary);
      const first = FIELDS.find((f) => check.errors[f]);
      if (first) formRef.current?.querySelector<HTMLElement>(`#of-${first}`)?.focus();
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
          setErrors(data.fields);
          setAnnounce(form.errors.summary);
          setState("idle");
          return;
        }
      }
      if (!res.ok) throw new Error(String(res.status));
      setState("done");
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
          <span className={s.successIcon} aria-hidden="true">✓</span>
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
  });
  const errorLine = (field: Field) =>
    err(field) ? <p id={`of-${field}-error`} className={s.error}>{errText(field)}</p> : null;
  const req = <span className={s.req} aria-hidden="true">*</span>;

  return (
    <div className={s.card}>
      <form ref={formRef} noValidate onSubmit={onSubmit} className={s.form} aria-labelledby="of-form-title">
        <h3 id="of-form-title" className={s.title}>{form.title}</h3>

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
