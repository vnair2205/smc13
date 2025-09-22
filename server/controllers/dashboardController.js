// server/controllers/dashboardController.js
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Course = require('../models/Course');

// @desc    Get logged in user's dashboard data
// @route   GET /api/dashboard/welcome-data
// @access  Private
exports.getWelcomeData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        let subscriptionData = {
            planName: 'No Plan',
            renewalDate: null,
            courseQuota: '0/0',
        };

        if (user.activeSubscription) {
            const subscription = await Subscription.findById(user.activeSubscription).populate('plan');
            if (subscription && subscription.plan) {
                
                // --- THIS IS THE FIX ---
                // We now count the courses created within the subscription period for an accurate number.
                const coursesGenerated = await Course.countDocuments({
                    user: req.user.id,
                    createdAt: {
                        $gte: subscription.startDate,
                        $lte: subscription.endDate
                    }
                });

                const courseLimit = subscription.plan.coursesPerMonth || 0;

                subscriptionData = {
                    planName: subscription.plan.name,
                    renewalDate: subscription.endDate,
                    courseQuota: `${coursesGenerated.toString().padStart(2, '0')}/${courseLimit.toString().padStart(2, '0')}`,
                };
            }
        }

        res.json({
            firstName: user.firstName,
            ...subscriptionData,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// @desc    Get user's progress data
// @route   GET /api/dashboard/progress-data
// @access  Private
exports.getProgressData = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Fetch all courses for the user to ensure we have the raw data
        const allUserCourses = await Course.find({ user: userId });

        const totalCoursesGenerated = allUserCourses.length;
        
        const pregeneratedCoursesAccessed = allUserCourses.filter(course => course.preGenCourseOrigin != null).length;

        // Calculate counts from the fetched data, which is more reliable
        const inProgressCourses = allUserCourses.filter(course => course.status === 'Active').length;
        
        const completedCourses = allUserCourses.filter(course => course.status === 'Completed').length;

        res.json({
            totalCoursesGenerated,
            pregeneratedCoursesAccessed,
            inProgressCourses,
            completedCourses
        });
    } catch (err) {
        console.error('[Dashboard Controller] Error in getProgressData:', err.message);
        res.status(500).send('Server Error');
    }
};