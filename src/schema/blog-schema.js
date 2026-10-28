import { ObjectId } from 'mongodb';
import { printResult } from '../lib/print-result.js';

const whyCommentsAreSeparate = [
  'In sample_mflix, comments are stored in their own collection because a movie can receive an unbounded number of comments.',
  'Each MongoDB document has a 16 MB size limit, and embedding every comment would make the movie document grow on every new comment and rewrite that whole document on each insert.',
  'Comments are also listed and filtered on their own, by movie, by person, and by date.',
  'A comments document that stores movie_id keeps the movie document stable and gives comments their own indexes.',
].join(' ');

const blogSchemaNotes = [
  'A blog stores users, posts, and comments in three collections.',
  'A user is shared by many posts and comments and is edited on its own, so users stay in a users collection and posts and comments store author_id.',
  'Tags are embedded on the post as an array of strings. A post has a small, bounded set of tags, and those tags are shown together with the post. A multikey index on tags supports "posts with this tag".',
  'Comments stay in a comments collection with post_id. They grow without a fixed limit and are paged separately from the post body, which is the same reason sample_mflix keeps comments out of the movie document.',
].join(' ');

const postId = new ObjectId('653000000000000000000001');
const authorId = new ObjectId('6530000000000000000000aa');

export const blogSchema = {
  notes: {
    comments: whyCommentsAreSeparate,
    blog: blogSchemaNotes,
  },
  post: {
    _id: postId,
    title: 'Notes on embed versus reference',
    body: 'Keep a small set of tags on the post. Store each comment in its own document with post_id.',
    author_id: authorId,
    tags: ['mongodb', 'schema-design'],
    created_at: new Date('2026-10-28T00:00:00.000Z'),
  },
  comment: {
    _id: new ObjectId('6530000000000000000000bb'),
    post_id: postId,
    author_id: authorId,
    text: 'Paging comments is easier when they are their own collection.',
    date: new Date('2026-10-28T12:00:00.000Z'),
  },
};

export const printBlogSchema = () => {
  // 30. Explain embed versus reference, then show one sample document.
  printResult(30, 'Embed versus reference', {
    a: blogSchema.notes.comments,
    b: blogSchema.notes.blog,
    c: {
      post: blogSchema.post,
      comment: blogSchema.comment,
    },
  });
};
