const colaboradores = [
  {
    id: 1,
    nome: 'Victor',
    senha: '1234',
    ativo: true,
  },
  {
    id: 2,
    nome: 'Guilherme',
    senha: '4321',
    ativo: true,
  },
];

export function validarSenhaColaborador(senha) {
  if (typeof senha !== 'string' || !senha.trim()) {
    return null;
  }

  const colaborador = colaboradores.find(
    (item) =>
      item.ativo === true &&
      item.senha === senha.trim()
  );

  if (!colaborador) {
    return null;
  }

  return {
    id: colaborador.id,
    nome: colaborador.nome,
  };
}

export function listarColaboradores() {
  return colaboradores
    .filter((item) => item.ativo)
    .map(({ id, nome }) => ({ id, nome }));
}