# mflix movies

Movie listing, search, catalog writes, and analytics against the Atlas `sample_mflix` dataset.

## Setup

1. Load the `sample_mflix` sample dataset in MongoDB Atlas.
2. Copy the environment file and fill in your Atlas connection string.

```bash
cp .env.example .env
npm install
npm start
```

`npm start` connects to `sample_mflix` and prints the catalog collection used for inserts, updates, and deletes. That name is `my_movies_<student name>` from `STUDENT_NAME` in `.env`. The `movies`, `comments`, and `users` collections stay read-only.

`npm run report` runs the full report. Catalog inserts, updates, and deletes use only that collection. The report clears it before the inserts so it can be run again.

## Layout

- `src/config.js` reads the connection settings.
- `src/db.js` opens and closes the MongoDB client.
- `src/index.js` checks that the database is reachable.
- `src/report.js` runs the report in order.
- `src/movies/list-movies.js` lists movies by year, runtime, genre, and cast.
- `src/movies/search-movies.js` searches with operators, regex, and pagination.
- `src/movies/movie-catalog.js` inserts, updates, and deletes catalog movies.
- `src/movies/seed-data.js` holds the catalog documents.
- `src/analytics/movie-analytics.js` aggregates movies and joins comments.
- `src/schema/blog-schema.js` describes the embed-versus-reference model.
- `src/lib/print-result.js` prints each result.
