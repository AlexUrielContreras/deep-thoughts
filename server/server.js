const express = require('express');
const { authMiddleware } = require('./utils/auth');
const path = require('path');

const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schemas');

const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
// create a new Apollo server and pass in our schema data
const server = new ApolloServer({
  typeDefs, 
  resolvers,
  context: authMiddleware
})
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  // Intergrate our Apollo server with the Express application as middleware
  server.applyMiddleware({ app });

  // Serve up static assets 
  if (process.env.NODE_ENV === 'producation') {
    app.use(express.static(path.join(__dirname, '../client/build')))
  };

  app.get('*', (req, res) => {
    res.sendFile(path.join(_dirname, '../client/build/index.html'))
  })


  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      // log where we can go test our GQL API
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
};

// Call the async function to start the server
startApolloServer(typeDefs, resolvers)