#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Checking prerequisites..."
command -v node >/dev/null || { echo "Node.js required"; exit 1; }
command -v npm >/dev/null || { echo "npm required"; exit 1; }

# Optional: start Postgres via Docker
if command -v docker >/dev/null; then
  if ! docker ps --format '{{.Names}}' | grep -q '^dodesk-postgres$'; then
    echo "==> Starting Postgres container..."
    docker run -d --name dodesk-postgres \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_PASSWORD=password \
      -e POSTGRES_DB=dodesk \
      -p 5432:5432 \
      postgres:16 || docker start dodesk-postgres
  fi
fi

echo "==> Installing dependencies..."
(cd backend && npm install)
(cd client && npm install)

echo "==> Setting up env files..."
[ -f backend/.env ] || cp backend/.env.example backend/.env
[ -f client/.env.local ] || cp client/.env.example client/.env.local

echo "==> Running Prisma..."
(cd backend && npx prisma generate && npx prisma migrate dev --name init)

echo "✅ Setup complete. Run: npm run dev"
