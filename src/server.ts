import { ApolloServer, gql } from "apollo-server";
import { randomUUID } from "node:crypto";

const authors: { id: string; name: string; age: number; email?: string }[] = [];
const books: { id: string; title: string; authorId: string }[] = [];

const typeDefs = gql`
  type Author {
    id: String!
    name: String!
    age: Int!
    email: String
  }

  type Book {
    id: String!
    title: String!
    author: Author!
  }

  input BookInput {
    title: String!
    authorId: String!
  }

  input AuthorInput {
    name: String!
    age: Int!
    email: String
  }

  type Query {
    book(id: String!): Book
    books: [Book]!
    author(id: String!): Author
    authors: [Author]!
  }

  type Mutation {
    addBook(data: BookInput!): Book!
    addAuthor(data: AuthorInput!): Author!
  }
`;

const resolvers = {
  Query: {
    book: (_, args) => {
      const book = books.find((book) => book.id === args.id);

      if (book) {
        return {
          ...book,
          author: authors.find((author) => author.id === book.authorId),
        };
      }
    },
    books: () =>
      books.map((book) => ({
        ...book,
        author: authors.find((author) => author.id === book.authorId),
      })),
    author: (_, args) => authors.find((author) => author.id === args.id),
    authors: () => authors,
  },
  Mutation: {
    addBook: (_, args) => {
      const { title, authorId } = args.data;
      const author = authors.find((at) => at.id === authorId);
      if (!author) {
        throw new Error(`Cannot find author with id ${authorId}`);
      }

      const book = {
        id: randomUUID(),
        title,
        authorId,
      };

      books.push(book);
      return book;
    },
    addAuthor: (_, args) => {
      const { name, age, email } = args.data;
      const author = {
        id: randomUUID(),
        name,
        age,
        email,
      };

      authors.push(author);
      return author;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server listening on ${url}`);
});
