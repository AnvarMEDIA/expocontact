/**
 * Root layout — minimal wrapper.
 * Actual layout with fonts + providers lives in app/[locale]/layout.js
 */
export const metadata = {
  title: 'ExpoContact',
};

export default function RootLayout({ children }) {
  return children;
}
