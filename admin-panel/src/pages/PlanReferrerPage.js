// admin-panel/src/pages/PlanReferrerPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiEdit } from 'react-icons/fi';
import DataTable from '../components/common/DataTable';
import AddEditReferrerModal from '../components/referrers/AddEditReferrerModal';
import referrerService from '../services/referrerService'; // --- IMPORT THE NEW SERVICE ---

// ... (keep all styled components as they were)
const PageWrapper = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text};
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

const PlanReferrerPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReferrer, setEditingReferrer] = useState(null);
    const [referrers, setReferrers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // --- START: MODIFIED DATA FETCHING ---
    const fetchReferrers = async () => {
        setIsLoading(true);
        try {
            const data = await referrerService.getReferrers();
            setReferrers(data);
        } catch (error) {
            console.error("Failed to fetch referrers", error);
            // Optionally, show an error message to the user
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReferrers();
    }, []);
    // --- END: MODIFIED DATA FETCHING ---

    const handleOpenModal = (referrer = null) => {
        setEditingReferrer(referrer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingReferrer(null);
        setIsModalOpen(false);
    };

    // --- START: MODIFIED SAVE LOGIC ---
    const handleSaveReferrer = async (referrerData) => {
        try {
            if (referrerData._id) {
                // Update existing referrer
                await referrerService.updateReferrer(referrerData._id, referrerData);
            } else {
                // Create new referrer
                await referrerService.createReferrer(referrerData);
            }
            fetchReferrers(); // Re-fetch the list to show the changes
        } catch (error) {
            console.error('Failed to save referrer', error);
            // Optionally, show an error message
        } finally {
            handleCloseModal();
        }
    };
    // --- END: MODIFIED SAVE LOGIC ---

    const columns = [
        {
            header: 'Referrer Name',
            accessor: (row) => `${row.firstName} ${row.lastName}`,
        },
        { header: 'Email', accessor: 'email' },
        { header: 'Phone', accessor: 'phone' },
        {
            header: 'Plan',
            accessor: (row) => row.plan?.name || 'N/A',
        },
        { header: 'User Count', accessor: 'userCount' },
        {
            header: 'Actions',
            accessor: (row) => (
                <button onClick={() => handleOpenModal(row)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#007bff' }}>
                    <FiEdit size={18} />
                </button>
            ),
        },
    ];

    return (
        <PageWrapper>
            <Header>
                <Title>Plan Referrers</Title>
                <Button onClick={() => handleOpenModal()}>
                    <FiPlus />
                    Add Referrer
                </Button>
            </Header>

            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <DataTable columns={columns} data={referrers} />
            )}

            {isModalOpen && (
                <AddEditReferrerModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveReferrer}
                    referrerData={editingReferrer}
                />
            )}
        </PageWrapper>
    );
};

export default PlanReferrerPage;