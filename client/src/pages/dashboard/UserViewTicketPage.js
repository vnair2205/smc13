// client/src/pages/dashboard/UserViewTicketPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import * as supportService from '../../services/supportService'; // Assuming you add getTicketById here
import Preloader from '../../components/common/Preloader';

// --- STYLED COMPONENTS (similar to admin view) ---
const PageContainer = styled.div`...`;
// ... (copy and adapt styled components from AdminViewTicketPage)

const UserViewTicketPage = () => {
    const { ticketId } = useParams();
    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTicket = useCallback(async () => {
        setIsLoading(true);
        try {
            // You will need to create this service function and the corresponding backend route/controller
            // For now, let's assume it exists
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

    if (isLoading) return <Preloader />;
    if (!ticket) return <PageContainer>Ticket not found.</PageContainer>;

    return (
        <PageContainer>
            {/* ... JSX to display the ticket details and conversation, similar to the admin view ... */}
            {/* You would display the initial ticket description and then map over ticket.conversation */}
            <Link to="/dashboard/support-tickets">Back to Tickets</Link>
        </PageContainer>
    );
};

export default UserViewTicketPage;