const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");

exports.bookForm = async (req, res) => {
  const dietician = await User.findById(req.params.did);
  res.render("appointments/book", { dietician });
};

exports.book = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/login");
    const { did } = req.params;
    const { date, timeSlot, notes } = req.body;
    const appt = new Appointment({
      user: req.session.user.id,
      dietician: did,
      date: new Date(date),
      timeSlot, notes, paymentStatus: "pending"
    });
    await appt.save();
    res.redirect(`/appointments/${appt._id}/pay`);
  } catch (err) { res.send(err.message); }
};

exports.payPage = async (req, res) => {
  const appt = await Appointment.findById(req.params.id).populate("dietician");
  res.render("appointments/payment", { appt });
};

exports.mockPay = async (req, res) => {
  await Appointment.findByIdAndUpdate(req.params.id, { paymentStatus: "paid", status: "confirmed" });
  res.redirect("/appointments/my");
};

exports.myAppointments = async (req,res) => {
  if (!req.session.user) return res.redirect("/login");
  const userId = req.session.user.id;
  const appts = await Appointment.find({ user: userId }).populate("dietician");
  res.render("appointments/my", { appts });
};
