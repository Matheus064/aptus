const { emailValido, senhaValida, textoObrigatorio, rolesPublicas } = require('../utilitarios/validadores');

describe('Validadores', () => {
  describe('emailValido', () => {
    it('deve aceitar email válido', () => {
      expect(emailValido('usuario@exemplo.com')).toBe(true);
    });

    it('deve rejeitar email sem @', () => {
      expect(emailValido('usuarioexemplo.com')).toBe(false);
    });

    it('deve rejeitar email vazio', () => {
      expect(emailValido('')).toBe(false);
    });

    it('deve rejeitar email com espaços', () => {
      expect(emailValido('usuario @exemplo.com')).toBe(false);
    });

    it('deve aceitar email com subdomínio', () => {
      expect(emailValido('usuario@mail.exemplo.com')).toBe(true);
    });
  });

  describe('senhaValida', () => {
    it('deve aceitar senha válida (mínimo 8 caracteres)', () => {
      expect(senhaValida('Senha@123')).toBe(true);
    });

    it('deve rejeitar senha muito curta', () => {
      expect(senhaValida('123456')).toBe(false);
    });

    it('deve rejeitar senha vazia', () => {
      expect(senhaValida('')).toBe(false);
    });

    it('deve rejeitar senha com menos de 8 caracteres', () => {
      expect(senhaValida('12345')).toBe(false);
    });

    it('deve aceitar senha com exatamente 8 caracteres', () => {
      expect(senhaValida('12345678')).toBe(true);
    });
  });

  describe('textoObrigatorio', () => {
    it('deve aceitar texto não vazio', () => {
      expect(textoObrigatorio('algum texto')).toBe(true);
    });

    it('deve rejeitar texto vazio', () => {
      expect(textoObrigatorio('')).toBe(false);
    });

    it('deve rejeitar apenas espaços', () => {
      expect(textoObrigatorio('   ')).toBe(false);
    });
  });

  describe('rolesPublicas', () => {
    it('deve ter user como role pública', () => {
      expect(rolesPublicas.has('user')).toBe(true);
    });

    it('deve ter nutricionista como role pública', () => {
      expect(rolesPublicas.has('nutricionista')).toBe(true);
    });

    it('não deve ter admin como role pública', () => {
      expect(rolesPublicas.has('admin')).toBe(false);
    });
  });
});
