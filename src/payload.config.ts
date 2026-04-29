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
import BO3SyncRuns from './collections/BO3SyncRuns'

// Import endpoints
import searchEndpoint from './endpoints/semantic-search'
import bo3SyncHealthEndpoint from './endpoints/bo3-sync-health'
import bo3SyncTriggerEndpoint from './endpoints/bo3-sync-trigger'
import { bo3SyncMatchesTask } from './jobs/tasks/bo3SyncMatchesTask'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const shouldPushSchema = process.env.PAYLOAD_PUSH_SCHEMA === 'true' && process.env.VITEST !== 'true'
const enableBO3AutoRun = process.env.BO3_SYNC_ENABLE_AUTORUN === 'true'

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
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
    BO3SyncRuns,
    Media,
    Search,
  ],
  endpoints: [searchEndpoint, bo3SyncHealthEndpoint, bo3SyncTriggerEndpoint],
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
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    autoRun: enableBO3AutoRun
      ? [
          {
            queue: 'bo3-live',
            cron: '0 * * * * *',
            limit: 20,
          },
          {
            queue: 'bo3-default',
            cron: '0 */2 * * * *',
            limit: 50,
          },
        ]
      : [],
    tasks: [bo3SyncMatchesTask],
  },
})
