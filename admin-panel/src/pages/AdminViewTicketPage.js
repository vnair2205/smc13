// admin-panel/src/pages/AdminViewTicketPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import * as supportService from '../services/supportService';
import Preloader from '../components/common/Preloader';
import { format } from 'date-fns';

// --- STYLED COMPONENTS ---
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

const AdminViewTicketPage = () => {
    const { ticketId } = useParams();
    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [admins, setAdmins] = useState([]);
    const [replyMessage, setReplyMessage] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [status, setStatus] = useState('');
    const [attachments, setAttachments] = useState([]);

    const fetchTicketData = useCallback(async () => {
        try {
            const [ticketRes, adminsRes] = await Promise.all([
                supportService.getTicketById(ticketId),
                supportService.getAdmins()
            ]);
            setTicket(ticketRes.data);
            setAdmins(adminsRes.data);
            setAssignedTo(ticketRes.data.assignedTo?._id || '');
            setStatus(ticketRes.data.status);
        } catch (error) {
            console.error("Error fetching ticket data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [ticketId]);

    useEffect(() => {
        fetchTicketData();
    }, [fetchTicketData]);

    const handleUpdateTicket = async () => {
        const formData = new FormData();
        formData.append('replyMessage', replyMessage);
        formData.append('status', status);
        formData.append('assignedTo', assignedTo);
        for (const file of attachments) {
            formData.append('attachments', file);
        }

        try {
            await supportService.updateTicket(ticketId, formData);
            setReplyMessage('');
            setAttachments([]);
            fetchTicketData(); // Refresh ticket data
        } catch (error) {
            console.error("Error updating ticket:", error);
        }
    };

    if (isLoading) return <Preloader />;
    if (!ticket) return <PageContainer>Ticket not found.</PageContainer>;

    return (
        <PageContainer>
            <h1>Ticket #{ticket.ticketNumber}</h1>
            <Grid>
                <Card>
                    <CardTitle>Ticket Details</CardTitle>
                    <InfoItem><strong>User:</strong> {`${ticket.user.firstName} ${ticket.user.lastName}`}</InfoItem>
                    <InfoItem><strong>Category:</strong> {ticket.category.name}</InfoItem>
                    <InfoItem><strong>Priority:</strong> {ticket.priority}</InfoItem>
                    <InfoItem><strong>Subject:</strong> {ticket.subject}</InfoItem>
                    <InfoItem><strong>Description:</strong><p>{ticket.description}</p></InfoItem>
                    {/* Display user attachments here */}
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

            <Card>
                <CardTitle>Conversation</CardTitle>
                {/* Render conversation history here */}
            </Card>

            <Card>
                <CardTitle>Your Reply</CardTitle>
                <Textarea
                    placeholder="Type your reply here..."
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                />
                <FileInput type="file" multiple onChange={e => setAttachments(e.target.files)} />
                <Button onClick={handleUpdateTicket} style={{ marginTop: '1rem' }}>
                    Update Ticket
                </Button>
            </Card>

            <Link to="/support-tickets">Back to All Tickets</Link>
        </PageContainer>
    );
};

export default AdminViewTicketPage;