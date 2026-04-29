import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-sqlite'

type DB = MigrateUpArgs['db'] | MigrateDownArgs['db']

const hasColumn = async (db: DB, table: string, column: string): Promise<boolean> => {
  const rows = await (db as any).all(sql`PRAGMA table_info(${sql.raw(table)});`)
  return Array.isArray(rows) && rows.some((row) => row?.name === column)
}

const addColumnIfMissing = async ({
  db,
  table,
  column,
  definition,
}: {
  db: DB
  table: string
  column: string
  definition: string
}): Promise<boolean> => {
  const exists = await hasColumn(db, table, column)

  if (exists) return false

  await db.run(sql.raw(`ALTER TABLE \`${table}\` ADD \`${column}\` ${definition};`))
  return true
}

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  const added: string[] = []

  // teams
  if (
    await addColumnIfMissing({
      db,
      table: 'teams',
      column: 'external_team_id',
      definition: 'numeric',
    })
  ) {
    added.push('teams.external_team_id')
  }
  if (await addColumnIfMissing({ db, table: 'teams', column: 'slug', definition: 'text' })) {
    added.push('teams.slug')
  }
  if (await addColumnIfMissing({ db, table: 'teams', column: 'image_url', definition: 'text' })) {
    added.push('teams.image_url')
  }
  if (
    await addColumnIfMissing({ db, table: 'teams', column: 'country_id', definition: 'numeric' })
  ) {
    added.push('teams.country_id')
  }
  if (
    await addColumnIfMissing({
      db,
      table: 'teams',
      column: 'source',
      definition: "text DEFAULT 'bo3.gg'",
    })
  ) {
    added.push('teams.source')
  }
  if (
    await addColumnIfMissing({ db, table: 'teams', column: 'last_synced_at', definition: 'text' })
  ) {
    added.push('teams.last_synced_at')
  }

  // tournaments
  if (
    await addColumnIfMissing({
      db,
      table: 'tournaments',
      column: 'external_tournament_id',
      definition: 'numeric',
    })
  ) {
    added.push('tournaments.external_tournament_id')
  }
  if (await addColumnIfMissing({ db, table: 'tournaments', column: 'slug', definition: 'text' })) {
    added.push('tournaments.slug')
  }
  if (
    await addColumnIfMissing({ db, table: 'tournaments', column: 'status', definition: 'text' })
  ) {
    added.push('tournaments.status')
  }
  if (await addColumnIfMissing({ db, table: 'tournaments', column: 'tier', definition: 'text' })) {
    added.push('tournaments.tier')
  }
  if (
    await addColumnIfMissing({
      db,
      table: 'tournaments',
      column: 'tier_rank',
      definition: 'numeric',
    })
  ) {
    added.push('tournaments.tier_rank')
  }
  if (
    await addColumnIfMissing({
      db,
      table: 'tournaments',
      column: 'source',
      definition: "text DEFAULT 'bo3.gg'",
    })
  ) {
    added.push('tournaments.source')
  }
  if (
    await addColumnIfMissing({
      db,
      table: 'tournaments',
      column: 'last_synced_at',
      definition: 'text',
    })
  ) {
    added.push('tournaments.last_synced_at')
  }

  // rankings
  if (
    await addColumnIfMissing({
      db,
      table: 'rankings',
      column: 'is_active',
      definition: 'integer DEFAULT true',
    })
  ) {
    added.push('rankings.is_active')
  }

  // payload_jobs (safety)
  if (await addColumnIfMissing({ db, table: 'payload_jobs', column: 'meta', definition: 'text' })) {
    added.push('payload_jobs.meta')
  }

  // Helpful non-unique indexes for lookups
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS teams_external_team_id_lookup_idx ON teams (external_team_id);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS tournaments_external_tournament_id_lookup_idx ON tournaments (external_tournament_id);`,
  )

  if (added.length > 0) {
    payload.logger.info(
      `[migration:20260405_040200_schema_reconcile_hotfix] Added columns: ${added.join(', ')}`,
    )
  } else {
    payload.logger.info(
      '[migration:20260405_040200_schema_reconcile_hotfix] No schema changes needed.',
    )
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.info(
    '[migration:20260405_040200_schema_reconcile_hotfix] Down migration is a no-op.',
  )
}
