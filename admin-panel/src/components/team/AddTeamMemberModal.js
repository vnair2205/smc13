// admin-panel/src/components/team/AddTeamMemberModal.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getDepartments, getDesignations } from '../../services/teamService';
import { addTeamMember, updateTeamMember } from '../../services/teamService';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 500px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &.save {
    background-color: #4e73df;
    color: white;
  }

  &.cancel {
    background-color: #f8f9fc;
  }
`;

const AddTeamMemberModal = ({ member, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: member?.firstName || '',
    lastName: member?.lastName || '',
    email: member?.email || '',
    password: '',
    confirmPassword: '',
    designation: member?.designation?._id || '',
    department: member?.department?._id || '',
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [deptRes, desgRes] = await Promise.all([getDepartments(), getDesignations()]);
        setDepartments(deptRes.data);
        setDesignations(desgRes.data);
      } catch (error) {
        console.error('Failed to fetch departments or designations', error);
      }
    };
    fetchDropdownData();
  }, []);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!member && formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    if (profilePicture) {
      data.append('profilePicture', profilePicture);
    }

    try {
      if (member) {
        await updateTeamMember(member._id, data);
      } else {
        await addTeamMember(data);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save team member', error);
    }
  };
  return (
    <ModalBackdrop>
      <ModalContent>
        <h2>{member ? 'Edit' : 'Add'} Team Member</h2>
        <Form onSubmit={handleSubmit}>
          <Input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
          <Input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
          <Input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <Input name="password" type="password" placeholder="Password" onChange={handleChange} required={!member} />
          <Input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required={!member} />
          <Input type="file" onChange={handleFileChange} />
          <Select name="designation" value={formData.designation} onChange={handleChange} required>
            <option value="">Select Designation</option>
            {designations.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </Select>
          <Select name="department" value={formData.department} onChange={handleChange} required>
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </Select>
          <ButtonContainer>
            <Button type="button" className="cancel" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="save">Save</Button>
          </ButtonContainer>
        </Form>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default AddTeamMemberModal;