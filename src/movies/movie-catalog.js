import { printResult } from '../lib/print-result.js';
import { additionalMovies, catalogTitles, initialMovie } from './seed-data.js';

const resetCatalog = async (catalog) => {
  // find() runs before this delete. Only the writable catalog is cleared,
  // so the report can be run again without changing sample_mflix.
  await catalog.find({}).toArray();
  await catalog.deleteMany({});
};

export const createCatalogMovies = async ({ catalog, collectionName }) => {
  await resetCatalog(catalog);

  // 8. Insert one movie into the writable collection.
  const inserted = await catalog.insertOne(initialMovie);
  printResult(8, `Inserted one movie into ${collectionName}`, {
    insertedId: inserted.insertedId,
    movie: await catalog.findOne({ _id: inserted.insertedId }),
  });

  // 9. Insert 3 more movies with a single command.
  const insertedMany = await catalog.insertMany(additionalMovies);
  printResult(9, 'Inserted 3 movies with one insertMany', {
    insertedCount: insertedMany.insertedCount,
    insertedIds: insertedMany.insertedIds,
    movies: await catalog.find({}, { projection: { title: 1, year: 1, rated: 1, genres: 1 } }).toArray(),
  });

  // 10. Set the rated field of one movie to "PG".
  const rateFilter = { title: catalogTitles.midnightClassroom };
  const beforeRate = await catalog.find(rateFilter).toArray();
  const rateResult = await catalog.updateOne(rateFilter, { $set: { rated: 'PG' } });
  printResult(10, 'Set rated to PG on one movie', {
    findBeforeUpdate: beforeRate,
    matchedCount: rateResult.matchedCount,
    modifiedCount: rateResult.modifiedCount,
    after: await catalog.findOne(rateFilter, { projection: { title: 1, rated: 1 } }),
  });
};

export const updateCatalogMovies = async ({ catalog }) => {
  // 18. Add 1 to a views field for every movie.
  const beforeViews = await catalog.find().toArray();
  const viewsResult = await catalog.updateMany({}, { $inc: { views: 1 } });
  printResult(18, 'Increment views by 1 on every catalog movie', {
    findBeforeUpdate: beforeViews.map((doc) => ({ title: doc.title, views: doc.views ?? 0 })),
    matchedCount: viewsResult.matchedCount,
    modifiedCount: viewsResult.modifiedCount,
    after: await catalog.find({}, { projection: { _id: 0, title: 1, views: 1 } }).toArray(),
  });

  // 19. Add a new genre to one movie.
  const genreFilter = { title: catalogTitles.neonHarbor };
  const beforeGenre = await catalog.find(genreFilter).toArray();
  const genreResult = await catalog.updateOne(genreFilter, { $push: { genres: 'Thriller' } });
  printResult(19, 'Push Thriller onto one movie', {
    findBeforeUpdate: beforeGenre.map((doc) => ({ title: doc.title, genres: doc.genres })),
    matchedCount: genreResult.matchedCount,
    modifiedCount: genreResult.modifiedCount,
    after: await catalog.findOne(genreFilter, { projection: { _id: 0, title: 1, genres: 1 } }),
  });

  // 20. Delete all movies rated "PG". find() runs first.
  const deleteFilter = { rated: 'PG' };
  const toDelete = await catalog.find(deleteFilter).toArray();
  const deleteResult = await catalog.deleteMany(deleteFilter);
  printResult(20, 'Deleted every catalog movie rated PG', {
    findBeforeDelete: toDelete.map((doc) => ({ title: doc.title, rated: doc.rated })),
    deletedCount: deleteResult.deletedCount,
    remaining: await catalog
      .find({}, { projection: { _id: 0, title: 1, rated: 1, genres: 1, views: 1 } })
      .toArray(),
  });
};
