const { buscar, listar } = require('../config/conexaoBanco');

async function recomendacoes(req, res, next) {
  try {
    const limite = Math.min(Math.max(Number(req.query.limite) || 5, 1), 20);
    const tipo = ['receita', 'exercicio', 'plano'].includes(req.query.tipo) ? req.query.tipo : null;
    const tabelas = tipo === 'exercicio' ? ['exercicios', 'e'] : tipo === 'plano' ? ['planos_alimentares', 'p'] : ['receitas', 'r'];
    const filtro = tipo ? `AND ${tabelas[1]}.ativo = 1` : '';
    const rows = await listar(`SELECT ${tabelas[1]}.id, ${tabelas[1]}.${tipo === 'exercicio' ? 'nome' : 'titulo'} AS titulo, ${tabelas[1]}.descricao, ${tabelas[1]}.curtidas, ${tabelas[1]}.data_criacao FROM ${tabelas[0]} ${tabelas[1]} WHERE ${tabelas[1]}.ativo = 1 ${filtro} ORDER BY ${tabelas[1]}.curtidas DESC, ${tabelas[1]}.data_criacao DESC LIMIT ?`, [limite]);
    return res.json({ recomendacoes: rows.map(item => ({ id: item.id, tipo: tipo || 'receita', item, score_compatibilidade: Math.min(99, 70 + Number(item.curtidas || 0)), motivo: 'Selecionado com base em popularidade e atividade recente', motivos_detalhados: ['Conteúdo ativo na comunidade'] })) });
  } catch (error) { return next(error); }
}

async function sugestoesPosts(req, res, next) {
  try {
    const item = req.query.item_id ? await buscar('SELECT titulo, descricao FROM receitas WHERE id = ?', [req.query.item_id]) : null;
    const assunto = item?.titulo || 'sua evolução';
    return res.json({ sugestoes: [{ legenda: `Compartilhe ${assunto} com a comunidade e conte como foi sua experiência.`, hashtags: ['#aptus', '#saude', '#habitos'], emoji: '💚', melhor_horario: '12:00', confianca_viralidade: 70, razao_selecao: 'Sugestão baseada no tipo de conteúdo selecionado' }] });
  } catch (error) { return next(error); }
}

module.exports = { recomendacoes, sugestoesPosts };
