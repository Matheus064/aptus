const { executar, buscar, listar } = require('../config/conexaoBanco');
const { urlDoArquivo } = require('../servicos/uploadServico');
const { registrarAcao } = require('../servicos/medalhasServico');

const tipos = ['progresso', 'receita', 'exercicio', 'motivacao', 'antes_depois'];
const json = (valor) => Array.isArray(valor) ? JSON.stringify(valor) : (valor || '[]');

async function criar(req, res, next) {
  try {
    const { conteudo, tipo = 'motivacao', hashtags = [], mentions = [], localizacao } = req.body;
    if (!conteudo || !conteudo.trim() || !tipos.includes(tipo)) return res.status(422).json({ erro: 'Conteúdo e tipo válido são obrigatórios.' });
    const resultado = await executar(`INSERT INTO posts_usuarios (usuario_id, conteudo, tipo, foto_url, video_url, hashtags, mentions, localizacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [req.usuario.sub, conteudo.trim(), tipo, urlDoArquivo(req) || req.body.foto_url || null, req.body.video_url || null, json(hashtags), json(mentions), localizacao || null]);
    return res.status(201).json(await obterPost(resultado.id, req.usuario.sub));
  } catch (error) { return next(error); }
}

async function obterPost(id, usuarioId) {
  return buscar(`SELECT p.*, u.nome_completo AS autor_nome, u.foto_perfil_url AS autor_foto, u.verificado AS autor_verificado,
    EXISTS(SELECT 1 FROM curtidas_posts cp WHERE cp.post_id = p.id AND cp.usuario_id = ?) AS curtido_por_usuario,
    (SELECT COUNT(*) FROM comentarios_posts c WHERE c.post_id = p.id) AS comentarios
    FROM posts_usuarios p JOIN usuarios u ON u.id = p.usuario_id WHERE p.id = ?`, [usuarioId || 0, id]);
}

async function listarPosts(req, res, next) {
  try {
    const pagina = Math.max(Number(req.query.page) || 1, 1); const limite = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const total = await buscar('SELECT COUNT(*) total FROM posts_usuarios', []);
    const posts = await listar(`SELECT p.*, u.nome_completo AS autor_nome, u.foto_perfil_url AS autor_foto, u.verificado AS autor_verificado,
      EXISTS(SELECT 1 FROM curtidas_posts cp WHERE cp.post_id = p.id AND cp.usuario_id = ?) AS curtido_por_usuario,
      (SELECT COUNT(*) FROM comentarios_posts c WHERE c.post_id = p.id) AS comentarios
      FROM posts_usuarios p JOIN usuarios u ON u.id = p.usuario_id ORDER BY p.data_criacao DESC LIMIT ? OFFSET ?`, [req.usuario.sub, limite, (pagina - 1) * limite]);
    return res.json({ sucesso: true, posts, pagina, total_itens: total.total, tem_proximo: pagina * limite < total.total });
  } catch (error) { return next(error); }
}

async function curtir(req, res, next) {
  try {
    const post = await buscar('SELECT id FROM posts_usuarios WHERE id = ?', [req.params.id]);
    if (!post) return res.status(404).json({ erro: 'Publicação não encontrada.' });
    const existente = await buscar('SELECT 1 FROM curtidas_posts WHERE usuario_id = ? AND post_id = ?', [req.usuario.sub, post.id]);
    if (existente) { await executar('DELETE FROM curtidas_posts WHERE usuario_id = ? AND post_id = ?', [req.usuario.sub, post.id]); await executar('UPDATE posts_usuarios SET curtidas = MAX(curtidas - 1, 0) WHERE id = ?', [post.id]); return res.json({ curtido: false }); }
    await executar('INSERT INTO curtidas_posts (usuario_id, post_id) VALUES (?, ?)', [req.usuario.sub, post.id]); await executar('UPDATE posts_usuarios SET curtidas = curtidas + 1 WHERE id = ?', [post.id]); await registrarAcao(req.usuario.sub, 'curtida_post', `post:${post.id}`, 1); return res.json({ curtido: true });
  } catch (error) { return next(error); }
}

async function comentar(req, res, next) {
  try {
    if (!req.body.conteudo || !req.body.conteudo.trim()) return res.status(422).json({ erro: 'Comentário é obrigatório.' });
    const post = await buscar('SELECT id FROM posts_usuarios WHERE id = ?', [req.params.id]);
    if (!post) return res.status(404).json({ erro: 'Publicação não encontrada.' });
    const resultado = await executar('INSERT INTO comentarios_posts (usuario_id, post_id, conteudo) VALUES (?, ?, ?)', [req.usuario.sub, post.id, req.body.conteudo.trim()]);
    await executar('UPDATE posts_usuarios SET comentarios_count = comentarios_count + 1 WHERE id = ?', [post.id]);
    return res.status(201).json({ id: resultado.id, post_id: post.id, conteudo: req.body.conteudo.trim() });
  } catch (error) { return next(error); }
}

async function listarComentarios(req, res, next) {
  try {
    const post = await buscar('SELECT id FROM posts_usuarios WHERE id = ?', [req.params.id]);
    if (!post) return res.status(404).json({ erro: 'Publicação não encontrada.' });
    const comentarios = await listar(`SELECT c.*, u.nome_completo, u.foto_perfil_url
      FROM comentarios_posts c JOIN usuarios u ON u.id = c.usuario_id
      WHERE c.post_id = ? ORDER BY c.data_criacao ASC`, [post.id]);
    return res.json({ comentarios });
  } catch (error) { return next(error); }
}

async function remover(req, res, next) {
  try {
    const post = await buscar('SELECT id, usuario_id FROM posts_usuarios WHERE id = ?', [req.params.id]);
    if (!post) return res.status(404).json({ erro: 'Publicação não encontrada.' });
    if (Number(post.usuario_id) !== Number(req.usuario.sub) && req.usuario.role !== 'admin') {
      return res.status(403).json({ erro: 'Você só pode excluir sua própria publicação.' });
    }
    await executar('DELETE FROM posts_usuarios WHERE id = ?', [post.id]);
    return res.status(204).end();
  } catch (error) { return next(error); }
}

module.exports = { criar, listarPosts, curtir, comentar, listarComentarios, remover };
