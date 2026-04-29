import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []
  const socialLinks = footerData?.socialLinks || []
  const copyright = footerData?.copyright || '© 2025 RCS - Todos os direitos reservados.'
  const additionalLinks = footerData?.additionalLinks || []

  return (
    <footer className="mt-auto border-t border-rcs-sec-400 bg-rcs-sec text-rcs-bg">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo e Descrição */}
          <div className="lg:col-span-1 text-center lg:text-left">
            <Link className="flex items-center justify-center lg:justify-start mb-4" href="/">
              <Logo />
            </Link>
            <p className="text-sm text-rcs-bg/80 leading-relaxed">
              Portal brasileiro de Counter-Strike 2 com notícias, rankings e estatísticas em tempo real.
            </p>
          </div>

          {/* Navegação Principal */}
          <div className="text-center lg:text-left">
            <h3 className="text-lg font-bold text-rcs-cta mb-4">Navegação</h3>
            <nav className="flex flex-col gap-3">
              <Link href="/" className="text-rcs-bg hover:text-rcs-cta transition-colors duration-200 text-sm">
                Início
              </Link>
              <Link href="/partidas" className="text-rcs-bg hover:text-rcs-cta transition-colors duration-200 text-sm">
                Partidas
              </Link>
              <Link href="/rankings" className="text-rcs-bg hover:text-rcs-cta transition-colors duration-200 text-sm">
                Rankings
              </Link>
              <Link href="/noticias" className="text-rcs-bg hover:text-rcs-cta transition-colors duration-200 text-sm">
                Notícias
              </Link>
              {navItems.map(({ link }, i) => {
                return <CMSLink className="text-rcs-bg hover:text-rcs-cta transition-colors duration-200 text-sm" key={i} {...link} />
              })}
            </nav>
          </div>

          {/* Links Adicionais */}
          <div className="text-center lg:text-left">
            <h3 className="text-lg font-bold text-rcs-cta mb-4">Links</h3>
            <nav className="flex flex-col gap-3">
              <Link href="/sobre" className="text-rcs-bg hover:text-rcs-cta transition-colors duration-200 text-sm">
                Sobre
              </Link>
              <Link href="/contato" className="text-rcs-bg hover:text-rcs-cta transition-colors duration-200 text-sm">
                Contato
              </Link>
              <Link href="/privacidade" className="text-rcs-bg hover:text-rcs-cta transition-colors duration-200 text-sm">
                Privacidade
              </Link>
              <Link href="/termos" className="text-rcs-bg hover:text-rcs-cta transition-colors duration-200 text-sm">
                Termos de Uso
              </Link>
              {additionalLinks.map(({ link }, i) => {
                return <CMSLink className="text-rcs-bg hover:text-rcs-cta transition-colors duration-200 text-sm" key={i} {...link} />
              })}
            </nav>
          </div>

          {/* Redes Sociais e Tema */}
          <div className="text-center lg:text-left">
            <h3 className="text-lg font-bold text-rcs-cta mb-4">Redes Sociais</h3>
            <div className="flex justify-center lg:justify-start gap-4 mb-6">
              {socialLinks.map(({ platform, url }, i) => {
                const label = platform.charAt(0).toUpperCase() + platform.slice(1)

                return (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rcs-bg hover:text-rcs-cta transition-colors duration-200 text-sm font-medium"
                    aria-label={platform}
                  >
                    {label}
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-rcs-sec-400 text-center">
          <p className="text-sm text-rcs-bg/70">{copyright}</p>
        </div>
      </div>
    </footer>
  )
}
