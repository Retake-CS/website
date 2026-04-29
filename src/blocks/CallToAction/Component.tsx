import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  return (
    <div className="container cta-block">
      <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-center">
        <div className="max-w-[48rem] flex items-center">
          {richText && <RichText className="mb-0 rich-text cta-rich-text" data={richText} enableGutter={false} />}
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          {(links || []).map(({ link }, i) => {
            return <CMSLink key={i} className="btn" size="lg" {...link} />
          })}
        </div>
      </div>
    </div>
  )
}
