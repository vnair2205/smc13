// server/controllers/reportController.js

const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Course = require('../models/Course');

// @desc    Get user report data with stats and pagination
// @route   GET /api/reports/user
// @access  Private (Admin)
exports.getUserReport = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;

        // 1. Get User Statistics
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const inactiveUsers = await User.countDocuments({ status: 'inactive' });

        // 2. Get Paginated User Data
        const users = await User.find({})
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'selectedPlan',
                select: 'name price'
            })
            .lean(); 

        // 3. Enhance user data with additional details
        const enhancedUsers = await Promise.all(
            users.map(async (user) => {
                const subscription = await Subscription.findOne({ user: user._id, status: 'active' }).sort({ endDate: -1 });
                const generatedCoursesCount = await Course.countDocuments({ user: user._id, preGenCourseOrigin: null });
                const preGeneratedCoursesCount = await Course.countDocuments({ user: user._id, preGenCourseOrigin: { $ne: null } });

                return {
                    ...user,
                    currentPlan: user.selectedPlan ? user.selectedPlan.name : 'N/A',
                    currentPlanAmount: user.selectedPlan ? user.selectedPlan.price : 0,
                    nextRenewalDate: subscription ? subscription.endDate : 'N/A',
                    signupDate: user.date,
                    location: user.sessions && user.sessions.length > 0 ? user.sessions[0].location : 'N/A',
                    generatedCoursesCount,
                    preGeneratedCoursesCount,
                };
            })
        );

        res.json({
            stats: {
                total: totalUsers,
                active: activeUsers,
                inactive: inactiveUsers,
            },
            users: enhancedUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        });

    } catch (err) {
        console.error('Error fetching user report:', err.message);
        res.status(500).send('Server Error');
    }
};