const Appointment = require('../models/Appointment');
const Dietician = require('../models/Dietician');
const User = require('../models/User');
const transporter = require('../utils/mailer'); // Gmail sender
const Razorpay = require('razorpay');


// -----------------------------------------------------
// BOOKING PAGE
// -----------------------------------------------------
exports.bookPage = async (req, res) => {
  try {
    if (!req.session.user) {
      req.session.error = "Please login before booking";
      return res.redirect('/login');
    }

    const dietician = await Dietician.findById(req.params.id)
      .populate('user')
      .lean();

    if (!dietician) {
      req.session.error = "Dietician not found";
      return res.redirect('/dieticians');
    }

    res.render('appointment-book', { dietician });
  } catch (err) {
    console.error("BOOK PAGE ERROR:", err);
    req.session.error = "Cannot load booking page";
    res.redirect('/dieticians');
  }
};

// -----------------------------------------------------
// CREATE APPOINTMENT (STEP 0: Show checkout page)
// -----------------------------------------------------
exports.create = async (req, res) => {
  try {
    if (!req.session.user) {
      req.session.error = 'You must be logged in to book';
      return res.redirect('/login');
    }

    const { dieticianId, date, mode, notes } = req.body;
    const dietician = await Dietician.findById(dieticianId).populate('user').lean();

    if (!dietician) throw new Error("Dietician not found");

    // Render checkout page with appointment info
    res.render('checkout', { dietician, date, mode, notes });
  } catch (err) {
    console.error("APPOINTMENT CREATE ERROR:", err);
    req.session.error = 'Failed to start booking';
    res.redirect('back');
  }
};

// -----------------------------------------------------
// USER APPOINTMENT LIST
// -----------------------------------------------------
exports.myAppointments = async (req, res) => {
  try {
    if (!req.session.user) {
      req.session.error = 'Login first';
      return res.redirect('/login');
    }

    const appts = await Appointment.find({ user: req.session.user.id })
      .populate({
        path: 'dietician',
        populate: { path: 'user', select: 'name email phone' }
      })
      .lean();

    res.render('my-appointments', { appointments: appts });
  } catch (err) {
    console.error("APPOINTMENT LOAD ERROR:", err);
    req.session.error = "Cannot load appointments";
    res.redirect('/');
  }
};

// -----------------------------------------------------
// CANCEL APPOINTMENT
// -----------------------------------------------------
exports.cancel = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/login');

    const appt = await Appointment.findOne({
      _id: req.params.id,
      user: req.session.user.id
    });

    if (!appt) {
      req.session.error = "Appointment not found";
      return res.redirect('/appointments/my');
    }

    appt.status = 'cancelled';
    appt.cancelReason = req.body.reason || "No reason provided";
    await appt.save();

    req.session.success = "Appointment cancelled successfully!";
    res.redirect('/appointments/my');
  } catch (err) {
    console.error("CANCEL ERROR:", err);
    req.session.error = "Could not cancel appointment";
    res.redirect('/appointments/my');
  }
};

// -----------------------------------------------------
// SEND REMINDER
// -----------------------------------------------------
exports.sendReminder = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/login');

    const appt = await Appointment.findOne({
      _id: req.params.id,
      user: req.session.user.id
    }).populate({
      path: "dietician",
      populate: { path: "user", select: "email name" }
    });

    if (!appt) {
      req.session.error = "Appointment not found";
      return res.redirect('/appointments/my');
    }

    // Email to dietician
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: appt.dietician.user.email,
      subject: "Appointment Reminder 🔔",
      html: `
        <h2>Reminder from user ${req.session.user.name}</h2>
        <p>They would like to remind you about the upcoming appointment.</p>
        <p><strong>Date:</strong> ${appt.date.toDateString()}</p>
      `
    });

    appt.lastReminderAt = new Date();
    await appt.save();

    req.session.success = "Reminder sent!";
    res.redirect('/appointments/my');
  } catch (err) {
    console.error("REMINDER ERROR:", err);
    req.session.error = "Could not send reminder";
    res.redirect('/appointments/my');
  }
};

// -----------------------------------------------------
// STEP 1: Show checkout page (from checkout button)
// -----------------------------------------------------
exports.showCheckout = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/login');

    const { dieticianId, date, mode, notes } = req.body;
    const dietician = await Dietician.findById(dieticianId).populate('user').lean();

    if (!dietician) throw new Error("Dietician not found");

    res.render('checkout', { dietician, date, mode, notes });
  } catch (err) {
    console.error("CHECKOUT ERROR:", err);
    req.session.error = err.message;
    res.redirect('back');
  }
};

// -----------------------------------------------------
// STEP 2: Process payment & create appointment
// -----------------------------------------------------
exports.processPayment = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/login');

    const { dieticianId, date, mode, notes } = req.body;

    // Simulate payment success
    const paymentConfirmed = true;

    // Create appointment after payment
    const appt = await Appointment.create({
      user: req.session.user.id,
      dietician: dieticianId,
      date: new Date(date),
      mode,
      notes,
      paymentConfirmed,
      status: 'booked'
    });

    // Fetch user & dietician for emails
    const user = await User.findById(req.session.user.id).lean();
    const dietician = await Dietician.findById(dieticianId).populate('user').lean();

    if (user && dietician) {
      // Email to USER
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: user.email,
        subject: "Appointment Booked ✔",
        html: `
          <h2>Your appointment is confirmed!</h2>
          <p>You booked <strong>${dietician.user.name}</strong>.</p>
          <p><strong>Date:</strong> ${new Date(date).toDateString()}</p>
          <p><strong>Mode:</strong> ${mode}</p>
        `
      });

      // Email to DIETICIAN
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: dietician.user.email,
        subject: "New Appointment Request 🔔",
        html: `
          <h2>You have a new appointment!</h2>
          <p>User <strong>${user.name}</strong> booked you.</p>
          <p><strong>Date:</strong> ${new Date(date).toDateString()}</p>
          <p><strong>Mode:</strong> ${mode}</p>
        `
      });
    }

    req.session.success = "Payment successful! Appointment booked.";
    res.redirect('/appointments/my');
  } catch (err) {
    console.error("PAYMENT ERROR:", err);
    req.session.error = "Payment failed or booking failed";
    res.redirect('back');
  }
};

// -----------------------------------------------------
// CREATE RAZORPAY ORDER
// -----------------------------------------------------
exports.createOrder = async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ error: "Login required" });

    const { dieticianId, date, mode, notes } = req.body;

    // Fetch dietician fee
    const dietician = await Dietician.findById(dieticianId).lean();
    if (!dietician) return res.status(404).json({ error: "Dietician not found" });

    // Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    // Create order (amount in paise)
    const order = await razorpay.orders.create({
      amount: dietician.fee * 100, // ₹ to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    });

    // Send order details to frontend
    res.json(order);

  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
};
