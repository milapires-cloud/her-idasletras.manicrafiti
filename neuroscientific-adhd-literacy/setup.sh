#!/usr/bin/env bash
# Script de instalação rápida do MANICRAFITI.
# Corre depois de "git clone" e "cp .env.example .env".

set -e
echo "🎮 MANICRAFITI — a instalar..."

# 1. Dependências
echo "→ 1/3 A instalar pacotes..."
npm install

# 2. Aplicar tabelas na base de dados
echo "→ 2/3 A criar tabelas no PostgreSQL..."
npx drizzle-kit push --force

# 3. Build de produção
echo "→ 3/3 A compilar o app..."
npm run build

echo ""
echo "✅ Pronto!"
echo ""
echo "Para arrancar:"
echo "  npm run start         (produção, porta 3000)"
echo "  npm run dev           (desenvolvimento com hot-reload)"
