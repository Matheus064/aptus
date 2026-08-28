const { executar, buscar, listar } = require('../config/conexaoBanco');

const CATALOGO = [
  { id: 'primeiro-passo', nome: 'Primeiro passo', descricao: 'Registrou sua primeira evolução.', icone: '🌱', pontos: 10 },
  { id: 'voz-da-comunidade', nome: 'Voz da comunidade', descricao: 'Publicou 5 comentários.', icone: '💬', pontos: 25 },
  { id: 'curioso', nome: 'Curioso', descricao: 'Curtiu 10 conteúdos.', icone: '✨', pontos: 30 },
  { id: 'colecionador', nome: 'Colecionador', descricao: 'Salvou 5 conteúdos.', icone: '🔖', pontos: 35 },
  { id: 'constancia', nome: 'Constância', descricao: 'Registrou 7 evoluções.', icone: '📈', pontos: 60 },
  { id: 'apoiador', nome: 'Apoiador', descricao: 'Começou a seguir alguém.', icone: '🤝', pontos: 15 },
];

async function registrarAcao(usuarioId, acao, referenciaId = null, pontos = 1) {
  if (!usuarioId || String(usuarioId) === 'guest') return;
  const existente = await buscar('SELECT id FROM acoes_pontuadas WHERE usuario_id=? AND acao=? AND referencia_id IS ?', [usuarioId, acao, referenciaId]);
  if (existente) return;
  await executar('INSERT INTO acoes_pontuadas (usuario_id,acao,referencia_id) VALUES (?,?,?)', [usuarioId, acao, referenciaId]);
  await executar('INSERT INTO usuarios_pontos (usuario_id,pontos) VALUES (?,?) ON CONFLICT(usuario_id) DO UPDATE SET pontos=pontos+excluded.pontos', [usuarioId, pontos]);
  await verificarMedalhas(usuarioId);
}

async function verificarMedalhas(usuarioId) {
  const contagens = await listar('SELECT acao, COUNT(*) total FROM acoes_pontuadas WHERE usuario_id=? GROUP BY acao', [usuarioId]);
  const mapa = Object.fromEntries(contagens.map((item) => [item.acao, item.total]));
  const regras = [
    ['primeiro-passo', (mapa.peso_registrado || 0) >= 1], ['voz-da-comunidade', (mapa.comentario || 0) >= 5],
    ['curioso', (mapa.curtida || 0) >= 10], ['colecionador', (mapa.salvo || 0) >= 5],
    ['constancia', (mapa.peso_registrado || 0) >= 7], ['apoiador', (mapa.seguiu || 0) >= 1],
  ];
  for (const [medalha, conquistada] of regras) if (conquistada) await executar('INSERT OR IGNORE INTO usuarios_medalhas (usuario_id,medalha) VALUES (?,?)', [usuarioId, medalha]);
}

async function obterResumo(usuarioId) {
  const pontos = await buscar('SELECT pontos FROM usuarios_pontos WHERE usuario_id=?', [usuarioId]);
  const conquistadas = await listar('SELECT medalha,data_conquista FROM usuarios_medalhas WHERE usuario_id=? ORDER BY data_conquista DESC', [usuarioId]);
  const mapa = Object.fromEntries(CATALOGO.map((medalha) => [medalha.id, medalha]));
  return { pontos: pontos?.pontos || 0, medalhas: conquistadas.map((item) => ({ ...mapa[item.medalha], conquistada_em: item.data_conquista })).filter(Boolean), proxima: CATALOGO.find((item) => !conquistadas.some((conquista) => conquista.medalha === item.id)) || null };
}

module.exports = { registrarAcao, obterResumo, CATALOGO };