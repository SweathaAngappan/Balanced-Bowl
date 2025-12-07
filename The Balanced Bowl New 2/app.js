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
const userRoutes = require('./src/routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;


connectDB();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Session setup
app.use(session({
  name: 'bb.sid.v3',
  secret: 'SuperSecret_' + Date.now(),
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Flash-like locals
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

// Auth (must be first for /register, /login)
app.use('/', authRoutes);

// Miscellaneous
app.use('/', miscRoutes);

// Dieticians (plural now, /dieticians works)
app.use('/dieticians', dieticianRoutes);

// Appointments
app.use('/appointments', appointmentRoutes);

// User
app.use('/user', userRoutes);

// Admin
app.use('/admin', adminRoutes);

// Homepage
app.get('/', (req, res) => {
  res.render('index');
});


// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Something broke! ' + err.message);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
