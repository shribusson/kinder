"use client";

import { useState } from "react";

export default function WebsiteLeadForm() {
  const [status, setStatus] = useState<string>("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Отправка...");
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      source: "website",
      utm: Object.fromEntries(new URLSearchParams(window.location.search))
    };

    const response = await fetch("/api/website-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      setStatus("Заявка отправлена");
      event.currentTarget.reset();
    } else {
      setStatus("Ошибка отправки");
    }
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-1">
        <label className="text-sm text-slate-600" htmlFor="name">
          Имя клиента
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
          Телефон
        </label>
        <input
          id="phone"
          name="phone"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
        />
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-slate-600" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
        />
      </div>
      <button className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white" type="submit">
        Отправить заявку
      </button>
      {status ? <p className="text-sm text-slate-500">{status}</p> : null}
    </form>
  );
}
