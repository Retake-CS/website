import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || 'retakecs-cron-2026-mK7pZ'

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const { performCSAPISync } = await import('@/utils/csapi.sync')
    await performCSAPISync(payload)
    return NextResponse.json({ ok: true, synced: new Date().toISOString() })
  } catch (error: any) {
    console.error('[CRON] Sync error:', error)
    // Retorna o erro completo para facilitar debug
    return NextResponse.json(
      { ok: false, error: error.message, stack: error.stack?.slice(0, 500) },
      { status: 500 },
    )
  }
}
