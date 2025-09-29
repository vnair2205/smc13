import React, { useState } from 'react';
import styled from 'styled-components';
import { FiEdit, FiSave } from 'react-icons/fi';

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

// ... (Use the same styled components as InstituteInfoCard: CardHeader, CardTitle, EditButton, InfoInput)

const AdminDetailsCard = ({ admin }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    password: '', // Password field is kept blank for security
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    // --- API call to update admin details ---
    console.log("Saving admin info:", formData);
    setIsEditing(false);
  };

  return (
    <Card>
        {/* ... Card JSX similar to InstituteInfoCard ... */}
    </Card>
  );
};

export default AdminDetailsCard;