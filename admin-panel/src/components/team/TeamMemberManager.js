// admin-panel/src/components/team/TeamMemberManager.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getTeamMembers, deleteTeamMember } from '../../services/teamService';
import AddTeamMemberModal from './AddTeamMemberModal';

const Container = styled.div``;

const AddButton = styled.button`
  background-color: #4e73df;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 20px;
`;

const StyledButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background-color: #02b3a3;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: #2a2a3e;
  color: ${({ theme }) => theme.colors.text};

  th,
  td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #33333e;
  }

  th {
    background-color: #1e1e2d;
    font-weight: 600;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const ProfilePic = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: white;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;
const Actions = styled.div`
  display: flex;
  gap: 1rem;

  button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    transition: color 0.3s ease;

    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const TeamMemberManager = () => {
  const [members, setMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const { data } = await getTeamMembers();
      setMembers(data);
    } catch (error) {
      console.error('Failed to load team members', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await deleteTeamMember(id);
        loadMembers();
      } catch (error) {
        console.error('Failed to delete team member', error);
      }
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    loadMembers();
  };

  return (
    <Container>
      <AddButton onClick={() => setIsModalOpen(true)}>Add Team Member</AddButton>
      {isModalOpen && <AddTeamMemberModal member={editingMember} onClose={closeModal} />}
      <Table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Profile Picture</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Designation</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member._id}>
              <td>{member._id}</td>
              <td>
                <ProfilePic>
                  {member.profilePicture ? (
                    <img src={`http://localhost:5000/${member.profilePicture}`} alt="Profile" />
                  ) : (
                    // --- THIS IS THE FIX ---
                    `${member.firstName ? member.firstName.charAt(0) : ''}${member.lastName ? member.lastName.charAt(0) : ''}`
                  )}
                </ProfilePic>
              </td>
              <td>{member.firstName}</td>
              <td>{member.lastName}</td>
              <td>{member.email}</td>
              <td>{member.designation?.name}</td>
              <td>{member.department?.name}</td>
              <td>
                <Actions>
                  <button className="edit" onClick={() => handleEdit(member)}>Edit</button>
                  <button className="delete" onClick={() => handleDelete(member._id)}>Delete</button>
                </Actions>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default TeamMemberManager;