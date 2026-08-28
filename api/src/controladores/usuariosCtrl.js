const { buscar, executar } = require('../config/conexaoBanco');
const { seguro } = require('./authCtrl');
async function me(req, res, next) { try { const usuario = await buscar('SELECT * FROM usuarios WHERE id = ?', [req.usuario.sub]); return usuario ? res.json(seguro(usuario)) : res.status(404).json({ erro: 'Usuário não encontrado.' }); } catch (e) { return next(e); } }
async function atualizarMe(req, res, next) { try { const permitidos = ['nome_completo', 'telefone', 'peso_atual', 'peso_meta', 'altura', 'foto_perfil_url', 'bio']; const campos = permitidos.filter((c) => req.body[c] !== undefined); if (!campos.length) return res.status(422).json({ erro: 'Nenhum campo válido para atualizar.' }); await executar(`UPDATE usuarios SET ${campos.map((c) => `${c} = ?`).join(', ')}, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?`, [...campos.map((c) => req.body[c]), req.usuario.sub]); return me(req, res, next); } catch (e) { return next(e); } }
module.exports = { me, atualizarMe };
