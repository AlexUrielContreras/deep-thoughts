const express = require('express');
// Import ApolloServer
const { ApolloServer } = require('apollo-server-express');

// import our typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas')

const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
// create a new apollo server and pass in our schema data
const server = new ApolloServer({
  typeDefs,
  resolvers
})

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// create a new instance of an apollo servcer with GraphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start()

  // intergraye our apollo server with express app as middleware
  server.applyMiddleware({app});


  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
  
}

// Call the async functio to start server
startApolloServer(typeDefs, resolvers)


