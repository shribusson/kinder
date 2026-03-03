import { fetchJson } from "@/app/lib/api";

interface EducationOverview {
  programs: number;
  courses: number;
  cohorts: number;
  enrollments: number;
}

interface EnrollmentItem {
  id: string;
  status: string;
  enrolledAt: string;
  family?: { name: string } | null;
  student: { firstName: string; lastName: string };
  course: {
    name: string;
    program?: { name: string } | null;
  };
  cohort?: { name: string } | null;
}

export default async function CrmEducationPage() {
  const overview = await fetchJson<EducationOverview>("/crm/education/overview", undefined, {
    programs: 0,
    courses: 0,
    cohorts: 0,
    enrollments: 0,
  });

  const enrollments = await fetchJson<EnrollmentItem[]>("/crm/education/enrollments", undefined, []);

  return (
    <div className="flex flex-col gap-6">
      <section className="card">
        <h1 className="text-2xl font-bold text-slate-900">Образовательный контур CRM</h1>
        <p className="mt-2 text-sm text-slate-600">
          Управление программами, курсами и зачислениями с интеграцией воронки продаж.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="card">
          <p className="text-xs text-slate-500">Программы</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{overview.programs}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500">Курсы</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{overview.courses}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500">Группы</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{overview.cohorts}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500">Зачисления</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{overview.enrollments}</p>
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold text-slate-900">Последние зачисления</h2>
        {enrollments.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Пока нет зачислений.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="py-2 pr-4">Семья</th>
                  <th className="py-2 pr-4">Ученик</th>
                  <th className="py-2 pr-4">Курс</th>
                  <th className="py-2 pr-4">Группа</th>
                  <th className="py-2 pr-4">Статус</th>
                  <th className="py-2">Дата</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.slice(0, 10).map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4">{item.family?.name ?? "—"}</td>
                    <td className="py-2 pr-4">{item.student.lastName} {item.student.firstName}</td>
                    <td className="py-2 pr-4">{item.course.program?.name ? `${item.course.program.name} / ` : ""}{item.course.name}</td>
                    <td className="py-2 pr-4">{item.cohort?.name ?? "—"}</td>
                    <td className="py-2 pr-4">{item.status}</td>
                    <td className="py-2">{new Date(item.enrolledAt).toLocaleDateString("ru-RU")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold text-slate-900">Сквозной сценарий</h2>
        <p className="mt-2 text-sm text-slate-600">
          Используйте API `POST /crm/education/enrollments/from-deal`, чтобы конвертировать выигранную сделку в ученика и зачисление.
        </p>
      </section>
    </div>
  );
}
