# 🚀 Setup Rápido - Aptus 2.0 com IA

## ⚡ Instalação em 5 Minutos

### Passo 1: Clonar e Entrar no Diretório
```bash
cd /home/matheus/Documentos/aptus/aptus
```

### Passo 2: Instalar Dependências do Backend
```bash
cd api
npm install
```

### Passo 3: Configurar Variáveis de Ambiente
```bash
cp .env.example .env
```

**Edite `.env` e adicione:**
```env
ANTHROPIC_API_KEY=sk-ant-XXXXXXXXXXXXX
```

📌 **Obtenha sua chave grátis aqui**: https://console.anthropic.com/account/keys

### Passo 4: Iniciar o Backend
```bash
npm run dev
```

✅ Você verá: `Servidor rodando em http://localhost:3000`

### Passo 5: Em outro terminal, Instalar Frontend
```bash
cd frontend
npm install
npm run dev
```

✅ Acesse: `http://localhost:5173`

---

## 🧪 Testar os Novos Endpoints

### 1️⃣ Registrar Usuário
```bash
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nome_completo": "Seu Nome",
    "email": "seu@email.com",
    "senha": "senha123"
  }'
```

### 2️⃣ Fazer Login (pega o TOKEN)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu@email.com",
    "senha": "senha123"
  }'
```

Copie o valor de `token` da resposta.

### 3️⃣ Calcular Necessidades (SEM TOKEN)
```bash
curl -X POST http://localhost:3000/api/ia/calcular-necessidades \
  -H "Content-Type: application/json" \
  -d '{
    "peso": 80,
    "altura": 175,
    "idade": 30,
    "sexo": "masculino",
    "objetivo": "emagrecimento",
    "nivelAtividade": "moderado"
  }' | jq .
```

### 4️⃣ Gerar Plano com IA (COM TOKEN)
```bash
curl -X POST http://localhost:3000/api/ia/gerar-plano \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "objetivo": "emagrecimento",
    "dias": 3,
    "calorias": 1800,
    "salvar": true
  }' | jq .
```

### 5️⃣ Gerar Receita Individual
```bash
curl -X POST http://localhost:3000/api/ia/gerar-receita \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "almoço",
    "calorias": 500,
    "alergias": ["amendoim"]
  }' | jq .
```

---

## 🎯 O Que Cada Endpoint Faz

| Endpoint | O Que Faz | Token? |
|----------|-----------|--------|
| `POST /api/ia/calcular-necessidades` | Calcula TMB e macronutrientes | ❌ Não |
| `POST /api/ia/gerar-plano` | Gera plano 7-30 dias com IA | ✅ Sim |
| `POST /api/ia/gerar-receita` | Gera receita individual | ✅ Sim |
| `GET /api/ia/sugestoes-planos` | Sugestões personalizadas | ✅ Sim |

---

## 📊 Exemplo Completo de Uso

### Backend
```bash
# Terminal 1
cd /home/matheus/Documentos/aptus/aptus/api
npm run dev
```

### Frontend (Vite)
```bash
# Terminal 2
cd /home/matheus/Documentos/aptus/aptus/frontend
npm run dev
```

### Testar
```bash
# Terminal 3
# Registre um usuário
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nome_completo": "Maria Silva",
    "email": "maria@email.com",
    "senha": "senha123"
  }'

# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@email.com",
    "senha": "senha123"
  }' | jq -r '.token')

echo "Token: $TOKEN"

# Gerar plano
curl -X POST http://localhost:3000/api/ia/gerar-plano \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "objetivo": "emagrecimento",
    "dias": 7,
    "calorias": 1800,
    "alergias": ["leite"],
    "salvar": true
  }' | jq '.plano.titulo'
```

---

## ❌ Troubleshooting

### "ANTHROPIC_API_KEY não configurada"
✅ Solução:
```bash
# Edite .env
nano api/.env

# Adicione:
ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui

# Reinicie:
npm run dev
```

### "Erro 401 - Token inválido"
✅ Solução: Use o token obtido no login

### "Timeout ao gerar plano"
✅ Solução: A IA pode levar até 30 segundos, aguarde

### "Erro: Não foi possível extrair o plano"
✅ Solução: Tente novamente com valores diferentes

---

## 📚 Documentação Completa

Para documentação detalhada de todos os endpoints, veja:
- [GUIA_IA_PLANOS.md](./doc/GUIA_IA_PLANOS.md)
- [README.md](./README.md)
- [MUDANCAS_IMPLEMENTADAS.md](./MUDANCAS_IMPLEMENTADAS.md)

---

## ✨ Funcionalidades Adicionadas

✅ Geração de planos com IA (7-30 dias)
✅ Receitas completas com fotos
✅ Ingredientes detalhados com macronutrientes
✅ Calculadora de necessidades nutricionais
✅ Recomendações personalizadas
✅ Suporte a alergias e preferências
✅ Cálculo automático de TMB e macros

---

## 🎉 Pronto!

Seu Aptus 2.0 está completo e rodando com IA integrada! 🚀

Para reportar problemas: https://github.com/Matheus064/aptus/issues
