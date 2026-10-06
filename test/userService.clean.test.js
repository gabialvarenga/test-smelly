const { UserService } = require('../src/userService');

const dadosUsuarioPadrao = {
  nome: 'Fulano de Tal',
  email: 'fulano@teste.com',
  idade: 25,
};

describe('UserService - Suíte de Testes Limpa', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  describe('createUser', () => {
    test('deve atribuir um id ao usuário criado', () => {
      const { nome, email, idade } = dadosUsuarioPadrao;

      const usuarioCriado = userService.createUser(nome, email, idade);

      expect(usuarioCriado.id).toBeDefined();
    });

    test('deve criar o usuário com status ativo', () => {
      const { nome, email, idade } = dadosUsuarioPadrao;

      const usuarioCriado = userService.createUser(nome, email, idade);

      expect(usuarioCriado.status).toBe('ativo');
    });

    test('deve lançar erro ao criar usuário menor de idade', () => {
      const criarMenorDeIdade = () =>
        userService.createUser('Menor', 'menor@email.com', 17);

      expect(criarMenorDeIdade).toThrow('O usuário deve ser maior de idade.');
    });

    test('deve lançar erro quando campos obrigatórios não são informados', () => {
      const criarSemEmail = () => userService.createUser('Sem Email', '', 30);

      expect(criarSemEmail).toThrow('Nome, email e idade são obrigatórios.');
    });
  });

  describe('getUserById', () => {
    test('deve retornar o usuário criado quando o id existe', () => {
      const { nome, email, idade } = dadosUsuarioPadrao;
      const usuarioCriado = userService.createUser(nome, email, idade);

      const usuarioBuscado = userService.getUserById(usuarioCriado.id);

      expect(usuarioBuscado).toMatchObject({ nome, email, idade });
    });

    test('deve retornar null quando o id não existe', () => {
      const usuarioBuscado = userService.getUserById('id-inexistente');

      expect(usuarioBuscado).toBeNull();
    });
  });

  describe('deactivateUser', () => {
    test('deve retornar true ao desativar um usuário comum', () => {
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

      const resultado = userService.deactivateUser(usuarioComum.id);

      expect(resultado).toBe(true);
    });

    test('deve marcar o usuário comum como inativo após desativá-lo', () => {
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

      userService.deactivateUser(usuarioComum.id);

      const usuarioAtualizado = userService.getUserById(usuarioComum.id);
      expect(usuarioAtualizado.status).toBe('inativo');
    });

    test('deve retornar false ao tentar desativar um administrador', () => {
      const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      const resultado = userService.deactivateUser(usuarioAdmin.id);

      expect(resultado).toBe(false);
    });

    test('deve manter o administrador ativo após tentativa de desativação', () => {
      const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      userService.deactivateUser(usuarioAdmin.id);

      const usuarioAtualizado = userService.getUserById(usuarioAdmin.id);
      expect(usuarioAtualizado.status).toBe('ativo');
    });

    test('deve retornar false quando o usuário não existe', () => {
      const resultado = userService.deactivateUser('id-inexistente');

      expect(resultado).toBe(false);
    });
  });

  describe('generateUserReport', () => {
    test('deve incluir o cabeçalho do relatório', () => {
      userService.createUser('Alice', 'alice@email.com', 28);

      const relatorio = userService.generateUserReport();

      expect(relatorio).toContain('Relatório de Usuários');
    });

    test('deve incluir id, nome e status de cada usuário', () => {
      const alice = userService.createUser('Alice', 'alice@email.com', 28);
      const bob = userService.createUser('Bob', 'bob@email.com', 32);

      const relatorio = userService.generateUserReport();

      expect(relatorio).toEqual(expect.stringContaining(alice.id));
      expect(relatorio).toEqual(expect.stringContaining('Alice'));
      expect(relatorio).toEqual(expect.stringContaining(bob.id));
      expect(relatorio).toEqual(expect.stringContaining('Bob'));
      expect(relatorio).toEqual(expect.stringContaining('ativo'));
    });

    test('deve informar que não há usuários quando a base está vazia', () => {
      const relatorio = userService.generateUserReport();

      expect(relatorio).toContain('Nenhum usuário cadastrado.');
    });
  });
});
