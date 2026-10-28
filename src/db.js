import { MongoClient } from 'mongodb';
import { config } from './config.js';

let client;

export const connect = async () => {
  client = new MongoClient(config.uri);
  await client.connect();
  return client.db(config.dbName);
};

export const close = async () => {
  if (client) await client.close();
};
