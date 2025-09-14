// admin-panel/src/pages/SupportTicketsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import * as supportService from '../services/supportService';
import Preloader from '../components/common/Preloader';
import { format } from 'date-fns';

// --- STYLED COMPONENTS (can be moved to a separate file) ---
const PageContainer = styled.div` padding: 2rem; `;
const Header = styled.h1` font-size: 2rem; color: ${({ theme }) => theme.colors.text}; margin-bottom: 2rem; `;
const Toolbar = styled.div` display: flex; gap: 1rem; margin-bottom: 2rem; `;
const Select = styled.select` padding: 0.75rem; background-color: #1e1e2d; border: 1px solid #444; color: white; border-radius: 6px; `;
const SearchInput = styled.input` padding: 0.75rem; background-color: #1e1e2d; border: 1px solid #444; color: white; border-radius: 6px; `;
const Table = styled.table` width: 100%; border-collapse: collapse; background-color: #1e1e2d; th, td { padding: 1rem 1.5rem; text-align: left; } thead { background-color: #2a2a3e; }`;
const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #000;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
`;

const SupportTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({ sortBy: 'newest', category: '', search: '', status: '' });
    const [categories, setCategories] = useState([]);

    const fetchTickets = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await supportService.getAllTickets(filters);
            setTickets(res.data);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const catRes = await supportService.getCategories();
                setCategories(catRes.data);
                fetchTickets();
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchInitialData();
    }, [fetchTickets]);

    return (
        <PageContainer>
            <Header>Support Tickets</Header>
            <Toolbar>
                <Select value={filters.sortBy} onChange={e => setFilters({ ...filters, sortBy: e.target.value })}>
                    <option value="newest">Newest to Oldest</option>
                    <option value="oldest">Oldest to Newest</option>
                </Select>
                <Select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
                    <option value="">All Categories</option>
                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </Select>
                <Select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                    <option value="">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                </Select>
                <SearchInput
                    type="text"
                    placeholder="Search by Ticket #"
                    onChange={e => setFilters({ ...filters, search: e.target.value })}
                />
            </Toolbar>
            {isLoading ? <Preloader /> : (
                <Table>
                    <thead>
                        <tr>
                            <th>Ticket #</th>
                            <th>User Name</th>
                            <th>Priority</th>
                            <th>Subject</th>
                            <th>Status</th>
                            <th>Last Updated</th>
                            <th>Assigned To</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map(ticket => (
                            <tr key={ticket._id}>
                                <td>#{ticket.ticketNumber}</td>
                                <td>{`${ticket.user.firstName} ${ticket.user.lastName}`}</td>
                                <td>{ticket.priority}</td>
                                <td>{ticket.subject}</td>
                                <td>{ticket.status}</td>
                                <td>{format(new Date(ticket.updatedAt), 'PPp')}</td>
                                <td>{ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : 'Unassigned'}</td>
                                <td>
                                    <Link to={`/support-tickets/${ticket._id}`}>
                                        <Button>View</Button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </PageContainer>
    );
};

export default SupportTicketsPage;