# Redis Migration Plan (Time-Windowed Messages, Docker Compose)

Summary
- Migrate message and image storage from Node process memory to Redis using a per-room sorted set keyed by room name.
- Retention is time-based (N hours) with periodic purge via `ZREMRANGEBYSCORE`.
- Provide `docker-compose.yml` for Redis and update server message flows to read/write Redis while keeping the rest of the app behavior intact.

Scope
In scope
- Redis via Docker Compose.
- Server-side storage of messages in Redis.
- Replace in-memory `persistentMessages` usage.
- Time-based retention aligned with `settings.cleanupTimeInHours`.

Out of scope (for now)
- External object storage for images.
- Client changes unless required for compatibility.
- Multi-instance scaling or Redis cluster.

Proposed Redis Data Model
Key per room
- Key format: `spc:room:{room}:messages`
- Type: Sorted Set (ZSET)
- Score: message timestamp (ms since epoch)
- Member: JSON string of `FullMessageType` (entire message)

Why
- Efficient range queries by time.
- Direct retention enforcement with `ZREMRANGEBYSCORE`.
- Natural fit for “last N hours” retrieval.

Docker Compose (Redis)
Add `docker-compose.yml` at repo root:

```yaml
version: "3.8"
services:
  redis:
    image: redis:7-alpine
    container_name: spc-redis
    command: ["redis-server", "--appendonly", "yes"]
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  redis-data:
```

Migration Checklist (Decision Complete)
1) Dependencies and Configuration
- Add Redis client dependency to server (e.g., `redis` npm package).
- Add Redis config to `src/settings.json` (or env):
  - `redisHost`, `redisPort`, optional `redisPassword`.
- Add a feature flag for storage backend:
  - `storageBackend: "memory" | "redis"` (default `redis` after cutover).

2) Server Storage Interface
- Create a small storage layer in `src/server/`:
  - `messageStore.ts` exporting:
    - `getMessagesForRoom(room: string): Promise<FullMessageType[]>`
    - `addMessage(message: FullMessageType): Promise<void>`
    - `updateMessage(message: FullMessageType): Promise<void>`
    - `deleteMessage(msgId: string, room: string): Promise<void>`
    - `purgeOldMessages(): Promise<void>`
- Implement Redis-backed version using the ZSET model.
- Keep a memory implementation only for initial rollout if needed, then remove it once Redis is validated.

3) Redis Operations (Implementation Details)
- Add message
  - `ZADD spc:room:{room}:messages <timestamp> <json>`
  - `EXPIRE` key to `(cleanupTimeInHours * 3600)` to avoid key leaks.
- Update message
  - Read room messages in time window, find by `msgId`, remove old JSON (ZREM), insert new JSON with same timestamp.
  - Optional: Store `msgId -> timestamp` in a hash to avoid full scan.
- Delete message
  - Same as update: find by `msgId` and `ZREM`.
- Get messages for room
  - `ZRANGEBYSCORE` from `now - cleanupWindow` to `now`.
- Purge old messages
  - `ZREMRANGEBYSCORE < -inf (now - cleanupWindow)>`
  - Run on interval (hourly) or on write.

4) Server Flow Changes
- Replace `persistentMessages` array usage in `src/server/index.ts` with `messageStore` calls:
  - On `USER_ONLINE`: `getMessagesForRoom`.
  - On `INCOMING`: `addMessage` / `updateMessage`.
  - On `DELETE`: `deleteMessage`.
  - On `CHECK_MISSING`: fetch room messages from Redis.
- Keep the socket behavior unchanged.

5) Graceful Shutdown
- Remove/disable `saveState` file writes since Redis persists messages.
- Keep SIGINT logging.

6) Operational Notes
- Ensure Redis is reachable (for local dev via `docker-compose up -d`).
- In production, update env vars or use managed Redis.
- Add simple health checks for Redis connectivity at boot.

Public API / Interface Changes
- `settings.json` adds Redis connection properties and `storageBackend` toggle.
- No client API changes.

Testing and Validation
Unit/Integration
- `messageStore` CRUD: add/get/update/delete/purge.
- Time-window retrieval: messages older than retention are excluded.
- CHECK_MISSING still returns accurate results.

Manual
- Start Redis via `docker-compose up -d`.
- Send messages, refresh client, confirm history.
- Wait beyond retention window and confirm old messages are gone.
- Send image (data URL) and confirm persistence.

Assumptions
- Retention is purely time-based (aligned to `cleanupTimeInHours`).
- Images remain as data URLs in message JSON stored in Redis.
- Single-instance server for now; Redis enables future scaling.

