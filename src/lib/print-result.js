export const printResult = (number, title, value) => {
  console.log(`\n${'='.repeat(72)}`);
  console.log(`${number}. ${title}`);
  console.log('='.repeat(72));
  console.log(JSON.stringify(value, null, 2));
};

export const previewDocuments = (docs, limit, pick = (doc) => doc) => ({
  count: docs.length,
  showing: Math.min(docs.length, limit),
  documents: docs.slice(0, limit).map(pick),
});
