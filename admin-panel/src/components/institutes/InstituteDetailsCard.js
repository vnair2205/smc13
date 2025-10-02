import React, { useState } from 'react';
import styled from 'styled-components';
import { FiEdit, FiSave, FiXCircle } from 'react-icons/fi';
import instituteService from '../../services/instituteService';

// --- Styled Components ---
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
    
    .full-width {
        grid-column: 1 / -1;
    }
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
const InstituteDetailsCard = ({ institute, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        instituteName: institute.instituteName,
        instituteEmail: institute.instituteEmail,
        institutePhoneNumber: institute.institutePhoneNumber,
        address: {
            line1: institute.address?.line1 || '',
            line2: institute.address?.line2 || '',
            city: institute.address?.city || '',
            state: institute.address?.state || '',
            pinCode: institute.address?.pinCode || '',
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, [name]: value }
        }));
    };

    const handleSave = async () => {
        try {
            await instituteService.updateInstituteDetails(institute._id, formData);
            onUpdate();
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update institute details", error);
        }
    };

    const handleCancel = () => {
        // Reset form data to original state
        setFormData({
            instituteName: institute.instituteName,
            instituteEmail: institute.instituteEmail,
            institutePhoneNumber: institute.institutePhoneNumber,
            address: institute.address
        });
        setIsEditing(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Institute Details</CardTitle>
                {!isEditing && (
                    <ActionButton onClick={() => setIsEditing(true)}>
                        <FiEdit /> Edit
                    </ActionButton>
                )}
            </CardHeader>

            {isEditing ? (
                <FormGrid>
                    <Input className="full-width" name="instituteName" value={formData.instituteName} onChange={handleChange} placeholder="Institute Name" />
                    <Input name="instituteEmail" value={formData.instituteEmail} onChange={handleChange} placeholder="Institute Email" />
                    <Input name="institutePhoneNumber" value={formData.institutePhoneNumber} onChange={handleChange} placeholder="Phone Number" />
                    <Input className="full-width" name="line1" value={formData.address.line1} onChange={handleAddressChange} placeholder="Address Line 1" />
                    <Input className="full-width" name="line2" value={formData.address.line2} onChange={handleAddressChange} placeholder="Address Line 2" />
                    <Input name="city" value={formData.address.city} onChange={handleAddressChange} placeholder="City" />
                    <Input name="state" value={formData.address.state} onChange={handleAddressChange} placeholder="State" />
                    <Input name="pinCode" value={formData.address.pinCode} onChange={handleAddressChange} placeholder="Pin Code" />
                    <ButtonContainer>
                        <ActionButton onClick={handleCancel}><FiXCircle/> Cancel</ActionButton>
                        <ActionButton onClick={handleSave}><FiSave/> Save</ActionButton>
                    </ButtonContainer>
                </FormGrid>
            ) : (
                <FormGrid>
                    <InfoItem className="full-width"><label>Institute Name</label><p>{institute.instituteName}</p></InfoItem>
                    <InfoItem><label>Email</label><p>{institute.instituteEmail}</p></InfoItem>
                    <InfoItem><label>Phone Number</label><p>{institute.institutePhoneNumber}</p></InfoItem>
                    <InfoItem className="full-width"><label>Address</label><p>{`${institute.address?.line1 || ''}, ${institute.address?.city || ''}`}</p></InfoItem>
                </FormGrid>
            )}
        </Card>
    );
};

export default InstituteDetailsCard;