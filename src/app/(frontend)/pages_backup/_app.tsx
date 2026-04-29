import '../styles/global.css'
import '../styles/theme.css'
import '../styles/scroll.css'
import '../styles/utilities.css'
import '../styles/utils.css'
import '../index.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}