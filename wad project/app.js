const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
require("dotenv").config();

const indexRoutes = require("./routes/indexRoutes");
const authRoutes = require("./routes/authRoutes");
const dieticianRoutes = require("./routes/dieticianRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// view engine
app.set("view engine", "ejs");

// static
app.use(express.static("public"));

// body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// method override for PUT/DELETE
app.use(methodOverride("_method"));

// session
app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

// make currentUser available in views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(()=> console.log("MongoDB Connected"))
  .catch(e => console.error("MongoDB connection error:", e));

// routes
app.use("/", indexRoutes);
app.use("/", authRoutes);
app.use("/dieticians", dieticianRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/admin", adminRoutes);

// 404
app.use((req, res) => res.status(404).render("404"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("Server running on port", PORT));
