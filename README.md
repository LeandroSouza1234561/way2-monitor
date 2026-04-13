# Way2 Monitor – GNA

Painel executivo em tempo real hospedado no **GitHub Pages** com proxy na **Vercel**.

---

## 🔗 Links após configuração
- **Painel:** `https://LeandroSouza1234561.github.io/way2-monitor`
- **Proxy:** `https://way2-monitor-leandrosouza1234561.vercel.app`

---

## 🚀 Como configurar (1x só, ~5 minutos)

### PASSO 1 — Criar repositório no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Nome do repositório: `way2-monitor`
3. Marque **Public**
4. Clique em **Create repository**
5. Faça upload dos arquivos deste projeto

### PASSO 2 — Ativar GitHub Pages

1. No repositório, clique em **Settings**
2. No menu lateral, clique em **Pages**
3. Em "Source", selecione **Deploy from a branch**
4. Branch: **main** / Folder: **/ (root)**
5. Clique em **Save**
6. Aguarde ~1 min → seu painel estará em:
   `https://LeandroSouza1234561.github.io/way2-monitor`

### PASSO 3 — Deploy do Proxy na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em **Add New → Project**
3. Selecione o repositório `way2-monitor`
4. Clique em **Deploy**
5. Aguarde ~2 min
6. Copie a URL gerada (ex: `https://way2-monitor-xyz.vercel.app`)

### PASSO 4 — Atualizar URL do proxy no painel

1. Abra o arquivo `index.html`
2. Localize a linha:
   ```js
   const PROXY = 'https://way2-monitor-leandrosouza1234561.vercel.app';
   ```
3. Substitua pela URL real da Vercel
4. Faça commit da alteração no GitHub

---

## ✅ Pronto!

Acesse `https://LeandroSouza1234561.github.io/way2-monitor` — o painel carrega automaticamente, sem login, sem instalação.

---

## 🔄 Atualização

Para atualizar o painel, edite os arquivos no GitHub → o GitHub Pages atualiza em ~30 segundos.
