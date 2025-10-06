import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { bulkUploadTestUsers, getSubscriptionPlans } from '../../services/testUserService';

const BulkUploadModal = ({ onClose, onUpload }) => {
    const [file, setFile] = useState(null);
    const [plan, setPlan] = useState('');
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        const fetchPlans = async () => {
            const response = await getSubscriptionPlans();
            setPlans(response.data);
        };
        fetchPlans();
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('plan', plan);

        try {
            await bulkUploadTestUsers(formData);
            onUpload();
            onClose();
        } catch (error) {
            console.error('Error during bulk upload:', error);
        }
    };
    
    const downloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "FirstName,LastName,Email,CountryCode,PhoneNumber,Password\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "test_user_template.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <Modal onClose={onClose}>
            <h2>Bulk Upload Test Users</h2>
            <select onChange={(e) => setPlan(e.target.value)}>
                <option value="">Select a Plan</option>
                {plans.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            <input type="file" onChange={handleFileChange} />
            <button onClick={downloadTemplate}>Download Template</button>
            <button onClick={handleUpload}>Upload</button>
        </Modal>
    );
};

export default BulkUploadModal;