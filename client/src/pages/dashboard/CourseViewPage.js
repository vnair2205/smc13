// client/src/pages/dashboard/CourseViewPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Preloader from '../../components/common/Preloader';
import CourseLayout from '../../components/layout/course/CourseLayout';
import { useTranslation } from 'react-i18next';

const CourseViewPage = () => {
    // --- FIX: Destructure lessonId from useParams ---
    const { courseId, lessonId } = useParams(); 
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refreshCourseData = () => {
        console.log('[CourseViewPage] Refresh triggered by child!');
        setRefreshTrigger(prev => prev + 1);
    };

    useEffect(() => {
        const fetchCourseDetails = async () => {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const config = { headers: { 'x-auth-token': token } };
                const res = await axios.get(`/api/course/${courseId}`, config);
                setCourse(res.data);
            } catch (err) {
                console.error("Error fetching course details:", err.response ? err.response.data : err.message);
                setError(t(err.response?.data?.msgKey || 'errors.generic'));
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCourseDetails();
        }
    }, [courseId, navigate, t, refreshTrigger]);

    // --- FIX: This effect now works correctly ---
    useEffect(() => {
        // Run this check only after the course has loaded, if it's a pre-generated course, and if no lesson is already selected in the URL
        if (course && course.isPreGenerated && !lessonId) {
            const firstTopic = course.topics?.[0];
            const firstSubtopic = firstTopic?.subtopics?.[0];
            const firstLesson = firstSubtopic?.lessons?.[0];

            // If we found a valid first lesson, navigate to it
            if (firstSubtopic?._id && firstLesson?._id) {
                navigate(`/course/${courseId}/lesson/${firstSubtopic._id}/${firstLesson._id}`, { replace: true });
            }
        }
    }, [course, lessonId, courseId, navigate]); // Dependencies for the effect

    const courseCompletedAndPassed = course && course.status === 'Completed' && course.score !== undefined && course.quiz && course.quiz.length > 0 && (course.score / course.quiz.length) * 100 >= 60;

    if (loading) {
        return <Preloader />;
    }

    if (error) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;
    }

    if (!course) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>Course not found or no data available.</div>;
    }

    return (
        <CourseLayout course={course} courseCompletedAndPassed={courseCompletedAndPassed}>
            <Outlet context={{ refreshCourseData, course, courseCompletedAndPassed }} />
        </CourseLayout>
    );
};

export default CourseViewPage;