/**
 * AniList Service - Ponto de entrada consolidado
 *
 * Este módulo exporta todas as funções do serviço AniList
 * com tratamento robusto de erros, cache e rate limiting.
 *
 * @example
 * import {
 *   searchAnimes,
 *   getAnimeDetails,
 *   initializeAniListService
 * } from "@config/anilist";
 *
 * // Inicializar na app
 * initializeAniListService();
 *
 * // Usar as funções
 * try {
 *   const result = await searchAnimes("Death Note");
 *   console.log(result.results);
 * } catch (error) {
 *   console.error(error.getUserMessage());
 * }
 */

export {
    advancedSearch,
    // Erro handling
    AniListError,
    // Cache
    clearCache, ErrorTypes, getAnimeDetails, getAnimesByGenre, getCacheStats, getPopularAnimes,
    // Serviço principal
    initializeAniListService, prewarmCache,
    // Utilitários internos (se necessário)
    resetRateLimiter, searchAnimes,
    searchAnimesDebounced
} from "./anilistService";

// Exporta mapper se necessário usar diretamente
export {
    extractPaginationInfo,
    formatSearchResponse, mapMediaArrayToMovieFormat, mapMediaToMovieFormat
} from "./mapper";

// Exporta queries para uso avançado
export {
    ADVANCED_SEARCH_QUERY, DETAILS_QUERY, GENRE_QUERY, POPULAR_QUERY, SEARCH_QUERY
} from "./queries";

