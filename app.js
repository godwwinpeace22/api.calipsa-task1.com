const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const dirty = require("dirty");
const db = dirty("logs.db");

var indexRouter = require("./routes/index");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "jade");

app.use(cors());

// check auth, assume users are issued API keys
app.use(function (req, res, next) {
  // MOCK USERS given API access
  const users = [
    {
      apiKey: "erwer934ksfdfjkl",
      apiSecret: "8932rjjadfkad",
    },
  ];

  const authorization = req.headers.authorization;
  const apiKeyExists = users.find((u) => u.apiKey == authorization);

  if (!authorization || !apiKeyExists) {
    return res.status(403).json({ error: "Invalid credentials sent" });
  }

  next();
});

// Logger requests
app.use(function (req, res, next) {
  // Ideally, this should be done in a proper db or a logging service.
  const timestamp = new Date();

  const newLogs = {
    timestamp,
    url: req.url,
    headers: req.headers,
    query: req.query,
    credentials: req.credentials,
    body: req.body,
    method: req.method,
    mode: req.mode,
    referrer: req.referrer,
  };
  db.set(timestamp, newLogs);

  // fs.writeFile("logs.json", JSON.stringify(newLogs), (err) => {});

  next();
});

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.log(err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
