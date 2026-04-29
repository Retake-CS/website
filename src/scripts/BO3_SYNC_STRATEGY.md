# BO3 Sync Strategy (RetakeCS)

## Objetivo
Garantir sincronização resiliente e sem bloqueio da thread principal do Payload para partidas CS2, com prioridade dinâmica para partidas ao vivo.

## Componentes
- Task principal: `bo3SyncMatches` em [src/jobs/tasks/bo3SyncMatchesTask.ts](src/jobs/tasks/bo3SyncMatchesTask.ts)
- Serviço de sincronização: [src/scripts/bo3-sync.service.ts](src/scripts/bo3-sync.service.ts)
- Helpers de enqueue: [src/scripts/bo3-sync.queue.ts](src/scripts/bo3-sync.queue.ts)
- Script manual para fila: [src/scripts/queue-bo3-sync-job.ts](src/scripts/queue-bo3-sync-job.ts)
- Script manual para worker: [src/scripts/run-bo3-sync-worker.ts](src/scripts/run-bo3-sync-worker.ts)
- Endpoint de health: [src/endpoints/bo3-sync-health.ts](src/endpoints/bo3-sync-health.ts)
- Endpoint de trigger: [src/endpoints/bo3-sync-trigger.ts](src/endpoints/bo3-sync-trigger.ts)
- Coleção de métricas de run: [src/collections/BO3SyncRuns.ts](src/collections/BO3SyncRuns.ts)

## Modos de sincronização
### 1) `live-priority`
- Endpoint live (API v2 `/matches/live`) com maior prioridade.
- Concurrency maior e retries mais agressivos.
- Ordenação final privilegia status live/current.
- Uso recomendado para janela de jogos em andamento.

### 2) `full`
- Combina live + upcoming + recent finished.
- Prioriza completude de cobertura e consistência do histórico recente.

### 3) `date-only`
- Busca por data exata (backfill/reprocessamento pontual).
- Ideal para reparo histórico e conferência por dia.

## Endpoints e tratamento diferenciado
- `live`: API v2 com payload leve (`teams,tournament`) para reduzir latência.
- `upcoming`: API v2 com payload leve (`teams,tournament`) para aceitar dados parciais sem falhar.
- `finished_recent`: endpoint recente para fechamento de resultados.
- `date_only`: busca por faixa de data para aprofundar dados (deep scan).

Cada endpoint é executado com `withExponentialRetry`. Se um endpoint falhar, ele é isolado e não interrompe os demais.

## Circuit Breaker
- Implementado por endpoint no serviço.
- Abre após sequência de falhas (`BO3_SYNC_CIRCUIT_BREAKER_FAILURE_THRESHOLD`, default: 3).
- Mantém endpoint em cooldown (`BO3_SYNC_CIRCUIT_BREAKER_COOLDOWN_MS`, default: 120000 ms).
- Enquanto aberto, o endpoint é marcado como `skipped_circuit_open` e não faz chamadas externas.

## Rate limit centralizado por versão da API
- Cliente centralizado em [src/utils/bo3.requests.ts](src/utils/bo3.requests.ts) com filas separadas por versão (`v1` e `v2`).
- Cada versão possui delay independente:
  - `BO3_RATE_LIMIT_DELAY_V1_MS` (default: `120`)
  - `BO3_RATE_LIMIT_DELAY_V2_MS` (default: `220`)
- Respostas `429` respeitam retry com backoff e `Retry-After` quando disponível.

## Estratégia lazy + deep scan
- `upsertMatchByExternalId` usa lazy skip para partidas sem mudança recente (`bo3Status` igual e janela de refresh válida).
- Janela de refresh por status:
  - `BO3_SYNC_LAZY_LIVE_REFRESH_MS` (default: 30s)
  - `BO3_SYNC_LAZY_UPCOMING_REFRESH_MS` (default: 10min)
  - `BO3_SYNC_LAZY_COMPLETED_REFRESH_MS` (default: 2h)
  - `BO3_SYNC_LAZY_POSTPONED_REFRESH_MS` (default: 30min)
- Dados incompletos de `live`/`upcoming` são aceitos com fallback (nomes placeholders), e o aprofundamento ocorre por `date-only`.

## Endpoint de monitoramento
- Rota: `/api/bo3-sync/health`
- Query params opcionais:
  - `liveStaleMinutes` (default via env)
  - `runStaleMinutes` (default via env)
- Status HTTP:
  - `200` = healthy
  - `206` = degraded
  - `503` = unhealthy

## Endpoint de disparo
- Rota: `/api/bo3-sync/trigger` (POST)
- Body opcional:
  - `mode`: `live-priority` | `full` | `date-only`
  - `date`: `YYYY-MM-DD` (força `date-only` na prática de coleta)
  - `batchSize`, `concurrency`
- Autorização:
  - usuário admin autenticado no Payload, ou
  - header `Authorization: Bearer <CRON_SECRET>`
- Resposta esperada: `202 queued`

## Cadência automática
Configurada em [src/payload.config.ts](src/payload.config.ts):
- `autoRun` agora é **opt-in** via `BO3_SYNC_ENABLE_AUTORUN=true`.
- Quando habilitado:
  - Fila `bo3-live` a cada 1 minuto.
  - Fila `bo3-default` a cada 2 minutos (processamento) e agendamentos na task:
    - `full` a cada 15 minutos
    - `date-only` de backfill (dia anterior) a cada 20 minutos

## Economia de requests e upserts
- Cooldown por modo evita reprocessar imediatamente após um run recente:
  - `BO3_SYNC_MIN_INTERVAL_LIVE_MS`
  - `BO3_SYNC_MIN_INTERVAL_FULL_MS`
  - `BO3_SYNC_MIN_INTERVAL_DATE_MS`
- Deduplicação de enqueue evita spam de jobs iguais em janela curta:
  - `BO3_SYNC_ENQUEUE_DEDUP_MS`
- Resultado prático: menos chamadas à API e menos `upsertMatch` redundante quando não há demanda real.

## Idempotência
- Times: `externalTeamId`
- Torneios: `externalTournamentId`
- Partidas: `externalMatchId`

Cada registro faz upsert por chave externa para evitar duplicação.

## Observabilidade
- Logs por endpoint e por match.
- Resumo final inclui:
  - `mode`
  - `endpointBreakdown`
  - `fetched/processed/created/updated/failed`
- Persistência por execução em `bo3-sync-runs` com:
  - duração total
  - métricas por endpoint (`endpointMetrics`)
  - retries, status por endpoint, erros

  ## Pré-requisitos para rodar corretamente
  1. Variáveis de ambiente:
    - `DATABASE_URI`
    - `PAYLOAD_SECRET`
    - `BO3_API_BASE` (opcional, default oficial)
    - `BO3_USER_AGENT` (recomendado)
  2. Processo com jobs habilitados (payload config com `jobs.autoRun` ativo).
  3. Execução de worker em produção (se não usar autorun interno):
    - `pnpm run bo3:sync:worker`
  4. Em cenários serverless, usar agendador externo para enfileirar jobs:
    - `pnpm run bo3:sync:queue`
