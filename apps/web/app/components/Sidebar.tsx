"use client";

import Link from "next/link";
import { clsx } from "clsx";

const navItems = [
  { label: "Дашборд", href: "/crm" },
  { label: "Входящие", href: "/crm/inbox" },
  { label: "Лиды", href: "/crm/leads" },
  { label: "Сделки", href: "/crm/deals" },
  { label: "Записи", href: "/crm/bookings" },
  { label: "Кампании", href: "/crm/campaigns" },
  { label: "Аналитика", href: "/crm/analytics" }
];

export default function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col gap-6 border-r border-slate-200 bg-white p-6">
      <div className="flex items-center gap-3">
          <img
            src="/brand-logo.png"
          alt="School Kids"
          className="h-10 w-10 rounded-xl object-cover"
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
            School Kids
          </p>
          <h1 className="mt-1 text-lg font-semibold text-slate-900">
            CRM
          </h1>
        </div>
      </div>
      <nav className="flex flex-col gap-2 text-sm">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "rounded-xl px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto">
        <button
          onClick={() => {
            document.cookie = 'auth_token=; path=/; max-age=0';
            window.location.href = '/crm/login';
          }}
          className="w-full rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
        >
          Выйти
        </button>
      </div>
    </aside>
  );
}
