// client/src/pages/admin/AdminSupportTicketsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import * as adminSupportService from '../../services/adminSupportService';
import Preloader from '../../components/common/Preloader';
import { format } from 'date-fns';

// --- STYLED COMPONENTS (You can adjust styles as needed) ---
const PageContainer = styled.div`
  padding: 2rem;
`;
const Header = styled.h1`
  color: ${({ theme }) => theme.colors.text};
`;
const Toolbar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
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
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: #1e1e2d;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text};
  th, td { padding: 1rem 1.5rem; text-align: left; }
  thead { background-color: #2a2a3e; }
  tbody tr { border-bottom: 1px solid #2a2a3e; &:hover { background-color: #2a2a3e; } }
`;
const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #000;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;

const AdminSupportTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        sortBy: 'newest',
        category: '',
        status: '',
        search: ''
    });
    const navigate = useNavigate();

    const fetchTicketsAndCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const [ticketsRes, categoriesRes] = await Promise.all([
                adminSupportService.getAllTickets(filters),
                adminSupportService.getSupportCategories()
            ]);
            setTickets(ticketsRes.data);
            setCategories(categoriesRes.data.categories);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchTicketsAndCategories();
    }, [fetchTicketsAndCategories]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <PageContainer>
            <Header>Support Tickets</Header>
            <Toolbar>
                <Select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                    <option value="newest">Newest to Oldest</option>
                    <option value="oldest">Oldest to Newest</option>
                </Select>
                <Select name="category" value={filters.category} onChange={handleFilterChange}>
                    <option value="">All Categories</option>
                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </Select>
                 <Select name="status" value={filters.status} onChange={handleFilterChange}>
                    <option value="">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                </Select>
                <SearchInput
                    name="search"
                    type="text"
                    placeholder="Search by Ticket #"
                    onChange={handleFilterChange}
                />
            </Toolbar>
            {isLoading ? <Preloader /> : (
                <Table>
                    <thead>
                        <tr>
                            <th>Ticket #</th>
                            <th>User</th>
                            <th>Priority</th>
                            <th>Subject</th>
                            <th>Status</th>
                            <th>Last Updated</th>
                            <th>Assigned To</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.length > 0 ? tickets.map(ticket => (
                            <tr key={ticket._id}>
                                <td>#{ticket.ticketNumber}</td>
                                <td>{ticket.user ? `${ticket.user.firstName} ${ticket.user.lastName}`: 'N/A'}</td>
                                <td>{ticket.priority}</td>
                                <td>{ticket.subject}</td>
                                <td>{ticket.status}</td>
                                <td>{format(new Date(ticket.updatedAt), 'PPp')}</td>
                                <td>{ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : 'Unassigned'}</td>
                                <td>
                                    <Button onClick={() => navigate(`/admin/support/ticket/${ticket._id}`)}>View</Button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="8" style={{ textAlign: 'center' }}>No tickets found.</td></tr>
                        )}
                    </tbody>
                </Table>
            )}
        </PageContainer>
    );
};

export default AdminSupportTicketsPage;