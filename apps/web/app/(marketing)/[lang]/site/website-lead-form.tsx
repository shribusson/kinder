"use client";

import { useState } from "react";

type Locale = "ru" | "kz" | "en";

const labels: Record<Locale, { name: string; phone: string; email: string; submit: string; statusOk: string; statusErr: string; statusSend: string; }> = {
  ru: {
    name: "Имя клиента",
    phone: "Телефон",
    email: "Email",
    submit: "Отправить заявку",
    statusOk: "Заявка отправлена",
    statusErr: "Ошибка отправки",
    statusSend: "Отправка..."
  },
  kz: {
    name: "Клиенттің аты",
    phone: "Телефон",
    email: "Email",
    submit: "Өтінім жіберу",
    statusOk: "Өтінім жіберілді",
    statusErr: "Жіберу қатесі",
    statusSend: "Жіберілуде..."
  },
  en: {
    name: "Client name",
    phone: "Phone",
    email: "Email",
    submit: "Send request",
    statusOk: "Request sent",
    statusErr: "Send failed",
    statusSend: "Sending..."
  }
};

export default function WebsiteLeadForm({ lang }: { lang: Locale }) {
  const [status, setStatus] = useState<string>("");
  const copy = labels[lang];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(copy.statusSend);
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      source: "website",
      utm: Object.fromEntries(new URLSearchParams(window.location.search)),
      lang
    };

    const response = await fetch("/api/website-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      setStatus(copy.statusOk);
      event.currentTarget.reset();
    } else {
      setStatus(copy.statusErr);
    }
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-1">
        <label className="text-sm text-slate-600" htmlFor="name">
          {copy.name}
        </label>
        <input
          id="name"
          name="name"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
          required
        />
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-slate-600" htmlFor="phone">
          {copy.phone}
        </label>
        <input
          id="phone"
          name="phone"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
        />
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-slate-600" htmlFor="email">
          {copy.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
        />
      </div>
      <button className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white" type="submit">
        {copy.submit}
      </button>
      {status ? <p className="text-sm text-slate-500">{status}</p> : null}
    </form>
  );
}
