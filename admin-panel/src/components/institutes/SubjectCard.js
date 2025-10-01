import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiUpload, FiEdit, FiTrash2, FiSave, FiXCircle, FiDownload } from 'react-icons/fi';
import instituteService from '../../services/instituteService';
import Modal from '../common/Modal'; // Assuming you have a generic Modal component

// --- Styled Components ---
const Card = styled.div`
    background-color: ${({ theme }) => theme.colors.lightBackground};
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
    margin: 0;
    font-size: 1.25rem;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 0.5rem;
`;

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

const Input = styled.input` /* For single add/edit */
    flex-grow: 1;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background-color: #1e1e32;
    color: ${({ theme }) => theme.colors.text};
`;

const List = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    overflow-y: auto;
    flex-grow: 1;
`;

const ListItem = styled.li`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ActionButton = styled.button` /* For edit/delete icons */
    background: none;
    border: none;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.1rem;
    margin-left: 0.5rem;
    &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;

// --- Bulk Upload Modal Styles ---
const ModalContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
`;

const UploadInput = styled.input`
    display: none;
`;

const UploadLabel = styled.label`
    padding: 2rem;
    border: 2px dashed ${({ theme }) => theme.colors.border};
    border-radius: 12px;
    cursor: pointer;
    text-align: center;
    width: 100%;
    color: ${({ theme }) => theme.colors.textSecondary};
    &:hover {
        border-color: ${({ theme }) => theme.colors.primary};
        color: ${({ theme }) => theme.colors.primary};
    }
`;

// --- Component ---
const SubjectCard = ({ subjects, instituteId, onUpdate }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleSave = async () => {
        try {
            if (editingId) {
                await instituteService.updateSubject(editingId, { name });
            } else {
                await instituteService.addSubject(instituteId, { name });
            }
            onUpdate();
            resetState();
        } catch (error) { console.error("Failed to save subject", error); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            try {
                await instituteService.deleteSubject(id);
                onUpdate();
            } catch (error) { console.error("Failed to delete subject", error); }
        }
    };

    const handleBulkUpload = async () => {
        if (!uploadFile) return;
        setIsUploading(true);
        try {
            await instituteService.bulkUploadSubjects(instituteId, uploadFile);
            onUpdate();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to upload subjects", error);
            alert("Upload failed. Please check the console for details.");
        } finally {
            setIsUploading(false);
            setUploadFile(null);
        }
    };

    const downloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,Subject Name\nExample Subject 1\nExample Subject 2";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "subject_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const resetState = () => {
        setIsAdding(false);
        setEditingId(null);
        setName('');
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Subjects</CardTitle>
                    <HeaderActions>
                        <Button secondary onClick={() => setIsModalOpen(true)}><FiUpload /> Bulk Upload</Button>
                        <Button onClick={() => { setIsAdding(true); setEditingId(null); setName(''); }}><FiPlus /> Add</Button>
                    </HeaderActions>
                </CardHeader>

                {isAdding && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter subject name" />
                        <ActionButton onClick={handleSave}><FiSave /></ActionButton>
                        <ActionButton onClick={resetState}><FiXCircle /></ActionButton>
                    </div>
                )}

                <List>
                    {subjects.map((sub) => (
                        <ListItem key={sub._id}>
                            {editingId === sub._id ? (
                                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                                    <ActionButton onClick={handleSave}><FiSave /></ActionButton>
                                    <ActionButton onClick={resetState}><FiXCircle /></ActionButton>
                                </div>
                            ) : (
                                <>
                                    <span>{sub.name}</span>
                                    <div>
                                        <ActionButton onClick={() => { setEditingId(sub._id); setName(sub.name); setIsAdding(false); }}><FiEdit /></ActionButton>
                                        <ActionButton onClick={() => handleDelete(sub._id)}><FiTrash2 /></ActionButton>
                                    </div>
                                </>
                            )}
                        </ListItem>
                    ))}
                     {subjects.length === 0 && !isAdding && <p style={{textAlign: 'center', color: '#888'}}>No subjects added yet.</p>}
                </List>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Bulk Upload Subjects"
                onSave={handleBulkUpload}
                saveText={isUploading ? 'Uploading...' : 'Upload'}
                isSaveDisabled={!uploadFile || isUploading}
            >
                <ModalContent>
                    <Button secondary onClick={downloadTemplate}><FiDownload/> Download CSV Template</Button>
                    <UploadLabel>
                        <FiUpload style={{ marginRight: '0.5rem' }} />
                        {uploadFile ? uploadFile.name : 'Click to choose a .csv file'}
                        <UploadInput type="file" accept=".csv" onChange={(e) => setUploadFile(e.target.files[0])} />
                    </UploadLabel>
                </ModalContent>
            </Modal>
        </>
    );
};

export default SubjectCard;