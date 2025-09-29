import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import instituteService from '../services/instituteService';
import Preloader from '../components/common/Preloader';
import PlanDetailsCard from '../components/institutes/PlanDetailsCard';
import InstituteInfoCard from '../components/institutes/InstituteInfoCard';
import AdminDetailsCard from '../components/institutes/AdminDetailsCard';
import ClassCard from '../components/institutes/ClassCard';
import SectionCard from '../components/institutes/SectionCard';
import SubjectCard from '../components/institutes/SubjectCard';
import TeacherCard from '../components/institutes/TeacherCard';
import StudentCard from '../components/institutes/StudentCard';

const PageContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
`;

const InstituteDetailPage = () => {
  const { id } = useParams();
  const [institute, setInstitute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInstitute = async () => {
      try {
        const { data } = await instituteService.getInstituteById(id);
        setInstitute(data);
      } catch (error) {
        console.error("Failed to fetch institute details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInstitute();
  }, [id]);

  if (isLoading) {
    return <Preloader />;
  }

  if (!institute) {
    return <PageContainer><Title>Institute not found.</Title></PageContainer>;
  }

  return (
     <PageContainer>
      <Title>{institute.instituteName}</Title>
      <GridContainer>
        <PlanDetailsCard institute={institute} />
        <InstituteInfoCard institute={institute} />
        <AdminDetailsCard admin={institute.admin} />
        <ClassCard instituteId={institute._id} />
        {/* Pass fetched data to the cards that need it */}
        <SectionCard instituteId={institute._id} classes={classes} />
        <SubjectCard instituteId={institute._id} />
      </GridContainer>

      <TeacherCard
        instituteId={institute._id}
        classes={classes}
        sections={sections}
        subjects={subjects}
      />
      
      <StudentCard
        instituteId={institute._id}
        classes={classes}
        sections={sections}
      />
    </PageContainer>
  );
};

export default InstituteDetailPage;