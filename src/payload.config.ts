// storage-adapter-import-placeholder
import { sqliteAdapter } from '@payloadcms/db-sqlite'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

/// ---

// Import collections
import Teams from './collections/Teams'
import Players from './collections/Players'
import Matches from './collections/Matches'
import Tournaments from './collections/Tournaments'
import Rankings from './collections/Rankings'
import Search from './collections/SemanticSearch'
import Media from './collections/Media'

import searchEndpoint from './endpoints/semantic-search'

// Import tasks
import { csapiSyncTask } from './tasks/csapiSyncTask'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const shouldPushSchema = process.env.PAYLOAD_PUSH_SCHEMA === 'true' && process.env.VITEST !== 'true'

export default buildConfig({
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  editor: defaultLexical,
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || '',
    },
    push: shouldPushSchema,
  }),
  collections: [
    Pages,
    Posts,
    Categories,
    Users,
    Teams,
    Players,
    Matches,
    Tournaments,
    Rankings,
    Media,
    Search,
  ],
  endpoints: [searchEndpoint],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    autoRun: [
      {
        cron: '*/30 * * * *', // Every 30 minutes (5-field standard Unix cron)
        queue: 'default',
      },
    ],
    tasks: [csapiSyncTask],
  },
})
