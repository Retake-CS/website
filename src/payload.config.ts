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

// Production Turso database — fallback when DATABASE_URI env var is not set
const TURSO_URL =
  'libsql://retakecs-retakecs.aws-us-west-2.turso.io?authToken=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzc0NjQ1NzcsImlkIjoiMDE5ZGQ5MjQtMTcwMS03OTBjLWE4MjAtYTkyNmQ0YzY4MGNkIiwicmlkIjoiMjc0ZDQ5YzQtMDdiZS00YzkxLTlmNmMtZjczYjE5YWY5MTg3In0.lOg5EBzf_waYFg0TUHooGw7mRpfprbCB63Go1CucWlS5gttmEkh9EgXuG4Ht1f0uQHhLALyKhpzkOLv02awaAQ'

const PAYLOAD_SECRET_FALLBACK = 'retakecs-payload-secret-2026-xk9mQp3jRs'
const CRON_SECRET_FALLBACK = 'retakecs-cron-2026-mK7pZ'

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
      // Use env var if set (local dev), otherwise use Turso production DB
      url: process.env.DATABASE_URI || TURSO_URL,
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
  secret: process.env.PAYLOAD_SECRET || PAYLOAD_SECRET_FALLBACK,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true
        const authHeader = req.headers.get('authorization')
        const secret = process.env.CRON_SECRET || CRON_SECRET_FALLBACK
        return authHeader === `Bearer ${secret}`
      },
    },
    autoRun: [
      {
        cron: '*/30 * * * *',
        queue: 'default',
      },
    ],
    tasks: [csapiSyncTask],
  },
})
