import { describe, expect, it } from 'vitest'
import path from 'path'
import { readFile } from 'fs/promises'

import Matches from '@/collections/Matches'
import Teams from '@/collections/Teams'
import Tournaments from '@/collections/Tournaments'

type FieldLike = {
  name?: string
  unique?: boolean
  index?: boolean
  fields?: FieldLike[]
  blocks?: Array<{ fields?: FieldLike[] }>
}

const collectFields = (fields: FieldLike[] = []): FieldLike[] => {
  const flat: FieldLike[] = []

  for (const field of fields) {
    flat.push(field)

    if (Array.isArray(field.fields) && field.fields.length > 0) {
      flat.push(...collectFields(field.fields))
    }

    if (Array.isArray(field.blocks) && field.blocks.length > 0) {
      for (const block of field.blocks) {
        if (Array.isArray(block.fields) && block.fields.length > 0) {
          flat.push(...collectFields(block.fields))
        }
      }
    }
  }

  return flat
}

describe('schema regressions', () => {
  it('does not define both unique and index on same field for BO3 entities', () => {
    const collections = [
      { slug: Matches.slug, fields: Matches.fields as FieldLike[] },
      { slug: Teams.slug, fields: Teams.fields as FieldLike[] },
      { slug: Tournaments.slug, fields: Tournaments.fields as FieldLike[] },
    ]

    const conflicts: string[] = []

    for (const collection of collections) {
      for (const field of collectFields(collection.fields)) {
        if (field.unique && field.index) {
          conflicts.push(`${collection.slug}.${field.name ?? '<unnamed>'}`)
        }
      }
    }

    expect(conflicts).toEqual([])
  })

  it('keeps schema push opt-in only', async () => {
    const payloadConfigPath = path.join(process.cwd(), 'src', 'payload.config.ts')
    const fileText = await readFile(payloadConfigPath, 'utf8')

    expect(fileText).toContain("process.env.PAYLOAD_PUSH_SCHEMA === 'true'")
  })

  it('keeps migration guard for already-pushed schema', async () => {
    const migrationPath = path.join(process.cwd(), 'src', 'migrations', '20260405_033302.ts')
    const fileText = await readFile(migrationPath, 'utf8')

    expect(fileText).toContain('sqlite_master')
    expect(fileText).toContain('matches_status_transitions')
    expect(fileText).toContain('bo3_sync_runs')
    expect(fileText).toContain('Skipping up migration')
  })

  it('keeps schema reconcile hotfix for teams/tournaments/rankings', async () => {
    const migrationPath = path.join(
      process.cwd(),
      'src',
      'migrations',
      '20260405_040200_schema_reconcile_hotfix.ts',
    )
    const fileText = await readFile(migrationPath, 'utf8')

    expect(fileText).toContain('teams')
    expect(fileText).toContain('external_team_id')
    expect(fileText).toContain('tournaments')
    expect(fileText).toContain('external_tournament_id')
    expect(fileText).toContain('rankings')
    expect(fileText).toContain('is_active')
  })
})
