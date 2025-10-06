// server/controllers/reportController.js

const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Course = require('../models/Course');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const PreGenCourse = require('../models/PreGenCourse');
const PreGenCategory = require('../models/PreGenCategory');
const PreGenSubCategory1 = require('../models/PreGenSubCategory1');
const PreGenSubCategory2 = require('../models/PreGenSubCategory2');

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
                 const originalLocation = user.sessions && user.sessions.length > 0 ? user.sessions[0].location : 'N/A';
                let city = 'Unknown'; // Default to 'Unknown'
                if (originalLocation && originalLocation !== 'Localhost' && originalLocation !== 'N/A') {
                    city = originalLocation.split(',')[0].trim();
                }
                // --- FIX ENDS HERE ---

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


exports.getSubscriptionReport = async (req, res) => {
    try {
        const { page = 1, limit = 100, search = '', planFilter = '' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // --- 1. Calculate Statistics ---
        // ... (keep the existing stats logic the same)
        const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
        const inactiveSubscriptions = await Subscription.countDocuments({ status: 'inactive' });
        const planStats = await Subscription.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$plan', count: { $sum: 1 } } },
            {
                $lookup: {
                    from: 'subscriptionplans',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'planDetails'
                }
            },
            { $unwind: '$planDetails' },
            { $project: { name: '$planDetails.name', count: '$count' } }
        ]);
        const allPlans = await SubscriptionPlan.find({}).lean();


        // --- 2. Build Query for Main Data ---
        // ... (keep the existing query logic the same)
        let query = {};
        if (planFilter) {
            query.plan = planFilter;
        }
        if (search) {
            const userIds = await User.find({ email: { $regex: search, $options: 'i' } }).select('_id');
            const userInQuery = userIds.map(u => u._id);
            
            query.$or = [
                { user: { $in: userInQuery } },
                // --- FIX STARTS HERE ---
                 { razorpay_payment_id: { $regex: search, $options: 'i' } } 
                // --- FIX ENDS HERE ---
            ];
        }

        // --- 3. Fetch Data ---
        const subscriptions = await Subscription.find(query)
            .populate('user', 'firstName lastName email phoneNumber')
            .populate('plan', 'name amount')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        const totalDocuments = await Subscription.countDocuments(query);

        res.json({
            stats: {
                active: activeSubscriptions,
                inactive: inactiveSubscriptions,
                plans: planStats,
                allPlans: allPlans
            },
            subscriptions, // The fix is implicit here by using .lean() which fetches all fields
            totalPages: Math.ceil(totalDocuments / limitNum),
            currentPage: pageNum,
        });

    } catch (err) {
        console.error('Error fetching subscription report:', err.message);
        res.status(500).send('Server Error');
    }
};

exports.getPregeneratedCourseReport = async (req, res) => {
    try {
        const { search = '', category = '' } = req.query;

        // --- 1. Get Statistics ---
        const categoryCount = await PreGenCategory.countDocuments();
        const subCategory1Count = await PreGenSubCategory1.countDocuments();
        const subCategory2Count = await PreGenSubCategory2.countDocuments();
        const totalCourses = await PreGenCourse.countDocuments();

        // --- 2. Build Query ---
        let query = {};
        if (search) {
            query.topic = { $regex: search, $options: 'i' };
        }
        if (category) {
            query.category = category;
        }

        // --- 3. Fetch Courses and Calculate Access Count ---
        const courses = await PreGenCourse.find(query)
            .populate('category', 'name')
            .populate('subCategory1', 'name')
            .populate('subCategory2', 'name')
            .lean();

        const reportData = await Promise.all(courses.map(async (course) => {
            const accessedCount = await Course.countDocuments({ preGenCourseOrigin: course._id });
            return {
                ...course,
                accessedCount,
            };
        }));
        
        const allCategories = await PreGenCategory.find({}).lean();

        res.json({
            stats: {
                categoryCount,
                subCategory1Count,
                subCategory2Count,
                totalCourses,
            },
            courses: reportData,
            categories: allCategories,
        });
    } catch (err) {
        console.error('Error fetching pre-generated course report:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get details of users who accessed a pre-generated course
// @route   GET /api/reports/pregenerated/:id
// @access  Private (Admin)
exports.getPregeneratedCourseAccessDetails = async (req, res) => {
    try {
        const preGenCourseId = req.params.id;

        const preGenCourse = await PreGenCourse.findById(preGenCourseId)
            .populate('category', 'name')
            .populate('subCategory1', 'name')
            .populate('subCategory2', 'name')
            .lean();

        if (!preGenCourse) {
            return res.status(404).json({ msg: 'Pre-generated course not found' });
        }

        const accessedCourses = await Course.find({ preGenCourseOrigin: preGenCourseId })
            .populate('user', 'firstName lastName email phoneNumber')
            .lean();
            
        const users = accessedCourses.map(course => course.user).filter(user => user);

        res.json({
            course: preGenCourse,
            users,
        });
    } catch (err) {
        console.error('Error fetching course access details:', err.message);
        res.status(500).send('Server Error');
    }
};

exports.getCourseReport = async (req, res) => {
    try {
        const { page = 1, limit = 100, search = '', status = '', language = '' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // --- 1. Get Statistics ---
        const totalCourses = await Course.countDocuments({ preGenCourseOrigin: null }); // Only user-generated

        // --- 2. Build Query ---
        let query = { preGenCourseOrigin: null }; // Base query for user-generated courses

        if (status) {
            query.status = status;
        }
        if (language) {
            query.language = language;
        }

        if (search) {
            // Find users whose email matches the search term
            const users = await User.find({ email: { $regex: search, $options: 'i' } }).select('_id');
            const userIds = users.map(u => u._id);
            query.user = { $in: userIds };
        }

        // --- 3. Fetch Data ---
        const courses = await Course.find(query)
            .populate('user', 'firstName lastName email phoneNumber')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        const totalDocuments = await Course.countDocuments(query);

        res.json({
            stats: {
                totalCourses,
            },
            courses,
            totalPages: Math.ceil(totalDocuments / limitNum),
            currentPage: pageNum,
        });

    } catch (err) {
        console.error('Error fetching course report:', err.message);
        res.status(500).send('Server Error');
    }
};


exports.getCertificateReport = async (req, res) => {
    try {
        // --- FIX #1: ADD PAGINATION AND SEARCH PARAMETERS ---
        const { search = '', page = 1, limit = 100 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        let courseQuery = {
            status: 'Completed',
            score: { $exists: true }
        };

        if (search) {
            const users = await User.find({ email: { $regex: search, $options: 'i' } }).select('_id');
            const userIds = users.map(u => u._id);
            courseQuery.user = { $in: userIds };
        }

        const completedCourses = await Course.find(courseQuery)
            .populate('user', 'firstName lastName email phoneNumber')
            .lean(); // We get all results first to filter them

        const certifiedCourses = completedCourses.filter(course => {
            if (!course.user) return false;
            const hasQuiz = Array.isArray(course.quiz) && course.quiz.length > 0;
            if (!hasQuiz) return false;
            const percentage = (course.score / course.quiz.length) * 100;
            return percentage >= 60;
        });

        // --- FIX #2: PAGINATE THE FINALIZED RESULTS ---
        const paginatedCertificates = certifiedCourses.slice(skip, skip + limitNum);
        const totalCertificates = certifiedCourses.length;

        const reportData = paginatedCertificates.map(course => ({
            ...course,
            courseType: course.preGenCourseOrigin ? 'Pre Generated' : 'User Generated',
        }));

        res.json({
            stats: {
                totalCertificates: totalCertificates,
            },
            certificates: reportData,
            totalPages: Math.ceil(totalCertificates / limitNum),
            currentPage: pageNum,
        });

    } catch (err) {
        console.error('Error fetching certificate report:', err.message);
        res.status(500).send('Server Error');
    }
};


exports.getChurnReport = async (req, res) => {
    try {
        const { page = 1, limit = 100, search = '' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // --- 1. Find all users, potentially filtered by email ---
        let userQuery = {};
        if (search) {
            userQuery.email = { $regex: search, $options: 'i' };
        }
        const allUsers = await User.find(userQuery).lean();

        // --- 2. Identify Churned Users ---
        let churnedCustomers = [];
        for (const user of allUsers) {
            // Find all subscriptions for the user, sorted so the latest is first
            const subscriptions = await Subscription.find({ user: user._id })
                .sort({ endDate: -1 })
                .populate('plan', 'name')
                .lean();

            if (subscriptions.length > 0) {
                const latestSubscription = subscriptions[0];
                const hasActiveSubscription = subscriptions.some(sub => sub.status === 'active' && new Date(sub.endDate) > new Date());

                // A user has churned if they have no active subscription and their latest subscription has expired
                if (!hasActiveSubscription && new Date(latestSubscription.endDate) < new Date()) {
                    churnedCustomers.push({
                        ...user,
                        lastActivePlan: latestSubscription.plan?.name || 'N/A',
                        lastSubscriptionDate: latestSubscription.startDate,
                    });
                }
            }
        }

        // --- 3. Paginate the results ---
        const paginatedChurned = churnedCustomers.slice(skip, skip + limitNum);

        res.json({
            stats: {
                totalChurned: churnedCustomers.length,
            },
            churnedCustomers: paginatedChurned,
            totalPages: Math.ceil(churnedCustomers.length / limitNum),
            currentPage: pageNum,
        });

    } catch (err) {
        console.error('Error fetching churn report:', err.message);
        res.status(500).send('Server Error');
    }
};



exports.getDroppedCustomersReport = async (req, res) => {
    try {
        const { page = 1, limit = 100, search = '' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // --- 1. Build Query ---
        // The core logic: find users who registered but never paid.
        let query = { status: 'pending_payment' };

        if (search) {
            query.email = { $regex: search, $options: 'i' };
        }

        // --- 2. Get Statistics and Data ---
        const totalDropped = await User.countDocuments(query);

        const droppedCustomers = await User.find(query)
            .populate('selectedPlan', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        res.json({
            stats: {
                totalDropped,
            },
            droppedCustomers,
            totalPages: Math.ceil(totalDropped / limitNum),
            currentPage: pageNum,
        });

    } catch (err) {
        console.error('Error fetching dropped customers report:', err.message);
        res.status(500).send('Server Error');
    }
};