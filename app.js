/** Express app for jobly. */

const express = require("express");
const ExpressError = require("./helpers/expressError");
const morgan = require("morgan");
const companiesRoutes = require("./routes/companies")
const jobsRoutes = require("./routes/jobs")
const app = express();

app.use(express.json());

// add logging system
app.use(morgan("tiny"));

app.use('/companies', companiesRoutes);
app.use('/jobs', jobsRoutes);


app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);

  return next(err);
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.error(err.stack);

  return res.json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;
