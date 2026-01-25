import "./globals.css";

export const metadata = {
  title: {
    default: "School Kids",
    template: "%s | School Kids"
  },
  description: "School Kids — детский центр: логопед, психолог, подготовка к школе.",
  icons: {
    icon: "/brand-logo.jpg"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        {children}
      </body>
    </html>
  );
}
