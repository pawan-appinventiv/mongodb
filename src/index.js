import { config, myMoviesCollection } from './config.js';
import { close, connect } from './db.js';

const main = async () => {
  const db = await connect();
  await db.command({ ping: 1 });
  console.log(`Connected to ${config.dbName}`);
  console.log(`Private collection for writes: ${myMoviesCollection}`);
};

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => close());
