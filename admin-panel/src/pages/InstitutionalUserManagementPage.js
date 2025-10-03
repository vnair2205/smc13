import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiPlus, FiEye, FiSearch } from 'react-icons/fi';
import instituteService from '../services/instituteService';
import StatCard from '../components/common/StatCard';
import DataTable from '../components/common/DataTable';
import Pagination from '../components/common/Pagination';
import AddInstituteModal from '../components/institutes/AddInstituteModal';
import Preloader from '../components/common/Preloader';

// --- STYLED COMPONENTS ---
const PageContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &:hover {
    opacity: 0.9;
  }
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
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: #1e1e32;
  color: ${({ theme }) => theme.colors.text};
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const StyledSelect = styled.select`
  /* --- Basic Appearance --- */
  padding: 0.75rem 2.5rem 0.75rem 1rem; /* Add space on the right for the arrow */
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};

  /* --- Force Dark Theme Colors --- */
  background-color: #1e1e32;
  color: ${({ theme }) => theme.colors.text};

  /* --- Remove native browser styling --- */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  /* --- Add Custom Dropdown Arrow --- */
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${({
    theme,
  }) =>
    theme.colors.textSecondary.replace(
      '#',
      '%23'
    )}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.2em;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;
const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.2rem;
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

// --- COMPONENT LOGIC ---
const InstitutionalUserManagementPage = () => {
    const [institutes, setInstitutes] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const navigate = useNavigate();

    const fetchInstitutes = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                search: searchTerm,
                status: statusFilter,
            };
            const { data } = await instituteService.getInstitutes(params);
            setInstitutes(data.docs);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch institutes:", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

    const fetchStats = useCallback(async () => {
        try {
            const { data } = await instituteService.getInstituteStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    }, []);

    useEffect(() => {
        fetchInstitutes();
        fetchStats();
    }, [fetchInstitutes, fetchStats]);

    const handleSaveInstitute = async (instituteData) => {
        try {
            await instituteService.createInstitute(instituteData);
            setIsModalOpen(false);
            fetchInstitutes();
            fetchStats();
        } catch (error) {
            console.error("Failed to save institute:", error);
        }
    };
    
    // --- THIS IS THE DEFINITIVE FIX ---
    // Added explicit `render` functions to all columns to ensure only strings are rendered.
    // Also added safety checks (`record && record.admin`) to prevent crashes if a row's data is incomplete.
     const columns = [
        {
            title: 'Institute Name',
            key: 'instituteName',
            render: (record) => (record ? record.instituteName : 'N/A'),
        },
        {
            title: 'Admin Name',
            key: 'adminName',
            render: (record) => (record && record.admin ? `${record.admin.firstName} ${record.admin.lastName}` : 'N/A'),
        },
        {
            title: 'Admin Email',
            key: 'adminEmail',
            render: (record) => (record && record.admin ? record.admin.email : 'N/A'),
        },
        {
            title: 'Phone Number',
            key: 'institutePhoneNumber',
            render: (record) => (record ? record.institutePhoneNumber : 'N/A'),
        },
        {
            title: 'Status',
            key: 'status',
            render: (record) => (
                <span style={{ color: record.status === 'active' ? '#2ecc71' : '#e74c3c', textTransform: 'capitalize' }}>
                    {record.status || 'N/A'}
                </span>
            ),
        },
        {
            title: 'Plan',
            key: 'planName',
            render: (record) => (record && record.plan ? record.plan.name : 'N/A'),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record) => (
                <ActionButton onClick={() => record && navigate(`/institute/${record._id}`)}>
                    <FiEye />
                </ActionButton>
            ),
        },
    ];

    return (
        <PageContainer>
            {isLoading && <Preloader />}
            <Header>
                <Title>Institutional User Management</Title>
                <Button onClick={() => setIsModalOpen(true)}><FiPlus /> Add Institute</Button>
            </Header>

            <StatsContainer>
                <StatCard title="Total Institutes" value={stats.total} type="total" />
                <StatCard title="Active Institutes" value={stats.active} type="active" />
                <StatCard title="Inactive Institutes" value={stats.inactive} type="inactive" />
            </StatsContainer>

            <ControlsContainer>
                <SearchContainer>
                    <SearchIcon />
                    <SearchInput
                        type="text"
                        placeholder="Search by institute name..."
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

            <DataTable columns={columns} data={institutes} />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            <AddInstituteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveInstitute}
            />
        </PageContainer>
    );
};

export default InstitutionalUserManagementPage;