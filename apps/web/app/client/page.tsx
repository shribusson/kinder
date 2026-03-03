import Link from "next/link";
import Image from "next/image";
import { fetchJson } from "@/app/lib/api";

interface ClientProgram {
  id: string;
  name: string;
  description?: string | null;
  courses: Array<{
    id: string;
    name: string;
    level?: string | null;
    ageMin?: number | null;
    ageMax?: number | null;
  }>;
}

export default async function ClientPortalPage() {
  const programs = await fetchJson<ClientProgram[]>("/client/catalog/programs", {}, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <Image
              src="/brand/logo.webp"
              alt="Скул-Кидс"
              fill
              sizes="48px"
              className="object-contain p-1"
              priority
            />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Скул-Кидс</p>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Клиентский портал</h1>
        <p className="mt-2 text-gray-600">
          Каталог программ дополнительного образования и доступ к личному кабинету семьи.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {programs.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
            Программы пока не опубликованы.
          </div>
        ) : (
          programs.map((program) => (
            <article key={program.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">{program.name}</h2>
              {program.description ? <p className="mt-2 text-gray-600">{program.description}</p> : null}

              <div className="mt-4 space-y-2">
                {program.courses.slice(0, 5).map((course) => (
                  <div key={course.id} className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    <div className="font-medium">{course.name}</div>
                    <div className="text-gray-500">
                      {course.level ? `Уровень: ${course.level}` : "Уровень уточняется"}
                      {course.ageMin || course.ageMax
                        ? ` · Возраст: ${course.ageMin ?? "?"}-${course.ageMax ?? "?"}`
                        : ""}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))
        )}
      </section>

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">Следующий шаг</h3>
        <p className="mt-2 text-gray-600">
          В следующей итерации здесь появятся расписание, зачисления, оплаты и материалы ученика.
        </p>
        <div className="mt-4">
          <Link
            href="/crm"
            className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Перейти в CRM
          </Link>
        </div>
      </section>
    </main>
  );
}
