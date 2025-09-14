// server/models/SupportTicket.js
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const replySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    attachments: [{
        fileName: String,
        filePath: String,
        fileType: String,
    }],
}, { timestamps: true });




const SupportTicketSchema = new mongoose.Schema({
 user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportTicketCategory', required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    attachments: [{
        fileName: String,
        filePath: String,
        fileType: String,
    }],
    status: { 
        type: String, 
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'], 
        default: 'Open' 
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    conversation: [replySchema],
}, { timestamps: true });

SupportTicketSchema.plugin(AutoIncrement, { inc_field: 'ticketNumber', start_seq: 1000 });



module.exports = mongoose.model('SupportTicket', SupportTicketSchema);

