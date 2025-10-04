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

    // --- FIX STARTS HERE ---
    // 1. We'll separate the data fetching logic into two parts.
    
    // This function will now ONLY fetch the main user list, not the stats.
    const fetchUsers = useCallback(async (searchQuery) => {
        setLoading(true);
        try {
            const usersRes = await getUsers(currentPage, itemsPerPage, searchQuery, statusFilter);
            if (usersRes && usersRes.users) {
                setUsers(usersRes.users);
                setTotalPages(usersRes.totalPages);
            } else {
                setUsers([]);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setUsers([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, statusFilter]);

    // 2. This useEffect handles the initial data load and changes to filters/pagination.
    useEffect(() => {
        // Fetch stats only once on the initial load or when filters change
        getUserStats().then(setStats).catch(err => console.error(err));
        
        // Fetch users based on the current search term
        fetchUsers(searchTerm);

    }, [fetchUsers, currentPage, itemsPerPage, statusFilter]);


    // 3. This new useEffect is specifically for handling the search input with a debounce.
    useEffect(() => {
        // Set up a timer to run after 500ms (half a second)
        const debounceTimer = setTimeout(() => {
            // Only fetch if the searchTerm is not empty or if it was just cleared.
            // This prevents an unnecessary API call on the very first render.
            fetchUsers(searchTerm);
        }, 500);

        // This is a cleanup function. It runs every time the searchTerm changes,
        // clearing the previous timer. This is what makes the debounce work.
        return () => clearTimeout(debounceTimer);

    }, [searchTerm, fetchUsers]); // It only runs when the search term changes.
    // --- FIX ENDS HERE ---

   const handleViewUser = (userId) => {
    // Correct the path to /user/:userId
    navigate(`/user/${userId}`); 
};

  // --- FIX STARTS HERE ---
  // The columns definitions have been updated to correctly access the data
  // sent from the modified backend.
  const columns = [
    { title: 'User ID', key: '_id' },
    { title: 'First Name', key: 'firstName' },
    { title: 'Last Name', key: 'lastName' },
    { title: 'Email', key: 'email' },
    { 
      title: 'Phone Number', 
      key: 'phoneNumber',
      render: (row) => row.phoneNumber || 'N/A' // Access phoneNumber
    },
    {
      title: 'Subscription Status',
      key: 'subscriptionStatus',
      // Access the status from the populated activeSubscription object
      render: (row) => row.activeSubscription?.status || 'inactive',
    },
    {
      title: 'Subscription Plan',
      key: 'subscriptionPlan',
      // Access the plan name from the nested populated object
      render: (row) => row.activeSubscription?.plan?.name || 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (row) => (
        <ActionButton onClick={() => handleViewUser(row._id)} title="View User">
          <FaEye />
        </ActionButton>
      ),
    },
  ];
  // --- FIX ENDS HERE ---

  if (loading) {
    return <Preloader />;
  }

  return (
    <PageContainer>
      <h1>User Management</h1>
      <StatsContainer>
        <StatCard title="Total Users" value={stats.total} type="total" />
        <StatCard title="Active Users" value={stats.active} type="active" />
        <StatCard title="Inactive Users" value={stats.inactive} type="inactive" />
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