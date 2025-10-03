// server/controllers/adminSupportController.js
const SupportTicket = require('../models/SupportTicket');
const Admin = require('../models/Admin');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

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

// Update a ticket (add reply, change status, assign)
exports.updateTicket = async (req, res) => {
    const { status, assignedTo, replyMessage } = req.body;

    try {
        const ticket = await SupportTicket.findById(req.params.id).populate('user');
        if (!ticket) {
            return res.status(404).json({ msg: 'Ticket not found' });
        }
        
        let updated = false;

        if (status && ticket.status !== status) {
            ticket.status = status;
            updated = true;
        }

        if (assignedTo !== undefined) {
             ticket.assignedTo = assignedTo ? assignedTo : null;
             updated = true;
        }

        if (replyMessage) {
            const reply = {
                sender: req.user.id,
                senderType: 'Admin',
                message: replyMessage,
                attachments: req.files ? req.files.map(file => ({
                    fileName: file.originalname,
                    filePath: file.path,
                    fileType: file.mimetype
                })) : []
            };
            ticket.conversation.push(reply);
            updated = true;
        }
        
        if (updated) {
            await ticket.save();

            // --- Email Notification to User ---
            if(replyMessage || status){
                await sendEmail({
                    to: ticket.user.email,
                    subject: `Update on your ticket #${ticket.ticketNumber}`,
                    html: `<p>Hello ${ticket.user.firstName},</p>
                           <p>There's an update on your support ticket.</p>
                           ${replyMessage ? `<p><b>Message from Support:</b> ${replyMessage}</p>` : ''}
                           ${status ? `<p><b>New Status:</b> ${status}</p>` : ''}
                           <p>You can view the ticket and reply by logging into your account.</p>`
                });
            }
        }
        
        // Populate again to return the full object
        const populatedTicket = await SupportTicket.findById(ticket._id)
            .populate('user', 'firstName lastName email')
            .populate('category', 'name')
            .populate('assignedTo', 'firstName lastName')
            .populate('conversation.sender');
            
        res.json(populatedTicket);

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
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};