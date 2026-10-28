import { printResult } from '../lib/print-result.js';
import { findSample } from './query-helpers.js';

export const searchMovies = async ({ movies }) => {
  // 11. Find movies that are Drama OR Romance and were released between 1990 and 1999.
  const ninetiesDramaOrRomance = {
    genres: { $in: ['Drama', 'Romance'] },
    year: { $gte: 1990, $lte: 1999 },
  };
  printResult(
    11,
    'Drama or Romance, released 1990–1999',
    await findSample(movies, ninetiesDramaOrRomance, 5, (doc) => ({
      title: doc.title,
      year: doc.year,
      genres: doc.genres,
    })),
  );

  // 12. Find movies that are BOTH Action and Sci-Fi.
  const actionAndSciFi = { genres: { $all: ['Action', 'Sci-Fi'] } };
  printResult(
    12,
    'Movies that are both Action and Sci-Fi',
    await findSample(movies, actionAndSciFi, 5, (doc) => ({
      title: doc.title,
      year: doc.year,
      genres: doc.genres,
    })),
  );

  // 13. imdb.rating >= 8.5 AND imdb.votes > 100000.
  // Sort by rating, highest first. Show only title and imdb.rating.
  // $gte already ignores text ratings. $type keeps the sort on numbers only.
  const highlyRated = await movies
    .find(
      {
        'imdb.rating': { $gte: 8.5, $type: 'number' },
        'imdb.votes': { $gt: 100000 },
      },
      { projection: { _id: 0, title: 1, 'imdb.rating': 1 } },
    )
    .sort({ 'imdb.rating': -1 })
    .toArray();
  printResult(13, 'High rating and more than 100000 votes', {
    count: highlyRated.length,
    showing: Math.min(highlyRated.length, 15),
    documents: highlyRated.slice(0, 15),
  });

  // 14. Find movies whose title starts with "The Lord".
  const titlesStartingWithTheLord = await movies.find({ title: { $regex: '^The Lord' } }).toArray();
  printResult(
    14,
    'Titles starting with "The Lord"',
    titlesStartingWithTheLord.map((doc) => ({ title: doc.title, year: doc.year })),
  );

  // 15. Find movies that do NOT have a rated field.
  printResult(
    15,
    'Movies with no rated field',
    await findSample(movies, { rated: { $exists: false } }, 5, (doc) => ({
      title: doc.title,
      year: doc.year,
      rated: doc.rated,
    })),
  );

  // 16. Count the movies from India that were released after 2010.
  printResult(16, 'Indian movies released after 2010', {
    count: await movies.countDocuments({
      countries: 'India',
      year: { $gt: 2010 },
    }),
  });

  // 17. Show page 3 of Comedy movies with 10 movies per page, sorted by title.
  const page = 3;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;
  const comedyPage = await movies
    .find({ genres: 'Comedy' })
    .sort({ title: 1 })
    .skip(skip)
    .limit(pageSize)
    .toArray();
  printResult(17, 'Page 3 of Comedy movies (10 per page, sorted by title)', {
    page,
    limit: pageSize,
    skip,
    movies: comedyPage.map((doc) => ({ title: doc.title, year: doc.year, genres: doc.genres })),
  });
};
