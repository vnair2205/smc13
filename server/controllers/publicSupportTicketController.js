// server/controllers/publicSupportTicketController.js
const SupportTicket = require('../models/SupportTicket');
const SupportTicketCategory = require('../models/SupportTicketCategory');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User'); 

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/tickets';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('File type not allowed!'), false);
};

exports.upload = multer({ storage, fileFilter, limits: { fileSize: 1024 * 1024 * 5 } }); // 5MB limit

exports.createTicket = async (req, res) => {
  const { category, subject, description, priority } = req.body;
  try {
    const newTicket = new SupportTicket({
      user: req.user.id,
      category,
      subject,
      description,
      priority,
      attachments: req.files.map(file => ({
        fileName: file.originalname,
        filePath: file.path,
        fileType: file.mimetype
      }))
    });
    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (err) {
    console.error('Error creating ticket:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};


exports.getTicketByIdForUser = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user', 'firstName lastName')
      .populate('category', 'name')
      .populate('assignedTo', 'firstName lastName')
      .populate('conversation.user', 'firstName lastName');

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    if (ticket.user._id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'User not authorized' });
    }
    res.json(ticket);
  } catch (err) {
    console.error('!!! [ERROR] fetching ticket by ID for user:', err.message);
    res.status(500).send('Server Error');
  }
};

exports.createTicket = async (req, res) => {
  const { category, subject, description, priority } = req.body;
  try {
    const newTicket = new SupportTicket({
      user: req.user.id,
      category,
      subject,
      description,
      priority,
      attachments: req.files ? req.files.map(file => ({
        fileName: file.originalname,
        filePath: file.path,
        fileType: file.mimetype
      })) : []
    });
    await newTicket.save();

    // --- START EMAIL NOTIFICATION ---
    const user = await User.findById(req.user.id);
    const admins = await Admin.find({});

    // Email to user
    const userSubject = `SeekMYCOURSE Support - Ticket #${newTicket.ticketNumber} Created`;
    const userHtml = `
      <p>Dear ${user.firstName},</p>
      <p>Thank you for contacting SeekMYCOURSE support. Your ticket has been created successfully.</p>
      <p><b>Ticket ID:</b> ${newTicket.ticketNumber}</p>
      <p><b>Subject:</b> ${newTicket.subject}</p>
      <p>Our team will get back to you shortly.</p>
      <p>Best Regards,<br/>The SeekMYCOURSE Team</p>
    `;
    await sendEmail(user.email, userSubject, userHtml);

    // Email to admins
    const adminSubject = `New Support Ticket #${newTicket.ticketNumber} Created`;
    const adminHtml = `
      <p>A new support ticket has been created by ${user.firstName} ${user.lastName} (${user.email}).</p>
      <p><b>Ticket ID:</b> ${newTicket.ticketNumber}</p>
      <p><b>Subject:</b> ${newTicket.subject}</p>
      <p><b>Description:</b></p>
      <p>${newTicket.description}</p>
      <p>Please log in to the admin panel to view and respond to the ticket.</p>
    `;
    admins.forEach(admin => {
      sendEmail(admin.email, adminSubject, adminHtml);
    });
    // --- END EMAIL NOTIFICATION ---

    res.status(201).json(newTicket);
  } catch (err) {
    console.error('Error creating ticket:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

exports.addReplyToTicket = async (req, res) => {
  const { replyMessage } = req.body;

  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    if (ticket.user.toString() !== req.user.id) {
        return res.status(403).json({ msg: 'User not authorized' });
    }

    const reply = {
      user: req.user.id,
      onModel: 'User',
      message: replyMessage,
      attachments: req.files ? req.files.map(file => ({
        fileName: file.originalname,
        filePath: file.path,
        fileType: file.mimetype
      })) : []
    };
    ticket.conversation.push(reply);
    await ticket.save();

    // --- START EMAIL NOTIFICATION ---
    const user = await User.findById(req.user.id);
    const admins = await Admin.find({});

    const adminSubject = `New Reply on Ticket #${ticket.ticketNumber}`;
    const adminHtml = `
      <p>A new reply has been added to ticket #${ticket.ticketNumber} by ${user.firstName} ${user.lastName} (${user.email}).</p>
      <p><b>Message:</b></p>
      <p>${replyMessage}</p>
      <p>Please log in to the admin panel to view and respond to the ticket.</p>
    `;
    admins.forEach(admin => {
      sendEmail(admin.email, adminSubject, adminHtml);
    });
    // --- END EMAIL NOTIFICATION ---

    res.json(ticket);
  } catch (err) {
    console.error('Error adding reply to ticket:', err.message);
    res.status(500).send('Server Error');
  }
};

exports.getUserTickets = async (req, res) => {
  try {
    const { sortBy = 'newest', search = '' } = req.query;
    const query = { user: req.user.id };
    if (search) {
      query.ticketNumber = parseInt(search, 10);
    }
    const sortOption = sortBy === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const tickets = await SupportTicket.find(query).sort(sortOption).populate('category', 'name');
    res.json(tickets);
  } catch (err) {
    console.error('Error fetching user tickets:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

exports.getSupportCategories = async (req, res) => {
  try {
    const categories = await SupportTicketCategory.find().sort({ name: 1 });
    if (!categories) {
        return res.status(404).json({ msg: 'Categories not found' });
    }
    res.json(categories);
  } catch (err) {
    console.error('Error fetching support categories:', err.message);
    res.status(500).send('Server Error');
  }
};


// Get a single ticket by ID for the logged-in user
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.ticketId)
      .populate('category', 'name')
      .populate({
        path: 'conversation.user',
        select: 'firstName lastName' // Populate user info for conversation
      });

    // Ensure the ticket exists and belongs to the user
    if (!ticket || ticket.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (err) {
    console.error('Error fetching ticket by ID:', err.message);
    res.status(500).send('Server Error');
  }
};

// --- NEW FUNCTION ---
// Add a reply to a ticket
exports.addReplyToTicket = async (req, res) => {
  const { message } = req.body;

  try {
    const ticket = await SupportTicket.findById(req.params.ticketId);

    // Ensure the ticket exists and belongs to the user
    if (!ticket || ticket.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    // Check if the ticket status allows replies
    if (!['Open', 'In Progress', 'Resolved'].includes(ticket.status)) {
        return res.status(400).json({ msg: 'This ticket is closed and cannot be replied to.' });
    }

    const newReply = {
      user: req.user.id,
      message,
      attachments: req.files ? req.files.map(file => ({
        fileName: file.originalname,
        filePath: file.path,
        fileType: file.mimetype
      })) : []
    };

    ticket.conversation.push(newReply);
    
    // If the user replies to a "Resolved" ticket, you might want to reopen it
    if (ticket.status === 'Resolved') {
        ticket.status = 'In Progress';
    }

    await ticket.save();

    // Repopulate the conversation to include the new user details
    const populatedTicket = await SupportTicket.findById(ticket._id)
      .populate('category', 'name')
      .populate('conversation.user', 'firstName lastName');

    res.json(populatedTicket);

  } catch (err) {
    console.error('Error adding reply to ticket:', err.message);
    res.status(500).send('Server Error');
  }
};

