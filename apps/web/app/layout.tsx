import "./globals.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales } from "@/i18n";

export const metadata: Metadata = {
  metadataBase: new URL('https://schoolkids.kz'),
  title: {
    default: "School Kids — детский центр развития в Караганде | Логопед, психолог, подготовка к школе",
    template: "%s | School Kids"
  },
  description: "School Kids — детский развивающий центр в Караганде. Профессиональный логопед, психолог, дефектолог, подготовка к школе. Индивидуальный подход к каждому ребенку. Запишитесь на бесплатную консультацию!",
  keywords: [
    "детский центр Караганда",
    "логопед Караганда",
    "детский психолог Караганда",
    "дефектолог Караганда",
    "подготовка к школе Караганда",
    "развитие речи",
    "коррекционные занятия",
    "School Kids",
    "детский центр развития"
  ],
  authors: [{ name: "School Kids" }],
  creator: "School Kids",
  publisher: "School Kids",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/brand-logo.png",
    apple: "/brand-logo.png"
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://schoolkids.kz",
    siteName: "School Kids",
    title: "School Kids — детский центр развития в Караганде",
    description: "Профессиональный логопед, психолог, подготовка к школе. Индивидуальный подход к каждому ребенку.",
    images: [
      {
        url: "/brand-logo.png",
        width: 1200,
        height: 630,
        alt: "School Kids — детский центр развития"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "School Kids — детский центр развития в Караганде",
    description: "Логопед, психолог, подготовка к школе. Индивидуальный подход.",
    images: ["/brand-logo.png"]
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
  verification: {
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale?: string };
}) {
  // Validate that the incoming `locale` parameter is valid
  if (params.locale && !locales.includes(params.locale as any)) {
    notFound();
  }

  const lang = params.locale || 'ru';

  return (
    <html lang={lang}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "School Kids",
              "description": "Детский развивающий центр в Караганде",
              "url": "https://schoolkids.kz",
              "logo": "https://schoolkids.kz/brand-logo.png",
              "image": "https://schoolkids.kz/brand-logo.png",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "ул. Язева, 9",
                "addressLocality": "Караганда",
                "addressRegion": "Казыбек Би район",
                "postalCode": "100026",
                "addressCountry": "KZ"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "49.772767",
                "longitude": "73.131225"
              },
              "telephone": "+77082050318",
              "email": "info@schoolkids.kz",
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  "opens": "09:00",
                  "closes": "19:00"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": "Saturday",
                  "opens": "10:00",
                  "closes": "16:00"
                }
              ],
              "department": [
                {
                  "@type": "EducationalOrganization",
                  "name": "School Kids — ул. Язева, 9",
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "ул. Язева, 9",
                    "addressLocality": "Караганда",
                    "addressRegion": "Казыбек Би район",
                    "postalCode": "100026",
                    "addressCountry": "KZ"
                  },
                  "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": "49.772767",
                    "longitude": "73.131225"
                  },
                  "telephone": "+77082050318",
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.8",
                    "reviewCount": "35"
                  }
                },
                {
                  "@type": "EducationalOrganization",
                  "name": "School Kids — ул. Университетская, 17",
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "ул. Университетская, 17",
                    "addressLocality": "Караганда",
                    "addressRegion": "Казыбек Би район",
                    "postalCode": "100026",
                    "addressCountry": "KZ"
                  },
                  "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": "49.766347",
                    "longitude": "73.13314"
                  },
                  "telephone": "+77082812899",
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "5",
                    "reviewCount": "27"
                  }
                }
              ],
              "sameAs": [
                "https://instagram.com/schoolkids.krg",
                "https://2gis.kz/karaganda/firm/70000001047590529",
                "https://2gis.kz/karaganda/firm/70000001097016512"
              ],
              "priceRange": "$$",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "35"
              },
              "areaServed": {
                "@type": "City",
                "name": "Караганда"
              }
            })
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
