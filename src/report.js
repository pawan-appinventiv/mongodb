import { reportMovieAnalytics } from './analytics/movie-analytics.js';
import { config, myMoviesCollection } from './config.js';
import { close, connect } from './db.js';
import { createCatalogMovies, updateCatalogMovies } from './movies/movie-catalog.js';
import { listMovies } from './movies/list-movies.js';
import { searchMovies } from './movies/search-movies.js';
import { printBlogSchema } from './schema/blog-schema.js';

const main = async () => {
  if (!myMoviesCollection.startsWith('my_movies_')) {
    throw new Error(`Refusing to write to ${myMoviesCollection}.`);
  }

  const db = await connect();
  const movies = db.collection('movies');
  const comments = db.collection('comments');
  const catalog = db.collection(myMoviesCollection);

  console.log(`Database: ${config.dbName}`);
  console.log(`Write collection: ${myMoviesCollection}`);

  await listMovies({ movies });
  await createCatalogMovies({ catalog, collectionName: myMoviesCollection });
  await searchMovies({ movies });
  await updateCatalogMovies({ catalog });
  await reportMovieAnalytics({ movies, comments });
  printBlogSchema();
};

main()
  .catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(message);
    if (message.includes('alert internal error') || message.toLowerCase().includes('server selection')) {
      console.error(
        'Atlas refused the connection before the report could run. In Atlas, open Network Access and allow this computer, then run npm run report again.',
      );
    }
    process.exitCode = 1;
  })
  .finally(() => close());
