import { GraphQLClient } from "graphql-request";
import { formatSearchResponse, mapMediaToMovieFormat } from "./mapper";
import {
    ADVANCED_SEARCH_QUERY,
    DETAILS_QUERY,
    GENRE_QUERY,
    POPULAR_QUERY,
    SEARCH_QUERY,
} from "./queries";

const ANILIST_URL = "https://graphql.anilist.co";
const REQUEST_DELAY = 500; // ms entre requisições
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// ============= ERRO HANDLING =============

/**
 * Tipos de erro possíveis
 */
export const ErrorTypes = {
  NETWORK: "NETWORK_ERROR",
  API: "API_ERROR",
  VALIDATION: "VALIDATION_ERROR",
  RATE_LIMIT: "RATE_LIMIT_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNKNOWN: "UNKNOWN_ERROR",
};

/**
 * Classe customizada para erros do AniList
 */
export class AniListError extends Error {
  constructor(type, message, originalError = null) {
    super(message);
    this.name = "AniListError";
    this.type = type;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Retorna mensagem amigável para o usuário
   */
  getUserMessage() {
    const messages = {
      [ErrorTypes.NETWORK]: "Erro de conexão. Verifique sua internet.",
      [ErrorTypes.API]: "Erro ao comunicar com AniList. Tente novamente.",
      [ErrorTypes.VALIDATION]: "Dados inválidos. Tente novamente.",
      [ErrorTypes.RATE_LIMIT]:
        "Muitas requisições. Aguarde um momento e tente novamente.",
      [ErrorTypes.NOT_FOUND]: "Anime não encontrado.",
      [ErrorTypes.UNKNOWN]: "Erro desconhecido. Tente novamente.",
    };
    return messages[this.type] || messages[ErrorTypes.UNKNOWN];
  }
}

// ============= RATE LIMITING =============

class RateLimiter {
  constructor(delayMs = REQUEST_DELAY) {
    this.delayMs = delayMs;
    this.lastRequestTime = 0;
    this.requestQueue = [];
    this.isProcessing = false;
  }

  /**
   * Aguarda antes de executar requisição
   */
  async waitForSlot() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.delayMs) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.delayMs - timeSinceLastRequest),
      );
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Reseta o limitador (útil para testes)
   */
  reset() {
    this.lastRequestTime = 0;
    this.requestQueue = [];
    this.isProcessing = false;
  }
}

// ============= CACHE =============

class MemoryCache {
  constructor(ttl = CACHE_TTL) {
    this.ttl = ttl;
    this.cache = new Map();
  }

  /**
   * Gera chave de cache a partir de parâmetros
   */
  _generateKey(type, params) {
    return `${type}:${JSON.stringify(params)}`;
  }

  /**
   * Obtém valor do cache se ainda válido
   */
  get(type, params) {
    const key = this._generateKey(type, params);
    const cached = this.cache.get(key);

    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Armazena valor no cache
   */
  set(type, params, data) {
    const key = this._generateKey(type, params);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Limpa cache específico ou todo
   */
  clear(type = null) {
    if (!type) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.startsWith(type)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        age: Date.now() - value.timestamp,
      })),
    };
  }
}

// ============= DEBOUNCE =============

/**
 * Cria função com debounce
 */
const debounce = (fn, delayMs) => {
  let timeoutId = null;

  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(fn(...args));
      }, delayMs);
    });
  };
};

// ============= INSTÂNCIAS GLOBAIS =============

let graphQLClient = null;
let rateLimiter = null;
let cache = null;

const initializeClient = () => {
  if (!graphQLClient) {
    graphQLClient = new GraphQLClient(ANILIST_URL, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  if (!rateLimiter) {
    rateLimiter = new RateLimiter(REQUEST_DELAY);
  }

  if (!cache) {
    cache = new MemoryCache(CACHE_TTL);
  }
};

// ============= FUNÇÕES PRIVADAS =============

/**
 * Identifica tipo de erro a partir da exceção
 * @private
 */
const identifyErrorType = (error) => {
  if (!error) return ErrorTypes.UNKNOWN;

  const message = error.message || "";
  const errorStr = JSON.stringify(error);

  // Rate limit
  if (error.status === 429 || message.includes("429")) {
    return ErrorTypes.RATE_LIMIT;
  }

  // Erro de rede
  if (
    message.includes("fetch") ||
    message.includes("ECONNREFUSED") ||
    message.includes("ETIMEDOUT") ||
    !navigator.onLine
  ) {
    return ErrorTypes.NETWORK;
  }

  // Not found
  if (error.status === 404) {
    return ErrorTypes.NOT_FOUND;
  }

  // GraphQL error
  if (error.response?.status || errorStr.includes("GraphQL")) {
    return ErrorTypes.API;
  }

  return ErrorTypes.UNKNOWN;
};

/**
 * Executa requisição GraphQL com tratamento robusto de erro
 * @private
 */
const executeGraphQLRequest = async (query, variables = {}) => {
  try {
    // Aguarda slot de rate limit
    await rateLimiter.waitForSlot();

    // Verifica cache
    const cacheKey = { query: query.toString().substring(0, 50), variables };
    const cached = cache.get("graphql", cacheKey);
    if (cached) {
      console.log("[Cache HIT]", Object.keys(variables).join(","));
      return cached;
    }

    // Executa requisição
    console.log("[GraphQL Request]", Object.keys(variables).join(","));
    const data = await graphQLClient.request(query, variables);

    // Armazena no cache
    cache.set("graphql", cacheKey, data);

    return data;
  } catch (error) {
    const errorType = identifyErrorType(error);
    const message = error.message || "Erro desconhecido na requisição";
    throw new AniListError(errorType, message, error);
  }
};

// ============= FUNÇÕES PÚBLICAS =============

/**
 * Inicializa o serviço (deve ser chamado antes de usar)
 * @public
 */
export const initializeAniListService = () => {
  initializeClient();
  console.log("[AniList] Service initialized");
};

/**
 * Busca animes por termo de busca
 *
 * @param {string} searchTerm - Termo de busca
 * @param {number} [page=1] - Página de resultados
 * @returns {Promise<{results: Array, pagination: Object}>}
 *
 * @example
 * const result = await searchAnimes("Death Note", 1);
 * // { results: [...], pagination: { ... } }
 */
export const searchAnimes = async (searchTerm, page = 1) => {
  if (!searchTerm || typeof searchTerm !== "string") {
    throw new AniListError(ErrorTypes.VALIDATION, "Termo de busca inválido");
  }

  try {
    initializeClient();
    const data = await executeGraphQLRequest(SEARCH_QUERY, {
      search: searchTerm.trim(),
      page,
    });

    return formatSearchResponse(data);
  } catch (error) {
    if (error instanceof AniListError) throw error;
    throw new AniListError(ErrorTypes.API, "Erro ao buscar animes", error);
  }
};

/**
 * Busca com debounce (para inputs de usuário)
 * @public
 */
export const searchAnimesDebounced = debounce(searchAnimes, 300);

/**
 * Obtém detalhes completos de um anime
 *
 * @param {number} animeId - ID do anime
 * @returns {Promise<Object>} Dados do anime formatados
 *
 * @example
 * const anime = await getAnimeDetails(1);
 * // { id: 1, Title: "...", ... }
 */
export const getAnimeDetails = async (animeId) => {
  const numericId = parseInt(animeId, 10);
  if (!numericId || isNaN(numericId)) {
    throw new AniListError(ErrorTypes.VALIDATION, "ID do anime inválido");
  }

  try {
    initializeClient();
    const data = await executeGraphQLRequest(DETAILS_QUERY, {
      id: numericId,
    });

    const media = data?.Media;
    if (!media) {
      throw new AniListError(
        ErrorTypes.NOT_FOUND,
        `Anime com ID ${animeId} não encontrado`,
      );
    }

    return mapMediaToMovieFormat(media);
  } catch (error) {
    if (error instanceof AniListError) throw error;
    throw new AniListError(
      ErrorTypes.API,
      "Erro ao buscar detalhes do anime",
      error,
    );
  }
};

/**
 * Obtém animes mais populares
 *
 * @param {number} [page=1] - Página de resultados
 * @returns {Promise<{results: Array, pagination: Object}>}
 *
 * @example
 * const popular = await getPopularAnimes(1);
 * // { results: [...], pagination: { ... } }
 */
export const getPopularAnimes = async (page = 1) => {
  try {
    initializeClient();
    const data = await executeGraphQLRequest(POPULAR_QUERY, { page });

    return formatSearchResponse(data);
  } catch (error) {
    if (error instanceof AniListError) throw error;
    throw new AniListError(
      ErrorTypes.API,
      "Erro ao buscar animes populares",
      error,
    );
  }
};

/**
 * Busca animes por gênero
 *
 * @param {string} genre - Nome do gênero (ex: "Drama", "Action")
 * @param {number} [page=1] - Página de resultados
 * @returns {Promise<{results: Array, pagination: Object}>}
 *
 * @example
 * const dramas = await getAnimesByGenre("Drama", 1);
 * // { results: [...], pagination: { ... } }
 */
export const getAnimesByGenre = async (genre, page = 1) => {
  if (!genre || typeof genre !== "string") {
    throw new AniListError(ErrorTypes.VALIDATION, "Gênero inválido");
  }

  try {
    initializeClient();
    const data = await executeGraphQLRequest(GENRE_QUERY, {
      genres: [genre.trim()],
      page,
    });

    return formatSearchResponse(data);
  } catch (error) {
    if (error instanceof AniListError) throw error;
    throw new AniListError(
      ErrorTypes.API,
      "Erro ao buscar animes por gênero",
      error,
    );
  }
};

/**
 * Busca avançada com múltiplos filtros
 *
 * @param {Object} filters - Filtros
 * @param {string} [filters.search] - Termo de busca
 * @param {string} [filters.genre] - Gênero
 * @param {Array} [filters.sort] - Ordenação (ex: ["POPULARITY_DESC"])
 * @param {number} [filters.page=1] - Página
 * @returns {Promise<{results: Array, pagination: Object}>}
 *
 * @example
 * const advanced = await advancedSearch({
 *   search: "Fate",
 *   genre: "Action",
 *   sort: ["POPULARITY_DESC"],
 *   page: 1
 * });
 */
export const advancedSearch = async (filters = {}) => {
  const { search, genre, sort = ["POPULARITY_DESC"], page = 1 } = filters;

  try {
    initializeClient();
    const data = await executeGraphQLRequest(ADVANCED_SEARCH_QUERY, {
      search: search?.trim() || undefined,
      genre: genre?.trim() || undefined,
      sort,
      page,
    });

    return formatSearchResponse(data);
  } catch (error) {
    if (error instanceof AniListError) throw error;
    throw new AniListError(ErrorTypes.API, "Erro na busca avançada", error);
  }
};

// ============= GERENCIAMENTO DE CACHE =============

/**
 * Limpa cache (útil quando dados podem estar desatualizados)
 * @public
 */
export const clearCache = (type = null) => {
  initializeClient();
  cache.clear(type);
  console.log("[Cache]", type ? `Cleared ${type}` : "Cleared all");
};

/**
 * Retorna estatísticas do cache
 * @public
 */
export const getCacheStats = () => {
  initializeClient();
  return cache.getStats();
};

/**
 * Reseta o rate limiter (para testes)
 * @private
 */
export const resetRateLimiter = () => {
  if (rateLimiter) rateLimiter.reset();
};

// ============= PRÉAQUECIMENTO DE CACHE =============

/**
 * Préaquece cache com dados populares
 * Útil para otimizar primeira carga da app
 *
 * @public
 */
export const prewarmCache = async () => {
  try {
    console.log("[Cache] Prewarming...");
    await Promise.all([
      searchAnimes("Death Note", 1),
      getPopularAnimes(1),
      getAnimesByGenre("Drama", 1),
    ]);
    console.log("[Cache] Prewarmed successfully");
  } catch (error) {
    console.error("[Cache] Prewarming failed:", error);
  }
};
