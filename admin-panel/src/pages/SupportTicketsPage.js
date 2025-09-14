import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import * as supportService from '../services/supportService';
import Preloader from '../components/common/Preloader';
import { format } from 'date-fns';
import SupportCategoryManager from '../components/support/SupportCategoryManager';

// --- STYLED COMPONENTS ---
const PageContainer = styled.div` padding: 2rem; `;
const Header = styled.h1` font-size: 2rem; color: ${({ theme }) => theme.colors.text}; margin-bottom: 2rem; `;
const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #33333e;
  margin-bottom: 2rem;
`;
const TabButton = styled.button`
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme, isActive }) => (isActive ? theme.colors.primary : theme.colors.textSecondary)};
  border-bottom: 3px solid ${({ theme, isActive }) => (isActive ? theme.colors.primary : 'transparent')};
  margin-bottom: -2px;
`;
const Toolbar = styled.div` display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; `;
const Select = styled.select` padding: 0.75rem; background-color: #1e1e2d; border: 1px solid #444; color: white; border-radius: 6px; `;
const SearchInput = styled.input` padding: 0.75rem; background-color: #1e1e2d; border: 1px solid #444; color: white; border-radius: 6px; `;
const Table = styled.table` width: 100%; border-collapse: collapse; background-color: #1e1e2d; border-radius: 8px; color: ${({ theme }) => theme.colors.text}; th, td { padding: 1rem 1.5rem; text-align: left; } thead { background-color: #2a2a3e; } tbody tr { border-bottom: 1px solid #2a2a3e; &:hover { background-color: #2a2a3e; } }`;
const Button = styled.button` padding: 0.5rem 1rem; background-color: ${({ theme }) => theme.colors.primary}; color: #000; border: none; border-radius: 6px; cursor: pointer; `;

const SupportTicketsPage = () => {
    const [activeTab, setActiveTab] = useState('tickets');
    const [tickets, setTickets] = useState([]);
    const [categories, setCategories] = useState([]); // Initial state is correct
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        sortBy: 'newest',
        category: '',
        status: '',
        search: ''
    });
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [ticketsRes, categoriesRes] = await Promise.all([
                supportService.getAllTickets(filters),
                supportService.getCategories()
            ]);
            setTickets(ticketsRes.data);
            
            // --- FIX: The API returns the array directly in `categoriesRes.data` ---
            // We also check if the data is actually an array before setting it.
            if (Array.isArray(categoriesRes.data)) {
                setCategories(categoriesRes.data);
            } else {
                console.error("Categories API did not return an array:", categoriesRes.data);
                setCategories([]); // Set to empty array to prevent crash
            }
            
        } catch (error) {
            console.error("Failed to fetch data:", error);
            setCategories([]); // Set to empty array on error
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <PageContainer>
            <Header>Support Management</Header>

            <TabContainer>
                <TabButton isActive={activeTab === 'tickets'} onClick={() => setActiveTab('tickets')}>
                    Support Tickets
                </TabButton>
                <TabButton isActive={activeTab === 'categories'} onClick={() => setActiveTab('categories')}>
                    Categories
                </TabButton>
            </TabContainer>

            {isLoading ? <Preloader /> : (
                <>
                    {activeTab === 'tickets' && (
                        <div>
                            <Toolbar>
                                <Select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                                    <option value="newest">Newest to Oldest</option>
                                    <option value="oldest">Oldest to Newest</option>
                                </Select>
                                <Select name="category" value={filters.category} onChange={handleFilterChange}>
                                    <option value="">All Categories</option>
                                    {/* --- FIX: Add a check to ensure categories is an array before mapping --- */}
                                    {Array.isArray(categories) && categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
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
                                                <Button onClick={() => navigate(`/support-tickets/${ticket._id}`)}>View</Button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="8" style={{ textAlign: 'center' }}>No tickets found.</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {activeTab === 'categories' && <SupportCategoryManager />}
                </>
            )}
        </PageContainer>
    );
};

export default SupportTicketsPage;