import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiEdit, FiTrash } from 'react-icons/fi';
import classService from '../../services/classService';

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1rem;
`;

const AddButton = styled.button`
    /* Add your button styles */
`;

const ClassList = styled.ul`
  list-style: none;
  padding: 0;
`;

const ClassItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ClassCard = ({ instituteId }) => {
  const [classes, setClasses] = useState([]);
  const [newClassName, setNewClassName] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      const { data } = await classService.getClassesByInstitute(instituteId);
      setClasses(data);
    };
    fetchClasses();
  }, [instituteId]);

  const handleAddClass = async () => {
    if (!newClassName) return;
    const { data } = await classService.createClass({ name: newClassName, instituteId });
    setClasses([...classes, data]);
    setNewClassName('');
  };

  return (
    <Card>
      <CardTitle>Classes</CardTitle>
      <div>
        <input
          type="text"
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          placeholder="New class name"
        />
        <AddButton onClick={handleAddClass}><FiPlus /> Add Class</AddButton>
      </div>
      <ClassList>
        {classes.map((c) => (
          <ClassItem key={c._id}>
            {c.name}
            <div>
              <FiEdit /> <FiTrash />
            </div>
          </ClassItem>
        ))}
      </ClassList>
    </Card>
  );
};

export default ClassCard;