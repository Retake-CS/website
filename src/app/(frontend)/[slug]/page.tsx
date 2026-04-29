import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import type { Page as PageType } from '@/payload-types'
import LiveGames from "../components/LiveGames";

import { generateMeta } from '@/utilities/generateMeta'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import Header from '@/app/(frontend)/components/Header'
import { Footer } from '@/Footer/Component'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function Page({ params: paramsPromise }: PageProps) {
  const { slug } = await paramsPromise
  const url = '/' + slug

  const page = await queryPageBySlug({
    slug,
  })

  // Remove this if you want to return null on a not found page
  if (!page) {
    return notFound()
  }

  if (page.slug !== slug) return notFound()

  return (
    <article className="min-h-screen">
      <PayloadRedirects disableNotFound url={url} />

      <Header />
      <LiveGames />

      <div className='container mx-auto px-4'>
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-rcs-sec pt-8" aria-label="Breadcrumb">
          <a href="/" className="hover:text-rcs-cta transition-colors">Início</a>
          <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-rcs-sec font-medium">{page.title}</span>
        </nav>

        {/* Page Title Section */}
        <section className="bg-rcs-bg pt-4 pb-8">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-rcs-cta rounded-full mr-2 group-hover:scale-125 transition-transform duration-300"></div>
            <h1 className="text-3xl font-bold text-rcs-sec group-hover:text-rcs-cta transition-colors duration-300 cursor-default">
              {page.title}
            </h1>
          </div>
          {page.meta?.description && (
            <p className="text-rcs-sec-600 text-sm md:text-base max-w-2xl">
              {page.meta.description}
            </p>
          )}
        </section>
          
        {/* Hero Section */}
        <RenderHero {...page.hero}/>

        {/* Page Content */}
        <div className="page-content">
          <RenderBlocks blocks={page.layout} />
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: PageProps): Promise<Metadata> {
  const { slug } = await paramsPromise
  const page = await queryPageBySlug({
    slug,
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const payload = await getPayload({ config: configPromise })
  const { isEnabled: draft } = await draftMode()

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})