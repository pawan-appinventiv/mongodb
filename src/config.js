import 'dotenv/config';

const required = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required. Copy .env.example to .env and fill it in.`);
  }
  return value;
};

export const config = {
  uri: required('MONGODB_URI'),
  dbName: process.env.DB_NAME || 'sample_mflix',
  studentName: (process.env.STUDENT_NAME || 'pawan').toLowerCase().replace(/[^a-z0-9]/g, ''),
};

export const myMoviesCollection = `my_movies_${config.studentName}`;
