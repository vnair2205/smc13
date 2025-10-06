const axios = require('axios');
const { getNextPexelsKey } = require('./apiKeyManager');

/**
 * Cleans raw text output from the AI into an array of lines.
 */
const cleanAIText = (text) => {
    if (typeof text !== 'string') return [];
    const lines = text.split(/\n\s*(?=\d+\.)/g);
    return lines.map(line => line.replace(/^\d+\.\s*/, '').trim()).filter(line => line.length > 0);
};

/**
 * Cleans AI-generated text into a single, clean line.
 */
const cleanSingleLine = (text) => {
    if (typeof text !== 'string') return '';
    return text.replace(/[\*#]/g, '').trim();
};

/**
 * Fetches a course thumbnail from Pexels.
 */
const fetchCourseThumbnail = async (topic) => {
    try {
        const pexelsKey = getNextPexelsKey();
        if (!pexelsKey) {
            console.warn('[Pexels] No Pexels API key available. Skipping thumbnail fetch.');
            return null;
        }

        const query = encodeURIComponent(topic);
        const pexelsApiUrl = `https://api.pexels.com/v1/search?query=${query}&per_page=1&orientation=landscape`;

        console.log(`[Pexels] Searching for thumbnail for topic: \"${topic}\"`);
        const response = await axios.get(pexelsApiUrl, {
            headers: { 'Authorization': pexelsKey }
        });

        if (response.data.photos && response.data.photos.length > 0) {
            console.log('[Pexels] Thumbnail found.');
            return response.data.photos[0].src.original;
        }
        console.warn('[Pexels] No thumbnail found for the topic.');
        return null;
    } catch (error) {
        console.error('[Pexels] Error fetching thumbnail:', error.response ? error.response.data : error.message);
        return null;
    }
};

/**
 * Finds the most relevant YouTube video from a list based on titles.
 */
const findBestVideo = (videos, { lessonTitle, subtopicTitle, courseTopic }) => {
    if (!videos || videos.length === 0) {
        return null;
    }

    const scoredVideos = videos
        .map(video => {
            if (!video.id?.videoId || !video.snippet?.title) {
                return null;
            }

            const title = video.snippet.title.toLowerCase();
            const description = (video.snippet.description || '').toLowerCase();

            if (title.includes('#shorts') || description.includes('#shorts')) {
                return null;
            }

            let score = 0;
            if (title.includes(lessonTitle.toLowerCase())) score += 10;
            if (title.includes(subtopicTitle.toLowerCase())) score += 5;
            if (title.includes(courseTopic.toLowerCase())) score += 2;

            return { video, score };
        })
        .filter(Boolean);

    if (scoredVideos.length === 0) {
        // **FIX:** Fallback to the first valid video if no scored videos are found
        return videos.find(v => v.id?.videoId && !v.snippet.title.toLowerCase().includes('#shorts')) || null;
    }

    scoredVideos.sort((a, b) => b.score - a.score);

    // **FIX:** If the top-scored video has a score of 0, return the first valid video instead
    if (scoredVideos[0].score === 0) {
        return videos.find(v => v.id?.videoId && !v.snippet.title.toLowerCase().includes('#shorts')) || null;
    }

    return scoredVideos[0].video;
};


module.exports = {
    cleanAIText,
    cleanSingleLine,
    fetchCourseThumbnail,
    findBestVideo
};