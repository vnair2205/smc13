import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { FiCamera } from 'react-icons/fi';
import ProfilePicModal from './ProfilePicModal';
import UpdateEmailModal from './UpdateEmailModal'; // Import our new modal
import UpdatePhoneModal from './UpdatePhoneModal'; // Import our new phone modal
import UpdateBillingAddressModal from './UpdateBillingAddressModal';

// --- DUMMY IndianStatesDropdown ---
const IndianStatesDropdown = ({ value, onChange }) => {
    const states = [ 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry' ];
    return (
        <select value={value} name="state" onChange={onChange} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#2c2f48', border: '1px solid #444', borderRadius: '6px', color: 'white' }}>
            <option value="">Select State</option>
            {states.map(state => <option key={state} value={state}>{state}</option>)}
        </select>
    );
};

// --- STYLES ---
const PersonalInfoContainer = styled.div` background-color: #1e1e2d; padding: 2rem; border-radius: 12px; `;
const ProfileHeader = styled.div` background-color: #03D9C5; border-radius: 10px; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; text-align: center; margin-bottom: 2rem; `;
const AvatarWrapper = styled.div` position: relative; width: 120px; height: 120px; cursor: pointer; `;
const ProfileImage = styled.img` width: 100%; height: 100%; border-radius: 50%; border: 4px solid white; object-fit: cover; background-color: #27293D; `;
const ProfileInitials = styled.div` width: 100%; height: 100%; border-radius: 50%; border: 4px solid white; background-color: #27293D; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: bold; color: white; `;
const CameraIconOverlay = styled.div` position: absolute; bottom: 0; right: 0; background-color: rgba(0, 0, 0, 0.6); padding: 8px; border-radius: 50%; display: flex; align-items: center; justify-content: center; `;
const UserName = styled.h2` color: #1e1e2d; margin: 0; font-size: 1.8rem; `;
const Section = styled.div` margin-bottom: 2rem; `;
const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`;
const InfoRow = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; span { color: #ccc; } `;
const UpdateButton = styled.button` background: none; border: 1px solid ${({ theme }) => theme.colors.primary}; color: ${({ theme }) => theme.colors.primary}; padding: 0.3rem 0.8rem; border-radius: 5px; cursor: pointer; font-size: 0.9rem; `;
const FormGroup = styled.div` margin-bottom: 1rem; `;
const Label = styled.label` display: block; margin-bottom: 0.5rem; color: #aaa; `;
const Input = styled.input` width: 100%; padding: 0.75rem; background-color: #2c2f48; border: 1px solid #444; border-radius: 6px; color: white; `;
const SaveButton = styled.button` padding: 0.75rem 2rem; border: none; border-radius: 8px; background-color: ${({ theme }) => theme.colors.primary}; color: #1e1e2d; font-size: 1rem; cursor: pointer; &:disabled { background-color: #555; }`;
const AddressDisplay = styled.div`
  width: 100%;
  padding: 0.75rem;
  background-color: #2c2f48;
  border: 1px solid #444;
  border-radius: 6px;
  color: #e0e0e0;
  min-height: 45px;
`;
// --- NEW STYLES FOR PRELOADER ---
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SectionTitleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid #444;
  padding-bottom: 0.5rem;
`;

const LoaderOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;

  &::after {
    content: '';
    border: 4px solid #f3f3f3;
    border-top: 4px solid #03D9C5;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: ${spin} 1s linear infinite;
  }
`;

// --- COMPONENT ---
const PersonalInfo = ({ user, onUpdate }) => {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', billingAddress: { addressLine1: '', addressLine2: '', city: '', state: '', zipCode: '' } });
    const [isPicModalOpen, setIsPicModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false); 
    const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);// New state for email modal
     const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                billingAddress: user.billingAddress || { addressLine1: '', addressLine2: '', city: '', state: '', zipCode: '' },
            });
        }
    }, [user]);
    
    // All helper functions (getInitials, handleSaveProfilePic, handleChange, handleSave) remain the same
   const getInitials = (firstName, lastName) => {
        if (!firstName || !lastName) return '..';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };
     const handleSaveProfilePic = async (image, crop) => {
        if (!crop || !image) { return; }
        setIsUploading(true); // Start preloader
        // ... (canvas logic is the same)
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        
        const token = localStorage.getItem('token');
        try {
            await axios.post('/api/profile/picture', { imageUrl: dataUrl }, { headers: { 'x-auth-token': token } });
            onUpdate(); // Refetch profile data
        } catch (error) {
            console.error("Failed to update profile picture", error);
        } finally {
            setIsUploading(false); // Stop preloader
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'state') { // Handle dropdown change
             setFormData(prev => ({ ...prev, billingAddress: { ...prev.billingAddress, state: value } }));
        } else if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
   const handleSave = async () => {
        setIsSaving(true);
        const token = localStorage.getItem('token');
        try {
            const payload = { 
                firstName: formData.firstName, 
                lastName: formData.lastName,
                billingAddress: formData.billingAddress 
            };
            await axios.put('/api/profile/personal', payload, { headers: { 'x-auth-token': token } });
            onUpdate();
        } catch (error) {
            console.error('Failed to save personal info', error);
        } finally {
            setIsSaving(false);
        }
    };
    const handleSaveAddress = async (newAddress) => {
        const token = localStorage.getItem('token');
        try {
            // We only send the billingAddress part of the payload
            const payload = { billingAddress: newAddress };
            await axios.put('/api/auth/profile/personal', payload, { headers: { 'x-auth-token': token } });
            onUpdate(); // Refetch all profile data
            setIsAddressModalOpen(false); // Close modal on success
        } catch (error) {
            console.error('Failed to save billing address', error);
            // Optionally show an error message to the user
        }
    };

    return (
        <PersonalInfoContainer>
            <ProfilePicModal 
                isOpen={isPicModalOpen} 
                onClose={() => setIsPicModalOpen(false)} 
                onSave={handleSaveProfilePic} 
            />
            {/* Render the new Email Modal */}
            <UpdateEmailModal 
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                currentUserEmail={user.email}
                onUpdateSuccess={onUpdate}
            />

            {/* Render the new Phone Modal */}
            <UpdatePhoneModal
                isOpen={isPhoneModalOpen}
                onClose={() => setIsPhoneModalOpen(false)}
                onUpdateSuccess={onUpdate}
            />
            <UpdateBillingAddressModal 
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                currentAddress={user.billingAddress}
                onSave={handleSaveAddress}
            />

            <ProfileHeader>
                <AvatarWrapper onClick={() => !isUploading && setIsPicModalOpen(true)}>
                    {isUploading && <LoaderOverlay />}
                    {user.profilePicture && (user.profilePicture.startsWith('data:image') || user.profilePicture.startsWith('http')) ? (
                        <ProfileImage src={user.profilePicture} alt="Profile" />
                    ) : (
                        <ProfileInitials>{getInitials(user.firstName, user.lastName)}</ProfileInitials>
                    )}
                    {!isUploading && <CameraIconOverlay><FiCamera color="white" size={20} /></CameraIconOverlay>}
                </AvatarWrapper>
                <UserName>{`${user.firstName} ${user.lastName}`}</UserName>
            </ProfileHeader>
            
            <Section>
                <SectionTitle>Contact Information</SectionTitle>
                <InfoRow>
                    <span>{user.email}</span>
                    {/* Connect the button to open the modal */}
                    <UpdateButton onClick={() => setIsEmailModalOpen(true)}>Update</UpdateButton>
                </InfoRow>
                <InfoRow>
                   <span>{user.phoneNumber || 'Not provided'}</span>
                    {/* Connect the button to open the phone modal */}
                    <UpdateButton onClick={() => setIsPhoneModalOpen(true)}>Update</UpdateButton>
                </InfoRow>
            </Section>

            <Section>
                <SectionTitle>Billing Address</SectionTitle>
                {/* Billing address form... */}
                <FormGroup>
                    <Label>Address Line 1</Label>
                    <Input name="billingAddress.addressLine1" value={formData.billingAddress.addressLine1} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                    <Label>Address Line 2</Label>
                    <Input name="billingAddress.addressLine2" value={formData.billingAddress.addressLine2} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                    <Label>City</Label>
                    <Input name="billingAddress.city" value={formData.billingAddress.city} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                    <Label>State</Label>
                    <IndianStatesDropdown value={formData.billingAddress.state} onChange={handleChange}/>
                </FormGroup>
                <FormGroup>
                    <Label>Pin Code</Label>
                    <Input name="billingAddress.zipCode" value={formData.billingAddress.zipCode} onChange={handleChange} />
                </FormGroup>
            </Section>
            
            <SaveButton onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
            </SaveButton>
        </PersonalInfoContainer>
    );
};

export default PersonalInfo;