// client/src/components/profile/LearnsProfile.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import SelectionModal from './SelectionModal'; // Import our new reusable modal

// --- STYLES ---
const LearnsProfileContainer = styled.div`
  background-color: #1e1e2d;
  padding: 2rem;
  border-radius: 12px;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #444;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`;

const UpdateButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.3rem 0.8rem;
  border-radius: 5px;
  cursor: pointer;
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  min-height: 28px; /* Ensure container doesn't collapse when empty */
`;

const Tag = styled.span`
  background-color: #333;
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-size: 0.9rem;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  input {
    accent-color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.2);
  }
`;

const SaveButton = styled.button`
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #1e1e2d;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  &:disabled {
    background-color: #555;
  }
`;

// --- OPTIONS DATA ---
const optionsData = {
    learningGoals: {
        title: 'Update Learning Goals',
        options: ['Career Advancement', 'Career Change', 'Skill Development', 'Knowledge Expansion', 'Certification/Credentialing', 'Entrepreneurship', 'Personal Interest/Hobby', 'Stay Current in Field'],
    },
    areasOfInterest: {
        title: 'Update Areas of Interest',
        options: ['Technology & Computer Science', 'Business & Entrepreneurship', 'Data Science & Analytics', 'Creative Arts & Design', 'Health & Wellness', 'Personal Development', 'Science & Engineering', 'Humanities & Social Sciences', 'Languages & Linguistics', 'Finance & Accounting', 'Marketing & Communications', 'Education & Teaching'],
    },
    resourceNeeds: {
        title: 'Update Resource Needs',
        options: ['Interactive Content', 'Video Lectures', 'Reading Materials', 'Live Sessions', 'Community & Collaboration', 'Downloadable Resources', 'Mentorship/Coaching', 'Self-Paced Learning', 'Structured & Guided'],
    },
    newSkillTarget: {
        title: 'Update New Skill Targets',
        options: ['Programming Languages', 'Data Analysis & Visualization', 'Machine Learning & AI', 'Web Development', 'Mobile App Development', 'Cloud Computing', 'Cybersecurity', 'UI/UX Design', 'Blockchain Technology', 'Project Management', 'Digital Marketing', 'Financial Analysis', 'Leadership & Team Management', 'Business Strategy', 'Sales & Negotiation', 'Data-Driven Decision Making', 'Graphic Design', 'Content Creation', 'Public Speaking', 'Creative Writing', 'Photography & Videography', 'Time Management & Productivity', 'Critical Thinking & Problem Solving', 'Emotional Intelligence', 'Mindfulness & Meditation'],
    },
};
const experienceLevels = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Expert'];

// --- COMPONENT ---
const LearnsProfile = ({ user, onUpdate }) => {
    const [learnsData, setLearnsData] = useState({});
    const [modalConfig, setModalConfig] = useState({ isOpen: false, key: null });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setLearnsData({
                learningGoals: user.learningGoals || [],
                experienceLevel: user.experienceLevel || 'Beginner',
                areasOfInterest: user.areasOfInterest || [],
                resourceNeeds: user.resourceNeeds || [],
                newSkillTarget: user.newSkillTarget || [],
            });
        }
    }, [user]);

    const openModal = (key) => setModalConfig({ isOpen: true, key });

    const handleSaveSelection = (newSelection) => {
        setLearnsData(prev => ({ ...prev, [modalConfig.key]: newSelection }));
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        const token = localStorage.getItem('token');
        try {
            await axios.put('/api/auth/profile/learns', learnsData, {
                headers: { 'x-auth-token': token }
            });
            // Optionally: show a success toast/message
            onUpdate(); // Refetch profile data to confirm save
        } catch (error) {
            console.error('Failed to save LEARNS profile', error);
            // Optionally: show an error toast/message
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <LearnsProfileContainer>
            {modalConfig.isOpen && (
                <SelectionModal
                    isOpen={modalConfig.isOpen}
                    onClose={() => setModalConfig({ isOpen: false, key: null })}
                    title={optionsData[modalConfig.key].title}
                    options={optionsData[modalConfig.key].options}
                    selectedItems={learnsData[modalConfig.key]}
                    onSave={handleSaveSelection}
                />
            )}

            {Object.keys(optionsData).map(key => (
                <Section key={key}>
                    <SectionHeader>
                        <SectionTitle>{optionsData[key].title.replace('Update ', '')}</SectionTitle>
                        <UpdateButton onClick={() => openModal(key)}>Update</UpdateButton>
                    </SectionHeader>
                    <TagContainer>
                        {learnsData[key]?.map(item => <Tag key={item}>{item}</Tag>) ?? <p>No items selected.</p>}
                    </TagContainer>
                </Section>
            ))}

            <Section>
                <SectionHeader>
                    <SectionTitle>Experience Level</SectionTitle>
                </SectionHeader>
                <RadioGroup>
                    {experienceLevels.map(level => (
                        <RadioLabel key={level}>
                            <input
                                type="radio"
                                name="experienceLevel"
                                value={level}
                                checked={learnsData.experienceLevel === level}
                                onChange={(e) => setLearnsData({ ...learnsData, experienceLevel: e.target.value })}
                            />
                            {level}
                        </RadioLabel>
                    ))}
                </RadioGroup>
            </Section>
            
            <SaveButton onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Learns Profile'}
            </SaveButton>
        </LearnsProfileContainer>
    );
};

export default LearnsProfile;