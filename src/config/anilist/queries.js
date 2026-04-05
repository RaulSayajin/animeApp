import { gql } from "graphql-request";

/**
 * GraphQL query para buscar animes por termo de busca
 * @constant
 */
export const SEARCH_QUERY = gql`
  query SearchAnimes($search: String, $page: Int = 1) {
    Page(page: $page, perPage: 20) {
      pageInfo {
        hasNextPage
        currentPage
        perPage
      }
      media(
        search: $search
        type: ANIME
        sort: [SEARCH_MATCH, POPULARITY_DESC]
      ) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          medium
          color
        }
        description
        episodes
        duration
        seasonYear
        season
        averageScore
        popularity
        genres
        studios(isMain: true) {
          nodes {
            name
          }
        }
        countryOfOrigin
        isAdult
        nextAiringEpisode {
          airingAt
          episode
        }
        status
        format
        source
      }
    }
  }
`;

/**
 * GraphQL query para buscar detalhes completos de um anime
 * @constant
 */
export const DETAILS_QUERY = gql`
  query GetAnimeDetails($id: Int!) {
    Media(id: $id, type: ANIME) {
      id
      idMal
      title {
        romaji
        english
        native
        userPreferred
      }
      coverImage {
        large
        medium
        color
      }
      bannerImage
      description
      episodes
      duration
      seasonYear
      season
      averageScore
      popularity
      isAdult
      genres
      studios(isMain: true) {
        nodes {
          name
        }
      }
      source
      format
      status
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      nextAiringEpisode {
        airingAt
        episode
      }
      synonyms
      hashtag
      countryOfOrigin
      isLicensed
      relations {
        edges {
          relationType
          node {
            id
            title {
              english
              romaji
            }
          }
        }
      }
      recommendations {
        nodes {
          mediaRecommendation {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
            }
          }
        }
      }
    }
  }
`;

/**
 * GraphQL query para buscar animes populares
 * @constant
 */
export const POPULAR_QUERY = gql`
  query GetPopularAnimes($page: Int = 1) {
    Page(page: $page, perPage: 20) {
      pageInfo {
        hasNextPage
        currentPage
        perPage
      }
      media(type: ANIME, sort: [POPULARITY_DESC]) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          medium
        }
        averageScore
        episodes
        genres
        seasonYear
        description
        status
        format
        studios(isMain: true) {
          nodes {
            name
          }
        }
      }
    }
  }
`;

/**
 * GraphQL query para buscar animes por gênero
 * @constant
 */
export const GENRE_QUERY = gql`
  query SearchByGenre($genres: [String], $page: Int = 1) {
    Page(page: $page, perPage: 20) {
      pageInfo {
        hasNextPage
        currentPage
        perPage
      }
      media(type: ANIME, genre_in: $genres, sort: [POPULARITY_DESC]) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          medium
        }
        averageScore
        episodes
        genres
        seasonYear
        status
        format
        studios(isMain: true) {
          nodes {
            name
          }
        }
      }
    }
  }
`;

/**
 * GraphQL query para busca genérica com múltiplos filtros
 * @constant
 */
export const ADVANCED_SEARCH_QUERY = gql`
  query AdvancedSearch(
    $page: Int = 1
    $search: String
    $genres: [String]
    $sort: [MediaSort]
  ) {
    Page(page: $page, perPage: 20) {
      pageInfo {
        hasNextPage
        currentPage
        perPage
      }
      media(type: ANIME, search: $search, genre_in: $genres, sort: $sort) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          medium
        }
        averageScore
        episodes
        genres
        seasonYear
        status
        studios(isMain: true) {
          nodes {
            name
          }
        }
      }
    }
  }
`;
