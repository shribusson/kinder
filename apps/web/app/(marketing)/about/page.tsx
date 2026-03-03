import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">О школе</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Мы развиваем детей через современные программы дополнительного образования
          </p>
        </div>

        <div className="bg-white rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Наша миссия</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Дать каждому ребенку доступ к качественному обучению, которое развивает мышление, дисциплину и уверенность. Мы строим прозрачный процесс с вовлечением родителей и понятной траекторией прогресса.
          </p>
        </div>

        <div className="bg-white rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Наши ценности</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Педагогика", desc: "Преподаватели и методисты с практическим опытом" },
              { title: "Качество", desc: "Актуальные образовательные программы и методики" },
              { title: "Результат", desc: "Измеримый прогресс и регулярная обратная связь" },
              { title: "Партнерство", desc: "Прозрачная коммуникация с родителями" },
            ].map((value) => (
              <div key={value.title} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 bg-orange-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Готовы начать обучение?</h2>
          <p className="text-gray-600 mb-6">Оставьте заявку и мы подберем программу для вашего ребенка</p>
          <Link
            href="/contacts"
            className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
          >
            Оставить заявку
          </Link>
        </div>
      </div>
    </div>
  );
}
