// server/controllers/adminSupportController.js
const SupportTicket = require('../models/SupportTicket');
const Admin = require('../models/Admin');
const User = require('../models/User');

// Get all support tickets for admin view
exports.getAllTickets = async (req, res) => {
    try {
        const { sortBy = 'newest', category = '', search = '', status = '' } = req.query;

        let query = {};
        if (category) query.category = category;
        if (status) query.status = status;
        if (search) {
            const searchNum = parseInt(search, 10);
            if (!isNaN(searchNum)) {
                query.ticketNumber = searchNum;
            }
        }
        
        const sortOption = sortBy === 'oldest' ? { updatedAt: 1 } : { updatedAt: -1 };

        const tickets = await SupportTicket.find(query)
            .populate('user', 'firstName lastName')
            .populate('category', 'name')
            .populate('assignedTo', 'firstName lastName')
            .sort(sortOption);

        res.json(tickets);
    } catch (err) {
        console.error('Error fetching tickets for admin:', err.message);
        res.status(500).send('Server Error');
    }
};

// Get a single ticket by ID
exports.getTicketById = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id)
            .populate('user', 'firstName lastName email')
            .populate('category', 'name')
            .populate('assignedTo', 'firstName lastName')
            .populate('conversation.user', 'firstName lastName');
        
        if (!ticket) {
            return res.status(404).json({ msg: 'Ticket not found' });
        }
        res.json(ticket);
    } catch (err) {
        console.error('Error fetching ticket by ID:', err.message);
        res.status(500).send('Server Error');
    }
};

// Update a ticket (add reply, change status, assign)
exports.updateTicket = async (req, res) => {
    const { replyMessage, status, assignedTo } = req.body;

    try {
        const ticket = await SupportTicket.findById(req.params.id).populate('user', 'firstName email');
        if (!ticket) {
            return res.status(404).json({ msg: 'Ticket not found' });
        }

        if (status) {
            ticket.status = status;
        }

        if (assignedTo) {
            ticket.assignedTo = assignedTo;
        } else if (assignedTo === '') { // Allow unassigning
            ticket.assignedTo = null;
        }

        if (replyMessage) {
            const reply = {
                user: req.user.id,
                onModel: 'Admin',
                message: replyMessage,
                attachments: req.files ? req.files.map(file => ({
                    fileName: file.originalname,
                    filePath: file.path,
                    fileType: file.mimetype
                })) : []
            };
            ticket.conversation.push(reply);

            // --- START EMAIL NOTIFICATION ---
            const userSubject = `Re: Your Support Ticket #${ticket.ticketNumber} has been updated`;
            const userHtml = `
              <p>Dear ${ticket.user.firstName},</p>
              <p>A new reply has been added to your support ticket #${ticket.ticketNumber}.</p>
              <p><b>Message from our team:</b></p>
              <p>${replyMessage}</p>
              <p>You can view the full conversation by logging into your SeekMYCOURSE account.</p>
              <p>Best Regards,<br/>The SeekMYCOURSE Team</p>
            `;
            await sendEmail(ticket.user.email, userSubject, userHtml);
            // --- END EMAIL NOTIFICATION ---
        }

        await ticket.save();
        res.json(ticket);
    } catch (err) {
        console.error('Error updating ticket:', err.message);
        res.status(500).send('Server Error');
    }
};

// Get a list of all admins
exports.getAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('firstName lastName');
        res.json(admins);
    } catch (err) {
        console.error('Error fetching admins:', err.message);
        res.status(500).send('Server Error');
    }
};