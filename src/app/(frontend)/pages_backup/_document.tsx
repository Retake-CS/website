import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="pt-BR" data-theme="rcs">
      <Head />
      <body className="text-white min-h-screen bg-base-100">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}