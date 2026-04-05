/**
 * Sanitiza HTML básico (removing tags)
 * @param {string} html - HTML string
 * @returns {string} Texto sanitizado
 */
const sanitizeHtml = (html) => {
  if (!html) return "N/A";
  return html
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
};

/**
 * Formata data para string legível
 * @param {Object} dateObj - Objeto com year, month, day
 * @returns {string} Data formatada ou "N/A"
 */
const formatDate = (dateObj) => {
  if (!dateObj || !dateObj.year) return "N/A";
  const { year, month, day } = dateObj;
  if (!month || !day) return year.toString();
  return `${day}/${month}/${year}`;
};

/**
 * Extrai nome do estúdio principal ou primeiro
 * @param {Array} studios - Array de estúdios
 * @returns {string} Nome do estúdio ou "N/A"
 */
const getStudioName = (studios) => {
  if (!studios || studios.length === 0) return "N/A";
  return studios[0]?.name || "N/A";
};

/**
 * Mapeia resposta da API AniList para formato padrão de anime
 * Garante fallbacks consistentes para todos os campos
 *
 * @param {Object} media - Objeto de anime/mídia da API AniList
 * @returns {Object} Objeto formatado com dados de anime
 *
 * @example
 * const media = { id: 1, title: { english: "Anime" }, ... };
 * const formatted = mapMediaToMovieFormat(media);
 * // { id: 1, Title: "Anime", ... }
 */
export const mapMediaToMovieFormat = (media) => {
  if (!media) return null;

  // Extrai título com fallbacks
  const title =
    media.title?.english ||
    media.title?.romaji ||
    media.title?.native ||
    media.title?.userPreferred ||
    "N/A";

  // Extrai poster/cover com fallback
  const poster =
    media.coverImage?.large ||
    media.coverImage?.medium ||
    "https://via.placeholder.com/300x450?text=No+Image";

  // Extrai descrição e sanitiza HTML
  const description = sanitizeHtml(media.description);

  // Extrai gêneros
  const genres = media.genres?.length > 0 ? media.genres.join(", ") : "N/A";

  // Extrai rating (escala 0-10 AniList)
  const rating = media.averageScore
    ? (media.averageScore / 10).toFixed(1)
    : "N/A";

  // Extrai estúdios
  const studios = media.studios?.nodes
    ? media.studios.nodes
        .map((s) => s?.name)
        .filter(Boolean)
        .join(", ")
    : "N/A";

  // Extrai informações de airing
  const status = media.status || "N/A";
  const episodes = media.episodes || "TBA";
  const nextEpisode = media.nextAiringEpisode?.episode || null;

  // Formato (movie, TV, special, etc)
  const format = media.format || "N/A";

  // Source (manga, light novel, original, etc)
  const source = media.source || "N/A";

  return {
    // IDs
    id: media.id,
    imdbID: media.idMal?.toString() || media.id.toString(),

    // Informações básicas
    Title: title,
    Poster: poster,
    Year: media.seasonYear?.toString() || "N/A",
    Season: media.season || "N/A",

    // Descrições
    Description: description,
    Plot: description, // Descrição do anime

    // Classificação
    Genre: genres,
    Type: "anime",
    Format: format,
    Source: source,

    // Métricas
    imdbRating: rating,
    Popularity: media.popularity || 0,
    Trending: media.trending || 0,

    // Episódios
    Episodes: episodes,
    Duration: media.duration ? `${media.duration} min` : "N/A",
    NextEpisode: nextEpisode,

    // Status
    Status: status,
    IsAdult: media.isAdult || false,
    IsLicensed: media.isLicensed !== false,

    // Estúdios
    Studios: studios,

    // Datas
    StartDate: formatDate(media.startDate),
    EndDate: formatDate(media.endDate),

    // Metadados adicionais
    Synonyms: media.synonyms?.join(", ") || "N/A",
    CountryOfOrigin: media.countryOfOrigin || "N/A",
    Hashtag: media.hashtag || "N/A",

    // Recomendações (raw - pode ser processado depois)
    Recommendations: media.recommendations?.nodes || [],

    // Relação com outras mídias
    Relations: media.relationships?.edges || [],

    // Timestamp para cache
    _fetchedAt: Date.now(),
  };
};

/**
 * Mapeia array de mídias para formato de anime
 * @param {Array} medias - Array de objetos de mídia
 * @returns {Array} Array de mídias formatadas
 */
export const mapMediaArrayToMovieFormat = (medias) => {
  if (!Array.isArray(medias)) return [];
  return medias.map(mapMediaToMovieFormat).filter((item) => item !== null);
};

/**
 * Extrai informações de paginação da resposta
 * @param {Object} pageInfo - Objeto pageInfo da API
 * @returns {Object} Objeto com informações de paginação
 */
export const extractPaginationInfo = (pageInfo) => {
  if (!pageInfo) {
    return {
      hasNextPage: false,
      total: 0,
      currentPage: 1,
      lastPage: 1,
    };
  }

  return {
    hasNextPage: pageInfo.hasNextPage || false,
    total: pageInfo.total || 0,
    currentPage: pageInfo.currentPage || 1,
    lastPage: pageInfo.lastPage || 1,
  };
};

/**
 * Transforma resposta de search para incluir paginação
 * @param {Object} response - Resposta da API com Page
 * @returns {Object} { results: [], pagination: {} }
 */
export const formatSearchResponse = (response) => {
  const pageData = response?.Page;
  if (!pageData) {
    return {
      results: [],
      pagination: extractPaginationInfo(null),
    };
  }

  return {
    results: mapMediaArrayToMovieFormat(pageData.media || []),
    pagination: extractPaginationInfo(pageData.pageInfo),
  };
};
