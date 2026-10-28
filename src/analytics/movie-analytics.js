import { previewDocuments, printResult } from '../lib/print-result.js';

export const reportMovieAnalytics = async ({ movies, comments }) => {
  // 21. List the top 10 genres by number of movies.
  const topGenres = await movies
    .aggregate([
      { $unwind: '$genres' },
      { $group: { _id: '$genres', movieCount: { $sum: 1 } } },
      { $sort: { movieCount: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, genre: '$_id', movieCount: 1 } },
    ])
    .toArray();
  printResult(21, 'Top 10 genres by number of movies', topGenres);

  // 22. Show the average runtime for each rated value, highest average first.
  const runtimeByRated = await movies
    .aggregate([
      { $match: { rated: { $type: 'string' }, runtime: { $type: 'number' } } },
      { $group: { _id: '$rated', avgRuntime: { $avg: '$runtime' } } },
      { $sort: { avgRuntime: -1 } },
      {
        $project: {
          _id: 0,
          rated: '$_id',
          avgRuntime: { $round: ['$avgRuntime', 2] },
        },
      },
    ])
    .toArray();
  printResult(22, 'Average runtime for each rated value', runtimeByRated);

  // 23. Show "The Godfather" together with all of its comments.
  const godfather = await movies
    .aggregate([
      { $match: { title: 'The Godfather' } },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'movie_id',
          as: 'comments',
        },
      },
    ])
    .toArray();
  printResult(
    23,
    'The Godfather with its comments',
    godfather.map((movie) => ({
      title: movie.title,
      year: movie.year,
      commentCount: movie.comments.length,
      commentsPreview: movie.comments.slice(0, 3).map((comment) => ({
        name: comment.name,
        email: comment.email,
        date: comment.date,
        text: comment.text,
      })),
    })),
  );

  // 24. Find the 5 most-commented movies, then look up each title.
  const mostCommented = await comments
    .aggregate([
      { $group: { _id: '$movie_id', commentCount: { $sum: 1 } } },
      { $sort: { commentCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movie',
        },
      },
      { $unwind: { path: '$movie', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          movie_id: '$_id',
          title: '$movie.title',
          year: '$movie.year',
          commentCount: 1,
        },
      },
    ])
    .toArray();
  printResult(24, 'Five most-commented movies', mostCommented);

  // 25. One $facet query for Comedy movies:
  // total count, count by rated value, and the top 3 by imdb.rating.
  const [comedyFacet] = await movies
    .aggregate([
      { $match: { genres: 'Comedy' } },
      {
        $facet: {
          totalMovies: [{ $count: 'count' }],
          byRated: [
            { $group: { _id: '$rated', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          top3ByRating: [
            { $match: { 'imdb.rating': { $type: 'number' } } },
            { $sort: { 'imdb.rating': -1 } },
            { $limit: 3 },
            { $project: { title: 1, year: 1, 'imdb.rating': 1 } },
          ],
        },
      },
    ])
    .toArray();
  printResult(25, 'Comedy movies in one $facet', comedyFacet);

  // 26. Paginated search: title contains the word "love", newest year first,
  // page 2, 10 per page, only title/year/genres, plus the total count.
  // year is limited to numbers because this sort has no $gt/$gte filter.
  const page = 2;
  const limit = 10;
  const skip = (page - 1) * limit;
  const [loveFacet] = await movies
    .aggregate([
      {
        $match: {
          title: { $regex: '\\blove\\b', $options: 'i' },
          year: { $type: 'number' },
        },
      },
      {
        $facet: {
          totalCount: [{ $count: 'total' }],
          page: [
            { $sort: { year: -1 } },
            { $skip: skip },
            { $limit: limit },
            { $project: { _id: 0, title: 1, year: 1, genres: 1 } },
          ],
        },
      },
    ])
    .toArray();
  const total = loveFacet.totalCount[0]?.total ?? 0;
  printResult(26, 'Page 2 of titles containing the word "love"', {
    page,
    limit,
    skip,
    total,
    totalPages: Math.ceil(total / limit),
    movies: loveFacet.page,
  });

  // 27. Directors who have directed more than 20 movies, busiest first.
  const busyDirectors = await movies
    .aggregate([
      { $unwind: '$directors' },
      { $group: { _id: '$directors', movieCount: { $sum: 1 } } },
      { $match: { movieCount: { $gt: 20 } } },
      { $sort: { movieCount: -1 } },
      { $project: { _id: 0, director: '$_id', movieCount: 1 } },
    ])
    .toArray();
  printResult(27, 'Directors with more than 20 movies', busyDirectors);

  // 28. For each country, movie count and average imdb.rating.
  // Keep countries with at least 500 movies. $avg skips text ratings.
  const byCountry = await movies
    .aggregate([
      { $unwind: '$countries' },
      {
        $group: {
          _id: '$countries',
          movieCount: { $sum: 1 },
          avgRating: { $avg: '$imdb.rating' },
        },
      },
      { $match: { movieCount: { $gte: 500 } } },
      { $sort: { movieCount: -1 } },
      {
        $project: {
          _id: 0,
          country: '$_id',
          movieCount: 1,
          avgRating: { $round: ['$avgRating', 2] },
        },
      },
    ])
    .toArray();
  printResult(28, 'Countries with at least 500 movies', byCountry);

  // 29. Movies released in 2015 that have no comments.
  // Year is filtered first so the $lookup only runs for that year.
  const moviesWithoutComments = await movies
    .aggregate([
      { $match: { year: 2015 } },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'movie_id',
          as: 'comments',
        },
      },
      { $match: { comments: { $eq: [] } } },
      { $project: { title: 1, year: 1 } },
    ])
    .toArray();
  printResult(
    29,
    '2015 movies with no comments',
    previewDocuments(moviesWithoutComments, 10, (doc) => ({
      title: doc.title,
      year: doc.year,
    })),
  );
};
