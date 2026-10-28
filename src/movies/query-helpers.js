export const movieSummary = (doc) => ({
  title: doc.title,
  year: doc.year,
  runtime: doc.runtime,
  genres: doc.genres,
  rated: doc.rated,
});

export const findSample = async (collection, filter, limit, pick) => {
  const count = await collection.countDocuments(filter);
  const documents = await collection.find(filter).limit(limit).toArray();
  return { count, showing: documents.length, documents: documents.map(pick) };
};
