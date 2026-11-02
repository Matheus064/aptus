# Publicar o frontend no GitHub Pages

O workflow `.github/workflows/deploy-pages.yml` compila e publica `frontend/` em cada push para `main`. O endereço do projeto é:

<https://matheus064.github.io/aptus/>

## Configurar a API pública

GitHub Pages hospeda arquivos estáticos; ele não executa a API Express nem o banco SQLite. Para login, perfil, mensagens e sincronização entre aparelhos funcionarem, publique a API (por exemplo, seguindo [DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md)) e configure o endereço público:

1. No GitHub, abra **Settings → Secrets and variables → Actions → Variables**.
2. Crie a variável `VITE_API_URL` com o endereço completo da API publicada, incluindo `/api`, por exemplo `https://seu-servico.example.com/api`.
3. Em **Settings → Pages**, selecione **GitHub Actions** como origem de publicação, se ainda não estiver selecionada.
4. Execute novamente o workflow **Publicar frontend no GitHub Pages** em **Actions → Run workflow**, ou faça um novo push em `main`.
5. Configure `FRONTEND_URL=https://matheus064.github.io/aptus` nas variáveis da API para permitir as chamadas CORS do site.

**Verifique a API antes:** `https://aptus-api.onrender.com/health` responde, mas esse serviço público atualmente devolve 404 nas rotas Express `/api/health` e `/api/receitas` (a origem informa que é um servidor Uvicorn). Portanto, **não configure esse endereço no Pages**: login, cadastro, receitas dinâmicas e perfil não funcionarão nele. Publique a API Node/Express deste repositório no serviço correto e confirme que `https://SEU-DOMINIO/api/health` retorna `{"status":"ok","servico":"aptus-api"}` antes de definir `VITE_API_URL` e `FRONTEND_URL`.

Sem `VITE_API_URL`, o site ainda publica, mas operações que precisam do servidor mostram uma mensagem de configuração. Não use `localhost` como endereço da API pública: esse endereço apontaria para o computador de cada visitante. O SQLite no disco efêmero de um serviço gratuito também não é armazenamento durável entre reinicializações; configure um volume persistente suportado pelo host antes de usar contas e fotos em produção.

## Desenvolvimento local

Com a API local ligada na porta 3000, execute `npm run dev` dentro de `frontend`. O Vite encaminha `/api` e `/uploads` para `http://localhost:3000` automaticamente.
