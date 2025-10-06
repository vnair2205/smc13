const PreGenCourse = require('../models/PreGenCourse');
const Course = require('../models/Course');
const PreGenCategory = require('../models/PreGenCategory');
const PreGenSubCategory1 = require('../models/PreGenSubCategory1');
const PreGenSubCategory2 = require('../models/PreGenSubCategory2');
const { generateWithFallback, getNextYoutubeKey } = require('../utils/apiKeyManager');
const { findBestVideo, cleanAIText, cleanSingleLine, fetchCourseThumbnail } = require('../utils/courseUtils');
const axios = require('axios');
const csv = require('csv-parser');
const streamifier = require('streamifier');


// Helper function to search YouTube
async function searchYoutube(query) {
    const apiKey = getNextYoutubeKey();
    if (!apiKey) {
        console.error("[YouTube] No API Key available.");
        return [];
    }
    try {
        const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoEmbeddable=true&maxResults=10&key=${apiKey}&relevanceLanguage=en&videoDuration=medium`;
        const youtubeResponse = await axios.get(youtubeApiUrl);
        return youtubeResponse.data.items || [];
    } catch (error) {
        console.error("[YouTube] Error searching for video:", error.response ? error.response.data : error.message);
        return [];
    }
}


// Main function to generate a full course with all content
async function generateFullCourse(courseData) {
    const { topic, languageName, numSubtopics, englishTopic } = courseData;
    console.log(`[AI] Starting full course generation for: "${topic}"`);

    const objectivePrompt = `Generate 4-5 learning objectives for a course on: "${topic}". Response must be a numbered list in ${languageName}.`;
    const objective = cleanAIText(await generateWithFallback(objectivePrompt));
    const outcomePrompt = `Based on topic "${topic}" and objectives "${objective.join('; ')}", generate 4-5 learning outcomes. Response must be a numbered list in ${languageName}.`;
    const outcome = cleanAIText(await generateWithFallback(outcomePrompt)).join('\n');
    const indexPrompt = `Generate a course index for "${topic}" with exactly ${numSubtopics} subtopics, and each subtopic containing 3-5 lessons. Response must be a valid JSON object: { "subtopics": [{ "title": "...", "lessons": [{"title": "..."}] }] }`;
    const rawIndex = await generateWithFallback(indexPrompt, { type: "json_object" });
    const index = JSON.parse(rawIndex.replace(/```json/g, '').replace(/```/g, '').trim());

    let allLessonContentForQuiz = "";

    for (const subtopic of index.subtopics) {
        for (const lesson of subtopic.lessons) {
            console.log(`[AI] Generating content for lesson: ${lesson.title}`);
            const contentPrompt = `You are an expert tutor. For the course "${topic}", generate detailed lesson content for the topic "${lesson.title}". Include a comprehensive explanation, real-world examples, a practice assignment, and key takeaways. The response must be in the ${languageName} language.`;
            const lessonContent = cleanSingleLine(await generateWithFallback(contentPrompt));
            lesson.content = lessonContent;
            allLessonContentForQuiz += `Lesson: ${lesson.title}\n${lessonContent}\n\n`;

            const videoQuery = `${englishTopic || topic} ${lesson.title} tutorial`;
            const videos = await searchYoutube(videoQuery);
            const bestVideo = findBestVideo(videos, { courseTopic: englishTopic || topic, subtopicTitle: subtopic.title, lessonTitle: lesson.title });
        if (bestVideo) {
                // --- FIX: Removed the "..." from the URL ---
                const videoUrl = `https://www.youtube.com/watch?v=${bestVideo.id.videoId}`;
                const videoChannelTitle = bestVideo.snippet.channelTitle;
                const videoChannelId = bestVideo.snippet.channelId;

                lesson.videoUrl = videoUrl;
                lesson.videoChannelTitle = videoChannelTitle;
                lesson.videoChannelId = videoChannelId;
                
                lesson.videoHistory = [{
                    videoUrl,
                    videoChannelTitle,
                    videoChannelId
                }];
            } else {
                lesson.videoHistory = [];
            }
            lesson.isCompleted = true;
        }
    }

    const quizPrompt = `Based on the following course content for "${topic}", generate a multiple-choice quiz with 10 questions. Each question must have 4 options and an indicated correct answer. Response must be a valid JSON array of objects: [{ "question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "..." }]`;
    const rawQuiz = await generateWithFallback(`${quizPrompt}\n\nCourse Content:\n${allLessonContentForQuiz}`, { type: "json_object" });
    const quiz = JSON.parse(rawQuiz.replace(/```json/g, '').replace(/```/g, '').trim());
    const thumbnailUrl = await fetchCourseThumbnail(englishTopic || topic);

    return { ...courseData, objective, outcome, index, quiz, thumbnailUrl };
}


// --- Controller Exports ---
// (The rest of the file remains the same)
exports.createPreGenCourse = async (req, res) => {
    try {
        const fullCourseData = await generateFullCourse(req.body);
        const newCourse = new PreGenCourse(fullCourseData);
        await newCourse.save();
        res.status(201).json(newCourse);
    } catch (error) {
        console.error("Controller Error: createPreGenCourse:", error);
        res.status(500).json({ msg: 'Failed to generate the course.' });
    }
};
exports.getPreGenCourses = async (req, res) => {
    const { page = 1, limit = 12, category, subCategory1, search } = req.query;
    try {
        const query = {};
        if (category) query.category = category;
        if (subCategory1) query.subCategory1 = subCategory1;
        if (search) {
            query.topic = { $regex: search, $options: 'i' }; // Case-insensitive search
        }

        const options = { page, limit, sort: { createdAt: -1 } };
        const courses = await PreGenCourse.paginate(query, options);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ msg: 'Error fetching courses.' });
    }
};

exports.getPreGenCourseById = async (req, res) => {
    try {
        const course = await PreGenCourse.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });
        res.json(course);
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.deletePreGenCourse = async (req, res) => {
    try {
        const course = await PreGenCourse.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }
        res.json({ msg: 'Course deleted successfully.' });
    } catch (error) {
        res.status(500).json({ msg: 'Server error while deleting course.' });
    }
};


exports.bulkGenerateCourses = async (req, res) => {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded.' });
    
    const { language, languageName, nativeName } = req.body;
    const results = [];
    const stream = streamifier.createReadStream(req.file.buffer);

    stream.pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                for (const row of results) {
                    const categoryName = row['Category Name']?.trim();
                    const subCat1Name = row['Sub Category 1 Name']?.trim();
                    const subCat2Name = row['Sub Category 2 Name']?.trim();
                    const courseTopic = row['Course Topic']?.trim();
                    
                    const numSubtopics = parseInt(row['Number of Subtopics']?.trim(), 10) || 5;

                    if (!categoryName || !subCat1Name || !subCat2Name || !courseTopic) {
                        console.warn('Skipping incomplete row:', row);
                        continue;
                    }

                    const category = await PreGenCategory.findOneAndUpdate(
                        { name: categoryName }, { $setOnInsert: { name: categoryName } }, { upsert: true, new: true }
                    );
                    const subCategory1 = await PreGenSubCategory1.findOneAndUpdate(
                        { name: subCat1Name, parentCategory: category._id }, { $setOnInsert: { name: subCat1Name, parentCategory: category._id } }, { upsert: true, new: true }
                    );
                    const subCategory2 = await PreGenSubCategory2.findOneAndUpdate(
                        { name: subCat2Name, parentSubCategory1: subCategory1._id }, { $setOnInsert: { name: subCat2Name, parentSubCategory1: subCategory1._id } }, { upsert: true, new: true }
                    );
                    
                    const courseData = {
                        topic: courseTopic,
                        category: category._id,
                        subCategory1: subCategory1._id,
                        subCategory2: subCategory2._id,
                        language, languageName, nativeName, 
                        numSubtopics
                    };

                    const fullCourseData = await generateFullCourse(courseData);
                    const newCourse = new PreGenCourse(fullCourseData);
                    await newCourse.save();
                }
                res.status(200).json({ msg: 'Bulk generation completed successfully.' });
            } catch (error) {
                console.error("Bulk Generation Error:", error);
                res.status(500).json({ msg: 'An error occurred during bulk generation.' });
            }
        });
};

exports.getPublicPreGenCourses = async (req, res) => {
    const { page = 1, limit = 50, category, language, search } = req.query;
    try {
        const query = {};
        if (category) query.category = category;
        if (language) query.language = language;
        if (search) {
            query.topic = { $regex: search, $options: 'i' };
        }

        const options = { page: parseInt(page), limit: parseInt(limit), sort: { createdAt: -1 } };
        const courses = await PreGenCourse.paginate(query, options);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ msg: 'Error fetching courses.' });
    }
};

exports.getCategoryCounts = async (req, res) => {
    try {
          const totalCourses = await PreGenCourse.countDocuments();
        const counts = await PreGenCourse.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $lookup: { from: 'pregencategories', localField: '_id', foreignField: '_id', as: 'categoryDetails' } },
            { $unwind: '$categoryDetails' },
            { $project: { _id: 1, count: 1, name: '$categoryDetails.name' } }
            
        ]);
        res.json(counts);
    } catch (error) {
        res.status(500).json({ msg: 'Error fetching category counts.' });
    }
};

exports.startCourse = async (req, res) => {
    try {
        const { id } = req.params; 
        const preGenCourseId = id;
        const userId = req.user.id;

        if (!preGenCourseId) {
            return res.status(400).json({ msg: 'Course ID is missing in the request.' });
        }

        const existingCourse = await Course.findOne({ user: userId, preGenCourseOrigin: preGenCourseId });
        if (existingCourse) {
            return res.status(409).json({ msg: 'You have already started this course.', courseId: existingCourse._id });
        }

        const templateCourse = await PreGenCourse.findById(preGenCourseId).lean();
        if (!templateCourse) {
            return res.status(404).json({ msg: 'Pre-generated course not found.' });
        }

        const newCourseData = {
            topic: templateCourse.topic,
            englishTopic: templateCourse.englishTopic,
            objective: templateCourse.objective,
            englishObjective: templateCourse.englishObjective,
            outcome: templateCourse.outcome,
            englishOutcome: templateCourse.englishOutcome,
            language: templateCourse.language,
            languageName: templateCourse.languageName,
            nativeName: templateCourse.nativeName,
            numSubtopics: templateCourse.numSubtopics,
            thumbnailUrl: templateCourse.thumbnailUrl,
            quiz: templateCourse.quiz,
            user: userId,
            preGenCourseOrigin: preGenCourseId,
            status: 'Active',
            index: {
                subtopics: templateCourse.index.subtopics.map(subtopic => ({
                    title: subtopic.title,
                    englishTitle: subtopic.englishTitle,
                    lessons: subtopic.lessons.map(lesson => {
                        // --- DEFINITIVE FIX STARTS HERE ---
                        // 1. Manually create a new, clean video history array.
                        // This forces a "deep copy" and removes any hidden Mongoose references.
                        const cleanVideoHistory = (lesson.videoHistory || []).map(v => ({
                            videoUrl: v.videoUrl,
                            videoChannelId: v.videoChannelId,
                            videoChannelTitle: v.videoChannelTitle
                        }));

                        // 2. Ensure the primary video URL is a valid embed URL.
                        let cleanVideoUrl = lesson.videoUrl || '';
                        if (cleanVideoUrl && !cleanVideoUrl.includes('/embed/')) {
                            // This is a safety check to correct any malformed URLs.
                            const videoId = cleanVideoUrl.split('v=')[1]?.split('&')[0] || '';
                            if (videoId) {
                                cleanVideoUrl = `https://www.youtube.com/embed/${videoId}`;
                            }
                        }

                        // 3. Ensure the clean URL is the first item in the clean history.
                        const hasUrlInHistory = cleanVideoHistory.some(v => v.videoUrl === cleanVideoUrl);
                        if (cleanVideoUrl && !hasUrlInHistory) {
                            cleanVideoHistory.unshift({
                                videoUrl: cleanVideoUrl,
                                videoChannelId: lesson.videoChannelId,
                                videoChannelTitle: lesson.videoChannelTitle,
                            });
                        }
                        
                        // 4. Return a completely new, clean lesson object.
                        return {
                            title: lesson.title,
                            englishTitle: lesson.englishTitle,
                            content: lesson.content,
                            videoUrl: cleanVideoUrl, // Use the clean URL
                            videoChannelId: lesson.videoChannelId,
                            videoChannelTitle: lesson.videoChannelTitle,
                            videoHistory: cleanVideoHistory, // Use the clean history
                            videoChangeCount: lesson.videoChangeCount || 0,
                            isCompleted: false
                        };
                        // --- DEFINITIVE FIX ENDS HERE ---
                    })
                }))
            }
        };
        
        const newCourse = new Course(newCourseData);
        await newCourse.save();

        res.status(201).json({ msg: 'Course started successfully!', courseId: newCourse._id });

    } catch (error) {
        console.error("Start course error:", error);
        res.status(500).json({ msg: 'Server error while starting course.' });
    }
};