import React, { useState } from 'react';
import styled from 'styled-components';
import { FiEdit, FiSave, FiXCircle } from 'react-icons/fi';
import instituteAdminService from '../../services/instituteAdminService';

// --- Styled Components (reusing styles is a good practice, but for clarity they are here) ---
const Card = styled.div`
    background-color: ${({ theme }) => theme.colors.lightBackground};
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    height: 100%;
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;

const CardTitle = styled.h3`
    margin: 0;
    font-size: 1.25rem;
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
`;

const InfoItem = styled.div`
    margin-bottom: 1rem;
    label {
        display: block;
        color: ${({ theme }) => theme.colors.textSecondary};
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
    }
    p {
        margin: 0;
        font-size: 1rem;
        font-weight: 500;
        word-break: break-all;
    }
`;

const Input = styled.input`
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background-color: #1e1e32;
    color: ${({ theme }) => theme.colors.text};
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
    grid-column: 1 / -1;
`;

// --- Component ---
const AdminDetailsCard = ({ admin, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        password: '', // Password is empty by default for security
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            // Filter out empty password so we only send it if it's changed
            const dataToSend = { ...formData };
            if (!dataToSend.password) {
                delete dataToSend.password;
            }
            
            await instituteAdminService.updateAdminDetails(admin._id, dataToSend);
            onUpdate(); // Refreshes the parent page's data
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update admin details", error);
            // You can add user-friendly error handling here
        }
    };

    const handleCancel = () => {
        setFormData({
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            password: '',
        });
        setIsEditing(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Admin Details</CardTitle>
                {!isEditing && (
                    <ActionButton onClick={() => setIsEditing(true)}>
                        <FiEdit /> Edit
                    </ActionButton>
                )}
            </CardHeader>

            {isEditing ? (
                <FormGrid>
                    <Input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" />
                    <Input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" />
                    <Input style={{ gridColumn: '1 / -1' }} name="email" value={formData.email} onChange={handleChange} placeholder="Admin Email" />
                    <Input style={{ gridColumn: '1 / -1' }} name="password" type="password" value={formData.password} onChange={handleChange} placeholder="New Password (leave blank to keep unchanged)" />
                    <ButtonContainer>
                        <ActionButton onClick={handleCancel}><FiXCircle /> Cancel</ActionButton>
                        <ActionButton onClick={handleSave}><FiSave /> Save</ActionButton>
                    </ButtonContainer>
                </FormGrid>
            ) : (
                <FormGrid>
                    <InfoItem><label>First Name</label><p>{admin.firstName}</p></InfoItem>
                    <InfoItem><label>Last Name</label><p>{admin.lastName}</p></InfoItem>
                    <InfoItem style={{ gridColumn: '1 / -1' }}><label>Email</label><p>{admin.email}</p></InfoItem>
                </FormGrid>
            )}
        </Card>
    );
};

export default AdminDetailsCard;