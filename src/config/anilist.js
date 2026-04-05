/**
 * DEPRECATED: Use @config/anilist/index.js instead
 *
 * This file is kept for backward compatibility.
 * All functionality has been moved to modular files:
 *
 * - queries.js: GraphQL queries
 * - mapper.js: Data transformation
 * - anilistService.js: Main service with caching and rate limiting
 * - index.js: Consolidated exports
 *
 * Migration:
 * OLD: import { searchAnimes } from '@config/anilist'
 * NEW: import { searchAnimes } from '@config/anilist'
 * (same import, now sources from new modular structure)
 */

// Re-export everything from the new service for backward compatibility
export {
    advancedSearch, AniListError, clearCache, ErrorTypes, getAnimeDetails, getAnimesByGenre, getCacheStats, getPopularAnimes, initializeAniListService, prewarmCache, searchAnimes,
    searchAnimesDebounced
} from "./anilist/index";

// Also initialize service on import
import { initializeAniListService } from "./anilist/index";
initializeAniListService();
