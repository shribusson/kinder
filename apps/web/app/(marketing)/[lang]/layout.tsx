import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n";

type Lang = (typeof locales)[number];

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Lang };
}) {
  if (!locales.includes(params.lang)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={params.lang} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
