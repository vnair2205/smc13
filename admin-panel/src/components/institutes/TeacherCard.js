import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import instituteService from '../../services/instituteService';
import Modal from '../common/Modal';

// --- Styled Components ---
const Card = styled.div`
    background-color: ${({ theme }) => theme.colors.lightBackground};
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    margin-top: 2rem;
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

// --- THIS IS THE FIX ---
// Replaced 'AddButton' with a more generic 'Button'
const Button = styled.button`
    padding: 0.6rem 1.2rem;
    background-color: ${({ theme, secondary }) => secondary ? '#3a3a5c' : theme.colors.primary};
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    &:hover { opacity: 0.9; }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    th, td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    }
    th {
        color: ${({ theme }) => theme.colors.textSecondary};
        font-weight: 500;
    }
`;
const ActionButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.1rem;
    margin-right: 0.5rem;
    &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;

// Modal Form Styles
const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    .full-width { grid-column: 1 / -1; }
`;
const Input = styled.input`
    width: 100%; padding: 0.75rem 1rem; border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background-color: #1e1e32; color: ${({ theme }) => theme.colors.text};
`;
const Select = styled.select`
    width: 100%; padding: 0.75rem 1rem; border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background-color: #1e1e32; color: ${({ theme }) => theme.colors.text};
`;
const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
`;

const initialFormState = {
    firstName: '', lastName: '', email: '', password: '',
    classId: '', sectionId: '', subjectId: '',
};

// --- Component ---
const TeacherCard = ({ teachers, instituteId, classes, sections, subjects, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [formData, setFormData] = useState(initialFormState);
    const [filteredSections, setFilteredSections] = useState([]);

    useEffect(() => {
        if (formData.classId) {
            setFilteredSections(sections.filter(sec => sec.class._id === formData.classId));
        } else {
            setFilteredSections([]);
        }
    }, [formData.classId, sections]);


    const handleOpenModal = (teacher = null) => {
        if (teacher) {
            setEditingTeacher(teacher);
            setFormData({
                firstName: teacher.firstName, lastName: teacher.lastName, email: teacher.email, password: '',
                classId: teacher.class?._id || '',
                sectionId: teacher.section?._id || '',
                subjectId: teacher.subject?._id || '',
            });
        } else {
            setEditingTeacher(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTeacher(null);
        setFormData(initialFormState);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'classId') {
            setFormData(prev => ({ ...prev, sectionId: '' }));
        }
    };

    const handleSave = async () => {
        try {
            const dataToSend = { ...formData };
            if (!dataToSend.password) delete dataToSend.password;

            if (editingTeacher) {
                await instituteService.updateTeacher(editingTeacher._id, dataToSend);
            } else {
                await instituteService.addTeacher(instituteId, dataToSend);
            }
            onUpdate();
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save teacher", error);
            alert('Failed to save teacher. Check console for details.');
        }
    };

    const handleDelete = async (teacherId) => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            try {
                await instituteService.deleteTeacher(teacherId);
                onUpdate();
            } catch (error) {
                console.error("Failed to delete teacher", error);
            }
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Teachers</CardTitle>
                    {/* Using the new generic Button */}
                    <Button onClick={() => handleOpenModal()}><FiPlus /> Add Teacher</Button>
                </CardHeader>
                <Table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Class/Section</th>
                            <th>Subject</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map(teacher => (
                            <tr key={teacher._id}>
                                <td>{teacher.firstName} {teacher.lastName}</td>
                                <td>{teacher.email}</td>
                                <td>{teacher.class?.name || 'N/A'} / {teacher.section?.name || 'N/A'}</td>
                                <td>{teacher.subject?.name || 'N/A'}</td>
                                <td>
                                    <ActionButton onClick={() => handleOpenModal(teacher)}><FiEdit /></ActionButton>
                                    <ActionButton onClick={() => handleDelete(teacher._id)}><FiTrash2 /></ActionButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                {teachers.length === 0 && <p style={{textAlign: 'center', color: '#888', padding: '1rem'}}>No teachers added yet.</p>}
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingTeacher ? 'Edit Teacher' : 'Add Teacher'}
            >
                <FormGrid>
                    <Input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" />
                    <Input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" />
                    <Input className="full-width" name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
                    <Input className="full-width" name="password" type="password" value={formData.password} onChange={handleChange} placeholder={editingTeacher ? "New Password (optional)" : "Password"} />
                    <Select name="classId" value={formData.classId} onChange={handleChange}>
                        <option value="">-- Select Class --</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </Select>
                    <Select name="sectionId" value={formData.sectionId} onChange={handleChange} disabled={!formData.classId}>
                        <option value="">-- Select Section --</option>
                        {filteredSections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </Select>
                    <Select className="full-width" name="subjectId" value={formData.subjectId} onChange={handleChange}>
                        <option value="">-- Select Subject --</option>
                        {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </Select>
                </FormGrid>
                <ModalFooter>
                    {/* Using the new generic Button */}
                    <Button secondary onClick={handleCloseModal}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default TeacherCard;