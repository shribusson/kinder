"use client";

import Link from "next/link";
import Image from "next/image";
import { clsx } from "clsx";
import { useState, useEffect } from "react";
import { IconMenu2, IconX } from "@tabler/icons-react";

const navItems = [
  { label: "Дашборд", href: "/crm", icon: "📊" },
  { label: "Входящие", href: "/crm/inbox", icon: "📬" },
  { label: "Лиды", href: "/crm/leads", icon: "👥" },
  { label: "Сделки", href: "/crm/deals", icon: "🎯" },
  { label: "Обучение", href: "/crm/education", icon: "🎓" },
  { label: "Записи", href: "/crm/bookings", icon: "📅" },
  { label: "Карточки", href: "/crm/profiles", icon: "🗂️" },
  { label: "Кампании", href: "/crm/campaigns", icon: "📢" },
  { label: "Аналитика", href: "/crm/analytics", icon: "📈" },
  { label: "Операции", href: "/crm/mechanic", icon: "⚙️" }
];

const settingsItems = [
  { label: "Каталог", href: "/crm/settings/services", icon: "🛠️" },
  { label: "Справочники", href: "/crm/settings/directories", icon: "🏭" },
  { label: "Интеграции", href: "/crm/settings/integrations", icon: "🔌" },
  { label: "План продаж", href: "/crm/settings/revenue-plan", icon: "💰" },
  { label: "Ресурсы", href: "/crm/settings/resources", icon: "⚙️" },
  { label: "Пользователи", href: "/crm/settings/users", icon: "👤" },
  { label: "Документы", href: "/crm/settings/work-order", icon: "📋" }
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) {
      setCollapsed(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
    }
  }, [collapsed, mounted]);

  return (
    <aside className={clsx(
      "flex h-full flex-col gap-6 border-r border-slate-200 bg-white p-6 transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="flex items-center justify-between gap-3">
        <div className={clsx("flex items-center gap-3", collapsed && "justify-center w-full")}>
          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-slate-200 bg-white flex-shrink-0">
            <Image
              src="/brand/logo.webp"
              alt="Скул-Кидс"
              fill
              sizes="40px"
              className="object-contain p-1"
              priority
            />
          </div>
          {!collapsed && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
                Скул-Кидс
              </p>
              <h1 className="mt-1 text-lg font-semibold text-slate-900">
                CRM
              </h1>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded hover:bg-slate-100 transition-colors"
            title="Свернуть"
          >
            <IconX className="w-5 h-5 text-slate-600" />
          </button>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="absolute left-6 top-6 p-1 rounded hover:bg-slate-100 transition-colors"
            title="Развернуть"
          >
            <IconMenu2 className="w-5 h-5 text-slate-600" />
          </button>
        )}
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto pr-1 flex flex-col gap-2 text-sm">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "rounded-xl px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900",
              collapsed ? "flex justify-center" : "flex items-center gap-2"
            )}
            title={collapsed ? item.label : undefined}
          >
            <span>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}

        {/* Settings Section */}
        {!collapsed && (
          <div className="mt-6 mb-2">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Настройки
              </h3>
            </div>
          </div>
        )}
        {settingsItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "rounded-xl px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900",
              collapsed ? "flex justify-center" : "flex items-center gap-2"
            )}
            title={collapsed ? item.label : undefined}
          >
            <span>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
      <div className="mt-auto">
        <button
          onClick={() => {
            document.cookie = 'auth_token=; path=/; max-age=0';
            window.location.href = '/crm/login';
          }}
          className={clsx(
            "rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors",
            collapsed ? "w-full flex justify-center py-3" : "w-full"
          )}
          title={collapsed ? "Выйти" : undefined}
        >
          {collapsed ? "🚪" : "Выйти"}
        </button>
      </div>
    </aside>
  );
}
