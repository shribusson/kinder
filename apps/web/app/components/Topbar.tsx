export default function Topbar() {
  return (
    <header className="flex items-center justify-between rounded-2xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-100">
      <div>
        <p className="text-xs text-slate-500">Сегодня</p>
        <h2 className="text-xl font-semibold text-slate-900">Панель управления</h2>
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
          Экспорт отчета
        </button>
        <button className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
          Новая заявка
        </button>
      </div>
    </header>
  );
}
