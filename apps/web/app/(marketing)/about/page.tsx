import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">О компании</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Мы профессионально занимаемся ремонтом и обслуживанием автомобилей
          </p>
        </div>

        <div className="bg-white rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Наша миссия</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Обеспечить качественный и честный ремонт каждого автомобиля. Мы верим в прозрачное ценообразование, использование только оригинальных запчастей и честное общение с клиентами.
          </p>
        </div>

        <div className="bg-white rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Наши ценности</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Опыт", desc: "Специалисты с многолетним опытом работы" },
              { title: "Качество", desc: "Используем только оригинальные запчасти" },
              { title: "Гарантия", desc: "Гарантия на все виды ремонтных работ" },
              { title: "Честность", desc: "Прозрачное ценообразование без скрытых доплат" },
            ].map((value) => (
              <div key={value.title} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 bg-orange-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Готовы начать?</h2>
          <p className="text-gray-600 mb-6">Свяжитесь с нами, чтобы обсудить вашу проблему</p>
          <Link
            href="/contacts"
            className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
          >
            Записаться на приём
          </Link>
        </div>
      </div>
    </div>
  );
}
