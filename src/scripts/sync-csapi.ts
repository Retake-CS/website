import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

import { getPayload } from 'payload'
import { performCSAPISync } from '../utils/csapi.sync'

async function sync() {
  const config = (await import('../payload.config')).default
  const payload = await getPayload({ config })

  try {
    await performCSAPISync(payload)
  } catch (error) {
    console.error('Sync failed:', error)
  } finally {
    process.exit(0)
  }
}

sync()
