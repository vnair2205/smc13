import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaSearch, FaEye, FaPlus } from 'react-icons/fa';
import { getAdminReferrals, createAdminReferral } from '../services/referralService';
import DataTable from '../components/common/DataTable';
import Pagination from '../components/common/Pagination';
import AddReferrerModal from '../components/referrals/AddReferrerModal';
import Preloader from '../components/common/Preloader';

const PageContainer = styled.div`
  padding: 2rem;
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
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
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const AdminReferralsPage = () => {
  const [referrals, setReferrals] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReferrals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminReferrals(currentPage, itemsPerPage, searchTerm);
      setReferrals(data.docs);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch referrals', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

const handleAddReferral = async (formData) => {
  try {
    await createAdminReferral(formData);
    setIsModalOpen(false);

    // --- START: FIX ---
    // By passing a function to setCurrentPage, we ensure we get the latest state
    // and then fetch the referrals. This is a more reliable way to handle
    // state updates that depend on the previous state.
    setCurrentPage(prevPage => {
      fetchReferrals(prevPage);
      return prevPage;
    });
    // --- END: FIX ---

  } catch (error) {
    if (error.response && error.response.data && error.response.data.msg) {
      alert(`Error: ${error.response.data.msg}`);
    } else {
      alert('Failed to add referrer. Please check the console.');
    }
  }
};

 const columns = React.useMemo(() => [
    // --- START: FIX ---
    // Re-adding the 'Name' column that was accidentally removed.
    {
      title: 'Name',
      key: 'name',
      render: (row) => `${row.firstName} ${row.lastName}`,
    },
    // --- END: FIX ---
    {
      title: 'Email',
      key: 'email',
    },
    {
      title: 'Phone',
      key: 'phoneNumber',
    },
    {
      title: 'Plan',
      key: 'plan',
      render: (row) => (row.plan ? row.plan.name : 'N/A'),
    },
    {
      title: 'Discount Price',
      key: 'discountAmount',
    },
    {
      title: 'Referred Count',
      key: 'referredUsers',
      render: (row) => row.referredUsers.length,
    },
    {
      title: 'Referral Link',
      key: 'referralLink',
      render: (row) => `${process.env.REACT_APP_CLIENT_URL}/signup?ref=${row.referralCode}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <button><FaEye /></button>
      ),
    },
  ], []);

  if (loading && referrals.length === 0) {
    return <Preloader />;
  }

  return (
    <PageContainer>
      <h1>Admin Referrals</h1>
      <ControlsContainer>
        <SearchContainer>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        <AddButton onClick={() => setIsModalOpen(true)}>
          <FaPlus />
          Add Referrer
        </AddButton>
      </ControlsContainer>

      <DataTable columns={columns} data={referrals} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      
      <AddReferrerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddReferral}
      />
    </PageContainer>
  );
};

export default AdminReferralsPage;