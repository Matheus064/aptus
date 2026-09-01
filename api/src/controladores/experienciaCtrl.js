const crypto = require('node:crypto');
const { executar, buscar, listar } = require('../config/conexaoBanco');

const json = (valor, padrao = []) => {
  try { return JSON.parse(valor || JSON.stringify(padrao)); } catch { return padrao; }
};
const numero = (valor, padrao = 0) => Number.isFinite(Number(valor)) ? Number(valor) : padrao;

async function planoAtual(req, res, next) {
  try {
    const plano = await buscar(`SELECT p.*, usp.data_inicio, usp.dias_completos
      FROM usuarios_seguem_planos usp JOIN planos_alimentares p ON p.id = usp.plano_id
      WHERE usp.usuario_id = ? AND p.ativo = 1 ORDER BY usp.data_inicio DESC LIMIT 1`, [req.usuario.sub]);
    if (!plano) return res.status(404).json({ erro: 'Nenhum plano ativo.' });
    const dia = Math.max(1, Math.floor((Date.now() - new Date(plano.data_inicio).getTime()) / 86400000) + 1);
    const refeicoes = await listar(`SELECT prd.*, r.titulo, r.foto_url, r.calorias, r.proteina, r.carboidrato, r.gordura
      FROM planos_receitas_detalhado prd JOIN receitas r ON r.id = prd.receita_id
      WHERE prd.plano_id = ? AND prd.dia_plano = ? AND prd.ativo = 1
      ORDER BY prd.ordem_refeicao, prd.id`, [plano.id, dia]);
    const totalDias = numero(plano.duracao_dias, 0);
    const completos = await buscar('SELECT COUNT(DISTINCT data) total FROM historico_consumo_usuario WHERE usuario_id = ? AND consumido = 1', [req.usuario.sub]);
    return res.json({ ...plano, dias_totais: totalDias, dia_atual: dia, dias_completos: completos.total, progresso_percentual: totalDias ? Math.min(100, Math.round((completos.total / totalDias) * 100)) : 0, refeicoes_hoje: refeicoes.map(item => ({ ...item, macros: { proteina: item.proteina, carboidrato: item.carboidrato, gordura: item.gordura }, consumido: Boolean(item.consumido) })) });
  } catch (error) { return next(error); }
}

async function consumirRefeicao(req, res, next) {
  try {
    const { planoId, dia, refeicao } = req.params;
    const receitaId = numero(req.body.receita_id, 0);
    if (!receitaId || !req.body.data) return res.status(422).json({ erro: 'receita_id e data são obrigatórios.' });
    const existente = await buscar('SELECT id FROM receitas WHERE id = ? AND ativo = 1', [receitaId]);
    if (!existente) return res.status(404).json({ erro: 'Receita não encontrada.' });
    await executar(`INSERT INTO historico_consumo_usuario (usuario_id, data, receita_id, refeicao, consumido, porcoes_consumidas, calorias_consumidas, macros_consumidas, foto_url, notas, sentimento)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(usuario_id, data, receita_id) DO UPDATE SET refeicao=excluded.refeicao, consumido=excluded.consumido, porcoes_consumidas=excluded.porcoes_consumidas, calorias_consumidas=excluded.calorias_consumidas, macros_consumidas=excluded.macros_consumidas, foto_url=excluded.foto_url, notas=excluded.notas, sentimento=excluded.sentimento`, [req.usuario.sub, req.body.data, receitaId, refeicao, req.body.consumido === false ? 0 : 1, req.body.porcoes || 1, req.body.calorias_consumidas || null, JSON.stringify(req.body.macros_consumidas || {}), req.body.foto_evidencia || null, req.body.notas || null, req.body.sentimento || null]);
    const progresso = await buscar('SELECT COUNT(*) total FROM historico_consumo_usuario WHERE usuario_id = ? AND data = ? AND consumido = 1', [req.usuario.sub, req.body.data]);
    await executar('UPDATE planos_receitas_detalhado SET consumido = ?, data_consumo = CURRENT_TIMESTAMP WHERE plano_id = ? AND dia_plano = ? AND refeicao = ? AND receita_id = ?', [req.body.consumido === false ? 0 : 1, planoId, dia, refeicao, receitaId]);
    return res.json({ sucesso: true, progresso_diario: `${progresso.total} refeições` });
  } catch (error) { return next(error); }
}

async function historicoConsumo(req, res, next) {
  try {
    const inicio = req.query.inicio || '1970-01-01';
    const fim = req.query.fim || '2999-12-31';
    const dias = await listar(`SELECT data, COUNT(*) total_refeicoes, SUM(consumido) consumidas, SUM(calorias_consumidas) calorias FROM historico_consumo_usuario WHERE usuario_id = ? AND data BETWEEN ? AND ? GROUP BY data ORDER BY data DESC`, [req.usuario.sub, inicio, fim]);
    const total = await buscar('SELECT COUNT(*) dias, COALESCE(SUM(calorias_consumidas), 0) calorias FROM historico_consumo_usuario WHERE usuario_id = ? AND data BETWEEN ? AND ?', [req.usuario.sub, inicio, fim]);
    return res.json({ dias_no_periodo: total.dias, total_calorias_consumidas: total.calorias, media_calorias_dia: total.dias ? Math.round(total.calorias / total.dias) : 0, dias: dias.map(item => ({ ...item, completo: item.total_refeicoes > 0 && item.total_refeicoes === item.consumidas })) });
  } catch (error) { return next(error); }
}

async function listaCompras(req, res, next) {
  try {
    const receitas = await listar(`SELECT ri.nome, ri.calorias_por_100g, pri.quantidade, pri.unidade_medida, r.titulo receita
      FROM planos_receitas pr JOIN receitas r ON r.id = pr.receita_id JOIN receitas_ingredientes pri ON pri.receita_id = r.id
      JOIN ingredientes ri ON ri.id = pri.ingrediente_id WHERE pr.plano_id = ? ORDER BY ri.nome`, [req.query.plano_id]);
    const agrupados = Object.values(receitas.reduce((acc, item) => { const atual = acc[item.nome] || { id: item.nome, nome: item.nome, quantidade: 0, unidade: item.unidade_medida, quantidade_receitas: 0, receitas_que_usam: [] }; atual.quantidade += numero(item.quantidade); atual.quantidade_receitas += 1; if (!atual.receitas_que_usam.includes(item.receita)) atual.receitas_que_usam.push(item.receita); acc[item.nome] = atual; return acc; }, {}));
    return res.json({ total_estimado: 0, quantidade_itens: agrupados.length, itens: agrupados });
  } catch (error) { return next(error); }
}

async function execucao(req, res, next) {
  try {
    const item = await buscar(`SELECT e.*, ee.execucao_estruturada, ee.tempo_total_execucao_segundos, ee.video_completo_url, ee.video_curto_url, ee.videos_por_angulo, ee.equipamento_necessario, ee.dicas_seguranca
      FROM exercicios e LEFT JOIN exercicios_execucao ee ON ee.exercicio_id = e.id WHERE e.id = ? AND e.ativo = 1`, [req.params.id]);
    if (!item) return res.status(404).json({ erro: 'Exercício não encontrado.' });
    return res.json({ ...item, tempo_total_execucao: item.tempo_total_execucao_segundos || 0, execucao_estruturada: json(item.execucao_estruturada), videos: { completo: item.video_completo_url, curto: item.video_curto_url, angulos: json(item.videos_por_angulo, {}) }, equipamento_necessario: json(item.equipamento_necessario), dicas_seguranca: json(item.dicas_seguranca), musculos: json(item.musculos_trabalhados) });
  } catch (error) { return next(error); }
}

async function iniciarSessao(req, res, next) {
  try {
    const exercicio = await buscar('SELECT * FROM exercicios WHERE id = ? AND ativo = 1', [req.params.id]);
    if (!exercicio) return res.status(404).json({ erro: 'Exercício não encontrado.' });
    const series = numero(req.body.series, exercicio.series_recomendadas || 1);
    const repeticoes = numero(req.body.repeticoes, exercicio.repeticoes_recomendadas || 1);
    if (series < 1 || repeticoes < 1) return res.status(422).json({ erro: 'Séries e repetições devem ser positivas.' });
    const sessaoId = crypto.randomUUID();
    await executar('INSERT INTO sessoes_exercicios (id, usuario_id, exercicio_id, series_totais, repeticoes_por_serie, peso) VALUES (?, ?, ?, ?, ?, ?)', [sessaoId, req.usuario.sub, exercicio.id, series, repeticoes, req.body.peso || null]);
    const passo = await buscar('SELECT * FROM exercicios_execucao WHERE exercicio_id = ?', [exercicio.id]);
    return res.status(201).json({ sessao_id: sessaoId, exercicio_id: exercicio.id, exercicio_nome: exercicio.nome, series_totais: series, repeticoes_por_serie: repeticoes, proximo_passo: json(passo?.execucao_estruturada)[0] || null });
  } catch (error) { return next(error); }
}

async function serieCompleta(req, res, next) {
  try {
    const sessao = await buscar('SELECT * FROM sessoes_exercicios WHERE id = ? AND usuario_id = ? AND status = \'ativa\'', [req.params.sessaoId, req.usuario.sub]);
    if (!sessao) return res.status(404).json({ erro: 'Sessão ativa não encontrada.' });
    const numeroSerie = numero(req.body.numero_serie, 0);
    if (numeroSerie < 1 || numeroSerie > sessao.series_totais) return res.status(422).json({ erro: 'Número de série inválido.' });
    await executar('UPDATE sessoes_exercicios SET series_completadas = MAX(series_completadas, ?), tempo_total_segundos = tempo_total_segundos + ? WHERE id = ?', [numeroSerie, numero(req.body.tempo_real_segundos), sessao.id]);
    return res.json({ serie: numeroSerie, status: 'completa', proxima_serie: numeroSerie < sessao.series_totais ? numeroSerie + 1 : null, tempo_descanso_sugerido: 60 });
  } catch (error) { return next(error); }
}

async function finalizarSessao(req, res, next) {
  try {
    const sessao = await buscar('SELECT s.*, e.nome, e.musculos_trabalhados FROM sessoes_exercicios s JOIN exercicios e ON e.id = s.exercicio_id WHERE s.id = ? AND s.usuario_id = ? AND s.status = \'ativa\'', [req.params.sessaoId, req.usuario.sub]);
    if (!sessao) return res.status(404).json({ erro: 'Sessão ativa não encontrada.' });
    await executar('UPDATE sessoes_exercicios SET status = \'finalizada\', data_fim = CURRENT_TIMESTAMP, notas_gerais = ? WHERE id = ?', [req.body.notas_gerais || null, sessao.id]);
    await executar('INSERT INTO historico_exercicios_usuario (usuario_id, exercicio_id, sessao_id, data_execucao, completado, series_completadas, repeticoes_completadas, peso_usado, tempo_total_segundos) VALUES (?, ?, ?, date(\'now\'), ?, ?, ?, ?, ?)', [sessao.usuario_id, sessao.exercicio_id, sessao.id, sessao.series_completadas >= sessao.series_totais ? 1 : 0, sessao.series_completadas, sessao.series_completadas * (sessao.repeticoes_por_serie || 0), sessao.peso, sessao.tempo_total_segundos]);
    return res.json({ sucesso: true, sessao_completa: { exercicio: sessao.nome, series_completas: sessao.series_completadas, tempo_total: sessao.tempo_total_segundos, musculos_trabalhados: json(sessao.musculos_trabalhados) } });
  } catch (error) { return next(error); }
}

async function historicoExercicio(req, res, next) {
  try {
    const itens = await listar(`SELECT h.*, e.nome FROM historico_exercicios_usuario h JOIN exercicios e ON e.id = h.exercicio_id WHERE h.usuario_id = ? AND h.exercicio_id = ? ORDER BY h.data_execucao DESC LIMIT 100`, [req.usuario.sub, req.params.exercicioId]);
    return res.json({ exercicio: itens[0]?.nome || null, total_sessoes: itens.length, sessoes: itens });
  } catch (error) { return next(error); }
}

module.exports = { planoAtual, consumirRefeicao, historicoConsumo, listaCompras, execucao, iniciarSessao, serieCompleta, finalizarSessao, historicoExercicio };
