import './globals.css'

export const metadata = {
  title: 'MDBC - Million Dollar Birth Card',
  description: 'Discover your strategic business cycles through cardology',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-serif">{children}</body>
    </html>
  )
}