import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL('https://schoolkids.kz'),
  title: {
    default: "School Kids — детский центр развития в Алматы | Логопед, психолог, подготовка к школе",
    template: "%s | School Kids"
  },
  description: "School Kids — детский развивающий центр в Алматы. Профессиональный логопед, психолог, дефектолог, подготовка к школе. Индивидуальный подход к каждому ребенку. Запишитесь на бесплатную консультацию!",
  keywords: [
    "детский центр Алматы",
    "логопед Алматы",
    "детский психолог Алматы",
    "дефектолог Алматы",
    "подготовка к школе Алматы",
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
    icon: "/brand-logo.jpg",
    apple: "/brand-logo.jpg"
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://schoolkids.kz",
    siteName: "School Kids",
    title: "School Kids — детский центр развития в Алматы",
    description: "Профессиональный логопед, психолог, подготовка к школе. Индивидуальный подход к каждому ребенку.",
    images: [
      {
        url: "/brand-logo.jpg",
        width: 1200,
        height: 630,
        alt: "School Kids — детский центр развития"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "School Kids — детский центр развития в Алматы",
    description: "Логопед, психолог, подготовка к школе. Индивидуальный подход.",
    images: ["/brand-logo.jpg"]
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
  children
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
              "@type": "EducationalOrganization",
              "name": "School Kids",
              "description": "Детский развивающий центр в Алматы",
              "url": "https://schoolkids.kz",
              "logo": "https://schoolkids.kz/brand-logo.jpg",
              "image": "https://schoolkids.kz/brand-logo.jpg",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "ул. Примерная, 123",
                "addressLocality": "Алматы",
                "addressCountry": "KZ"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "43.238293",
                "longitude": "76.889709"
              },
              "telephone": "+77001234567",
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
              "sameAs": [
                "https://instagram.com/schoolkids.kz",
                "https://facebook.com/schoolkids.kz"
              ],
              "priceRange": "$$",
              "areaServed": {
                "@type": "City",
                "name": "Алматы"
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
