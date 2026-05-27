#!/bin/sh
set -e

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  FacilTrack — iniciando contenedor"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Esperar a que MySQL acepte conexiones ────────────────────────────────────
echo "⏳ Esperando MySQL (db:3306)..."
until nc -z db 3306 2>/dev/null; do
  sleep 2
done
echo "✅ MySQL listo"

# ── Sincronizar esquema (idempotente) ────────────────────────────────────────
echo "🗂  Sincronizando esquema Prisma..."
npx prisma db push --accept-data-loss

# ── Seed inicial (el propio seed verifica si ya hay datos) ───────────────────
echo "🌱 Inicializando datos..."
npm run db:seed

# ── Arrancar servidor de producción ──────────────────────────────────────────
echo "🚀 Iniciando Next.js..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
exec npm run start
