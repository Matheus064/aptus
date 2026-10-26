# Publicar o frontend no GitHub Pages

O workflow `.github/workflows/deploy-pages.yml` compila e publica `frontend/` em cada push para `main`. O endereço do projeto é:

<https://matheus064.github.io/aptus/>

## Configurar a API pública

GitHub Pages hospeda arquivos estáticos; ele não executa a API Express nem o banco SQLite. Para login, perfil, mensagens e sincronização entre aparelhos funcionarem, publique a API (por exemplo, seguindo [DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md)) e configure o endereço público:

1. A API publicada é usada automaticamente como padrão pelo workflow. Se quiser trocar o endereço, abra **Settings → Secrets and variables → Actions → Variables** e defina `VITE_API_URL`, incluindo `/api`.
2. Em **Settings → Pages**, selecione **GitHub Actions** como origem de publicação, se ainda não estiver selecionada.
3. Execute novamente o workflow **Publicar frontend no GitHub Pages** em **Actions → Run workflow**, ou faça um novo push em `main`.
4. No Render, mantenha `FRONTEND_URL=https://matheus064.github.io` para permitir as chamadas CORS do site.

**API Node/Express publicada:** `https://aptus-api-evu0.onrender.com`. O health check foi validado em `/health` e `/api/health`. Configure `VITE_API_URL=https://aptus-api-evu0.onrender.com/api` nas variáveis do GitHub Pages Actions e `FRONTEND_URL=https://matheus064.github.io` no Render para habilitar login, cadastro e recursos com persistência. No plano gratuito, o primeiro acesso após inatividade pode levar 50 segundos ou mais. O SQLite fica em armazenamento efêmero; dados podem ser perdidos em reinicializações e não há persistência adequada para produção.

Sem `VITE_API_URL`, o site ainda publica, mas operações que precisam do servidor mostram uma mensagem de configuração. Não use `localhost` como endereço da API pública: esse endereço apontaria para o computador de cada visitante. O SQLite no disco efêmero de um serviço gratuito também não é armazenamento durável entre reinicializações; configure um volume persistente suportado pelo host antes de usar contas e fotos em produção.

## Desenvolvimento local

Com a API local ligada na porta 3000, execute `npm run dev` dentro de `frontend`. O Vite encaminha `/api` e `/uploads` para `http://localhost:3000` automaticamente.
