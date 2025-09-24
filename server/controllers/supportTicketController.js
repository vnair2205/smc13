// server/controllers/supportTicketController.js
const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const Admin = require('../models/Admin');
const sendEmail = require('../utils/sendEmail');

// @desc    Create a new support ticket for the logged-in user
// @route   POST /api/support
// @access  Private
exports.createTicketForUser = async (req, res) => {
    // Note: 'description' from the old form is now 'message'
    const { category, subject, message, priority } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const newTicket = new SupportTicket({
            user: req.user.id, // Automatically associate the ticket with the logged-in user
            category,
            subject,
            description: message, // Map 'message' from form to 'description' in model
            priority,
            attachments: req.files ? req.files.map(file => ({
                fileName: file.originalname,
                filePath: file.path,
                fileType: file.mimetype
            })) : []
        });

        const ticket = await newTicket.save();

        // --- Email Notification Logic (Restored) ---
        await sendEmail({
            to: user.email,
            subject: `Ticket #${ticket.ticketNumber} Created Successfully`,
            html: `<p>Hello ${user.firstName},</p><p>Your support ticket has been created. Our team will get back to you shortly.</p><p><b>Subject:</b> ${ticket.subject}</p>`
        });
        
        const admins = await Admin.find().select('email');
        const adminEmails = admins.map(admin => admin.email);
        if (adminEmails.length > 0) {
            await sendEmail({
                to: adminEmails.join(','),
                subject: `New Ticket #${ticket.ticketNumber} from ${user.firstName}`,
                html: `<p>A new support ticket has been created by ${user.firstName} ${user.lastName} (${user.email}).</p><p><b>Subject:</b> ${ticket.subject}</p>`
            });
        }
        
        res.status(201).json(ticket);

    } catch (err) {
        console.error('Error in createTicketForUser:', err.message);
        res.status(500).send('Server Error');
    }
};