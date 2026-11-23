# TMDB API reference for tmdb-front

This is a locally saved, project-oriented guide to the official TMDB API docs. It records the API's main areas and operating conventions, the read-only endpoint families for movies, TV series, seasons, and episodes, the endpoints this app currently uses, and direct links to authoritative references. It is a map and summary, not a full copy of TMDB's large, changing endpoint reference.

**Checked:** 2026-11-23  
**Official API docs:** <https://developer.themoviedb.org/docs/getting-started>  
**API reference:** <https://developer.themoviedb.org/reference>
**OpenAPI v3 specification:** <https://developer.themoviedb.org/openapi/tmdb-api.json>

## How to use this guide

- Use this file for orientation and the app's current integration.
- Use the linked official pages for exact parameters, response schemas, and current behavior before making an API change. TMDB docs can change.
- To inspect the app's current API calls, query CodeGraph for `getMovies`, `getTv`, `getSearch`, `getSelected`, `getProviders`, and `getGeoInfo`.

## API overview

TMDB provides data and images for movies, TV shows, people, and related media. The current API reference describes **v3**; TMDB also has **v4** APIs, particularly for lists and user-authorized workflows.

| Purpose | Host / base |
| --- | --- |
| JSON API | `https://api.themoviedb.org/3` (v3) and `https://api.themoviedb.org/4` (v4) |
| Image CDN | `https://image.tmdb.org/t/p/{size}{file_path}` |
| User authorization | `https://www.themoviedb.org` |

The app currently uses v3. API responses are JSON. Use HTTPS. Image paths from API responses are fragments (such as `/abc123.jpg`) and must be combined with the image host and a supported size.

## Authentication

For application-level access, v3 accepts either:

1. `api_key` as a query parameter; or
2. the API Read Access Token as `Authorization: Bearer <token>`.

TMDB says these application authentication methods provide the same level of access. A Bearer token also works across v3 and v4. For user-specific actions, the app must separately authorize the user and use a session (v3) or the relevant v4 user-auth flow. Treat access tokens, session IDs, and request tokens as secrets.

Official docs: [Application authentication](https://developer.themoviedb.org/docs/authentication-application), [User authentication](https://developer.themoviedb.org/docs/authentication-user), [v4 application authentication](https://developer.themoviedb.org/v4/docs/authentication-application), [v4 user authentication](https://developer.themoviedb.org/v4/docs/authentication-user).

**Current app note:** its v3 API key is hard-coded in browser JavaScript. That means it is visible to visitors. Do not put a secret user token in frontend code; if rotating or changing credentials, use a server-side proxy or other appropriate secret handling.

## Ways to find media

TMDB documents three main discovery patterns:

- **Search**: text query against movie, TV, person, and multi-search endpoints.
- **Discover**: filter movie or TV catalog results by attributes such as dates, ratings, certifications, and other supported filters.
- **Find**: resolve an external ID (for example an IMDb ID) to matching TMDB records.

Common API paths include `/search/{movie|tv|person|multi}`, `/discover/{movie|tv}`, and `/find/{external_id}`. Exact query parameters vary by endpoint.

Official docs: [Finding data](https://developer.themoviedb.org/docs/finding-data), [Search and query for details](https://developer.themoviedb.org/docs/search-and-query-for-details).

## Endpoint families and broader API map

The reference is organized by resource family. This list is a practical map; the linked reference is the exhaustive endpoint catalog and source of truth.

- **Account and authentication**: account details, request tokens, sessions, guest sessions, account lists, favorites, watchlists, and ratings.
- **Movie**: details, credits, images, videos, release dates, recommendations, similar titles, reviews, translations, watch providers, and changes.
- **TV**: series details, aggregate credits, seasons, episodes, images, videos, recommendations, similar shows, translations, watch providers, and changes.
- **People**: person details, credits, images, external IDs, translations, and changes.
- **Search, discover, and find**: text search, filter-based discovery, and external-ID lookup.
- **Collections**: collection details, images, translations, and related movies.
- **Lists**: list creation and management; v4 lists add newer features such as mixed media and private lists.
- **Genres and configuration**: genre lists, languages, countries, jobs, timezones, and image configuration.
- **Certifications**: certification catalogs for movie and TV releases.
- **Networks and companies**: company/network metadata and images.
- **Keywords**: keyword lookup and related movies.
- **Watch providers**: provider catalogs and media availability by region.
- **Trending and charts**: trending titles and other catalog/chart endpoints.
- **Changes**: IDs changed in a time window and field-level change history for individual records.

Browse all methods in the [TMDB API reference](https://developer.themoviedb.org/reference). Useful overview pages: [Getting started](https://developer.themoviedb.org/docs/getting-started), [v3 or v4 lists](https://developer.themoviedb.org/reference/v3-or-v4-lists), [Tracking content changes](https://developer.themoviedb.org/docs/tracking-content-changes).

## Read-only GET reference: movies, TV series, seasons, and episodes

The tables below summarize the v3 `GET` methods that return movie or TV information. Path placeholders such as `{movie_id}` are TMDB integer IDs; replace the entire placeholder with the ID returned by search, discover, a list, or a parent resource. Use `/3` as the API base and authenticate every request. GET methods read data; account-state GETs are user-specific and need a valid session or guest session. The official [OpenAPI v3 specification](https://developer.themoviedb.org/openapi/tmdb-api.json) is the machine-readable endpoint catalog; individual linked reference pages define exact schemas and parameter constraints.

### Recommended retrieval workflow

1. **Find IDs.** Use search for a text query, discover for filter-driven selection, a list endpoint for a chart, or `/3/find/{external_id}` when you already have an external ID. Search and list results are summaries, not complete detail records.
2. **Get details.** Call `/3/movie/{movie_id}` or `/3/tv/{series_id}` using the result's TMDB `id`. These return the main metadata and links to related resources.
3. **Fetch only the subresources needed.** Call credits, images, videos, providers, release dates/content ratings, translations, and similar endpoints separately. On supported detail methods, `append_to_response=videos,images` can combine compatible same-namespace subrequests into one response (up to 20 appended methods); inspect the result shape because appended resources appear as additional fields.
4. **For TV episode data, walk the hierarchy.** Get the series, use each `seasons[]` entry's `season_number` with the season endpoint, then use the season's `episode_number` with the episode endpoint. Specials are often season `0`; use values returned by TMDB rather than assuming a season numbering convention.
5. **Build image URLs from file paths.** A result's `poster_path`, `backdrop_path`, `still_path`, or logo path is not a full URL. Get image host and supported sizes from `/3/configuration`, then combine the chosen size with the path.

### Shared request and response conventions

- **Authentication:** send `Authorization: Bearer <API Read Access Token>` or, for v3, `api_key=<key>`. Prefer a shared Axios client/interceptor so every request gets auth and common defaults consistently.
- **Language:** many metadata methods accept `language` (commonly defaults to `en-US`). Set it explicitly when the UI language is known. This localizes fields where TMDB has translations; it does not guarantee every field is translated.
- **Pagination:** result-list endpoints commonly accept `page` (default `1`) and return `{ page, results, total_pages, total_results }`. Fetch more pages only while needed. TMDB documents page values up to 500.
- **Query encoding:** pass values as a client `params` object instead of interpolating user text into a URL. This keeps special characters and repeated/pipe-separated filter values correctly encoded.
- **Regions:** use ISO 3166-1 country codes, such as `US` or `JP`, when an endpoint supports a `region`, `watch_region`, or `country` parameter. These parameters mean different things by endpoint; don't assume they are interchangeable.
- **Filter logic in discover:** where documented, comma-separated values mean AND and pipe-separated values mean OR. A filter must be supported by that specific discover method.
- **Errors:** handle HTTP status and the TMDB JSON error body. A missing/invalid ID can return 404; bad auth 401; invalid parameters 422; rate limiting 429. Do not interpret an empty result as proof of an API failure without checking status and response body.

### Search and discovery

| Method | What it returns / when to use it | Key usage details |
| --- | --- | --- |
| [`GET /3/search/movie`](https://developer.themoviedb.org/reference/search-movie) | Movie matches by original, translated, or alternative title. | `query` required; optional `include_adult`, `language`, `page`, `primary_release_year`, `year`. Result rows include `id`, title, dates, overview, poster, genre IDs, and votes. |
| [`GET /3/search/tv`](https://developer.themoviedb.org/reference/search-tv) | TV series matches by original, translated, or known-as name. | `query` required; optional `first_air_date_year`, `year`, `include_adult`, `language`, `page`. Result rows include `id`, name, first-air date, overview, poster, origin countries, and votes. |
| [`GET /3/search/multi`](https://developer.themoviedb.org/reference/search-multi) | Movie, TV, and person matches in one response. | `query` required; optional `include_adult`, `language`, `page`. Each result has `media_type`; use it to select the correct details endpoint. It does not document `watch_region` or `with_watch_monetization_types`. |
| [`GET /3/discover/movie`](https://developer.themoviedb.org/reference/discover-movie) | Filtered movie catalog search. Use when the input is filters rather than a title string. | Supports filters for release dates/year, region/certification, genres, keywords, people/credits, companies, original language/country, runtime, ratings/vote count, and streaming providers. Provider filters require `watch_region` with `with_watch_providers` and/or `with_watch_monetization_types`. Defaults include `page=1`, `language=en-US`, `sort_by=popularity.desc`, `include_adult=false`, and `include_video=false`. |
| [`GET /3/discover/tv`](https://developer.themoviedb.org/reference/discover-tv) | Filtered TV series catalog search. | Supports filters for air/first-air dates, genre, keyword, company/network, origin country/language, runtime, status/type, rating/vote count, and streaming providers. Provider filters require `watch_region` with `with_watch_providers` and/or `with_watch_monetization_types`. Defaults include `page=1`, `language=en-US`, `sort_by=popularity.desc`, and `include_adult=false`. |
| [`GET /3/find/{external_id}`](https://developer.themoviedb.org/reference/find-by-id) | Resolves external identifiers (such as IMDb IDs) to TMDB movies, TV, people, and episode results. | Supply `external_source` to identify the source system. Use the returned TMDB ID for later `/movie`, `/tv`, or episode requests. |

**Search vs. discover:** Search matches text; discover filters a catalog. TMDB's watch-provider filters are documented on discover endpoints, not multi-search. To search text and filter by availability, either search movie and TV separately and then check provider results for candidates, or show search results without claiming the unsupported provider filter was applied.

### Request examples

These use a Bearer token so a real API key is not written into command history. Substitute your own token and IDs. The equivalent v3 `api_key` query parameter is also supported.

```bash
# Find movies by title. --data-urlencode safely encodes punctuation and spaces.
curl --get 'https://api.themoviedb.org/3/search/movie' \
  --header 'Authorization: Bearer YOUR_READ_ACCESS_TOKEN' \
  --data-urlencode 'query=The Matrix' \
  --data-urlencode 'language=en-US' \
  --data-urlencode 'page=1'

# Get a movie and append related resources in one request.
curl 'https://api.themoviedb.org/3/movie/603?language=en-US&append_to_response=credits,videos,images' \
  --header 'Authorization: Bearer YOUR_READ_ACCESS_TOKEN'

# Get a TV series, then a season and a specific episode.
curl 'https://api.themoviedb.org/3/tv/1399?language=en-US' \
  --header 'Authorization: Bearer YOUR_READ_ACCESS_TOKEN'
curl 'https://api.themoviedb.org/3/tv/1399/season/1?language=en-US' \
  --header 'Authorization: Bearer YOUR_READ_ACCESS_TOKEN'
curl 'https://api.themoviedb.org/3/tv/1399/season/1/episode/1?language=en-US' \
  --header 'Authorization: Bearer YOUR_READ_ACCESS_TOKEN'

# Discover movies available to stream in Japan on a flat-rate service.
curl --get 'https://api.themoviedb.org/3/discover/movie' \
  --header 'Authorization: Bearer YOUR_READ_ACCESS_TOKEN' \
  --data-urlencode 'watch_region=JP' \
  --data-urlencode 'with_watch_monetization_types=flatrate' \
  --data-urlencode 'sort_by=popularity.desc'
```

### Common response shapes

- **Search, discover, catalog lists, recommendations, similar, reviews, and lists:** typically return a paginated envelope with `page`, `results`, `total_pages`, and `total_results`; catalog results are summaries. Movie summaries commonly use `title` and `release_date`; TV summaries commonly use `name` and `first_air_date`.
- **Multi-search and trending-all:** result rows can be different media types. Branch on `media_type` (`movie`, `tv`, or `person`); do not infer the type from `title`/`name` alone.
- **Details:** return one object keyed by media-specific fields. Movie detail fields include `title`, `release_date`, and `runtime`; TV series fields include `name`, `first_air_date`, `seasons`, and `number_of_episodes`.
- **Credits:** movie and TV credits have cast and crew arrays; TV aggregate credits consolidate episode appearances and may include per-role/per-episode details.
- **Images:** methods return file metadata and paths, not ready-to-render URLs. Movie/series methods include artwork such as posters, backdrops, and logos; episode images are stills.
- **Videos:** methods return metadata such as `site`, `key`, `type`, and language. Use the provider's documented URL pattern and only when `site` is supported; TMDB does not host the video itself.
- **Watch providers:** a `results` map is keyed by country code, with separate availability buckets such as `flatrate`, `free`, `ads`, `rent`, and `buy`. A missing country entry or missing bucket means the response has no such availability data, not that the title record is invalid.
- **Changes:** item-level change methods return changed field keys and time-stamped change items. By default they cover the last 24 hours; the date parameters can cover up to 14 days.

### Movie catalog endpoints

These methods return pages of movie summaries. Use the detail endpoint below when you need full metadata.

| Method | Use |
| --- | --- |
| `GET /3/movie/now_playing` | Movies currently in theatrical release; supports `language`, `page`, and `region`. |
| `GET /3/movie/popular` | Popularity-ranked movie catalog; supports `language`, `page`, and `region`. |
| `GET /3/movie/top_rated` | Highest-rated movie catalog; supports `language`, `page`, and `region`. |
| `GET /3/movie/upcoming` | Upcoming theatrical releases; supports `language`, `page`, and `region`. |
| `GET /3/movie/latest` | One recently created movie record, not a paginated list. |

See the [movie API reference](https://developer.themoviedb.org/reference) and the [OpenAPI spec](https://developer.themoviedb.org/openapi/tmdb-api.json) for endpoint-specific parameters. Regional release behavior depends on the endpoint; for discover, `region` affects which release dates are considered.

### Movie ID endpoints

All rows below require `{movie_id}` from a TMDB result. Most metadata endpoints accept `language`; list endpoints commonly accept `language` and `page`. Follow the linked endpoint page for the full parameter contract.

| Method | Information returned / usage |
| --- | --- |
| [`GET /3/movie/{movie_id}`](https://developer.themoviedb.org/reference/movie-details) | Main movie record: title, overview, dates, runtime, genres, production, collection, and related metadata. Supports `language` and `append_to_response`. |
| [`GET /3/movie/{movie_id}/account_states`](https://developer.themoviedb.org/reference/movie-account-states) | Current user's favorite/watchlist/rating state; requires user or guest session context. |
| [`GET /3/movie/{movie_id}/alternative_titles`](https://developer.themoviedb.org/reference/movie-alternative-titles) | Region-specific alternate title list; optional `country` ISO 3166-1 code. |
| [`GET /3/movie/{movie_id}/changes`](https://developer.themoviedb.org/reference/movie-changes) | Field-level history for the movie. Optional `start_date`, `end_date`, `page`; a single range can cover at most 14 days. |
| [`GET /3/movie/{movie_id}/credits`](https://developer.themoviedb.org/reference/movie-credits) | Cast and crew for the movie; accepts `language`. |
| [`GET /3/movie/{movie_id}/external_ids`](https://developer.themoviedb.org/reference/movie-external-ids) | External identifiers such as IMDb, Wikidata, and social IDs. |
| [`GET /3/movie/{movie_id}/images`](https://developer.themoviedb.org/reference/movie-images) | Posters, backdrops, and logos. `language` filters; `include_image_language` adds language fallbacks, including `null`. |
| [`GET /3/movie/{movie_id}/keywords`](https://developer.themoviedb.org/reference/movie-keywords) | Keywords associated with the movie. |
| [`GET /3/movie/{movie_id}/lists`](https://developer.themoviedb.org/reference/movie-lists) | Public lists that include the movie; paginated. |
| [`GET /3/movie/{movie_id}/recommendations`](https://developer.themoviedb.org/reference/movie-recommendations) | TMDB recommendations based on the movie; accepts `language`, `page`. |
| [`GET /3/movie/{movie_id}/release_dates`](https://developer.themoviedb.org/reference/movie-release-dates) | Release dates and certification records by country. Use for localized theatrical/digital/physical release information. |
| [`GET /3/movie/{movie_id}/reviews`](https://developer.themoviedb.org/reference/movie-reviews) | User reviews; paginated, with language selection. |
| [`GET /3/movie/{movie_id}/similar`](https://developer.themoviedb.org/reference/movie-similar) | Similar movies based on genres and plot keywords; paginated. Similarity is approximate, not a guarantee of close matches. |
| [`GET /3/movie/{movie_id}/translations`](https://developer.themoviedb.org/reference/movie-translations) | Available translated metadata records. |
| [`GET /3/movie/{movie_id}/videos`](https://developer.themoviedb.org/reference/movie-videos) | Trailers, teasers, clips, and other video records. The response contains provider keys; the API does not host the video itself. |
| [`GET /3/movie/{movie_id}/watch/providers`](https://developer.themoviedb.org/reference/movie-watch-providers) | Streaming, rental, and purchase availability grouped by country. The endpoint doesn't provide full deep links; use its TMDB link and follow the required JustWatch attribution. |

The movie detail method supports `append_to_response` for compatible methods in the movie namespace, such as `credits,videos,images`. Use this to avoid extra round trips when the UI needs several subresources immediately; it may produce a larger response.

### TV series catalog endpoints

These return TV series summaries; a series is not an episode or season.

| Method | Use |
| --- | --- |
| `GET /3/tv/airing_today` | Series with an episode airing today; supports `language`, `page`, and `timezone`. |
| `GET /3/tv/on_the_air` | Series currently airing; supports `language`, `page`, and `timezone`. |
| `GET /3/tv/popular` | Popularity-ranked series; supports `language` and `page`. |
| `GET /3/tv/top_rated` | Highest-rated series; supports `language` and `page`. |
| `GET /3/tv/latest` | One recently created series record, not a paginated list. |
| `GET /3/trending/tv/{time_window}` | Trending TV series for `day` or `week`; paginated. The parallel `GET /3/trending/movie/{time_window}` returns trending movies. |

### TV series ID endpoints

All rows below require `{series_id}`. Most metadata endpoints accept `language`; result lists commonly accept `language` and `page`.

| Method | Information returned / usage |
| --- | --- |
| [`GET /3/tv/{series_id}`](https://developer.themoviedb.org/reference/tv-series-details) | Main series record: name, overview, genres, status, networks, seasons, episode counts, and related metadata. Supports `language`, `append_to_response`. |
| [`GET /3/tv/{series_id}/account_states`](https://developer.themoviedb.org/reference/tv-series-account-states) | Current user's favorite/watchlist/rating state; requires session context. |
| [`GET /3/tv/{series_id}/aggregate_credits`](https://developer.themoviedb.org/reference/tv-series-aggregate-credits) | Cast and crew aggregated across the series' episodes. Distinct from regular credits; accepts `language`. |
| [`GET /3/tv/{series_id}/alternative_titles`](https://developer.themoviedb.org/reference/tv-series-alternative-titles) | Alternate names/titles for the series, with country information. |
| [`GET /3/tv/{series_id}/changes`](https://developer.themoviedb.org/reference/tv-series-changes) | Field-level series change history; supports date range and page. |
| [`GET /3/tv/{series_id}/content_ratings`](https://developer.themoviedb.org/reference/tv-series-content-ratings) | TV content ratings by country. |
| [`GET /3/tv/{series_id}/credits`](https://developer.themoviedb.org/reference/tv-series-credits) | Main series cast and crew; accepts `language`. |
| [`GET /3/tv/{series_id}/episode_groups`](https://developer.themoviedb.org/reference/tv-series-episode-groups) | Alternate episode grouping sets; use a returned group ID with the episode-group details method. |
| [`GET /3/tv/{series_id}/external_ids`](https://developer.themoviedb.org/reference/tv-series-external-ids) | External IDs for the series. |
| [`GET /3/tv/{series_id}/images`](https://developer.themoviedb.org/reference/tv-series-images) | Series posters, backdrops, and logos; supports image language filtering. |
| [`GET /3/tv/{series_id}/keywords`](https://developer.themoviedb.org/reference/tv-series-keywords) | Keywords associated with the series. |
| [`GET /3/tv/{series_id}/lists`](https://developer.themoviedb.org/reference/lists-copy) | Public lists that include the series; paginated. |
| [`GET /3/tv/{series_id}/recommendations`](https://developer.themoviedb.org/reference/tv-series-recommendations) | Recommended TV shows; paginated. |
| [`GET /3/tv/{series_id}/reviews`](https://developer.themoviedb.org/reference/tv-series-reviews) | User reviews; paginated. |
| [`GET /3/tv/{series_id}/screened_theatrically`](https://developer.themoviedb.org/reference/tv-series-screened-theatrically) | Episodes that were screened theatrically. |
| [`GET /3/tv/{series_id}/similar`](https://developer.themoviedb.org/reference/tv-series-similar) | Similar series; paginated and approximate. |
| [`GET /3/tv/{series_id}/translations`](https://developer.themoviedb.org/reference/tv-series-translations) | Available translated series metadata. |
| [`GET /3/tv/{series_id}/videos`](https://developer.themoviedb.org/reference/tv-series-videos) | Series-level trailers, teasers, and clips. |
| [`GET /3/tv/{series_id}/watch/providers`](https://developer.themoviedb.org/reference/tv-series-watch-providers) | Streaming, rental, and purchase availability grouped by country; JustWatch attribution is required. |

### TV episode groups

An episode group is an alternate grouping/order of a series' episodes (for example, original air date, absolute, DVD, digital, story arc, production, or TV order). First get the group IDs from the series `episode_groups` method, then request:

| Method | Information returned / usage |
| --- | --- |
| [`GET /3/tv/episode_group/{tv_episode_group_id}`](https://developer.themoviedb.org/reference/tv-episode-group-details) | Group metadata and its grouped seasons/episodes. The group ID is a string returned by the series endpoint. |

The series detail method supports `append_to_response` for compatible series-namespace resources, such as `aggregate_credits,videos,images`. Season and episode methods have their own namespaces and are requested separately.

### TV season endpoints

Use `{series_id}` plus the `season_number` returned in the series detail response. Season `0` is commonly used for specials, but rely on the API's returned values.

| Method | Information returned / usage |
| --- | --- |
| [`GET /3/tv/{series_id}/season/{season_number}`](https://developer.themoviedb.org/reference/tv-season-details) | Season metadata and its episode summaries; supports `language` and `append_to_response`. |
| [`GET /3/tv/{series_id}/season/{season_number}/aggregate_credits`](https://developer.themoviedb.org/reference/tv-season-aggregate-credits) | Cast and crew aggregated across episodes in that season. |
| [`GET /3/tv/{series_id}/season/{season_number}/credits`](https://developer.themoviedb.org/reference/tv-season-credits) | Season cast and crew. |
| [`GET /3/tv/{series_id}/season/{season_number}/external_ids`](https://developer.themoviedb.org/reference/tv-season-external-ids) | External IDs for the season. |
| [`GET /3/tv/{series_id}/season/{season_number}/images`](https://developer.themoviedb.org/reference/tv-season-images) | Season posters; supports image language filtering. |
| [`GET /3/tv/{series_id}/season/{season_number}/translations`](https://developer.themoviedb.org/reference/tv-season-translations) | Translated season metadata. |
| [`GET /3/tv/{series_id}/season/{season_number}/videos`](https://developer.themoviedb.org/reference/tv-season-videos) | Season-level videos. |

### TV episode endpoints

Use the series ID, season number, and episode number supplied by the season response. An episode has its own detail, credits, images, and external IDs.

| Method | Information returned / usage |
| --- | --- |
| [`GET /3/tv/{series_id}/season/{season_number}/episode/{episode_number}`](https://developer.themoviedb.org/reference/tv-episode-details) | Episode metadata; supports `language` and `append_to_response`. |
| [`GET /3/tv/{series_id}/season/{season_number}/episode/{episode_number}/account_states`](https://developer.themoviedb.org/reference/tv-episode-account-states) | Current user's rating/account state for the episode; requires session context. |
| [`GET /3/tv/{series_id}/season/{season_number}/episode/{episode_number}/credits`](https://developer.themoviedb.org/reference/tv-episode-credits) | Episode cast and crew. |
| [`GET /3/tv/{series_id}/season/{season_number}/episode/{episode_number}/external_ids`](https://developer.themoviedb.org/reference/tv-episode-external-ids) | External IDs for the episode. |
| [`GET /3/tv/{series_id}/season/{season_number}/episode/{episode_number}/images`](https://developer.themoviedb.org/reference/tv-episode-images) | Episode stills; supports image language filtering. |
| [`GET /3/tv/{series_id}/season/{season_number}/episode/{episode_number}/translations`](https://developer.themoviedb.org/reference/tv-episode-translations) | Translated episode metadata. |
| [`GET /3/tv/{series_id}/season/{season_number}/episode/{episode_number}/videos`](https://developer.themoviedb.org/reference/tv-episode-videos) | Episode-level videos. |

### Shared read endpoints that enrich movie and TV data

These aren't inside the movie or TV resource namespace, but are commonly used to find or display movie/series information.

| Method | Use |
| --- | --- |
| `GET /3/genre/movie/list`, `GET /3/genre/tv/list` | Map `genre_ids` from search/discover/list responses to readable names; accepts `language`. |
| `GET /3/watch/providers/movie`, `GET /3/watch/providers/tv` | List available provider identities/logos for a media type, optionally by `watch_region`. This is different from a specific title's `/watch/providers` endpoint. |
| [`GET /3/watch/providers/regions`](https://developer.themoviedb.org/reference/watch-providers-available-regions) | List supported region codes for watch-provider filtering; accepts `language`. |
| [`GET /3/certification/movie/list`](https://developer.themoviedb.org/reference/certification-movie-list), [`GET /3/certification/tv/list`](https://developer.themoviedb.org/reference/certifications-tv-list) | Return the supported movie or TV certification ratings by country. Useful for building localized filters or explaining a certification value. |
| `GET /3/configuration` | Static configuration including image URL bases/sizes; cache and refresh periodically rather than request it for every image. |
| `GET /3/collection/{collection_id}` and `/images` | Get collection metadata and its artwork, useful when a movie has `belongs_to_collection`. |
| `GET /3/trending/{movie\|tv}/{day\|week}` | Short-window trending movie or TV catalog. This differs from discover's popularity sorting. |
| `GET /3/movie/changes`, `GET /3/tv/changes` | Lists of changed movie/series IDs for a date range; use item-level `/changes` methods for field details. The tracking guide documents a maximum 14-day window. |

### Endpoint families not included here

This chapter focuses on read operations for titles and their metadata. Account mutations (favorite/watchlist/rating writes), authentication creation, list writes, people/company/network/keyword detail families, and TMDB v4 operations are outside its scope. The [OpenAPI v3 specification](https://developer.themoviedb.org/openapi/tmdb-api.json) includes the full request and response contracts; the [API reference](https://developer.themoviedb.org/reference) includes the v3 endpoint pages.

## Pagination, languages, and combining responses

- Many list/search/discover endpoints return a paginated response with fields such as `page`, `results`, `total_pages`, and `total_results`. Page numbers start at 1; the current docs' error table says the maximum page is 500.
- Endpoints can support locale parameters such as `language`; parameters are endpoint-specific. Check each endpoint's reference for defaults and allowed values.
- `append_to_response` is supported by top-level detail methods for movies, TV shows, seasons, episodes, and people. It can request supported subresources (for example `videos,images`) alongside a detail response, reducing round trips. Appended subrequests still have their own parameters and limits.
- For image queries, `include_image_language` can include multiple language tags and `null` as a fallback for untagged images.

Official docs: [Append to response](https://developer.themoviedb.org/docs/append-to-response), [Image languages](https://developer.themoviedb.org/docs/image-languages), [Errors](https://developer.themoviedb.org/docs/errors).

## Images

Image paths are not full URLs. A complete URL is assembled from the image base URL, a size, and the media object's `poster_path`, `backdrop_path`, `profile_path`, or another file path. TMDB's `/configuration` API provides image base URLs and available sizes. The general shape is:

```text
https://image.tmdb.org/t/p/{size}/{file_path}
```

Use a size returned by configuration where possible. TMDB notes SVG logos should use `original`; resized versions are not generated for SVGs.

Official docs: [Image basics](https://developer.themoviedb.org/docs/image-basics), [Configuration reference](https://developer.themoviedb.org/reference/configuration-details).

## Rate limits and errors

TMDB says the old fixed limit of 40 requests per 10 seconds was disabled in 2019. It still applies upper limits to mitigate bulk scraping, estimated in the docs at around 40 requests per second; this can change. Respect HTTP `429` and avoid unnecessary requests.

The official error table includes common cases such as `401` authentication failures, `404` missing resources, `422` invalid parameters, `429` too many requests, and `5xx` service errors. Handle both HTTP status and the returned TMDB error body; retry transient failures carefully and do not retry invalid credentials or parameters blindly.

Official docs: [Rate limiting](https://developer.themoviedb.org/docs/rate-limiting), [Errors](https://developer.themoviedb.org/docs/errors).

## Terms and attribution

TMDB's FAQ says the developer API is free for non-commercial purposes when TMDB is attributed; commercial projects require contacting TMDB about licensing. It requires the TMDB logo and a prominent notice: “This product uses the TMDB API but is not endorsed or certified by TMDB.” Follow the current [API terms](https://www.themoviedb.org/api-terms-of-use) and [FAQ](https://developer.themoviedb.org/docs/faq) for current legal and branding requirements.

## Endpoints currently used by tmdb-front

These are based on the app's source, not recommendations about what it should use.

| App function | Request | Purpose |
| --- | --- | --- |
| `getMovies` | `GET /3/discover/movie?api_key=…` | Initial movie catalog |
| `getTv` | `GET /3/discover/tv?api_key=…` | Initial TV catalog |
| `getSearch` | `GET /3/search/multi?api_key=…&query=…&include_adult=false&language=en-US` | Multi-search using documented parameters. The UI filters out person results and routes by `media_type`; it does not apply provider filters. |
| `getSelected` | `GET /3/{movie\|tv}/{id}?api_key=…` | Movie or TV details |
| `getProviders` | `GET /3/{movie\|tv}/{id}/watch/providers?api_key=…` | Streaming provider availability |
| `getGeoInfo` | `GET https://ipapi.co/json/` | Country code/name used to select the matching country from provider results; this is **not** a TMDB endpoint |

The UI builds poster/provider logo URLs using `https://image.tmdb.org/t/p/...`.

`getSearch` uses the documented `/search/multi` parameters. Search results remain unfiltered by provider; use discover endpoints when filtering by watch availability is the goal.

The app also calls local services at `http://localhost:3001/api/...` and `http://localhost:3002/api/...` for its own user/favorites/movie data. Those are app backends, not TMDB API endpoints.

## Official source pages

- [Getting started](https://developer.themoviedb.org/docs/getting-started)
- [OpenAPI v3 specification](https://developer.themoviedb.org/openapi/tmdb-api.json)
- [API reference catalog](https://developer.themoviedb.org/reference)
- [Authentication](https://developer.themoviedb.org/docs/authentication-application)
- [Finding data](https://developer.themoviedb.org/docs/finding-data)
- [Search and detail workflow](https://developer.themoviedb.org/docs/search-and-query-for-details)
- [Append to response](https://developer.themoviedb.org/docs/append-to-response)
- [Image basics](https://developer.themoviedb.org/docs/image-basics)
- [Rate limiting](https://developer.themoviedb.org/docs/rate-limiting)
- [Errors](https://developer.themoviedb.org/docs/errors)
- [FAQ and attribution](https://developer.themoviedb.org/docs/faq)
