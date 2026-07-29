# 🎮 MANICRAFITI — Herói da Leitura

App gamificado de alfabetização fônica em 15 dias, com voz, monstros, missões
e painel dos pais. Baseado em evidências (PNA, National Reading Panel,
Frontiers 2025), pensado para crianças com TDAH.

---

## 📦 O que precisas antes de começar

Este é um app fullstack Next.js + PostgreSQL. Precisa de **duas coisas**:

1. **Node.js 20+** — para rodar o app.  
   Download: <https://nodejs.org>
2. **PostgreSQL** (uma base de dados) — para guardar heróis, XP, missões.  
   Podes usar:
   - **Neon** (gratuito, recomendado): <https://neon.tech>
   - **Supabase** (gratuito): <https://supabase.com>
   - **Railway** (gratuito com limite): <https://railway.app>
   - **Vercel Postgres**: <https://vercel.com/storage/postgres>
   - Ou local no teu computador.

> ⚠️ **Só subir o código no GitHub NÃO faz o app funcionar sozinho.**
> O GitHub só guarda o código. Precisas de o **hospedar** num serviço
> (Vercel, Railway, etc.) e ligar a uma base de dados.

---

## 🚀 Como rodar (3 caminhos)

### Caminho A — Hospedar na Vercel (mais fácil, gratuito)

1. Cria conta em <https://vercel.com>.
2. Cria uma base de dados em <https://neon.tech> (gratuito) e copia a
   **connection string** (começa por `postgresql://...`).
3. Sobe este projeto para o teu GitHub.
4. Na Vercel, clica em **Add New → Project** e escolhe o teu repositório.
5. Antes de fazer deploy, adiciona a variável de ambiente:
   - Nome: `DATABASE_URL`
   - Valor: a connection string do Neon
6. Clica **Deploy**. Em ~2 minutos tens um endereço público
   (ex: `manicrafiti.vercel.app`).
7. Depois do primeiro deploy, corre uma vez o comando de criar tabelas:
   - Localmente: `npx drizzle-kit push --force` (com o `DATABASE_URL` no `.env`).

Pronto — o teu filho abre o link em qualquer celular.

---

### Caminho B — Rodar no teu computador

```bash
# 1. Clona o repositório
git clone https://github.com/o-teu-user/manicrafiti.git
cd manicrafiti

# 2. Cria o .env com o endereço da base de dados
cp .env.example .env
# Edita o .env e coloca o teu DATABASE_URL

# 3. Instala e prepara tudo (dependências + tabelas + build)
bash setup.sh

# 4. Arranca o servidor
npm run start
```

Depois abre <http://localhost:3000> no navegador.

Para rodar num celular na **mesma rede WiFi**, descobre o IP do teu
computador (ex: `192.168.1.10`) e no celular abre `http://192.168.1.10:3000`.

---

### Caminho C — Railway (tudo num sítio só, base incluída)

1. Cria conta em <https://railway.app>.
2. Novo projeto → **Deploy from GitHub repo**.
3. No mesmo projeto, adiciona um **PostgreSQL** (Railway cria automaticamente).
4. Nas variáveis do serviço Next.js, adiciona:
   `DATABASE_URL = ${{Postgres.DATABASE_URL}}`
5. Faz deploy. Depois corre a migração uma vez:
   ```
   npx drizzle-kit push --force
   ```

---

## 🗂️ Estrutura do projeto

```
src/
├── app/                    # páginas Next.js (App Router)
│   ├── mae/                # painel da mãe (admin)
│   ├── pai/                # painel do pai/padrinhos
│   ├── jogar/              # jogo principal
│   ├── loja-recompensas/   # loja de itens
│   └── api/                # endpoints do servidor
├── components/             # componentes React
│   ├── game/               # fases do jogo
│   └── ...
├── db/                     # schema Drizzle (PostgreSQL)
└── lib/                    # utilidades: voz, sessão, currículo
public/
├── manifest.webmanifest    # PWA
├── sw.js                   # service worker
└── icons/                  # ícone do app
```

---

## 🎯 Comandos úteis

```bash
npm run dev              # desenvolvimento (hot reload)
npm run build            # produção
npm run start            # arranca a versão de produção
npm run lint             # verifica erros

npx drizzle-kit push     # aplica schema à base de dados
```

---

## 🔐 Contas iniciais

Quando arrancas pela primeira vez, a base está vazia.

1. Entra em `/mae` → **CRIAR CONTA** com o teu nome + PIN.
2. Adiciona os perfis dos filhos.
3. Dá acesso ao pai/padrinhos (nomes + PINs próprios).
4. Toca em **▶ JOGAR** ao lado do perfil da criança.

---

## 📱 Instalar como app no celular

Depois de hospedar (Vercel/Railway):

1. Abre o link público no navegador do celular.
2. Toca em **📱 INSTALAR NO CELULAR** na tela inicial.
3. Segue as instruções (Android/iPhone) — vira app com ícone próprio.

---

## 🧠 Base científica

- **PNA** (Política Nacional de Alfabetização, Brasil 2019)
- **National Reading Panel** (NRP, 2000)
- **Frontiers 2025** — RCT de 8 semanas com gamificação em TDAH
- **Linnea Ehri** — Fases de reconhecimento de palavras
- **Scarborough's Reading Rope** — decodificação × compreensão

---

## 📄 Licença

Uso pessoal e educativo.
