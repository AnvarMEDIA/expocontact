import '@/app/globals.css';
import '@/app/site-fonts.css';

export const metadata = {
  title: 'Admin — ExpoContact CMS',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
