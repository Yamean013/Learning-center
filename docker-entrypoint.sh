#!/bin/sh
set -e

# Apply any pending Prisma migrations against the mounted SQLite DB.
# `migrate deploy` is idempotent and safe to run on every container start.
echo "[entrypoint] applying database migrations..."
npx --no-install prisma migrate deploy --schema /app/prisma/schema.prisma

# If SEED_ON_BOOT=1 is set AND the users table is empty, run the seed once
# so the first boot gives you an admin account to log in with.
if [ "${SEED_ON_BOOT:-0}" = "1" ]; then
  USER_COUNT="$(node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.user.count().then(n=>{console.log(n);process.exit(0)}).catch(()=>{console.log(0);process.exit(0)})")"
  if [ "$USER_COUNT" = "0" ]; then
    echo "[entrypoint] empty DB detected, seeding..."
    node -e "require('child_process').spawnSync('npx',['--no-install','tsx','/app/prisma/seed.ts'],{stdio:'inherit'})" || true
  fi
fi

exec "$@"
