const express = require('express');
const path = require('path');
// Import ApolloServer
const { ApolloServer } = require('apollo-server-express');
const { authMiddleware } = require('./utils/auth');

// import our typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas')

const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
// create a new apollo server and pass in our schema data
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
})

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// Serve up static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

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


