require('dotenv').config();
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');

const connectDB = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const dieticianRoutes = require('./src/routes/dieticianRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const miscRoutes = require('./src/routes/miscRoutes');

const app = express();   // ✅ app must be created BEFORE use()
const PORT = process.env.PORT || 3000;

connectDB();

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'src', 'public')));

// sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'devsecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// flash-like (simple)
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.success = req.session.success || null;
  res.locals.error = req.session.error || null;
  delete req.session.success;
  delete req.session.error;
  next();
});

// ---------------------------------------------------
// ROUTES (order matters!)
// ---------------------------------------------------
app.use('/', miscRoutes);               // Share-story, etc. MUST come first!
app.use('/', authRoutes);
app.use('/dieticians', dieticianRoutes); // shifted prefix to avoid route collision
app.use('/appointments', appointmentRoutes);
app.use('/admin', adminRoutes);

// homepage
app.get('/', (req, res) => {
  res.render('index');
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Something broke! ' + err.message);
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
