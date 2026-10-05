#!/bin/bash
# Sync boilerplate source into builder's templates folder.
# Run this whenever you make changes to the boilerplate that should ship to users.

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/apps/boilerplate"
DEST="$ROOT/apps/builder/templates/boilerplate"

echo "🧹 Cleaning old template..."
rm -rf "$DEST"
mkdir -p "$DEST"

echo "📦 Copying boilerplate source..."
# Copy everything, then remove things we don't want to ship
cp -r "$SRC"/* "$DEST/" 2>/dev/null || true
cp "$SRC"/.env.example "$DEST/" 2>/dev/null || true
cp "$SRC"/.gitignore "$DEST/" 2>/dev/null || true

echo "🗑️  Removing build artifacts and secrets..."
rm -rf "$DEST/node_modules"
rm -rf "$DEST/.next"
rm -rf "$DEST/.vercel"
rm -rf "$DEST/.turbo"
rm -f "$DEST/.env.local"
rm -f "$DEST/.env"
rm -f "$DEST/.env.development"
rm -f "$DEST/.env.production"
rm -f "$DEST/package-lock.json"
rm -f "$DEST/yarn.lock"
rm -f "$DEST/tsconfig.tsbuildinfo"

echo "📝 Marking as template..."
cat > "$DEST/TEMPLATE_README.md" << 'TEMPLATE_EOF'
# Restaurant Website Template

This is a pre-built restaurant website. When you receive this ZIP:

1. Run `pnpm install` (or `npm install`)
2. Create `.env.local` with your Supabase keys
3. Run `pnpm dev`
4. Open http://localhost:3000

See the generated README.md at the root for full deployment instructions.
TEMPLATE_EOF

echo ""
echo "✅ Done. Template synced to:"
echo "   $DEST"
echo ""
echo "📊 Size check:"
du -sh "$DEST" 2>/dev/null || echo "(size unavailable)"
