import './globals.css';

export const metadata = {
  title: 'EntryWay - Professional CV in 5 Minutes',
  description: 'Create a professional CV instantly. No templates, no learning curve.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
