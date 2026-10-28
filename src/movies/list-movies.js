import { previewDocuments, printResult } from '../lib/print-result.js';
import { findSample, movieSummary } from './query-helpers.js';

export const listMovies = async ({ movies }) => {
  // 1. Show any one movie from the movies collection.
  printResult(1, 'One movie', await movies.findOne());

  // 2. Find all movies released in the year 2000. Show only title and year (hide _id).
  const releasedIn2000 = await movies
    .find({ year: 2000 }, { projection: { _id: 0, title: 1, year: 1 } })
    .toArray();
  printResult(2, 'Movies released in 2000', previewDocuments(releasedIn2000, 10));

  // 3. Count how many movies are rated "PG-13".
  printResult(3, 'Movies rated PG-13', {
    count: await movies.countDocuments({ rated: 'PG-13' }),
  });

  // 4. Find movies with a runtime greater than 180 minutes.
  printResult(
    4,
    'Runtime greater than 180 minutes',
    await findSample(movies, { runtime: { $gt: 180 } }, 5, (doc) => ({
      title: doc.title,
      year: doc.year,
      runtime: doc.runtime,
    })),
  );

  // 5. Show the 5 longest movies by runtime, longest first.
  // runtime is restricted to numbers so a text value cannot sort above a real length.
  const longest = await movies
    .find({ runtime: { $type: 'number' } })
    .sort({ runtime: -1 })
    .limit(5)
    .toArray();
  printResult(
    5,
    'Five longest movies',
    longest.map((doc) => ({ title: doc.title, year: doc.year, runtime: doc.runtime })),
  );

  // 6. Find all movies whose genres include "Comedy".
  printResult(
    6,
    'Movies whose genres include Comedy',
    await findSample(movies, { genres: 'Comedy' }, 5, movieSummary),
  );

  // 7. Find all movies in which Tom Hanks is part of the cast.
  const tomHanks = await movies.find({ cast: 'Tom Hanks' }).toArray();
  printResult(
    7,
    'Movies with Tom Hanks in the cast',
    previewDocuments(tomHanks, tomHanks.length, (doc) => ({
      title: doc.title,
      year: doc.year,
      cast: doc.cast,
    })),
  );
};
