import React, { useState } from 'react';
import styled from 'styled-components';
import { FiEdit, FiSave } from 'react-icons/fi';

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
`;

const EditButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  font-size: 1.2rem;
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const InfoInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const InstituteInfoCard = ({ institute }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    instituteName: institute.instituteName,
    instituteEmail: institute.instituteEmail,
    institutePhoneNumber: institute.institutePhoneNumber,
    addressLine1: institute.address.addressLine1,
    addressLine2: institute.address.addressLine2,
    city: institute.address.city,
    state: institute.address.state,
    pinCode: institute.address.pinCode,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    // --- API call to update institute details ---
    console.log("Saving institute info:", formData);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Institute Details</CardTitle>
        <EditButton onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? <FiSave onClick={handleSave} /> : <FiEdit />}
        </EditButton>
      </CardHeader>
      {Object.entries(formData).map(([key, value]) => (
        <div key={key}>
          <strong>{key.replace(/([A-Z])/g, ' $1').trim()}: </strong>
          {isEditing ? (
            <InfoInput
              type="text"
              name={key}
              value={value}
              onChange={handleInputChange}
            />
          ) : (
            <span>{value}</span>
          )}
        </div>
      ))}
    </Card>
  );
};

export default InstituteInfoCard;