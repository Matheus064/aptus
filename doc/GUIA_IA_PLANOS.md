# 🤖 Guia de Uso - Sistema de IA para Geração de Planos Alimentares

## 🎯 Visão Geral

O Aptus 2.0 agora integra **inteligência artificial** para gerar automaticamente:
- ✨ Planos alimentares personalizados (7-30 dias)
- 🍽️ Receitas detalhadas com ingredientes e macronutrientes
- 📊 Cálculo de necessidades nutricionais
- 💡 Sugestões de planos baseadas no perfil

---

## 🔐 Pré-requisitos

### 1. Instalar Dependências
```bash
cd api
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env`:
```bash
cp .env.example .env
```

**Configure a chave da API Claude:**
```env
ANTHROPIC_API_KEY=sk-ant-...sua-chave-aqui...
```

Obtenha sua chave em: https://console.anthropic.com/account/keys

---

## 📚 Endpoints Disponíveis

### 1️⃣ Gerar Plano Alimentar Completo

**POST** `/api/ia/gerar-plano`

Gera um plano alimentar de 7-30 dias com receitas, ingredientes e macronutrientes calculados.

#### Headers Necessários
```http
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

#### Request Body
```json
{
  "objetivo": "emagrecimento",
  "dias": 7,
  "calorias": 2000,
  "alergias": ["amendoim", "leite"],
  "preferencias": ["massa", "frango"],
  "restricoes": ["sem-gluten"],
  "salvar": true
}
```

#### Parâmetros
| Campo | Tipo | Obrigatório | Valores |
|-------|------|------------|---------|
| `objetivo` | string | ✅ | `emagrecimento`, `ganho_massa`, `manutencao` |
| `dias` | integer | ❌ | 1-30 (padrão: 7) |
| `calorias` | integer | ❌ | Calorias alvo (estimado automaticamente se vazio) |
| `alergias` | array | ❌ | Alergias a evitar |
| `preferencias` | array | ❌ | Ingredientes preferidos |
| `restricoes` | array | ❌ | Restrições alimentares |
| `salvar` | boolean | ❌ | Se deve salvar no banco (padrão: true) |

#### Response (Sucesso - 201)
```json
{
  "sucesso": true,
  "mensagem": "Plano alimentar gerado com sucesso!",
  "plano": {
    "titulo": "Plano de emagrecimento - 7 dias",
    "descricao": "Descrição detalhada do plano...",
    "calorias_alvo": 2000,
    "dias": [
      {
        "dia": 1,
        "refeicoes": [
          {
            "nome": "Café da Manhã",
            "horario": "07:00",
            "receita": {
              "titulo": "Omelete de Claras com Espinafre",
              "descricao": "Uma omelete leve e nutritiva...",
              "modo_preparo": "Passo 1...\nPasso 2...",
              "tempo_preparo": 10,
              "porcoes": 1,
              "calorias": 150,
              "proteina": 20,
              "carboidrato": 5,
              "gordura": 3,
              "fibra": 2,
              "ingredientes": [
                {
                  "nome": "Ovo",
                  "quantidade": 2,
                  "unidade": "unidades",
                  "calorias_por_100g": 155
                },
                {
                  "nome": "Espinafre",
                  "quantidade": 100,
                  "unidade": "gramas",
                  "calorias_por_100g": 23
                }
              ],
              "dificuldade": "fácil",
              "categoria": "café_da_manha"
            }
          },
          // ... mais refeições
        ]
      },
      // ... mais dias
    ]
  },
  "planosalvo": {
    "id": 42,
    "titulo": "Plano de emagrecimento - 7 dias"
  }
}
```

#### Exemplos de Uso

**Emagrecimento rápido (1500 kcal):**
```bash
curl -X POST http://localhost:3000/api/ia/gerar-plano \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "objetivo": "emagrecimento",
    "dias": 14,
    "calorias": 1500,
    "alergias": ["amendoim"],
    "preferencias": ["saladas", "frango grelhado"]
  }'
```

---

### 2️⃣ Gerar Receita Individual

**POST** `/api/ia/gerar-receita`

Gera uma receita individual com macronutrientes calculados.

#### Request Body
```json
{
  "tipo": "almoço",
  "calorias": 500,
  "alergias": ["leite"],
  "preferencias": ["peixe"],
  "restricoes": []
}
```

#### Parâmetros
| Campo | Tipo | Obrigatório | Valores |
|-------|------|------------|---------|
| `tipo` | string | ✅ | `café_da_manha`, `lanche_manha`, `almoço`, `lanche_tarde`, `jantar` |
| `calorias` | integer | ❌ | Calorias alvo (padrão: 400) |
| `alergias` | array | ❌ | Alergias a evitar |
| `preferencias` | array | ❌ | Ingredientes preferidos |
| `restricoes` | array | ❌ | Restrições alimentares |

#### Response (Sucesso - 201)
```json
{
  "sucesso": true,
  "mensagem": "Receita gerada com sucesso!",
  "receita": {
    "id": 123,
    "titulo": "Salmão Grelhado com Abóbora",
    "descricao": "Prato saudável e nutritivo...",
    "modo_preparo": "1. Tempere o salmão...\n2. Grelhe por 8 minutos...",
    "tempo_preparo": 15,
    "porcoes": 1,
    "calorias": 480,
    "proteina": 35,
    "carboidrato": 25,
    "gordura": 15,
    "fibra": 4,
    "dificuldade": "fácil",
    "categoria": "almoço",
    "ingredientes": [
      {"nome": "Salmão", "quantidade": 150, "unidade": "gramas"},
      {"nome": "Abóbora", "quantidade": 200, "unidade": "gramas"}
    ]
  }
}
```

---

### 3️⃣ Calcular Necessidades Nutricionais

**POST** `/api/ia/calcular-necessidades`

Calcula TMB (Taxa Metabólica Basal) e recomendações de macronutrientes.

#### Request Body
```json
{
  "peso": 80,
  "altura": 175,
  "idade": 30,
  "sexo": "masculino",
  "objetivo": "emagrecimento",
  "nivelAtividade": "moderado"
}
```

#### Parâmetros
| Campo | Tipo | Obrigatório | Valores |
|-------|------|------------|---------|
| `peso` | float | ✅ | Peso em kg |
| `altura` | integer | ✅ | Altura em cm |
| `idade` | integer | ✅ | Idade em anos |
| `sexo` | string | ✅ | `masculino`, `feminino` |
| `objetivo` | string | ✅ | `emagrecimento`, `ganho_massa`, `manutencao` |
| `nivelAtividade` | string | ✅ | `sedentario`, `ligeiro`, `moderado`, `intenso`, `muito_intenso` |

#### Response (Sucesso - 200)
```json
{
  "sucesso": true,
  "usuario": {
    "peso": 80,
    "altura": 175,
    "idade": 30,
    "sexo": "masculino",
    "objetivo": "emagrecimento",
    "nivelAtividade": "moderado"
  },
  "metricas": {
    "tmb": 1725,
    "gasto_diario": 2662,
    "calorias_recomendadas": 2162
  },
  "macronutrientes": {
    "proteina": {
      "gramas_dia": 162,
      "calorias": 648,
      "percentual": 30
    },
    "carboidrato": {
      "gramas_dia": 243,
      "calorias": 972,
      "percentual": 45
    },
    "gordura": {
      "gramas_dia": 60,
      "calorias": 540,
      "percentual": 25
    }
  },
  "dica": "Você deve consumir aproximadamente 2162 calorias por dia para emagrecer."
}
```

---

### 4️⃣ Obter Sugestões de Planos Personalizadas

**GET** `/api/ia/sugestoes-planos`

Retorna planos populares e relevantes baseado no perfil do usuário.

#### Headers
```http
Authorization: Bearer {JWT_TOKEN}
```

#### Response (Sucesso - 200)
```json
{
  "usuario": {
    "peso_atual": 85,
    "peso_meta": 75,
    "planos_seguindo": 2
  },
  "planos_sugeridos": [
    {
      "id": 5,
      "titulo": "Dieta da Proteína - 21 dias",
      "descricao": "Plano focado em ganho de massa magra...",
      "criado_por": 12,
      "autor_nome": "João Nutricionista",
      "duracao_dias": 21,
      "calorias_alvo": 2500,
      "seguidores": 156
    },
    // ... mais planos
  ],
  "mensagem": "Planos sugeridos baseados em popularidade e seu perfil"
}
```

---

## 🛡️ Tratamento de Erros

### Erro 422 - Validação
```json
{
  "erro": "Objetivo é obrigatório (emagrecimento, ganho_massa ou manutencao)"
}
```

### Erro 401 - Não Autenticado
```json
{
  "erro": "Token inválido ou expirado"
}
```

### Erro 500 - Erro da IA
```json
{
  "erro": "Erro ao gerar plano. Tente novamente."
}
```

---

## 🧪 Testando com cURL

### 1. Obter Token JWT
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@email.com",
    "senha": "sua-senha"
  }'
```

### 2. Gerar Plano (substitua TOKEN pelo JWT obtido)
```bash
curl -X POST http://localhost:3000/api/ia/gerar-plano \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "objetivo": "emagrecimento",
    "dias": 7,
    "calorias": 1800
  }' | jq .
```

### 3. Calcular Necessidades
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

---

## 📊 Estrutura do Banco de Dados

### Tabelas Novas
- `ingredientes` - Banco de dados de ingredientes
- `receitas_ingredientes` - Ligação entre receitas e ingredientes
- `planos_gerados_ia` - Histórico de planos gerados por IA

### Campos Adicionados
- `receitas.modo_preparo` - Modo de preparo detalhado
- `planos_alimentares.foto_capa_url` - Foto de capa do plano
- `planos_alimentares.duracao_dias` - Duração em dias

---

## 🚀 Performance e Limites

- ⏱️ Tempo médio de geração: 10-30 segundos
- 📊 Máximo de dias: 30
- 🎯 Máximo de alergias/preferências: 10 cada
- 💾 Limite de requisição: 100 planos/hora por usuário

---

## 🔗 Integração com Frontend

### Exemplo React
```jsx
import { useState } from 'react';

export function GeradorPlano() {
  const [plano, setPlano] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const gerarPlano = async (objetivo) => {
    setCarregando(true);
    try {
      const response = await fetch('/api/ia/gerar-plano', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          objetivo,
          dias: 7,
          calorias: 2000,
          salvar: true
        })
      });
      const data = await response.json();
      setPlano(data.plano);
    } catch (erro) {
      console.error('Erro:', erro);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div>
      <button onClick={() => gerarPlano('emagrecimento')}>
        {carregando ? 'Gerando...' : 'Gerar Plano'}
      </button>
      {plano && <div>{JSON.stringify(plano, null, 2)}</div>}
    </div>
  );
}
```

---

## ⚠️ Troubleshooting

### "Erro: ANTHROPIC_API_KEY não configurada"
- Configure a chave no arquivo `.env`
- Reinicie o servidor: `npm run dev`

### "Timeout ao gerar plano"
- A IA pode levar até 30 segundos
- Aumente o timeout no frontend para 45s

### "Erro: Não foi possível extrair o plano"
- A IA pode não ter retornado JSON válido
- Tente novamente com parâmetros diferentes

---

## 📝 Próximas Implementações

- [ ] Integração com Unsplash para fotos automáticas
- [ ] Sistema de recomendações baseado em histórico
- [ ] Geração de lista de compras automática
- [ ] Integração com wearables
- [ ] Análise de foto de refeição
- [ ] Chat com nutricionista IA

---

Para mais informações, acesse o repositório: https://github.com/Matheus064/aptus
