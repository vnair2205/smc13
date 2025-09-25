// admin-panel/src/pages/UserManagementPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getUsers, getUserStats } from '../services/userService';
import AdminLayout from '../components/layout/AdminLayout'; // Ensure this is imported

const Container = styled.div`
  padding: 2rem;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: #2a2a38;
  padding: 1.5rem;
  border-radius: 8px;
  color: #fff;
  h3 {
    margin: 0;
    font-size: 1.5rem;
  }
  p {
    margin: 0.5rem 0 0;
    color: #a0a0a0;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #444;
    background: #333;
    color: #fff;
`;

const FilterSelect = styled.select`
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #444;
    background: #333;
    color: #fff;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #444;
    white-space: nowrap;
  }
`;

const Button = styled.button`
    padding: 0.5rem 1rem;
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
`;

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, inactiveUsers: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getUserStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch user stats", error);
      }
    };
    fetchStats();
  }, []);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers(page, 10, search, status);
        setUsers(data.users);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };
    fetchUsers();
  }, [page, search, status]);

  return (
    // This AdminLayout is the key to the fix.
    <AdminLayout>
      <Container>
        <h1>User Management</h1>
        <StatsContainer>
          <StatCard>
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </StatCard>
          <StatCard>
            <h3>{stats.activeUsers}</h3>
            <p>Active Users</p>
          </StatCard>
          <StatCard>
            <h3>{stats.inactiveUsers}</h3>
            <p>Inactive Users</p>
          </StatCard>
        </StatsContainer>

        <ControlsContainer>
          <SearchInput 
            type="text" 
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FilterSelect value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </FilterSelect>
        </ControlsContainer>

        <TableWrapper>
            <Table>
            <thead>
                <tr>
                  <th>User ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Plan</th>
                  <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                <tr key={user._id}>
                    <td>{user._id}</td>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{user.status}</td>
                    <td>{user.activeSubscription?.plan?.name || 'N/A'}</td>
                    <td>
                      <Button onClick={() => navigate(`/user-management/${user._id}`)}>View</Button>
                    </td>
                </tr>
                ))}
            </tbody>
            </Table>
        </TableWrapper>
      </Container>
    </AdminLayout>
  );
};

export default UserManagementPage;