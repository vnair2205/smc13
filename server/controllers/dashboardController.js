// server/controllers/dashboardController.js
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Course = require('../models/Course');
const PreGenCourse = require('../models/PreGenCourse');
const Admin = require('../models/Admin');
const SupportTicket = require('../models/SupportTicket');

// --- CLIENT DASHBOARD: GET USER DATA ---
exports.getDashboardData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json({ user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- CLIENT DASHBOARD: GET WELCOME WIDGET DATA ---
exports.getWelcomeData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) { return res.status(404).json({ msg: 'User not found' }); }
        let subscriptionData = { planName: 'No Plan', renewalDate: null, courseQuota: '0/0' };
        if (user.activeSubscription) {
            const subscription = await Subscription.findById(user.activeSubscription).populate('plan');
            if (subscription && subscription.plan) {
                const renewalDate = new Date(subscription.endDate);
                const coursesUsed = await Course.countDocuments({ user: req.user.id, createdAt: { $gte: subscription.startDate } });
                subscriptionData = {
                    planName: subscription.plan.name,
                    courseQuota: `${coursesUsed}/${subscription.plan.coursesPerMonth}`,
                    renewalDate: `${renewalDate.getDate().toString().padStart(2, '0')}/${(renewalDate.getMonth() + 1).toString().padStart(2, '0')}/${renewalDate.getFullYear()}`,
                };
            }
        }
        res.json({ firstName: user.firstName, ...subscriptionData });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- CLIENT DASHBOARD: GET PROGRESS WIDGET DATA (RESTORED)---
exports.getProgressData = async (req, res) => {
    try {
        const userId = req.user.id;
        const allUserCourses = await Course.find({ user: userId });
        const totalCoursesGenerated = allUserCourses.length;
        const pregeneratedCoursesAccessed = allUserCourses.filter(course => course.preGenCourseOrigin != null).length;
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

// --- ADMIN DASHBOARD: GET ANALYTICS DATA ---
exports.getDashboardAnalytics = async (req, res) => {
    try {
        // --- Stat Card Data ---
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const inactiveUsers = await User.countDocuments({ status: 'inactive' });
        const droppedCustomers = await User.countDocuments({ status: 'pending_payment' });
        const totalGeneratedCourses = await Course.countDocuments({ preGenCourseOrigin: null });
        const totalPreGeneratedCourses = await PreGenCourse.countDocuments();
        const totalTeamMembers = await Admin.countDocuments();
        const totalTickets = await SupportTicket.countDocuments();
        const openTickets = await SupportTicket.countDocuments({ status: 'Open' });
        const closedTickets = await SupportTicket.countDocuments({ status: 'Closed' });

        const usersWithExpiredSubs = await Subscription.distinct('user', { endDate: { $lt: new Date() } });
        const usersWithActiveSubs = await Subscription.distinct('user', { status: 'active', endDate: { $gte: new Date() } });
        const churnedUserIds = usersWithExpiredSubs.filter(userId => !usersWithActiveSubs.some(activeId => activeId.equals(userId)));
        const churnedCount = churnedUserIds.length;

        // --- Chart Data ---
        // Revenue by Month
        const revenueByMonth = await Subscription.aggregate([
            { $lookup: { from: 'subscriptionplans', localField: 'plan', foreignField: '_id', as: 'planDetails' } },
            { $unwind: '$planDetails' },
            // --- FIX: Use 'amount' which matches your SubscriptionPlan model ---
            { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, totalRevenue: { $sum: '$planDetails.amount' } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Users by Plan (This query is correct)
        const usersByPlan = await Subscription.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$plan', count: { $sum: 1 } } },
            { $lookup: { from: 'subscriptionplans', localField: '_id', foreignField: '_id', as: 'planDetails' } },
            { $unwind: '$planDetails' },
            { $project: { name: '$planDetails.name', value: '$count' } }
        ]);

        // Revenue by Plan
        const revenueByPlan = await Subscription.aggregate([
            { $lookup: { from: 'subscriptionplans', localField: 'plan', foreignField: '_id', as: 'planDetails' } },
            { $unwind: '$planDetails' },
             // --- FIX: Use 'amount' which matches your SubscriptionPlan model ---
            { $group: { _id: '$planDetails.name', totalRevenue: { $sum: '$planDetails.amount' } } },
            { $project: { name: '$_id', totalRevenue: 1, _id: 0 } }
        ]);

        res.json({
            stats: {
                totalUsers, activeUsers, inactiveUsers,
                churnedCustomers: churnedCount,
                droppedCustomers, totalGeneratedCourses, totalPreGeneratedCourses, totalTeamMembers,
                totalTickets, openTickets, closedTickets
            },
            charts: { revenueByMonth, usersByPlan, revenueByPlan }
        });

    } catch (err) {
        console.error('Error fetching dashboard analytics:', err.message);
        res.status(500).send('Server Error');
    }
};