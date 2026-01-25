import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "О центре School Kids",
  description: "School Kids — современный детский развивающий центр в Алматы. Наша миссия — помочь каждому ребенку раскрыть свой потенциал через профессиональный подход и заботу.",
  openGraph: {
    title: "О центре School Kids — детский центр развития",
    description: "Узнайте больше о нашей команде, методиках и ценностях"
  }
};

export default function AboutPage({ params }: { params: { lang: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Image 
              src="/brand-logo.jpg" 
              alt="School Kids" 
              width={120} 
              height={120}
              className="rounded-full shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            О центре School Kids
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Мы создали пространство, где каждый ребёнок может развиваться в комфортной атмосфере с поддержкой опытных специалистов
          </p>
        </div>

        {/* Миссия */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Наша миссия</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Помогать детям раскрывать свой потенциал через профессиональный подход, современные методики и индивидуальную заботу. Мы верим, что каждый ребёнок уникален и заслуживает внимательного отношения к его особенностям развития.
          </p>
        </div>

        {/* Команда */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Наша команда</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Логопеды</h3>
              <p className="text-gray-700">
                Дипломированные специалисты с опытом работы от 5 лет. Регулярно проходят курсы повышения квалификации и внедряют современные методики коррекции речи.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Психологи</h3>
              <p className="text-gray-700">
                Детские психологи, специализирующиеся на работе с детьми дошкольного и младшего школьного возраста. Бережный подход и глубокое понимание детской психологии.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Дефектологи</h3>
              <p className="text-gray-700">
                Специалисты по коррекционной педагогике с медицинским образованием. Работают с детьми, имеющими особенности развития, используя проверенные методики.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Педагоги</h3>
              <p className="text-gray-700">
                Опытные преподаватели по подготовке к школе. Используют игровые формы обучения, делая процесс увлекательным и эффективным для детей.
              </p>
            </div>
          </div>
        </div>

        {/* Ценности */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Наши ценности</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-4">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Индивидуальный подход</h3>
                <p className="text-gray-700">Каждый ребёнок получает персональную программу развития</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-4">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Профессионализм</h3>
                <p className="text-gray-700">Работаем только с квалифицированными специалистами</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-4">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Комфорт и безопасность</h3>
                <p className="text-gray-700">Создаём уютную атмосферу для занятий и развития</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-4">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Результативность</h3>
                <p className="text-gray-700">Отслеживаем прогресс и корректируем программу для достижения целей</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Приходите на бесплатную консультацию
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Познакомьтесь с нашей командой, задайте вопросы и получите рекомендации по развитию вашего ребёнка
          </p>
          <Link
            href={`/${params.lang}#contact`}
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Записаться на консультацию
          </Link>
        </div>
      </div>
    </div>
  );
}
