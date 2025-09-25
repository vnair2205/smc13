import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaEye } from 'react-icons/fa';
import { getUsers, getUserStats } from '../services/userService';
import DataTable from '../components/common/DataTable';
import Pagination from '../components/common/Pagination';
import StatCard from '../components/common/StatCard';
import Preloader from '../components/common/Preloader';

const PageContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 350px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border-radius: 8px;
  border: 1px solid #33333e;
  background-color: #1e1e32;
  color: white;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StyledSelect = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #33333e;
  background-color: #1e1e32;
  color: white;
  min-width: 150px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #5e72e4;
  cursor: pointer;
  font-size: 1.2rem;
  &:hover {
    color: #485cc7;
  }
`;

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        getUserStats(),
        getUsers(currentPage, itemsPerPage, searchTerm, statusFilter),
      ]);
      
      // --- THIS IS THE FIX ---
      // Check if the responses are valid before setting state
      if (statsRes) {
        setStats(statsRes);
      }
      if (usersRes && usersRes.users) {
        setUsers(usersRes.users);
        setTotalPages(usersRes.totalPages);
      } else {
        // Handle cases where the API might not return the expected structure
        setUsers([]);
        setTotalPages(1);
      }
      // --- END OF FIX ---

    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // Ensure the page doesn't stay in a loading state on error
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);
  
  const handleViewUser = (userId) => {
    navigate(`/users/${userId}`);
  };

  const columns = [
    { title: 'User ID', key: '_id' },
    { title: 'First Name', key: 'firstName' },
    { title: 'Last Name', key: 'lastName' },
    { title: 'Email', key: 'email' },
    { title: 'Phone Number', key: 'phone' },
    {
      title: 'Subscription Status',
      key: 'isActive',
      render: (isActive) => (isActive ? 'Active' : 'Inactive'),
    },
    {
      title: 'Subscription Plan',
      key: 'subscription',
      render: (subscription) => subscription?.plan?.name || 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <ActionButton onClick={() => handleViewUser(row._id)} title="View User">
          <FaEye />
        </ActionButton>
      ),
    },
  ];

  if (loading) {
    return <Preloader />;
  }

  return (
    <PageContainer>
      <h1>User Management</h1>
      <StatsContainer>
        <StatCard title="Total Users" count={stats.total} type="total" />
        <StatCard title="Active Users" count={stats.active} type="active" />
        <StatCard title="Inactive Users" count={stats.inactive} type="inactive" />
      </StatsContainer>

      <ControlsContainer>
        <SearchContainer>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        <FilterContainer>
          <StyledSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </StyledSelect>
          <StyledSelect
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </StyledSelect>
        </FilterContainer>
      </ControlsContainer>

      <DataTable columns={columns} data={users} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </PageContainer>
  );
};

export default UserManagementPage;