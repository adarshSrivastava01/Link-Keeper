const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const usersRoutes = require("./routes/user-routes");
const linksRoutes = require("./routes/link-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());


app.use("/api/users", usersRoutes);
app.use("/api/links", linksRoutes);
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((req, res, next) => {
  const error = new HttpError("Could not find the specified Route.", 404);
});

app.listen(3000);
