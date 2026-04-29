import * as migration_20260405_033302 from './20260405_033302'
import * as migration_20260405_035800_payload_jobs_meta_hotfix from './20260405_035800_payload_jobs_meta_hotfix'
import * as migration_20260405_040200_schema_reconcile_hotfix from './20260405_040200_schema_reconcile_hotfix'

export const migrations = [
  {
    up: migration_20260405_033302.up,
    down: migration_20260405_033302.down,
    name: '20260405_033302',
  },
  {
    up: migration_20260405_035800_payload_jobs_meta_hotfix.up,
    down: migration_20260405_035800_payload_jobs_meta_hotfix.down,
    name: '20260405_035800_payload_jobs_meta_hotfix',
  },
  {
    up: migration_20260405_040200_schema_reconcile_hotfix.up,
    down: migration_20260405_040200_schema_reconcile_hotfix.down,
    name: '20260405_040200_schema_reconcile_hotfix',
  },
]
