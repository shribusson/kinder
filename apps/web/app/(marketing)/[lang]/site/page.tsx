import type { Metadata } from "next";
import PageHeader from "@/app/components/PageHeader";
import WebsiteLeadForm from "./website-lead-form";

const titles = {
  ru: "Запись на консультацию",
  kz: "Кеңеске жазылу",
  en: "Book a consultation"
} as const;

const subtitles = {
  ru: "Оставьте контакты — мы подберём удобное время",
  kz: "Байланыс қалдырыңыз — ыңғайлы уақыт ұсынамыз",
  en: "Leave your details and we will offer a convenient time"
} as const;

export function generateMetadata({ params }: { params: { lang: keyof typeof titles } }): Metadata {
  return {
    title: titles[params.lang],
    description: subtitles[params.lang]
  };
}

export default function SitePage({ params }: { params: { lang: keyof typeof titles } }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={titles[params.lang]} subtitle={subtitles[params.lang]} />
      <div className="card">
        <WebsiteLeadForm lang={params.lang} />
      </div>
    </div>
  );
}
