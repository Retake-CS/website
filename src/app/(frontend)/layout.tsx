import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './styles/global.css'
import './styles/theme.css'
import './styles/scroll.css'
import './styles/utilities.css'
import './styles/dynamic-pages.css'
import './index.css'
import { Footer } from '@/Footer/Component'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RCS - Counter-Strike Portal',
  description: 'Portal brasileiro de Counter-Strike 2 com notícias, rankings e estatísticas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" data-theme="rcs">
      <body className="text-white min-h-screen bg-rcs-bg flex flex-col">
        {children}
        <Footer />
      </body>
    </html>
  )
}
