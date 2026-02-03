import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  metadataBase: new URL('https://schoolkids.kz'), // TODO: change to auto shop domain
  title: {
    default: "Автомастерская — профессиональный ремонт автомобилей | Гарантия качества",
    template: "%s | Автомастерская"
  },
  description: "Профессиональный ремонт автомобилей. Диагностика, замена запчастей, техническое обслуживание. Собственный склад запчастей, гарантия на все работы.",
  keywords: [
    "ремонт автомобилей",
    "автомастерская",
    "диагностика автомобилей",
    "техническое обслуживание",
    "замена запчастей",
    "тормозная система",
    "система охлаждения",
  ],
  authors: [{ name: "Автомастерская" }],
  creator: "Автомастерская",
  publisher: "Автомастерская",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://schoolkids.kz",
    siteName: "Автомастерская",
    title: "Автомастерская — профессиональный ремонт автомобилей",
    description: "Профессиональный ремонт и техническое обслуживание автомобилей. Гарантия на все виды работ.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Автомастерская — профессиональный ремонт",
    description: "Ремонт и техническое обслуживание автомобилей с гарантией.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AutoRepair",
              "name": "Автомастерская",
              "description": "Профессиональный ремонт и техническое обслуживание автомобилей",
              "url": "https://schoolkids.kz",
              "areaServed": {
                "@type": "City",
                "name": "Караганда"
              },
              "priceRange": "$$",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "1"
              }
            })
          }}
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1e293b',
              border: '1px solid #e2e8f0',
              padding: '12px 16px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
