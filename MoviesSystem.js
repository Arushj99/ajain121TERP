const express = require("express");
const app = express();
const path = require("path");
const portNumber = process.env.PORT || 7003;
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");

app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));

/*
require("dotenv").config({
   path: path.resolve(__dirname, "credentialsDontPost/.env"),
});
*/

const databaseName = "CMSC335DeployDB";
const collectionName = "moviesCollection";
const uri = process.env.MONGO_CONNECTION_STRING;
if (!uri) {
   throw new Error("Set the MONGO_CONNECTION_STRING environment variable before starting the app.");
}

const client = new MongoClient(uri, {
   serverApi: ServerApiVersion.v1,
   serverSelectionTimeoutMS: 10000,
});
const collection = client.db(databaseName).collection(collectionName);

app.get("/", async (req, res) => {
   res.send(`My Deployment`);
});

app.get("/insertMovies", async (req, res) => {
   const moviesArray = [
      { name: "Batman", year: 2021, stars: 1.5 },
      { name: "Wonder Women", year: 2005, stars: 2.0 },
      { name: "When Harry Met Sally", year: 1985, stars: 5 },
      { name: "Hulk", year: 1985, stars: 5 },
   ];
   const result = await collection.insertMany(moviesArray);
   res.send(`<h2>Inserted ${result.insertedCount} movies</h2>`);
});

app.get("/listMovies", async (req, res) => {
   const movies = await collection.find({}).toArray();
   const movieLines = movies.map(movie => `${movie.name} (${movie.year})<br>`);
   res.send(`${movieLines.join("")}Found: ${movies.length} movies`);
});

app.get("/clearCollection", async (req, res) => {
   await collection.deleteMany({});
   res.send("<h2>Collection Cleared</h2>");
});

app.get("/getSummary", (req, res) => {
   const variables = { year: 2025 };
   res.render("summary", variables);
});


app.use((error, req, res, next) => {
   console.error(`Request failed for ${req.path}: ${error.name}`);
   res.status(500).send("Unable to complete the database request.");
});

app.listen(portNumber, "0.0.0.0", () => {
   console.log(`main URL http://localhost:${portNumber}/`);
});
