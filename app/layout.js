/**
 * Root layout — minimal wrapper.
 * Actual layout with fonts + providers lives in app/[locale]/layout.js
 */
export const metadata = {
  title: 'ExpoContact',
  icons: {
    icon: 'https://static.tildacdn.one/tild3763-3133-4362-b561-386636623766/favicon.ico',
    shortcut: 'https://static.tildacdn.one/tild3763-3133-4362-b561-386636623766/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return children;
}
