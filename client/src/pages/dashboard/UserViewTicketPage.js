// client/src/pages/dashboard/UserViewTicketPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import * as supportService from '../../services/supportService';
import Preloader from '../../components/common/Preloader';
import { format } from 'date-fns';
import { FiPaperclip, FiSend } from 'react-icons/fi';


// --- STYLED COMPONENTS (with the fix) ---
const PageContainer = styled.div` padding: 2rem; color: ${({ theme }) => theme.colors.text}; `;
const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #000;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  &:disabled { background-color: #555; cursor: not-allowed; }
`;
const Card = styled.div` background: #1e1e2d; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; `;
const CardTitle = styled.h3` margin-top: 0; border-bottom: 1px solid #444; padding-bottom: 1rem; margin-bottom: 1rem; `;
const InfoGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; `;
const InfoItem = styled.div` strong { display: block; color: #a0a0a0; margin-bottom: 0.5rem; } `;
const ConversationArea = styled.div` margin-top: 2rem; `;
const MessageCard = styled.div`
  background: ${({ fromAdmin }) => (fromAdmin ? '#2a2a3e' : '#2c3e50')};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 3px solid ${({ fromAdmin, theme }) => (fromAdmin ? theme.colors.primary : '#3498db')};
`;
const MessageHeader = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; color: #a0a0a0; font-size: 0.9rem; `;
const Textarea = styled.textarea` width: 100%; padding: 0.75rem; background-color: #2a2a3e; border: 1px solid #444; color: white; border-radius: 6px; min-height: 120px; resize: vertical; `;
const FileInput = styled.input` margin-top: 1rem; display: block; `;
const AttachmentLink = styled.a`
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-right: 1rem;
    &:hover { text-decoration: underline; }
`;

// --- FIX: Add a new component for the message body ---
const MessageBody = styled.p`
    white-space: pre-wrap; /* This preserves line breaks */
    word-wrap: break-word;   /* This ensures long text wraps */
    margin: 0;
`;


const UserViewTicketPage = () => {
    const { ticketId } = useParams();
    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [replyMessage, setReplyMessage] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [isReplying, setIsReplying] = useState(false);

    const fetchTicket = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await supportService.getTicketById(ticketId); //
            setTicket(data);
        } catch (error) {
            console.error("Failed to fetch ticket:", error);
        } finally {
            setIsLoading(false);
        }
    }, [ticketId]);

    useEffect(() => {
        fetchTicket();
    }, [fetchTicket]);

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if(!replyMessage.trim()) return;

        setIsReplying(true);
        const formData = new FormData();
        formData.append('message', replyMessage);
        for (let i = 0; i < attachments.length; i++) {
            formData.append('attachments', attachments[i]);
        }

        try {
            await supportService.addReply(ticketId, formData); //
            setReplyMessage('');
            setAttachments([]);
            fetchTicket();
        } catch (error) {
            console.error('Failed to submit reply', error);
        } finally {
            setIsReplying(false);
        }
    };

    if (isLoading) return <Preloader />;
    if (!ticket) return <PageContainer><h2>Ticket not found.</h2><Link to="/support-tickets">Go Back</Link></PageContainer>;

    const canReply = ticket.status !== 'Closed' && ticket.status !== 'Resolved';

    return (
        <PageContainer>
            <Link to="/support-tickets">← Back to All Tickets</Link>
            <h1 style={{ marginTop: '1rem' }}>Ticket #{ticket.ticketNumber} - {ticket.subject}</h1>

            <Card>
                <CardTitle>Ticket Details</CardTitle>
                <InfoGrid>
                    <InfoItem><strong>Category:</strong> {ticket.category?.name}</InfoItem>
                    <InfoItem><strong>Priority:</strong> {ticket.priority}</InfoItem>
                    <InfoItem><strong>Status:</strong> {ticket.status}</InfoItem>
                    <InfoItem><strong>Created On:</strong> {format(new Date(ticket.createdAt), 'PPp')}</InfoItem>
                </InfoGrid>
            </Card>

            <ConversationArea>
                <CardTitle>Conversation</CardTitle>
                <MessageCard>
                    <MessageHeader>
                        <span>You</span>
                        <span>{format(new Date(ticket.createdAt), 'PPp')}</span>
                    </MessageHeader>
                    {/* --- FIX: Use the MessageBody component --- */}
                    <MessageBody>{ticket.description}</MessageBody>
                    {ticket.attachments?.length > 0 && (
                        <div>
                            {ticket.attachments.map((att, idx) => (
                                <AttachmentLink href={`http://localhost:5000/${att.filePath}`} target="_blank" rel="noopener noreferrer" key={idx}><FiPaperclip /> {att.fileName}</AttachmentLink>
                            ))}
                        </div>
                    )}
                </MessageCard>
                
                {ticket.conversation.map(reply => (
                    <MessageCard key={reply._id} fromAdmin={reply.senderType === 'Admin'}>
                        <MessageHeader>
                            <span>{reply.senderType === 'Admin' ? 'Seek Support' : 'You'}</span>
                            <span>{format(new Date(reply.createdAt), 'PPp')}</span>
                        </MessageHeader>
                        {/* --- FIX: Use the MessageBody component --- */}
                        <MessageBody>{reply.message}</MessageBody>
                        {reply.attachments?.length > 0 && (
                            <div>
                                {reply.attachments.map((att, idx) => (
                                    <AttachmentLink href={`http://localhost:5000/${att.filePath}`} target="_blank" rel="noopener noreferrer" key={idx}><FiPaperclip /> {att.fileName}</AttachmentLink>
                                ))}
                            </div>
                        )}
                    </MessageCard>
                ))}
            </ConversationArea>

            {canReply && (
                 <Card as="form" onSubmit={handleReplySubmit}>
                    <CardTitle>Your Reply</CardTitle>
                    <Textarea
                        placeholder="Type your reply here..."
                        value={replyMessage}
                        onChange={e => setReplyMessage(e.target.value)}
                        required
                    />
                    <FileInput type="file" multiple onChange={e => setAttachments(e.target.files)} />
                    <Button type="submit" disabled={isReplying} style={{ marginTop: '1rem' }}>
                        <FiSend /> {isReplying ? 'Sending...' : 'Send Reply'}
                    </Button>
                </Card>
            )}
        </PageContainer>
    );
};

export default UserViewTicketPage;