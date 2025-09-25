import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FaInstagram, FaYoutube, FaTwitter, FaLinkedin, FaFacebook } from 'react-icons/fa';

// --- Styled Components ---
const BioFormContainer = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const SectionTitle = styled.h2`
    color: ${({ theme }) => theme.colors.primary};
    border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
    padding-bottom: 0.5rem;
    margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.textSecondary};
`;

const TextArea = styled.textarea`
    min-height: 150px;
    padding: 1rem;
    border: 1px solid #444;
    border-radius: 8px;
    background-color: #33333d;
    color: white;
    font-size: 1rem;
    width: 100%;
    
    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.primary};
    }
`;

const SocialMediaGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

// FIX: Define the Input styled component for this file
const Input = styled.input`
    padding: 0.75rem 1rem;
    border: 1px solid #444;
    border-radius: 8px;
    background-color: #33333d;
    color: white;
    font-size: 1rem;
    width: 100%;
    
    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.primary};
    }
`;

const SocialMediaInput = styled(Input)`
    flex: 1;
`;

const SocialIcon = styled.div`
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1.5rem;
`;

const Button = styled.button`
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 8px;
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
    width: fit-content;

    &:hover {
        background-color: #02c3b2;
    }

    &:disabled {
        background-color: #555;
        cursor: not-allowed;
    }
`;

const StatusMessage = styled.p`
    font-size: 1rem;
    color: ${({ type }) => (type === 'success' ? '#4CAF50' : '#F44336')};
`;

const Bio = ({ user }) => {
    const [bioData, setBioData] = useState({
        bio: '',
        socialMedia: {
            instagram: '',
            youtube: '',
            x: '',
            linkedin: '',
            facebook: '',
        }
    });
    const [status, setStatus] = useState({ message: '', type: '' });

    useEffect(() => {
        if (user) {
            setBioData({
                bio: user.bio || '',
                socialMedia: user.socialMedia || {}
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('socialMedia')) {
            const field = name.split('.')[1];
            setBioData(prev => ({
                ...prev,
                socialMedia: {
                    ...prev.socialMedia,
                    [field]: value
                }
            }));
        } else {
            setBioData(prev => ({ ...prev, bio: value }));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const config = { headers: { 'x-auth-token': token } };

        try {
            const res = await axios.put('/api/auth/profile/bio', bioData, config);
            setStatus({ message: res.data.msg, type: 'success' });
        } catch (err) {
            console.error(err);
            setStatus({ message: 'Failed to update bio. Please try again.', type: 'error' });
        }
    };

    return (
        <BioFormContainer onSubmit={handleUpdate}>
            {status.message && <StatusMessage type={status.type}>{status.message}</StatusMessage>}
            
            <SectionTitle>About Me</SectionTitle>
            <FormGroup>
                <Label htmlFor="bio">Bio</Label>
                <TextArea id="bio" name="bio" value={bioData.bio} onChange={handleChange} placeholder="Write a brief bio about yourself..." />
            </FormGroup>

            <SectionTitle>Social Media Links</SectionTitle>
            <FormGroup>
                <SocialMediaGroup>
                    <SocialIcon><FaInstagram /></SocialIcon>
                    <SocialMediaInput type="text" name="socialMedia.instagram" placeholder="Instagram URL" value={bioData.socialMedia.instagram || ''} onChange={handleChange} />
                </SocialMediaGroup>
            </FormGroup>
            <FormGroup>
                <SocialMediaGroup>
                    <SocialIcon><FaYoutube /></SocialIcon>
                    <SocialMediaInput type="text" name="socialMedia.youtube" placeholder="YouTube URL" value={bioData.socialMedia.youtube || ''} onChange={handleChange} />
                </SocialMediaGroup>
            </FormGroup>
            <FormGroup>
                <SocialMediaGroup>
                    <SocialIcon><FaTwitter /></SocialIcon>
                    <SocialMediaInput type="text" name="socialMedia.x" placeholder="X (Twitter) URL" value={bioData.socialMedia.x || ''} onChange={handleChange} />
                </SocialMediaGroup>
            </FormGroup>
            <FormGroup>
                <SocialMediaGroup>
                    <SocialIcon><FaLinkedin /></SocialIcon>
                    <SocialMediaInput type="text" name="socialMedia.linkedin" placeholder="LinkedIn URL" value={bioData.socialMedia.linkedin || ''} onChange={handleChange} />
                </SocialMediaGroup>
            </FormGroup>
            <FormGroup>
                <SocialMediaGroup>
                    <SocialIcon><FaFacebook /></SocialIcon>
                    <SocialMediaInput type="text" name="socialMedia.facebook" placeholder="Facebook URL" value={bioData.socialMedia.facebook || ''} onChange={handleChange} />
                </SocialMediaGroup>
            </FormGroup>
            
            <Button type="submit">Save Bio</Button>
        </BioFormContainer>
    );
};

export default Bio;