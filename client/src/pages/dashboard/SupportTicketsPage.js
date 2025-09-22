// client/src/pages/dashboard/SupportTicketsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import * as supportService from '../../services/supportService';
import AddTicketModal from '../../components/support/AddTicketModal';
import Preloader from '../../components/common/Preloader';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

// --- STYLED COMPONENTS (with fixes) ---
const PageContainer = styled.div`
    padding: 2rem;
    color: ${({ theme }) => theme.colors.text};

    @media (max-width: 768px) {
        padding: 1rem;
    }
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;

    /* --- FIX 1: Stack header on mobile --- */
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }
`;

const Toolbar = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem; /* Add margin to separate from content */

    /* --- FIX 2: Stack toolbar controls on mobile --- */
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const Button = styled.button`
    padding: 0.75rem 1.5rem;
    background-color: ${({ theme }) => theme.colors.primary};
    color: #000;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center; /* Center content */
    gap: 0.5rem;
    &:hover { opacity: 0.9; }
`;

const Select = styled.select`
    padding: 0.75rem;
    background-color: #1e1e2d;
    border: 1px solid #444;
    color: white;
    border-radius: 6px;
`;

const SearchInput = styled.input`
    padding: 0.75rem;
    background-color: #1e1e2d;
    border: 1px solid #444;
    color: white;
    border-radius: 6px;
    flex-grow: 1; /* Allow search to take more space */
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    background-color: #1e1e2d;
    border-radius: 8px;
    overflow: hidden;
    th, td { padding: 1rem 1.5rem; text-align: left; }
    thead { background-color: #2a2a3e; }
    tbody tr { border-bottom: 1px solid #2a2a3e; &:last-child { border-bottom: none; } }

    /* --- FIX 3: Hide table on mobile --- */
    @media (max-width: 768px) {
        display: none;
    }
`;

const PriorityPill = styled.span`
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-weight: bold;
    color: white;
    font-size: 0.8rem; /* Slightly smaller text */
    background-color: ${({ color }) => color};
`;

// --- FIX 4: New components for the mobile card view ---
const MobileCardContainer = styled.div`
    display: none;
    @media (max-width: 768px) {
        display: block;
        width: 100%;
    }
`;

const TicketCard = styled.div`
    background-color: #1e1e2d;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    border-left: 5px solid ${({ color }) => color};
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
`;

const TicketSubject = styled.h3`
    margin: 0;
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.text};
`;

const CardRow = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
`;

const CardLabel = styled.span`
    color: #a0a0a0;
`;

const CardData = styled.span`
    color: #fff;
    font-weight: 500;
`;

const ViewLink = styled(Link)`
    display: block;
    text-align: center;
    margin-top: 1rem;
    padding: 0.75rem;
    background-color: ${({ theme }) => theme.colors.primary};
    color: #000;
    font-weight: 600;
    text-decoration: none;
    border-radius: 6px;
`;


const SupportTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [filters, setFilters] = useState({ sortBy: 'newest', search: '' });

    const fetchTickets = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await supportService.getUserTickets(filters);
            setTickets(res.data);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const priorityColors = {
        Critical: '#d9534f',
        High: '#f0ad4e',
        Medium: '#5bc0de',
        Low: '#5cb85c'
    };

    return (
        <PageContainer>
            <Header>
                <h1>My Support Tickets</h1>
                <Button onClick={() => setModalOpen(true)}>
                    <FiPlus /> Add New Ticket
                </Button>
            </Header>
            <Toolbar>
                <Select value={filters.sortBy} onChange={e => setFilters({...filters, sortBy: e.target.value})}>
                    <option value="newest">Newest to Oldest</option>
                    <option value="oldest">Oldest to Newest</option>
                </Select>
                <SearchInput
                    type="text"
                    placeholder="Search by Ticket #"
                    onChange={e => setFilters({...filters, search: e.target.value})}
                />
            </Toolbar>

            {isLoading ? <Preloader /> : (
                <>
                    {/* --- FIX 5: Render both the table and the mobile cards --- */}
                    
                    {/* Desktop Table */}
                    <Table>
                        <thead>
                            <tr>
                                <th>Ticket #</th>
                                <th>Priority</th>
                                <th>Subject</th>
                                <th>Status</th>
                                <th>Last Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.length > 0 ? tickets.map(ticket => (
                                <tr key={ticket._id}>
                                    <td>#{ticket.ticketNumber}</td>
                                    <td><PriorityPill color={priorityColors[ticket.priority]}>{ticket.priority}</PriorityPill></td>
                                    <td>{ticket.subject}</td>
                                    <td>{ticket.status}</td>
                                    <td>{format(new Date(ticket.updatedAt), 'PPp')}</td>
                                    <td>
                                        <Link to={`/support-tickets/${ticket._id}`}>
                                            <Button style={{padding: '0.5rem 1rem'}}>View</Button>
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center' }}>No tickets found.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>

                    {/* Mobile Card View */}
                    <MobileCardContainer>
                        {tickets.length > 0 ? tickets.map(ticket => (
                            <TicketCard key={ticket._id} color={priorityColors[ticket.priority]}>
                                <CardHeader>
                                    <TicketSubject>#{ticket.ticketNumber} - {ticket.subject}</TicketSubject>
                                    <PriorityPill color={priorityColors[ticket.priority]}>{ticket.priority}</PriorityPill>
                                </CardHeader>
                                <CardRow>
                                    <CardLabel>Status:</CardLabel>
                                    <CardData>{ticket.status}</CardData>
                                </CardRow>
                                <CardRow>
                                    <CardLabel>Last Updated:</CardLabel>
                                    <CardData>{format(new Date(ticket.updatedAt), 'PPp')}</CardData>
                                </CardRow>
                                <ViewLink to={`/support-tickets/${ticket._id}`}>View Ticket</ViewLink>
                            </TicketCard>
                        )) : (
                            <p style={{ textAlign: 'center' }}>No tickets found.</p>
                        )}
                    </MobileCardContainer>
                </>
            )}
            
            {modalOpen && <AddTicketModal onClose={() => setModalOpen(false)} onTicketCreated={fetchTickets} />}
        </PageContainer>
    );
};

export default SupportTicketsPage;