'use client';

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function AboutPage({ params }: { params: { lang: string } }) {
  const t = useTranslations();
  const aboutData = t.raw('aboutPage');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Image 
              src="/brand-logo.png" 
              alt="School Kids" 
              width={120} 
              height={120}
              className="rounded-full shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {aboutData.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {aboutData.hero}
          </p>
        </div>

        {/* Миссия */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{aboutData.mission.title}</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            {aboutData.mission.text}
          </p>
        </div>

        {/* Команда */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{aboutData.team.title}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{aboutData.team.logopeds.title}</h3>
              <p className="text-gray-700">
                {aboutData.team.logopeds.text}
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{aboutData.team.psychologists.title}</h3>
              <p className="text-gray-700">
                {aboutData.team.psychologists.text}
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{aboutData.team.defectologists.title}</h3>
              <p className="text-gray-700">
                {aboutData.team.defectologists.text}
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{aboutData.team.teachers.title}</h3>
              <p className="text-gray-700">
                {aboutData.team.teachers.text}
              </p>
            </div>
          </div>
        </div>

        {/* Ценности */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{aboutData.values.title}</h2>
          <div className="space-y-4">
            {aboutData.values.items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-4">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-700">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {aboutData.cta.title}
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            {aboutData.cta.subtitle}
          </p>
          <Link
            href={`/${params.lang}#contact`}
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            {aboutData.cta.button}
          </Link>
        </div>
      </div>
    </div>
  );
}
