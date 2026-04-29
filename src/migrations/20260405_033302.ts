import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const alreadyHasStatusTransitions = await (db as any).get(
    sql`SELECT name FROM sqlite_master WHERE type='table' AND name='matches_status_transitions' LIMIT 1;`,
  )

  const alreadyHasSyncRuns = await (db as any).get(
    sql`SELECT name FROM sqlite_master WHERE type='table' AND name='bo3_sync_runs' LIMIT 1;`,
  )

  if (alreadyHasStatusTransitions && alreadyHasSyncRuns) {
    payload.logger.info(
      '[migration:20260405_033302] Schema already present (likely pushed in dev). Skipping up migration.',
    )
    return
  }

  await db.run(sql`CREATE TABLE \`matches_status_transitions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`from_status\` text,
  	\`to_status\` text NOT NULL,
  	\`changed_at\` text NOT NULL,
  	\`source\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`matches\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`matches_status_transitions_order_idx\` ON \`matches_status_transitions\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`matches_status_transitions_parent_id_idx\` ON \`matches_status_transitions\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`matches_sync_meta_missing_critical_fields\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`field\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`matches\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`matches_sync_meta_missing_critical_fields_order_idx\` ON \`matches_sync_meta_missing_critical_fields\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`matches_sync_meta_missing_critical_fields_parent_id_idx\` ON \`matches_sync_meta_missing_critical_fields\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`bo3_sync_runs_endpoint_metrics\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`endpoint\` text NOT NULL,
  	\`status\` text NOT NULL,
  	\`fetched_count\` numeric NOT NULL,
  	\`duration_ms\` numeric NOT NULL,
  	\`retry_count\` numeric NOT NULL,
  	\`circuit_open\` integer,
  	\`error_message\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`bo3_sync_runs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`bo3_sync_runs_endpoint_metrics_order_idx\` ON \`bo3_sync_runs_endpoint_metrics\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`bo3_sync_runs_endpoint_metrics_parent_id_idx\` ON \`bo3_sync_runs_endpoint_metrics\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`bo3_sync_runs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`mode\` text NOT NULL,
  	\`date\` text,
  	\`started_at\` text NOT NULL,
  	\`finished_at\` text NOT NULL,
  	\`duration_ms\` numeric NOT NULL,
  	\`fetched\` numeric NOT NULL,
  	\`processed\` numeric NOT NULL,
  	\`created\` numeric NOT NULL,
  	\`updated\` numeric NOT NULL,
  	\`failed\` numeric NOT NULL,
  	\`endpoint_breakdown\` text,
  	\`error_message\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`bo3_sync_runs_mode_idx\` ON \`bo3_sync_runs\` (\`mode\`);`)
  await db.run(sql`CREATE INDEX \`bo3_sync_runs_date_idx\` ON \`bo3_sync_runs\` (\`date\`);`)
  await db.run(
    sql`CREATE INDEX \`bo3_sync_runs_started_at_idx\` ON \`bo3_sync_runs\` (\`started_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`bo3_sync_runs_finished_at_idx\` ON \`bo3_sync_runs\` (\`finished_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`bo3_sync_runs_updated_at_idx\` ON \`bo3_sync_runs\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`bo3_sync_runs_created_at_idx\` ON \`bo3_sync_runs\` (\`created_at\`);`,
  )
  await db.run(sql`CREATE TABLE \`payload_jobs_stats\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`stats\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`DROP TABLE \`matches_maps_highlights\`;`)
  await db.run(sql`DROP TABLE \`matches_player_stats\`;`)
  await db.run(sql`DROP TABLE \`matches_key_moments\`;`)
  await db.run(sql`DROP TABLE \`matches_vods\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_matches\` (
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`external_match_id\` text NOT NULL,
  	\`status\` text DEFAULT 'upcoming' NOT NULL,
  	\`bo3_status\` text,
  	\`tier\` text,
  	\`discipline_id\` numeric,
  	\`date\` text,
  	\`start_date\` text,
  	\`end_date\` text,
  	\`time\` text,
  	\`format\` text,
  	\`final_score_team1\` numeric DEFAULT 0,
  	\`final_score_team2\` numeric DEFAULT 0,
  	\`team1_id\` integer,
  	\`team2_id\` integer,
  	\`tournament_id\` integer,
  	\`team1_name\` text,
  	\`team2_name\` text,
  	\`tournament_name\` text,
  	\`team1_external_id\` numeric,
  	\`team2_external_id\` numeric,
  	\`tournament_external_id\` numeric,
  	\`raw\` text,
  	\`sync_meta_first_seen_at\` text,
  	\`sync_meta_last_status_change_at\` text,
  	\`sync_meta_last_live_seen_at\` text,
  	\`sync_meta_data_completeness_score\` numeric,
  	\`last_synced_at\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`team1_id\`) REFERENCES \`teams\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`team2_id\`) REFERENCES \`teams\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`tournament_id\`) REFERENCES \`tournaments\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_matches\`("id", "external_match_id", "status", "bo3_status", "tier", "discipline_id", "date", "start_date", "end_date", "time", "format", "final_score_team1", "final_score_team2", "team1_id", "team2_id", "tournament_id", "team1_name", "team2_name", "tournament_name", "team1_external_id", "team2_external_id", "tournament_external_id", "raw", "sync_meta_first_seen_at", "sync_meta_last_status_change_at", "sync_meta_last_live_seen_at", "sync_meta_data_completeness_score", "last_synced_at", "updated_at", "created_at") SELECT "id", "external_match_id", "status", "bo3_status", "tier", "discipline_id", "date", "start_date", "end_date", "time", "format", "final_score_team1", "final_score_team2", "team1_id", "team2_id", "tournament_id", "team1_name", "team2_name", "tournament_name", "team1_external_id", "team2_external_id", "tournament_external_id", "raw", "sync_meta_first_seen_at", "sync_meta_last_status_change_at", "sync_meta_last_live_seen_at", "sync_meta_data_completeness_score", "last_synced_at", "updated_at", "created_at" FROM \`matches\`;`,
  )
  await db.run(sql`DROP TABLE \`matches\`;`)
  await db.run(sql`ALTER TABLE \`__new_matches\` RENAME TO \`matches\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`matches_external_match_id_idx\` ON \`matches\` (\`external_match_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`matches_bo3_status_idx\` ON \`matches\` (\`bo3_status\`);`)
  await db.run(sql`CREATE INDEX \`matches_tier_idx\` ON \`matches\` (\`tier\`);`)
  await db.run(sql`CREATE INDEX \`matches_discipline_id_idx\` ON \`matches\` (\`discipline_id\`);`)
  await db.run(sql`CREATE INDEX \`matches_start_date_idx\` ON \`matches\` (\`start_date\`);`)
  await db.run(sql`CREATE INDEX \`matches_team1_idx\` ON \`matches\` (\`team1_id\`);`)
  await db.run(sql`CREATE INDEX \`matches_team2_idx\` ON \`matches\` (\`team2_id\`);`)
  await db.run(sql`CREATE INDEX \`matches_tournament_idx\` ON \`matches\` (\`tournament_id\`);`)
  await db.run(
    sql`CREATE INDEX \`matches_team1_external_id_idx\` ON \`matches\` (\`team1_external_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`matches_team2_external_id_idx\` ON \`matches\` (\`team2_external_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`matches_tournament_external_id_idx\` ON \`matches\` (\`tournament_external_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`matches_last_synced_at_idx\` ON \`matches\` (\`last_synced_at\`);`,
  )
  await db.run(sql`CREATE INDEX \`matches_updated_at_idx\` ON \`matches\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`matches_created_at_idx\` ON \`matches\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_teams\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`external_team_id\` numeric NOT NULL,
  	\`slug\` text,
  	\`name\` text NOT NULL,
  	\`short_name\` text,
  	\`logo_id\` integer,
  	\`image_url\` text,
  	\`country\` text,
  	\`country_id\` numeric,
  	\`ranking\` numeric,
  	\`founded\` text,
  	\`region\` text,
  	\`coach\` text,
  	\`stats_matches_played\` numeric,
  	\`stats_wins\` numeric,
  	\`stats_losses\` numeric,
  	\`stats_win_rate\` numeric,
  	\`stats_average_rating\` numeric,
  	\`stats_maps_played\` numeric,
  	\`stats_rounds_won\` numeric,
  	\`stats_rounds_lost\` numeric,
  	\`social_media_twitter\` text,
  	\`social_media_instagram\` text,
  	\`social_media_website\` text,
  	\`source\` text DEFAULT 'bo3.gg',
  	\`last_synced_at\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_teams\`("id", "external_team_id", "slug", "name", "short_name", "logo_id", "image_url", "country", "country_id", "ranking", "founded", "region", "coach", "stats_matches_played", "stats_wins", "stats_losses", "stats_win_rate", "stats_average_rating", "stats_maps_played", "stats_rounds_won", "stats_rounds_lost", "social_media_twitter", "social_media_instagram", "social_media_website", "source", "last_synced_at", "updated_at", "created_at") SELECT "id", "external_team_id", "slug", "name", "short_name", "logo_id", "image_url", "country", "country_id", "ranking", "founded", "region", "coach", "stats_matches_played", "stats_wins", "stats_losses", "stats_win_rate", "stats_average_rating", "stats_maps_played", "stats_rounds_won", "stats_rounds_lost", "social_media_twitter", "social_media_instagram", "social_media_website", "source", "last_synced_at", "updated_at", "created_at" FROM \`teams\`;`,
  )
  await db.run(sql`DROP TABLE \`teams\`;`)
  await db.run(sql`ALTER TABLE \`__new_teams\` RENAME TO \`teams\`;`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`teams_external_team_id_idx\` ON \`teams\` (\`external_team_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`teams_slug_idx\` ON \`teams\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`teams_logo_idx\` ON \`teams\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`teams_updated_at_idx\` ON \`teams\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`teams_created_at_idx\` ON \`teams\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_matches_maps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`map_name\` text NOT NULL,
  	\`status\` text,
  	\`team1_score\` numeric,
  	\`team2_score\` numeric,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`matches\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_matches_maps\`("_order", "_parent_id", "id", "map_name", "status", "team1_score", "team2_score") SELECT "_order", "_parent_id", "id", "map_name", "status", "team1_score", "team2_score" FROM \`matches_maps\`;`,
  )
  await db.run(sql`DROP TABLE \`matches_maps\`;`)
  await db.run(sql`ALTER TABLE \`__new_matches_maps\` RENAME TO \`matches_maps\`;`)
  await db.run(sql`CREATE INDEX \`matches_maps_order_idx\` ON \`matches_maps\` (\`_order\`);`)
  await db.run(
    sql`CREATE INDEX \`matches_maps_parent_id_idx\` ON \`matches_maps\` (\`_parent_id\`);`,
  )
  await db.run(sql`ALTER TABLE \`tournaments\` ADD \`external_tournament_id\` numeric NOT NULL;`)
  await db.run(sql`ALTER TABLE \`tournaments\` ADD \`slug\` text;`)
  await db.run(sql`ALTER TABLE \`tournaments\` ADD \`status\` text;`)
  await db.run(sql`ALTER TABLE \`tournaments\` ADD \`tier\` text;`)
  await db.run(sql`ALTER TABLE \`tournaments\` ADD \`tier_rank\` numeric;`)
  await db.run(sql`ALTER TABLE \`tournaments\` ADD \`source\` text DEFAULT 'bo3.gg';`)
  await db.run(sql`ALTER TABLE \`tournaments\` ADD \`last_synced_at\` text;`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`tournaments_external_tournament_id_idx\` ON \`tournaments\` (\`external_tournament_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`tournaments_slug_idx\` ON \`tournaments\` (\`slug\`);`)
  await db.run(sql`ALTER TABLE \`rankings\` ADD \`is_active\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`payload_jobs\` ADD \`meta\` text;`)
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`bo3_sync_runs_id\` integer REFERENCES bo3_sync_runs(id);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_bo3_sync_runs_id_idx\` ON \`payload_locked_documents_rels\` (\`bo3_sync_runs_id\`);`,
  )
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`matches_maps_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`matches_maps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`matches_maps_highlights_order_idx\` ON \`matches_maps_highlights\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`matches_maps_highlights_parent_id_idx\` ON \`matches_maps_highlights\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`matches_player_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`player_id\` integer NOT NULL,
  	\`kills\` numeric,
  	\`deaths\` numeric,
  	\`assists\` numeric,
  	\`kd\` numeric,
  	\`adr\` numeric,
  	\`rating\` numeric,
  	\`headshot_percentage\` numeric,
  	\`clutches\` numeric,
  	\`mvp_rounds\` numeric,
  	FOREIGN KEY (\`player_id\`) REFERENCES \`players\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`matches\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`matches_player_stats_order_idx\` ON \`matches_player_stats\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`matches_player_stats_parent_id_idx\` ON \`matches_player_stats\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`matches_player_stats_player_idx\` ON \`matches_player_stats\` (\`player_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`matches_key_moments\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`round\` numeric,
  	\`map\` text,
  	\`description\` text,
  	\`impact\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`matches\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`matches_key_moments_order_idx\` ON \`matches_key_moments\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`matches_key_moments_parent_id_idx\` ON \`matches_key_moments\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`matches_vods\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`url\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`matches\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`matches_vods_order_idx\` ON \`matches_vods\` (\`_order\`);`)
  await db.run(
    sql`CREATE INDEX \`matches_vods_parent_id_idx\` ON \`matches_vods\` (\`_parent_id\`);`,
  )
  await db.run(sql`DROP TABLE \`matches_status_transitions\`;`)
  await db.run(sql`DROP TABLE \`matches_sync_meta_missing_critical_fields\`;`)
  await db.run(sql`DROP TABLE \`bo3_sync_runs_endpoint_metrics\`;`)
  await db.run(sql`DROP TABLE \`bo3_sync_runs\`;`)
  await db.run(sql`DROP TABLE \`payload_jobs_stats\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`posts_id\` integer,
  	\`categories_id\` integer,
  	\`users_id\` integer,
  	\`teams_id\` integer,
  	\`players_id\` integer,
  	\`matches_id\` text,
  	\`tournaments_id\` integer,
  	\`rankings_id\` integer,
  	\`media_id\` integer,
  	\`semantic_search_id\` integer,
  	\`redirects_id\` integer,
  	\`forms_id\` integer,
  	\`form_submissions_id\` integer,
  	\`search_id\` integer,
  	\`payload_jobs_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`teams_id\`) REFERENCES \`teams\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`players_id\`) REFERENCES \`players\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`matches_id\`) REFERENCES \`matches\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tournaments_id\`) REFERENCES \`tournaments\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`rankings_id\`) REFERENCES \`rankings\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`semantic_search_id\`) REFERENCES \`semantic_search\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`redirects_id\`) REFERENCES \`redirects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`forms_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`form_submissions_id\`) REFERENCES \`form_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`search_id\`) REFERENCES \`search\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`payload_jobs_id\`) REFERENCES \`payload_jobs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "pages_id", "posts_id", "categories_id", "users_id", "teams_id", "players_id", "matches_id", "tournaments_id", "rankings_id", "media_id", "semantic_search_id", "redirects_id", "forms_id", "form_submissions_id", "search_id", "payload_jobs_id") SELECT "id", "order", "parent_id", "path", "pages_id", "posts_id", "categories_id", "users_id", "teams_id", "players_id", "matches_id", "tournaments_id", "rankings_id", "media_id", "semantic_search_id", "redirects_id", "forms_id", "form_submissions_id", "search_id", "payload_jobs_id" FROM \`payload_locked_documents_rels\`;`,
  )
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(
    sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`,
  )
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`categories_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_teams_id_idx\` ON \`payload_locked_documents_rels\` (\`teams_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_players_id_idx\` ON \`payload_locked_documents_rels\` (\`players_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_matches_id_idx\` ON \`payload_locked_documents_rels\` (\`matches_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_tournaments_id_idx\` ON \`payload_locked_documents_rels\` (\`tournaments_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_rankings_id_idx\` ON \`payload_locked_documents_rels\` (\`rankings_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_semantic_search_id_idx\` ON \`payload_locked_documents_rels\` (\`semantic_search_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_redirects_id_idx\` ON \`payload_locked_documents_rels\` (\`redirects_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_forms_id_idx\` ON \`payload_locked_documents_rels\` (\`forms_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_form_submissions_id_idx\` ON \`payload_locked_documents_rels\` (\`form_submissions_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_search_id_idx\` ON \`payload_locked_documents_rels\` (\`search_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_payload_jobs_id_idx\` ON \`payload_locked_documents_rels\` (\`payload_jobs_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`__new_teams\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`short_name\` text NOT NULL,
  	\`logo_id\` integer NOT NULL,
  	\`country\` text NOT NULL,
  	\`ranking\` numeric,
  	\`founded\` text,
  	\`region\` text,
  	\`coach\` text,
  	\`stats_matches_played\` numeric,
  	\`stats_wins\` numeric,
  	\`stats_losses\` numeric,
  	\`stats_win_rate\` numeric,
  	\`stats_average_rating\` numeric,
  	\`stats_maps_played\` numeric,
  	\`stats_rounds_won\` numeric,
  	\`stats_rounds_lost\` numeric,
  	\`social_media_twitter\` text,
  	\`social_media_instagram\` text,
  	\`social_media_website\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_teams\`("id", "name", "short_name", "logo_id", "country", "ranking", "founded", "region", "coach", "stats_matches_played", "stats_wins", "stats_losses", "stats_win_rate", "stats_average_rating", "stats_maps_played", "stats_rounds_won", "stats_rounds_lost", "social_media_twitter", "social_media_instagram", "social_media_website", "updated_at", "created_at") SELECT "id", "name", "short_name", "logo_id", "country", "ranking", "founded", "region", "coach", "stats_matches_played", "stats_wins", "stats_losses", "stats_win_rate", "stats_average_rating", "stats_maps_played", "stats_rounds_won", "stats_rounds_lost", "social_media_twitter", "social_media_instagram", "social_media_website", "updated_at", "created_at" FROM \`teams\`;`,
  )
  await db.run(sql`DROP TABLE \`teams\`;`)
  await db.run(sql`ALTER TABLE \`__new_teams\` RENAME TO \`teams\`;`)
  await db.run(sql`CREATE INDEX \`teams_logo_idx\` ON \`teams\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`teams_updated_at_idx\` ON \`teams\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`teams_created_at_idx\` ON \`teams\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_matches\` (
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`team1_id\` integer NOT NULL,
  	\`team2_id\` integer NOT NULL,
  	\`final_score_team1\` numeric NOT NULL,
  	\`final_score_team2\` numeric NOT NULL,
  	\`prediction_team1_score\` numeric,
  	\`prediction_team2_score\` numeric,
  	\`prediction_confidence\` numeric,
  	\`status\` text NOT NULL,
  	\`date\` text NOT NULL,
  	\`time\` text NOT NULL,
  	\`tournament_id\` integer NOT NULL,
  	\`format\` text NOT NULL,
  	\`match_context_importance\` text,
  	\`match_context_stakes\` text,
  	\`match_context_rivalry\` text,
  	\`match_context_previous_meetings\` text,
  	\`mvp_player_id\` integer,
  	\`mvp_reason\` text,
  	\`stream_url\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`team1_id\`) REFERENCES \`teams\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`team2_id\`) REFERENCES \`teams\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`tournament_id\`) REFERENCES \`tournaments\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`mvp_player_id\`) REFERENCES \`players\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_matches\`("id", "team1_id", "team2_id", "final_score_team1", "final_score_team2", "prediction_team1_score", "prediction_team2_score", "prediction_confidence", "status", "date", "time", "tournament_id", "format", "match_context_importance", "match_context_stakes", "match_context_rivalry", "match_context_previous_meetings", "mvp_player_id", "mvp_reason", "stream_url", "updated_at", "created_at") SELECT "id", "team1_id", "team2_id", "final_score_team1", "final_score_team2", "prediction_team1_score", "prediction_team2_score", "prediction_confidence", "status", "date", "time", "tournament_id", "format", "match_context_importance", "match_context_stakes", "match_context_rivalry", "match_context_previous_meetings", "mvp_player_id", "mvp_reason", "stream_url", "updated_at", "created_at" FROM \`matches\`;`,
  )
  await db.run(sql`DROP TABLE \`matches\`;`)
  await db.run(sql`ALTER TABLE \`__new_matches\` RENAME TO \`matches\`;`)
  await db.run(sql`CREATE INDEX \`matches_team1_idx\` ON \`matches\` (\`team1_id\`);`)
  await db.run(sql`CREATE INDEX \`matches_team2_idx\` ON \`matches\` (\`team2_id\`);`)
  await db.run(sql`CREATE INDEX \`matches_tournament_idx\` ON \`matches\` (\`tournament_id\`);`)
  await db.run(sql`CREATE INDEX \`matches_mvp_mvp_player_idx\` ON \`matches\` (\`mvp_player_id\`);`)
  await db.run(sql`CREATE INDEX \`matches_updated_at_idx\` ON \`matches\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`matches_created_at_idx\` ON \`matches\` (\`created_at\`);`)
  await db.run(sql`DROP INDEX \`tournaments_external_tournament_id_idx\`;`)
  await db.run(sql`DROP INDEX \`tournaments_slug_idx\`;`)
  await db.run(sql`ALTER TABLE \`tournaments\` DROP COLUMN \`external_tournament_id\`;`)
  await db.run(sql`ALTER TABLE \`tournaments\` DROP COLUMN \`slug\`;`)
  await db.run(sql`ALTER TABLE \`tournaments\` DROP COLUMN \`status\`;`)
  await db.run(sql`ALTER TABLE \`tournaments\` DROP COLUMN \`tier\`;`)
  await db.run(sql`ALTER TABLE \`tournaments\` DROP COLUMN \`tier_rank\`;`)
  await db.run(sql`ALTER TABLE \`tournaments\` DROP COLUMN \`source\`;`)
  await db.run(sql`ALTER TABLE \`tournaments\` DROP COLUMN \`last_synced_at\`;`)
  await db.run(sql`CREATE TABLE \`__new_matches_maps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`map_name\` text NOT NULL,
  	\`team1_score\` numeric NOT NULL,
  	\`team2_score\` numeric NOT NULL,
  	\`team1_start_side\` text,
  	\`team2_start_side\` text,
  	\`duration\` text,
  	\`overtime\` integer,
  	\`overtime_rounds\` numeric,
  	\`winner\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`matches\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_matches_maps\`("_order", "_parent_id", "id", "map_name", "team1_score", "team2_score", "team1_start_side", "team2_start_side", "duration", "overtime", "overtime_rounds", "winner") SELECT "_order", "_parent_id", "id", "map_name", "team1_score", "team2_score", "team1_start_side", "team2_start_side", "duration", "overtime", "overtime_rounds", "winner" FROM \`matches_maps\`;`,
  )
  await db.run(sql`DROP TABLE \`matches_maps\`;`)
  await db.run(sql`ALTER TABLE \`__new_matches_maps\` RENAME TO \`matches_maps\`;`)
  await db.run(sql`CREATE INDEX \`matches_maps_order_idx\` ON \`matches_maps\` (\`_order\`);`)
  await db.run(
    sql`CREATE INDEX \`matches_maps_parent_id_idx\` ON \`matches_maps\` (\`_parent_id\`);`,
  )
  await db.run(sql`ALTER TABLE \`rankings\` DROP COLUMN \`is_active\`;`)
  await db.run(sql`ALTER TABLE \`payload_jobs\` DROP COLUMN \`meta\`;`)
}
