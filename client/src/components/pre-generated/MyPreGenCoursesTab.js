import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios'; // You will likely have a service for this
import { useNavigate } from 'react-router-dom';

// --- (Reuse styled components from MyCoursesPage.js) ---
const CourseGrid = styled.div` /* ... */ `;
const CourseCard = styled.div` /* ... */ `;

const MyPreGenCoursesTab = () => {
    const [myCourses, setMyCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyCourses = async () => {
            setLoading(true);
            try {
                // This API call fetches all user courses but filters for those with a preGenCourseOrigin
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/course', {
                    headers: { 'x-auth-token': token },
                    params: { preGenOriginOnly: true } // We need to add this filter on the backend
                });
                setMyCourses(res.data.docs);
            } catch (error) {
                console.error("Failed to fetch my pre-generated courses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyCourses();
    }, []);

    if (loading) return <p>Loading your courses...</p>;

    return (
        <div>
            {/* You can add filter/search bars here, similar to MyCoursesPage.js */}
            <CourseGrid>
                {myCourses.map(course => (
                    <CourseCard key={course._id} onClick={() => navigate(`/course/${course._id}`)}>
                        {/* Display card content from MyCoursesPage.js */}
                        <h4>{course.topic}</h4>
                        {/* ... etc ... */}
                    </CourseCard>
                ))}
            </CourseGrid>
        </div>
    );
};

export default MyPreGenCoursesTab;