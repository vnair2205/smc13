import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import instituteService from '../services/instituteService';
import Preloader from '../components/common/Preloader';
import PlanCard from '../components/institutes/PlanCard';

import InstituteDetailsCard from '../components/institutes/InstituteDetailsCard';
import AdminDetailsCard from '../components/institutes/AdminDetailsCard';
import ClassCard from '../components/institutes/ClassCard';
import SectionCard from '../components/institutes/SectionCard';
import SubjectCard from '../components/institutes/SubjectCard';
import TeacherCard from '../components/institutes/TeacherCard';
import StudentTable from '../components/institutes/StudentTable';

const PageContainer = styled.div`
  padding: 2rem;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
`;

const FullWidthContainer = styled.div`
  grid-column: 1 / -1;
`;


const InstituteDetailPage = () => {
    const { id } = useParams();
    const [instituteData, setInstituteData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchInstituteData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await instituteService.getInstituteById(id);
            setInstituteData(res.data);
        } catch (error) {
            console.error("Failed to fetch institute details", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchInstituteData();
    }, [fetchInstituteData]);

    if (loading) {
        return <Preloader />;
    }

    if (!instituteData) {
        return <PageContainer><h2>Institute not found.</h2></PageContainer>;
    }

    const { institute, classes, sections, subjects, teachers, users } = instituteData;

    return (
        <PageContainer>
            <h1>{institute.instituteName}</h1>
           <GridContainer>
                <PlanCard institute={institute} onUpdate={fetchInstituteData} />
                <InstituteDetailsCard institute={institute} onUpdate={fetchInstituteData} />
                
              
                <AdminDetailsCard admin={institute.admin} onUpdate={fetchInstituteData} />

                
                    <ClassCard classes={classes} instituteId={id} onUpdate={fetchInstituteData} />
                    <SectionCard sections={sections} classes={classes} instituteId={id} onUpdate={fetchInstituteData} />
                     <SubjectCard subjects={subjects} instituteId={id} onUpdate={fetchInstituteData} />
                    
               
            </GridContainer>
             <FullWidthContainer>
                <TeacherCard 
                    teachers={teachers} 
                    instituteId={id} 
                    classes={classes} 
                    sections={sections} 
                    subjects={subjects} 
                    onUpdate={fetchInstituteData} 
                />
            </FullWidthContainer>
             <FullWidthContainer>
                <StudentTable 
                    students={users} 
                    instituteId={id} 
                    classes={classes} 
                    sections={sections} 
                    onUpdate={fetchInstituteData} 
                />
            </FullWidthContainer>
        </PageContainer>
    );
};

export default InstituteDetailPage;