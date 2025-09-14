// client/src/pages/dashboard/SupportTicketsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import * as supportService from '../../services/supportService';
import AddTicketModal from '../../components/support/AddTicketModal';
import Preloader from '../../components/common/Preloader';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { format } from 'date-fns';

// --- STYLED COMPONENTS ---
const PageContainer = styled.div`
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 1rem;
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
`;

const PriorityPill = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: bold;
  color: white;
  background-color: ${({ color }) => color};
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
                <td>
                  <PriorityPill color={priorityColors[ticket.priority]}>
                    {ticket.priority}
                  </PriorityPill>
                </td>
  

                <td>{ticket.subject}</td>
                <td>{ticket.status}</td>
                <td>{format(new Date(ticket.updatedAt), 'PPp')}</td>
                <td><Button style={{padding: '0.5rem 1rem'}}>View</Button></td>
              </tr>
            )) : (
                <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>No tickets found.</td>
                </tr>
            )}
          </tbody>
        </Table>
      )}
      {modalOpen && <AddTicketModal onClose={() => setModalOpen(false)} onTicketCreated={fetchTickets} />}
    </PageContainer>
  );
};

export default SupportTicketsPage;