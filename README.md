# MongoDB practice

Initial setup for the sample_mflix assignment. The numbered questions are not answered in this repository yet.

## Setup

1. Load the `sample_mflix` sample dataset in MongoDB Atlas.
2. Copy the environment file and fill in your Atlas connection string.

```bash
cp .env.example .env
npm install
npm start
```

`npm start` connects to `sample_mflix` and prints the private collection name used for inserts, updates, and deletes. That name is `my_movies_<student name>` from `STUDENT_NAME` in `.env`. Sample collections such as `movies`, `comments`, and `users` stay read-only.

## Layout

- `src/config.js` reads the connection settings.
- `src/db.js` opens and closes the MongoDB client.
- `src/index.js` checks that the database is reachable.
