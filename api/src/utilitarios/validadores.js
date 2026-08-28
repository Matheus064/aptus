const rolesPublicas = new Set(['user', 'nutricionista']);
const emailValido = (email) => typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
const senhaValida = (senha) => typeof senha === 'string' && senha.length >= 8;
const textoObrigatorio = (valor) => typeof valor === 'string' && valor.trim().length > 0;

module.exports = { rolesPublicas, emailValido, senhaValida, textoObrigatorio };
