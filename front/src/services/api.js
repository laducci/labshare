/*
 * ============================================================
 *  api.js  |  Camada: Front-end (serviço de comunicação HTTP)
 *  Responsável na apresentação: Todos  |  Atividade: Q2 (telas CRUD com banco), Q3 (reuso)
 * ------------------------------------------------------------
 *  O que faz: centraliza TODAS as chamadas ao backend. Nenhuma tela usa fetch direto: todas
 *  chamam api.get/post/put/delete. Aqui também são colocados os cabeçalhos X-Tenant-Id e
 *  X-Usuario-Id (multi-cliente) e é feito o tratamento de erro padrão.
 *  Quem chama: hooks/useApi.js, AppContext.jsx, CrudPage, EquipmentForm, Layout e as páginas.
 *  Chama: fetch('/api/...') -> Vite proxy -> Controllers do Spring Boot.
 * ============================================================
 */
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
// Prefixo de todas as URLs. Como o front e a API ficam na mesma origem (o Vite faz proxy de /api),
// não precisamos escrever o endereço do servidor aqui nem lidar com CORS.
const BASE_URL = '/api';

let sessao = null; // { usuario, tenant } - definido no login (AppContext)

// Chamada pelo AppContext no login, no logout (null) e ao abrir o site com sessão salva.
// Guarda a sessão numa variável do módulo para que toda requisição saiba quem está logado.
export function definirSessao(novaSessao) {
  sessao = novaSessao;
}

// Função interna usada pelos 4 métodos do objeto "api" (reuso: um único lugar faz o fetch).
// metodo = GET/POST/PUT/DELETE, caminho = ex. '/equipamentos/3', corpo = objeto JS que vira JSON.
async function requisicao(metodo, caminho, corpo) {
  const headers = { 'Content-Type': 'application/json' };
  // Depois do login, toda requisição leva o cliente (tenant) e o usuário. No backend o
  // ContextoResolver lê esses cabeçalhos e monta o objeto Contexto recebido pelos Controllers;
  // os DAOs usam o tenant_id para que cada cliente só veja os próprios dados.
  if (sessao) {
    headers['X-Tenant-Id'] = sessao.tenant.id;
    headers['X-Usuario-Id'] = String(sessao.usuario.id);
  }

  let resposta;
  // fetch só lança exceção quando nem chega ao servidor (rede caída / backend desligado).
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

  // Tenta ler o JSON da resposta; se o corpo vier vazio ou inválido, fica null.
  const dados = await resposta.json().catch(() => null);
  // resposta.ok é false para status 4xx/5xx (ex.: 400 regra de negócio, 403 recurso desligado, 404).
  // Lançamos um Error com a mensagem do backend; as telas mostram e.message no <ErrorState>.
  if (!resposta.ok) {
    // o backend sempre responde { "erro": "mensagem" } (TratadorDeErros.java)
    throw new Error(dados?.erro || `Erro ${resposta.status} ao acessar ${caminho}`);
  }
  return dados;
}

// Objeto exportado e usado pelas telas. Ex.: api.put('/equipamentos/3', corpo) -> UPDATE no banco.
// post usa corpo = {} por padrão porque algumas ações (ex.: /reservas/5/cancelar) não mandam dados.
export const api = {
  get: (caminho) => requisicao('GET', caminho),
  post: (caminho, corpo = {}) => requisicao('POST', caminho, corpo),
  put: (caminho, corpo) => requisicao('PUT', caminho, corpo),
  delete: (caminho) => requisicao('DELETE', caminho),
};
