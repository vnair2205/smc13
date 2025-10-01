import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiUpload, FiEye, FiTrash2, FiDownload } from 'react-icons/fi';
import instituteService from '../../services/instituteService';
import Modal from '../common/Modal';
import Preloader from '../common/Preloader';

// --- Styled Components ---
const Container = styled.div`
    background-color: ${({ theme }) => theme.colors.lightBackground};
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    margin-top: 2rem;
`;
const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;
const Title = styled.h3`
    margin: 0;
    font-size: 1.25rem;
`;
const HeaderActions = styled.div` display: flex; gap: 0.5rem; `;
const Button = styled.button`
    padding: 0.6rem 1.2rem;
    background-color: ${({ theme, secondary }) => secondary ? '#3a3a5c' : theme.colors.primary};
    color: white; border: none; border-radius: 8px; cursor: pointer;
    font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;
    &:hover { opacity: 0.9; }
    &:disabled { background-color: #555; cursor: not-allowed; }
`;
const Table = styled.table`
    width: 100%; border-collapse: collapse;
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; }
    th { color: ${({ theme }) => theme.colors.textSecondary}; font-weight: 500; }
`;
const ActionButton = styled.button`
    background: none; border: none; cursor: pointer; color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.1rem; margin-right: 0.5rem;
    &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;

// Modal & Form Styles
const FormGrid = styled.div`
    display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
    h4 { grid-column: 1 / -1; margin: 1rem 0 0; border-bottom: 1px solid #444; padding-bottom: 0.5rem; }
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
const UploadLabel = styled.label`
    padding: 2rem; border: 2px dashed ${({ theme }) => theme.colors.border};
    border-radius: 12px; cursor: pointer; text-align: center; width: 100%;
    color: ${({ theme }) => theme.colors.textSecondary};
    &:hover { border-color: ${({ theme }) => theme.colors.primary}; color: ${({ theme }) => theme.colors.primary}; }
`;
const ErrorList = styled.ul`
    list-style-type: none; padding: 0; margin-top: 1rem;
    background-color: rgba(255, 0, 0, 0.1); border: 1px solid red;
    border-radius: 8px; max-height: 150px; overflow-y: auto; width: 100%;
    li { padding: 0.5rem 1rem; font-size: 0.9rem; }
`;

const initialFormState = {
    studentId: '', firstName: '', lastName: '', email: '', phone: '',
    classId: '', sectionId: '',
    guardianFirstName: '', guardianLastName: '', guardianEmail: '', guardianPhone: ''
};

// --- Component ---
const StudentTable = ({ students, instituteId, classes, sections, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState(initialFormState);
    const [uploadFile, setUploadFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadErrors, setUploadErrors] = useState([]);
    
    // State for the dropdowns in both modals
    const [singleUserFilteredSections, setSingleUserFilteredSections] = useState([]);
    const [bulkUploadClassId, setBulkUploadClassId] = useState('');
    const [bulkUploadSectionId, setBulkUploadSectionId] = useState('');
    const [bulkUploadFilteredSections, setBulkUploadFilteredSections] = useState([]);

    // Effect for single add/edit modal
    useEffect(() => {
        if (formData.classId) {
            setSingleUserFilteredSections(sections.filter(sec => sec.class._id === formData.classId));
        } else {
            setSingleUserFilteredSections([]);
        }
    }, [formData.classId, sections]);

    // Effect for bulk upload modal
    useEffect(() => {
        if (bulkUploadClassId) {
            setBulkUploadFilteredSections(sections.filter(sec => sec.class._id === bulkUploadClassId));
        } else {
            setBulkUploadFilteredSections([]);
        }
    }, [bulkUploadClassId, sections]);

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                studentId: user.studentId, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone || '',
                classId: user.class?._id || '', sectionId: user.section?._id || '',
                guardianFirstName: user.guardian?.firstName || '', guardianLastName: user.guardian?.lastName || '',
                guardianEmail: user.guardian?.email || '', guardianPhone: user.guardian?.phone || ''
            });
        } else {
            setEditingUser(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };
    
    const handleCloseBulkModal = () => {
        setIsBulkModalOpen(false);
        setUploadFile(null);
        setUploadErrors([]);
        setBulkUploadClassId('');
        setBulkUploadSectionId('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'classId') {
            setFormData(prev => ({ ...prev, classId: value, sectionId: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        try {
            if (editingUser) {
                await instituteService.updateInstituteUser(editingUser._id, formData);
            } else {
                await instituteService.addInstituteUser(instituteId, formData);
            }
            onUpdate();
            handleCloseModal();
        } catch (error) { 
            console.error("Failed to save student:", error.response?.data || error.message);
            alert("Failed to save student. Please check the console for details.");
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await instituteService.deleteInstituteUser(userId);
                onUpdate();
            } catch (error) { console.error("Failed to delete user", error); }
        }
    };

    const handleBulkUpload = async () => {
        if (!uploadFile || !bulkUploadClassId || !bulkUploadSectionId) {
            alert('Please select a class, a section, and a file to upload.');
            return;
        }
        setIsUploading(true);
        setUploadErrors([]);
        try {
            await instituteService.bulkUploadInstituteUsers(instituteId, uploadFile, bulkUploadClassId, bulkUploadSectionId);
            alert('Bulk upload successful!');
            onUpdate();
            handleCloseBulkModal();
        } catch (error) {
             console.error("Bulk upload failed:", error.response?.data || error);
             setUploadErrors(error.response?.data?.errors || ['An unexpected error occurred.']);
        } finally {
            setIsUploading(false);
        }
    };

    const downloadTemplate = () => {
        const headers = "Student ID,First Name,Last Name,Email,Phone,Guardian First Name,Guardian Last Name,Guardian Email,Guardian Phone";
        const csvContent = "data:text/csv;charset=utf-8," + headers;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "student_bulk_upload_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    return (
        <>
            <Container>
                <Header>
                    <Title>Students</Title>
                    <HeaderActions>
                        <Button secondary onClick={() => setIsBulkModalOpen(true)}><FiUpload /> Bulk Upload</Button>
                        <Button onClick={() => handleOpenModal()}><FiPlus /> Add Student</Button>
                    </HeaderActions>
                </Header>
                <Table>
                    <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Class/Section</th>
                            <th>Email</th>
                            <th>Guardian</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.docs.map(user => (
                            <tr key={user._id}>
                                <td>{user.studentId}</td>
                                <td>{user.firstName} {user.lastName}</td>
                                <td>{user.class?.name || 'N/A'} / {user.section?.name || 'N/A'}</td>
                                <td>{user.email}</td>
                                <td>{user.guardian?.email || 'N/A'}</td>
                                <td>
                                    <ActionButton onClick={() => handleOpenModal(user)}><FiEye /></ActionButton>
                                    <ActionButton onClick={() => handleDelete(user._id)}><FiTrash2 /></ActionButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? 'Edit Student' : 'Add Student'}>
                <FormGrid>
                    <h4>Student Details</h4>
                    <Input name="studentId" value={formData.studentId} onChange={handleChange} placeholder="Student ID" />
                    <Input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" />
                    <Input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" />
                    <Input name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
                    <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" />
                    <Select name="classId" value={formData.classId} onChange={handleChange}>
                        <option value="">-- Select Class --</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </Select>
                    <Select name="sectionId" value={formData.sectionId} onChange={handleChange} disabled={!formData.classId}>
                        <option value="">-- Select Section --</option>
                        {singleUserFilteredSections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </Select>
                    <h4>Guardian Details (Optional)</h4>
                    <Input name="guardianFirstName" value={formData.guardianFirstName} onChange={handleChange} placeholder="Guardian First Name" />
                    <Input name="guardianLastName" value={formData.guardianLastName} onChange={handleChange} placeholder="Guardian Last Name" />
                    <Input name="guardianEmail" value={formData.guardianEmail} onChange={handleChange} placeholder="Guardian Email" />
                    <Input name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} placeholder="Guardian Phone" />
                </FormGrid>
                <ModalFooter>
                    <Button secondary onClick={handleCloseModal}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </ModalFooter>
            </Modal>

            <Modal isOpen={isBulkModalOpen} onClose={handleCloseBulkModal} title="Bulk Upload Students">
                 {isUploading && <Preloader message="Uploading students, please wait..." />}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', opacity: isUploading ? 0.5 : 1 }}>
                    <FormGrid>
                        <Select value={bulkUploadClassId} onChange={e => { setBulkUploadClassId(e.target.value); setBulkUploadSectionId(''); }} disabled={isUploading}>
                            <option value="">-- Select Class for Upload --</option>
                            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </Select>
                        <Select value={bulkUploadSectionId} onChange={e => setBulkUploadSectionId(e.target.value)} disabled={!bulkUploadClassId || isUploading}>
                            <option value="">-- Select Section for Upload --</option>
                            {bulkUploadFilteredSections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </Select>
                    </FormGrid>

                    <Button secondary onClick={downloadTemplate} disabled={isUploading}>
                        <FiDownload/> Download CSV Template
                    </Button>
                    <UploadLabel>
                        <FiUpload style={{ marginRight: '0.5rem' }} />
                        {uploadFile ? uploadFile.name : 'Click to choose a .csv file'}
                        <input type="file" accept=".csv" onChange={e => setUploadFile(e.target.files[0])} style={{ display: 'none' }} disabled={isUploading} />
                    </UploadLabel>

                    {uploadErrors.length > 0 && (
                        <ErrorList>
                            {uploadErrors.map((error, index) => <li key={index}>{error}</li>)}
                        </ErrorList>
                    )}
                 </div>
                 <ModalFooter>
                    <Button secondary onClick={handleCloseBulkModal} disabled={isUploading}>Cancel</Button>
                    <Button onClick={handleBulkUpload} disabled={!uploadFile || isUploading || !bulkUploadClassId || !bulkUploadSectionId}>
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                 </ModalFooter>
            </Modal>
        </>
    );
};

export default StudentTable;