import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: "Скул-Кидс — школа дополнительного образования для детей",
    template: "%s | Скул-Кидс"
  },
  description: "Школа дополнительного образования для детей: программы, курсы, расписание, личный кабинет родителя и CRM сопровождение обучения.",
  keywords: [
    "дополнительное образование детей",
    "детские курсы",
    "edtech школа",
    "расписание занятий",
    "личный кабинет родителя",
    "детский образовательный центр",
  ],
  authors: [{ name: "Скул-Кидс" }],
  creator: "Скул-Кидс",
  publisher: "Скул-Кидс",
  icons: {
    icon: '/brand/logo.webp',
    shortcut: '/brand/logo.webp',
    apple: '/brand/logo.webp',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "http://localhost:3000",
    siteName: "Скул-Кидс",
    title: "Скул-Кидс — школа дополнительного образования",
    description: "Программы обучения для детей, расписание, материалы и интеграция с CRM.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Скул-Кидс — дополнительное образование для детей",
    description: "Современная EdTech-платформа: курсы, прогресс, расписание и поддержка семьи.",
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
              "@type": "EducationalOrganization",
              "name": "Скул-Кидс",
              "description": "Школа дополнительного образования для детей",
              "url": "http://localhost:3000",
              "areaServed": {
                "@type": "City",
                "name": "Караганда"
              },
              "educationLevel": "Дополнительное образование",
              "audience": {
                "@type": "EducationalAudience",
                "educationalRole": "student"
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
