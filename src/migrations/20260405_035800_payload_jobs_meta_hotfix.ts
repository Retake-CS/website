import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

const hasColumn = async (
  db: MigrateUpArgs['db'] | MigrateDownArgs['db'],
  table: string,
  column: string,
) => {
  const rows = await (db as any).all(sql`PRAGMA table_info(${sql.raw(table)});`)
  return Array.isArray(rows) && rows.some((row) => row?.name === column)
}

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  const payloadJobsHasMeta = await hasColumn(db, 'payload_jobs', 'meta')

  if (!payloadJobsHasMeta) {
    await db.run(sql`ALTER TABLE \`payload_jobs\` ADD \`meta\` text;`)
    payload.logger.info(
      '[migration:20260405_035800_payload_jobs_meta_hotfix] Added payload_jobs.meta column.',
    )
  }
}

export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  const payloadJobsHasMeta = await hasColumn(db, 'payload_jobs', 'meta')

  if (payloadJobsHasMeta) {
    await db.run(sql`ALTER TABLE \`payload_jobs\` DROP COLUMN \`meta\`;`)
    payload.logger.info(
      '[migration:20260405_035800_payload_jobs_meta_hotfix] Removed payload_jobs.meta column.',
    )
  }
}
