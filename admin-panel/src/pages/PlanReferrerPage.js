// admin-panel/src/pages/PlanReferrerPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FiPlus, FiEdit } from 'react-icons/fi';
import DataTable from '../components/common/DataTable';
import AddEditReferrerModal from '../components/referrers/AddEditReferrerModal';
import referrerService from '../services/referrerService';

// --- Styled components remain unchanged ---
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
// --- End of Styled components ---

const PlanReferrerPage = () => {
    const [referrers, setReferrers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReferrer, setEditingReferrer] = useState(null);

    const fetchReferrers = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await referrerService.getReferrers();
            setReferrers(data);
        } catch (error) {
            console.error('Failed to fetch referrers', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReferrers();
    }, [fetchReferrers]);

    const handleOpenModal = (referrer = null) => {
        setEditingReferrer(referrer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingReferrer(null);
    };

    const handleSaveReferrer = async (referrerData) => {
        try {
            if (editingReferrer) {
                await referrerService.updateReferrer(editingReferrer._id, referrerData);
            } else {
                await referrerService.createReferrer(referrerData);
            }
            fetchReferrers(); // This is correct, it re-fetches the data.
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save referrer', error);
        }
    };

    // --- FIX: Update the columns definition to match DataTable.js props ---
    const columns = [
        {
            title: 'Referrer Name',
            key: 'name',
            render: (row) => `${row.firstName} ${row.lastName}`,
        },
        { title: 'Email', key: 'email' },
        { title: 'Phone', key: 'phone' },
        {
            title: 'Plan',
            key: 'plan',
            render: (row) => row.plan?.name || 'N/A',
        },
        { title: 'User Count', key: 'userCount' },
        {
            title: 'Actions',
            key: 'actions',
            render: (row) => (
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