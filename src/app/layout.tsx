import './globals.css';

export const metadata = {
  title: 'EduLink | Sistema de Gestión Escolar',
  description: 'Plataforma administrativa para instituciones educativas.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
