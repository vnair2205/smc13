import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiUpload, FiEye, FiTrash } from 'react-icons/fi';
import instituteUserService from '../../services/instituteUserService';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';

const Container = styled.div`
  margin-top: 2rem;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
`;

const StudentCard = ({ instituteId, classes, sections }) => {
    const [users, setUsers] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const columns = [
        { title: 'Student ID', key: 'studentId' },
        { title: 'Name', key: 'firstName' /* Render full name */ },
        { title: 'Class', key: 'class.name' },
        { title: 'Section', key: 'section.name' },
        { title: 'Email', key: 'email' },
        { title: 'Phone', key: 'phone' },
        { title: 'Guardian Name', key: 'guardian.firstName' /* Render full name */ },
        { title: 'Guardian Email', key: 'guardian.email' },
        { title: 'Actions', key: 'actions', render: (row) => ( <div> <FiEye /> <FiTrash /> </div>) }
    ];

    useEffect(() => {
        // fetch users
    }, [instituteId]);

    return (
        <Container>
            <Header>
                <h2>Students</h2>
                <div>
                    <button onClick={() => setIsAddModalOpen(true)}><FiPlus /> Add User</button>
                    <button><FiUpload /> Bulk Upload Users</button>
                </div>
            </Header>
            <DataTable columns={columns} data={users} />
            {isAddModalOpen && (
                <Modal title="Add New Student" onClose={() => setIsAddModalOpen(false)}>
                    {/* Add student form with student and guardian details */}
                </Modal>
            )}
        </Container>
    );
};

export default StudentCard;