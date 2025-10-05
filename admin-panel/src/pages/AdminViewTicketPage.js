// admin-panel/src/pages/AdminViewTicketPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import * as supportService from '../services/supportService';
import Preloader from '../components/common/Preloader';
import { format } from 'date-fns';
import { FiPaperclip } from 'react-icons/fi';

// --- STYLED COMPONENTS (with the fix) ---
const PageContainer = styled.div` padding: 2rem; `;
const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #000;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  &:disabled { background-color: #555; cursor: not-allowed; }
`;
const Card = styled.div`
  background: #1e1e2d;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;
const CardTitle = styled.h3`
  margin-top: 0;
  border-bottom: 1px solid #444;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;
const InfoItem = styled.div`
  strong { display: block; color: #888; margin-bottom: 0.5rem; }
`;
const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  background-color: #2a2a3e;
  border: 1px solid #444;
  color: white;
  border-radius: 6px;
  min-height: 150px;
  resize: vertical;
`;
const ConversationArea = styled.div` margin-top: 2rem; `;

const MessageCard = styled.div`
  background: ${({ fromAdmin }) => (fromAdmin ? '#2a2a3e' : '#2c3e50')};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 3px solid ${({ fromAdmin, theme }) => (fromAdmin ? theme.colors.primary : '#3498db')};
`;

const MessageHeader = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; color: #a0a0a0; font-size: 0.9rem; `;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  background-color: #2a2a3e;
  border: 1px solid #444;
  color: white;
  border-radius: 6px;
`;
const FileInput = styled.input`
  margin-top: 1rem;
  display: block;
`;

// --- FIX: Add a new component for the message body ---
const MessageBody = styled.p`
    white-space: pre-wrap; /* This preserves line breaks */
    word-wrap: break-word;   /* This ensures long text wraps */
    margin: 0;
`;


const AdminViewTicketPage = () => {
    const { ticketId } = useParams();
    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [admins, setAdmins] = useState([]);
    
    // State for the management form
    const [status, setStatus] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [replyMessage, setReplyMessage] = useState('');
    const [attachments, setAttachments] = useState(null);

    const fetchTicketData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [ticketRes, adminsRes] = await Promise.all([
                supportService.getTicketById(ticketId),
                supportService.getAdmins()
            ]);
            setTicket(ticketRes.data);
            setAdmins(adminsRes.data);
            // Initialize form state
            setStatus(ticketRes.data.status);
            setAssignedTo(ticketRes.data.assignedTo?._id || '');
        } catch (error) {
            console.error("Failed to fetch ticket data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [ticketId]);

    useEffect(() => {
        fetchTicketData();
    }, [fetchTicketData]);

    const handleUpdateTicket = async () => {
        setIsUpdating(true);
        const formData = new FormData();
        
        formData.append('status', status);
        formData.append('assignedTo', assignedTo);
        if (replyMessage) formData.append('replyMessage', replyMessage);
        
        if (attachments) {
            for (let i = 0; i < attachments.length; i++) {
                formData.append('attachments', attachments[i]);
            }
        }

        try {
            const { data } = await supportService.updateTicket(ticketId, formData);
            setTicket(data); // Update with the latest ticket data from server
            setReplyMessage('');
            setAttachments(null);
            document.getElementById('file-input').value = ''; // Reset file input
        } catch (error) {
            console.error('Failed to update ticket:', error);
            alert('Failed to update ticket. Check console for details.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) return <Preloader />;
    if (!ticket) return <PageContainer><h2>Ticket not found.</h2></PageContainer>;

    return (
        <PageContainer>
            <Link to="/support-tickets">← Back to All Tickets</Link>
            <h1 style={{ marginTop: '1rem' }}>Ticket #{ticket.ticketNumber}</h1>
            
            <Grid>
                <Card>
                    <CardTitle>Ticket Details</CardTitle>
                    <InfoItem><strong>User:</strong> {`${ticket.user.firstName} ${ticket.user.lastName}`} ({ticket.user.email})</InfoItem>
                    <InfoItem><strong>Category:</strong> {ticket.category?.name}</InfoItem>
                    <InfoItem><strong>Priority:</strong> {ticket.priority}</InfoItem>
                    <InfoItem><strong>Subject:</strong> {ticket.subject}</InfoItem>
                    {/* --- FIX: Use the MessageBody component --- */}
                    <InfoItem><strong>Description:</strong> <MessageBody>{ticket.description}</MessageBody></InfoItem>
                    {ticket.attachments.length > 0 && (
                        <InfoItem><strong>Attachments:</strong>
                         {ticket.attachments.map((att, idx) => (
                                <a href={`http://localhost:5000/${att.filePath}`} target="_blank" rel="noopener noreferrer" key={idx}><FiPaperclip /> {att.fileName}</a>
                            ))}
                        </InfoItem>
                    )}
                </Card>
                <Card>
                    <CardTitle>Manage Ticket</CardTitle>
                    <InfoItem>
                        <strong>Assign To:</strong>
                        <Select value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
                            <option value="">Unassigned</option>
                            {admins.map(admin => (
                                <option key={admin._id} value={admin._id}>{`${admin.firstName} ${admin.lastName}`}</option>
                            ))}
                        </Select>
                    </InfoItem>
                    <InfoItem>
                        <strong>Status:</strong>
                        <Select value={status} onChange={e => setStatus(e.target.value)}>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </Select>
                    </InfoItem>
                </Card>
            </Grid>

            <ConversationArea>
                <CardTitle>Conversation</CardTitle>
                 {ticket.conversation.map(reply => (
                    <MessageCard key={reply._id} fromAdmin={reply.senderType === 'Admin'}>
                        <MessageHeader>
                            <span>{reply.senderType === 'Admin' ? `${reply.sender.firstName} ${reply.sender.lastName}` : `${ticket.user.firstName} ${ticket.user.lastName}`}</span>
                            <span>{format(new Date(reply.createdAt), 'PPp')}</span>
                        </MessageHeader>
                        {/* --- FIX: Use the MessageBody component --- */}
                        <MessageBody>{reply.message}</MessageBody>
                        {reply.attachments.length > 0 && (
                        <div>
                            {reply.attachments.map((att, idx) => (
                                <a href={`http://localhost:5000/${att.filePath}`} target="_blank" rel="noopener noreferrer" key={idx}><FiPaperclip /> {att.fileName}</a>
                            ))}
                        </div>
                    )}
                    </MessageCard>
                ))}
            </ConversationArea>

            <Card>
                <CardTitle>Your Reply</CardTitle>
                <Textarea
                    placeholder="Type your reply here..."
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                />
                <FileInput id="file-input" type="file" multiple onChange={e => setAttachments(e.target.files)} />
                <Button onClick={handleUpdateTicket} disabled={isUpdating} style={{ marginTop: '1rem' }}>
                    {isUpdating ? 'Updating...' : 'Update Ticket'}
                </Button>
            </Card>
        </PageContainer>
    );
};

export default AdminViewTicketPage;