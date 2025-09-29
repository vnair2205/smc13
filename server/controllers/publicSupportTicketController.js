// server/controllers/publicSupportTicketController.js
const SupportTicket = require('../models/SupportTicket');
const SupportTicketCategory = require('../models/SupportTicketCategory');
const Admin = require('../models/Admin');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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




exports.upload = multer({ storage, fileFilter, limits: { fileSize: 1024 * 1024 * 5 } });


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
    const savedTicket = await newTicket.save();

// --- Email Notifications ---
    const user = await User.findById(req.user.id);
    const admins = await Admin.find().select('email');
    const adminEmails = admins.map(admin => admin.email);

    // 1. To User
    await sendEmail({
        to: user.email,
        subject: `Ticket #${savedTicket.ticketNumber} Created`,
        html: `<p>Hello ${user.firstName},</p><p>Your support ticket has been successfully created. We will get back to you shortly.</p><p><b>Subject:</b> ${subject}</p>`
    });

    // 2. To Admins
    if(adminEmails.length > 0) {
        await sendEmail({
            to: adminEmails.join(','),
            subject: `New Support Ticket #${savedTicket.ticketNumber}`,
            html: `<p>A new support ticket has been created by ${user.firstName} ${user.lastName}.</p><p><b>Subject:</b> ${subject}</p><p>Please log in to the admin panel to view the ticket.</p>`
        });
    }

    res.status(201).json(savedTicket);
  } catch (err) {
    console.error('Error creating ticket:', err.message);
    res.status(500).json({ msg: 'Server Error' });
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


exports.getTicketByIdForUser = async (req, res) => {
    try {
        const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user.id })
            .populate('category', 'name')
            .populate('conversation.sender');
            
        if (!ticket) {
            return res.status(404).json({ msg: 'Ticket not found' });
        }
        res.json(ticket);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.addUserReply = async (req, res) => {
    const { message } = req.body;
    try {
        const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user.id });
        if (!ticket) {
            return res.status(404).json({ msg: 'Ticket not found' });
        }

        const reply = {
            sender: req.user.id,
            senderType: 'User',
            message,
            attachments: req.files ? req.files.map(file => ({
                fileName: file.originalname,
                filePath: file.path,
                fileType: file.mimetype
            })) : []
        };
        ticket.conversation.push(reply);
        ticket.status = 'Open'; // Re-open ticket on user reply
        const savedTicket = await ticket.save();

        // --- Email Notification to Admins ---
        const user = await User.findById(req.user.id);
        const admins = await Admin.find().select('email');
        const adminEmails = admins.map(admin => admin.email);

        if(adminEmails.length > 0) {
            await sendEmail({
                to: adminEmails.join(','),
                subject: `New Reply on Ticket #${ticket.ticketNumber}`,
                html: `<p>User ${user.firstName} ${user.lastName} has replied to ticket #${ticket.ticketNumber}.</p><p><b>Message:</b> ${message}</p>`
            });
        }

        res.json(savedTicket);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


exports.getSupportCategories = async (req, res) => {
  try {
    const categories = await SupportTicketCategory.find();
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};