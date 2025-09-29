// client/src/pages/admin/AdminViewTicketPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import * as adminSupportService from '../../services/adminSupportService';
import Preloader from '../../components/common/Preloader';
import { format } from 'date-fns';

// --- STYLED COMPONENTS ---
const PageContainer = styled.div`
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text};
`;
const TicketHeader = styled.div`
  margin-bottom: 2rem;
  h1 { margin: 0; }
  span { color: #888; }
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
`;
const MainContent = styled.div``;
const Sidebar = styled.div``;
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
`;
const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;
const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  min-height: 150px;
  background-color: #2a2a3e;
  border: 1px solid #444;
  color: white;
  border-radius: 6px;
`;
const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #000;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;
const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  background-color: #2a2a3e;
  border: 1px solid #444;
  color: white;
  border-radius: 6px;
`;
const ConversationThread = styled.div``;
const MessageBubble = styled.div`
  background: ${({ fromAdmin }) => fromAdmin ? '#2a2a3e' : '#3c3c54'};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const AdminViewTicketPage = () => {
    const { ticketId } = useParams();
    const [ticket, setTicket] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [replyMessage, setReplyMessage] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [newAssignedTo, setNewAssignedTo] = useState('');
    
    const fetchTicketDetails = useCallback(async () => {
        try {
            const [ticketRes, adminsRes] = await Promise.all([
                adminSupportService.getTicketById(ticketId),
                adminSupportService.getAdmins()
            ]);
            setTicket(ticketRes.data);
            setAdmins(adminsRes.data);
            setNewStatus(ticketRes.data.status);
            setNewAssignedTo(ticketRes.data.assignedTo?._id || '');
        } catch (error) {
            console.error("Failed to fetch ticket details:", error);
        } finally {
            setIsLoading(false);
        }
    }, [ticketId]);

    useEffect(() => {
        fetchTicketDetails();
    }, [fetchTicketDetails]);

    const handleSubmitReply = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('replyMessage', replyMessage);
        formData.append('status', newStatus);
        formData.append('assignedTo', newAssignedTo);
        // Note: File attachments for replies can be added here
        
        try {
            await adminSupportService.updateTicket(ticketId, formData);
            setReplyMessage('');
            fetchTicketDetails(); // Refresh ticket details
        } catch (error) {
            console.error("Failed to update ticket:", error);
        }
    };

    if (isLoading) return <Preloader />;
    if (!ticket) return <PageContainer>Ticket not found.</PageContainer>;

    return (
        <PageContainer>
            <TicketHeader>
                <h1>{ticket.subject}</h1>
                <span>Ticket #{ticket.ticketNumber} created by {ticket.user.firstName} {ticket.user.lastName}</span>
            </TicketHeader>
            <Grid>
                <MainContent>
                    <Card>
                        <CardTitle>Conversation</CardTitle>
                        <ConversationThread>
                             <MessageBubble fromAdmin={false}>
                                <strong>{ticket.user.firstName} {ticket.user.lastName}</strong>
                                <p>{ticket.description}</p>
                                {/* Add logic to display user attachments */}
                            </MessageBubble>
                            {ticket.conversation.map(reply => (
                                <MessageBubble key={reply._id} fromAdmin={true}>
                                    <strong>{reply.user.firstName} {reply.user.lastName} (Admin)</strong>
                                    <p>{reply.message}</p>
                                    {/* Add logic to display admin attachments */}
                                </MessageBubble>
                            ))}
                        </ConversationThread>
                    </Card>
                    <Card>
                        <CardTitle>Reply</CardTitle>
                        <form onSubmit={handleSubmitReply}>
                            <FormGroup>
                                <Textarea 
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    placeholder="Type your response here..."
                                />
                            </FormGroup>
                            {/* Add file input for attachments here */}
                            <Button type="submit">Post Reply</Button>
                        </form>
                    </Card>
                </MainContent>
                <Sidebar>
                    <Card>
                        <CardTitle>Ticket Details</CardTitle>
                         <form onSubmit={handleSubmitReply}>
                            <FormGroup>
                                <label>Status</label>
                                <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                </Select>
                            </FormGroup>
                             <FormGroup>
                                <label>Assign To</label>
                                <Select value={newAssignedTo} onChange={(e) => setNewAssignedTo(e.target.value)}>
                                    <option value="">Unassigned</option>
                                    {admins.map(admin => (
                                        <option key={admin._id} value={admin._id}>
                                            {admin.firstName} {admin.lastName}
                                        </option>
                                    ))}
                                </Select>
                            </FormGroup>
                             <Button type="submit">Update Ticket</Button>
                         </form>
                    </Card>
                </Sidebar>
            </Grid>
        </PageContainer>
    );
};

export default AdminViewTicketPage;