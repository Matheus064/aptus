const { buscar, listar, executar } = require('../config/conexaoBanco');

const paginaValida = (valor, padrao = 1) => Math.max(Number.parseInt(valor, 10) || padrao, 1);
const limiteValido = (valor) => Math.min(Math.max(Number.parseInt(valor, 10) || 10, 1), 30);
const lista = (valor) => { try { return JSON.parse(valor || '[]'); } catch { return []; } };

const queryFeed = `SELECT * FROM (
  SELECT 'receita' AS tipo, r.id, r.titulo, NULL AS nome, r.descricao, r.foto_url, NULL AS video_url,
    r.calorias, r.proteina, r.carboidrato, r.gordura, r.fibra, NULL AS dificuldade,
    NULL AS musculos_trabalhados, NULL AS series_recomendadas, NULL AS repeticoes_recomendadas,
    NULL AS descanso_segundos, r.curtidas, r.compartilhamentos,
    (SELECT COUNT(*) FROM comentarios c WHERE c.receita_id = r.id) AS comentarios,
    r.data_criacao, u.id AS autor_id, u.nome_completo AS autor_nome, u.foto_perfil_url AS autor_foto,
    u.verificado AS autor_verificado, u.total_seguidores AS autor_total_seguidores,
    EXISTS(SELECT 1 FROM curtidas_receitas cr WHERE cr.receita_id = r.id AND cr.usuario_id = ?) AS curtido,
    EXISTS(SELECT 1 FROM usuarios_salvam_receitas sr WHERE sr.receita_id = r.id AND sr.usuario_id = ?) AS salvo
  FROM receitas r JOIN usuarios u ON u.id = r.criado_por WHERE r.ativo = 1
  UNION ALL
  SELECT 'exercicio' AS tipo, e.id, NULL AS titulo, e.nome, e.descricao, NULL AS foto_url, e.video_url,
    NULL AS calorias, NULL AS proteina, NULL AS carboidrato, NULL AS gordura, NULL AS fibra, e.dificuldade,
    e.musculos_trabalhados, e.series_recomendadas, e.repeticoes_recomendadas, e.descanso_segundos,
    e.curtidas, 0 AS compartilhamentos, 0 AS comentarios, e.data_criacao, u.id, u.nome_completo,
    u.foto_perfil_url, u.verificado, u.total_seguidores,
    EXISTS(SELECT 1 FROM curtidas_exercicios ce WHERE ce.exercicio_id = e.id AND ce.usuario_id = ?) AS curtido,
    EXISTS(SELECT 1 FROM usuarios_salvam_exercicios se WHERE se.exercicio_id = e.id AND se.usuario_id = ?) AS salvo
  FROM exercicios e JOIN usuarios u ON u.id = e.criado_por WHERE e.ativo = 1
) ORDER BY data_criacao DESC LIMIT ? OFFSET ?`;

function formatar(item) {
  return { id: item.id, tipo: item.tipo, titulo: item.titulo || undefined, nome: item.nome || undefined, foto_url: item.foto_url || undefined, video_url: item.video_url || undefined, descricao: item.descricao, calorias: item.calorias, macros: item.tipo === 'receita' ? { proteina: item.proteina, carboidrato: item.carboidrato, gordura: item.gordura } : undefined, dificuldade: item.dificuldade, musculos: lista(item.musculos_trabalhados), series_recomendadas: item.series_recomendadas, repeticoes_recomendadas: item.repeticoes_recomendadas, descanso_segundos: item.descanso_segundos, praticas: item.praticas || 0, criado_por: { id: item.autor_id, nome: item.autor_nome, foto_perfil: item.autor_foto, verificado: Boolean(item.autor_verificado), total_seguidores: item.autor_total_seguidores || 0 }, curtidas: item.curtidas || 0, comentarios: item.comentarios || 0, compartilhamentos: item.compartilhamentos || 0, curtido_por_usuario: Boolean(item.curtido), salvo_por_usuario: Boolean(item.salvo), data_criacao: item.data_criacao };
}

async function obterFeedInfinito(usuarioId, pagina, limite) {
  const page = paginaValida(pagina); const limit = limiteValido(limite); const total = await buscar('SELECT (SELECT COUNT(*) FROM receitas WHERE ativo=1) + (SELECT COUNT(*) FROM exercicios WHERE ativo=1) AS total');
  const itens = await listar(queryFeed, [usuarioId, usuarioId, usuarioId, usuarioId, limit, (page - 1) * limit]);
  return { dados: itens.map(formatar), pagina: page, total_itens: total.total, tem_proximo: page * limit < total.total };
}

async function obterTrending(tipo, periodo, usuarioId) {
  const limite = 30; const intervalo = periodo === '30dias' ? '-30 days' : '-7 days'; const filtro = tipo === 'exercicios' ? 'e' : tipo === 'receitas' ? 'r' : null;
  const queries = filtro === 'e' ? `SELECT 'exercicio' tipo,e.id,e.nome titulo,e.descricao,e.video_url foto_url,NULL calorias,NULL proteina,NULL carboidrato,NULL gordura,e.curtidas,0 compartilhamentos,0 comentarios,e.data_criacao,u.id autor_id,u.nome_completo autor_nome,u.foto_perfil_url autor_foto,u.verificado autor_verificado,u.total_seguidores autor_total_seguidores,0 curtido,0 salvo FROM exercicios e JOIN usuarios u ON u.id=e.criado_por WHERE e.ativo=1 AND e.data_criacao >= datetime('now','${intervalo}') ORDER BY e.curtidas DESC LIMIT ${limite}` : `SELECT 'receita' tipo,r.id,r.titulo,r.descricao,r.foto_url,r.calorias,r.proteina,r.carboidrato,r.gordura,r.curtidas,r.compartilhamentos,0 comentarios,r.data_criacao,u.id autor_id,u.nome_completo autor_nome,u.foto_perfil_url autor_foto,u.verificado autor_verificado,u.total_seguidores autor_total_seguidores,0 curtido,0 salvo FROM receitas r JOIN usuarios u ON u.id=r.criado_por WHERE r.ativo=1 AND r.data_criacao >= datetime('now','${intervalo}') ORDER BY r.curtidas DESC LIMIT ${limite}`;
  return (await listar(queries, [])).map(formatar);
}

async function salvar(usuarioId, tipo, conteudoId, ativo) {
  const tabela = tipo === 'receita' ? 'usuarios_salvam_receitas' : 'usuarios_salvam_exercicios'; const coluna = tipo === 'receita' ? 'receita_id' : 'exercicio_id';
  if (ativo) await executar(`INSERT OR IGNORE INTO ${tabela} (usuario_id, ${coluna}) VALUES (?, ?)`, [usuarioId, conteudoId]); else await executar(`DELETE FROM ${tabela} WHERE usuario_id=? AND ${coluna}=?`, [usuarioId, conteudoId]);
  return { salvo: ativo };
}

module.exports = { obterFeedInfinito, obterTrending, salvar, paginaValida, limiteValido, listar, buscar };
