import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getTestUsers } from '../services/testUserService';
import AddTestUserModal from '../components/users/AddTestUserModal';
import EditTestUserModal from '../components/users/EditTestUserModal';
import BulkUploadModal from '../components/users/BulkUploadModal';
import { FaEdit } from 'react-icons/fa';

const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const TestUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isBulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = async () => {
        try {
            const response = await getTestUsers();
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching test users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setEditModalOpen(true);
    };

    return (
        <Container>
            <Header>
                <h2>Test Users</h2>
                <div>
                    <Button onClick={() => setAddModalOpen(true)}>Add User</Button>
                    <Button onClick={() => setBulkUploadModalOpen(true)} style={{ marginLeft: '1rem' }}>Bulk Upload</Button>
                </div>
            </Header>

            <table>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Phone Number</th>
                        <th>Plan</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td>{user.firstName}</td>
                            <td>{user.lastName}</td>
                            <td>{user.email}</td>
                            <td>{user.phoneNumber}</td>
                            <td>{user.plan.name}</td>
                            <td><FaEdit onClick={() => handleEditClick(user)} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isAddModalOpen && <AddTestUserModal onClose={() => setAddModalOpen(false)} onSave={fetchUsers} />}
            {isEditModalOpen && <EditTestUserModal user={selectedUser} onClose={() => setEditModalOpen(false)} onSave={fetchUsers} />}
            {isBulkUploadModalOpen && <BulkUploadModal onClose={() => setBulkUploadModalOpen(false)} onUpload={fetchUsers} />}

        </Container>
    );
};

export default TestUsersPage;