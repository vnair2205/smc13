// client/src/pages/dashboard/UserViewTicketPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import * as supportService from '../../services/supportService';
import Preloader from '../../components/common/Preloader';
import { format } from 'date-fns';
import { FiPaperclip } from 'react-icons/fi';

// --- STYLED COMPONENTS (No changes needed here) ---
const PageContainer = styled.div`
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text};
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
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
`;
const TicketInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;
const InfoItem = styled.div`
  strong { display: block; color: #888; margin-bottom: 0.5rem; }
`;
const Description = styled.p`
  white-space: pre-wrap;
  line-height: 1.6;
`;
const ConversationThread = styled.div``;
const MessageBubble = styled.div`
  background: ${({ fromAdmin }) => fromAdmin ? '#2a2a3e' : '#3c3c54'};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;
const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  color: #aaa;
  font-size: 0.9rem;
`;
const AttachmentsList = styled.div`
  margin-top: 1rem;
  a {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    margin-right: 1rem;
    &:hover { text-decoration: underline; }
  }
`;
const ReplyForm = styled.form`
  margin-top: 2rem;
`;
const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  min-height: 150px;
  background-color: #2a2a3e;
  border: 1px solid #444;
  color: white;
  border-radius: 6px;
  margin-bottom: 1rem;
`;
const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #000;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  &:disabled { background-color: #555; cursor: not-allowed; }
`;

const UserViewTicketPage = () => {
    const { ticketId } = useParams();
    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [replyMessage, setReplyMessage] = useState('');
    const [attachments, setAttachments] = useState([]);

    const fetchTicket = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await supportService.getTicketById(ticketId); 
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

    const handleFileChange = (e) => {
        setAttachments([...e.target.files]);
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('message', replyMessage);
        attachments.forEach(file => {
            formData.append('attachments', file);
        });

        try {
            const { data } = await supportService.addReply(ticketId, formData);
            setTicket(data);
            setReplyMessage('');
            setAttachments([]);
        } catch (error) {
            console.error("Failed to submit reply:", error);
        }
    };

    if (isLoading) return <Preloader />;
    if (!ticket) return <PageContainer>Ticket not found or you do not have permission to view it.</PageContainer>;
    
    // --- FIX IS HERE ---
    // Safely determines the author of a reply.
    const getAuthorName = (reply) => {
        // If reply.user exists and its ID matches the ticket owner's ID, it's from the user.
        if (reply.user && reply.user._id === ticket.user) { 
            return "You";
        }
        // Otherwise, it's a reply from an admin.
        return "Seek Support";
    };

    return (
        <PageContainer>
            <Link to="/dashboard/support-tickets">{"<"} Back to Tickets</Link>
            <Card>
                <CardTitle>Ticket Details</CardTitle>
                <TicketInfoGrid>
                    <InfoItem><strong>Date Created</strong> {format(new Date(ticket.createdAt), 'PPp')}</InfoItem>
                    <InfoItem><strong>Ticket ID</strong> #{ticket.ticketNumber}</InfoItem>
                    <InfoItem><strong>Category</strong> {ticket.category.name}</InfoItem>
                    <InfoItem><strong>Priority</strong> {ticket.priority}</InfoItem>
                    <InfoItem><strong>Status</strong> {ticket.status}</InfoItem>
                </TicketInfoGrid>
                <hr style={{ border: '1px solid #444', margin: '1.5rem 0' }} />
                <InfoItem><strong>Subject</strong> {ticket.subject}</InfoItem>
                <InfoItem><strong>Description</strong></InfoItem>
                <Description>{ticket.description}</Description>
                {ticket.attachments && ticket.attachments.length > 0 && (
                    <AttachmentsList>
                        <strong>Attachments:</strong>
                        {ticket.attachments.map((file, index) => (
                           <a href={`http://localhost:5000/${file.filePath}`} target="_blank" rel="noopener noreferrer" key={index}>
                                <FiPaperclip /> {file.fileName}
                            </a>
                        ))}
                    </AttachmentsList>
                )}
            </Card>

            <Card>
                <CardTitle>Conversation</CardTitle>
                <ConversationThread>
                    {ticket.conversation.map(reply => (
                        <MessageBubble key={reply._id} fromAdmin={getAuthorName(reply) === "Seek Support"}>
                            <MessageHeader>
                                <strong>{getAuthorName(reply)}</strong>
                                <span>{format(new Date(reply.createdAt), 'PPp')}</span>
                            </MessageHeader>
                            <p>{reply.message}</p>
                            {reply.attachments && reply.attachments.length > 0 && (
                                <AttachmentsList>
                                    {reply.attachments.map((file, index) => (
                                       <a href={`http://localhost:5000/${file.filePath}`} target="_blank" rel="noopener noreferrer" key={index}>
                                            <FiPaperclip /> {file.fileName}
                                        </a>
                                    ))}
                                </AttachmentsList>
                            )}
                        </MessageBubble>
                    ))}
                </ConversationThread>
            </Card>

            {['Open', 'In Progress', 'Resolved'].includes(ticket.status) && (
                <Card>
                    <CardTitle>Reply to this Ticket</CardTitle>
                    <ReplyForm onSubmit={handleReplySubmit}>
                        <Textarea 
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Type your message here..."
                            required
                        />
                        <input type="file" multiple onChange={handleFileChange} />
                        <Button type="submit" disabled={!replyMessage.trim()}>Submit Reply</Button>
                    </ReplyForm>
                </Card>
            )}
        </PageContainer>
    );
};

export default UserViewTicketPage;