/**
 * ============================================================
 *  Camada de comunicação com o backend (Java / Spring Boot)
 * ============================================================
 * TODA tela que lê ou grava dados passa por aqui. Ex.: ao clicar em "Salvar":
 *
 *   api.post('/categorias', { nome: 'Robótica' })
 *     -> fetch('POST /api/categorias')                 (navegador)
 *     -> Vite repassa para http://localhost:8080        (vite.config.js)
 *     -> CategoriaController.criar -> CategoriaService -> CategoriaDao
 *     -> INSERT INTO categoria (...) VALUES (...)       (PostgreSQL no Neon)
 *
 * Os cabeçalhos X-Tenant-Id e X-Usuario-Id dizem ao backend de qual cliente
 * e de qual usuário é a requisição (é assim que a variabilidade funciona).
 */
const BASE_URL = '/api';

let sessao = null; // { usuario, tenant } - definido no login (AppContext)

export function definirSessao(novaSessao) {
  sessao = novaSessao;
}

async function requisicao(metodo, caminho, corpo) {
  const headers = { 'Content-Type': 'application/json' };
  if (sessao) {
    headers['X-Tenant-Id'] = sessao.tenant.id;
    headers['X-Usuario-Id'] = String(sessao.usuario.id);
  }

  let resposta;
  try {
    resposta = await fetch(BASE_URL + caminho, {
      method: metodo,
      headers,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
  }

  if (resposta.status === 204) return null; // DELETE sem conteúdo

  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    // o backend sempre responde { "erro": "mensagem" } (TratadorDeErros.java)
    throw new Error(dados?.erro || `Erro ${resposta.status} ao acessar ${caminho}`);
  }
  return dados;
}

export const api = {
  get: (caminho) => requisicao('GET', caminho),
  post: (caminho, corpo = {}) => requisicao('POST', caminho, corpo),
  put: (caminho, corpo) => requisicao('PUT', caminho, corpo),
  delete: (caminho) => requisicao('DELETE', caminho),
};
