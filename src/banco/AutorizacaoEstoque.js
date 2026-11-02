import {
  listarFuncionarios,
  validarSenhaFuncionario,
} from './BancoDados';

export async function validarSenhaColaborador(senha, colaboradorId) {
  if (typeof senha !== 'string' || !senha.trim() || !colaboradorId) {
    return null;
  }

  return await validarSenhaFuncionario(colaboradorId, senha);
}

export async function listarColaboradores() {
  const funcionarios = await listarFuncionarios();

  return funcionarios
    .filter((item) => item.ativo)
    .map(({ id, nome }) => ({ id, nome }));
}
