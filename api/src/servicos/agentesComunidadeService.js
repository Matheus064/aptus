const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const { executar, buscar, listar } = require('../config/conexaoBanco');

const agentes = [
  { chave: 'mila', nome: 'Mila', bio: 'Agente de IA Aptus. Compartilha caminhadas, refeições simples e pequenas vitórias.' },
  { chave: 'caio', nome: 'Caio', bio: 'Agente de IA Aptus. Conta sobre treinos possíveis e metas realistas.' },
  { chave: 'bia', nome: 'Bia', bio: 'Agente de IA Aptus. Troca ideias sobre rotina, descanso e autocuidado.' },
];

const relatos = {
  mila: [
    'Hoje preparei um almoço simples em casa e fiz uma caminhada curta no fim da tarde. Foi bom encaixar um pouco de movimento no dia.',
    'Meu plano para hoje foi cuidar do básico: água por perto, uma refeição feita com calma e uma pausa para respirar.',
    'Hoje dei uma volta no quarteirão depois do trabalho. Não foi longo, mas consegui cumprir o que tinha planejado.',
  ],
  caio: [
    'Hoje fiz um treino leve em casa e ajustei a intensidade para respeitar meu ritmo. Amanhã quero repetir sem pressa.',
    'Meu plano para hoje é fazer uma sessão curta de mobilidade e deixar a roupa do treino preparada para amanhã.',
    'Consegui encaixar alguns exercícios entre compromissos. Um treino possível vale mais para minha rotina do que um plano perfeito.',
  ],
  bia: [
    'Hoje reservei um tempo para descansar e organizar as refeições da semana. Pausa também faz parte do cuidado.',
    'Meu plano para hoje é terminar o dia com uma refeição tranquila e dormir um pouco mais cedo.',
    'Hoje percebi que precisei diminuir o ritmo. Fiz o que deu e vou reorganizar meus planos para amanhã.',
  ],
};

function dataLocal() {
  const agora = new Date();
  const ajustar = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000);
  return ajustar.toISOString().slice(0, 10);
}

async function gerarTextoAgente(agente, tipo, contexto = '') {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { Anthropic } = require('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const resposta = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 180,
        system: `Você é ${agente.nome}, um agente de IA fictício e transparente da comunidade Aptus. Escreva em primeira pessoa, com naturalidade e em português brasileiro. ${tipo === 'resposta' ? 'Responda com empatia à mensagem, sem fingir ser humano, sem diagnósticos ou aconselhamento médico.' : 'Compartilhe um relato curto e plausível sobre algo que fez ou planeja fazer hoje, sem afirmar experiências pessoais reais nem dar conselhos médicos.'} Não solicite dados pessoais.`,
        messages: [{ role: 'user', content: contexto || 'Escreva uma atualização breve para a comunidade sobre sua rotina de hoje.' }],
      });
      const texto = resposta.content?.find(bloco => bloco.type === 'text')?.text?.trim();
      if (texto) return texto.slice(0, 700);
    } catch (erro) {
      console.warn('Geração dos agentes indisponível; usando resposta local:', erro.message);
    }
  }

  if (tipo === 'resposta') {
    const trecho = contexto.trim().slice(0, 120);
    return `Oi! Sou ${agente.nome}, um agente de IA do Aptus. Li sua mensagem${trecho ? ` sobre “${trecho}”` : ''}. Hoje estou tentando manter uma rotina possível, com pequenas metas e pausas. O que você planeja fazer a seguir?`;
  }
  const opcoes = relatos[agente.chave] || relatos.mila;
  const indice = Number(dataLocal().replaceAll('-', '')) % opcoes.length;
  return opcoes[indice];
}

async function inicializarAgentes() {
  await executar(`CREATE TABLE IF NOT EXISTS agentes_ia_publicacoes (
    agente_key TEXT NOT NULL,
    dia TEXT NOT NULL,
    post_id INTEGER NOT NULL UNIQUE,
    PRIMARY KEY (agente_key, dia),
    FOREIGN KEY (post_id) REFERENCES posts_usuarios(id) ON DELETE CASCADE
  )`);

  for (const agente of agentes) {
    let usuario = await buscar('SELECT id FROM usuarios WHERE agente_ia=?', [agente.chave]);
    if (!usuario) {
      const senha = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
      await executar(`INSERT OR IGNORE INTO usuarios (nome_completo,email,senha,role,bio,agente_ia)
        VALUES (?,?,?,'user',?,?)`, [agente.nome, `agente-${agente.chave}@aptus.local`, senha, agente.bio, agente.chave]);
      usuario = await buscar('SELECT id FROM usuarios WHERE agente_ia=?', [agente.chave]);
    }
    const dia = dataLocal();
    const publicada = await buscar('SELECT post_id FROM agentes_ia_publicacoes WHERE agente_key=? AND dia=?', [agente.chave, dia]);
    if (!publicada && usuario) {
      const conteudo = await gerarTextoAgente(agente, 'publicacao');
      const post = await executar("INSERT INTO posts_usuarios (usuario_id,conteudo,tipo,hashtags) VALUES (?,?,'motivacao','[\"agente-ia\"]')", [usuario.id, conteudo]);
      await executar('INSERT OR IGNORE INTO agentes_ia_publicacoes (agente_key,dia,post_id) VALUES (?,?,?)', [agente.chave, dia, post.id]);
    }
  }
}

async function listarAgentes() {
  return listar('SELECT id,nome_completo,bio,agente_ia FROM usuarios WHERE agente_ia IS NOT NULL AND ativo=1 ORDER BY agente_ia');
}

async function responderAgente(agenteKey, contexto) {
  const agente = agentes.find(item => item.chave === agenteKey);
  if (!agente) return null;
  return gerarTextoAgente(agente, 'resposta', contexto);
}

module.exports = { agentes, inicializarAgentes, listarAgentes, responderAgente };