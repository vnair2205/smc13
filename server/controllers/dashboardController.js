// server/controllers/dashboardController.js
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Course = require('../models/Course');
const PreGenCourse = require('../models/PreGenCourse');
const Admin = require('../models/Admin');
const SupportTicket = require('../models/SupportTicket');

// ... (keep any existing functions)

// --- ADD THIS ENTIRE NEW FUNCTION ---
// @desc    Get all data for the main admin dashboard
// @route   GET /api/dashboard/analytics
// @access  Private (Admin)
exports.getDashboardAnalytics = async (req, res) => {
    try {
        // --- Stat Card Data ---
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const inactiveUsers = await User.countDocuments({ status: 'inactive' });
        const droppedCustomers = await User.countDocuments({ status: 'pending_payment' });
        const totalGeneratedCourses = await Course.countDocuments({ preGenCourseOrigin: null });
        const totalPreGeneratedCourses = await PreGenCourse.countDocuments();
        const totalTeamMembers = await Admin.countDocuments(); // Assumes team members are admins
        const totalTickets = await SupportTicket.countDocuments();
        const openTickets = await SupportTicket.countDocuments({ status: 'Open' });
        const closedTickets = await SupportTicket.countDocuments({ status: 'Closed' });

        // Churn logic: Find users whose latest subscription is expired
        const allUsers = await User.find({}).lean();
        let churnedCount = 0;
        for (const user of allUsers) {
            const lastSub = await Subscription.findOne({ user: user._id }).sort({ endDate: -1 });
            if (lastSub && new Date(lastSub.endDate) < new Date()) {
                const hasActiveSub = await Subscription.findOne({ user: user._id, status: 'active', endDate: { $gte: new Date() } });
                if (!hasActiveSub) {
                    churnedCount++;
                }
            }
        }

        // --- Chart Data ---
        // Revenue by Month
        const revenueByMonth = await Subscription.aggregate([
            {
                $lookup: { from: 'subscriptionplans', localField: 'plan', foreignField: '_id', as: 'planDetails' }
            },
            { $unwind: '$planDetails' },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    totalRevenue: { $sum: '$planDetails.amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Users by Plan
        const usersByPlan = await Subscription.aggregate([
            { $match: { status: 'active' } },
            {
                $group: { _id: '$plan', count: { $sum: 1 } }
            },
            {
                $lookup: { from: 'subscriptionplans', localField: '_id', foreignField: '_id', as: 'planDetails' }
            },
            { $unwind: '$planDetails' },
            { $project: { name: '$planDetails.name', value: '$count' } }
        ]);

        // Revenue by Plan
        const revenueByPlan = await Subscription.aggregate([
            {
                $lookup: { from: 'subscriptionplans', localField: 'plan', foreignField: '_id', as: 'planDetails' }
            },
            { $unwind: '$planDetails' },
            {
                $group: {
                    _id: '$planDetails.name',
                    totalRevenue: { $sum: '$planDetails.amount' }
                }
            },
            { $project: { name: '$_id', totalRevenue: 1, _id: 0 } }
        ]);

        res.json({
            stats: {
                totalUsers,
                activeUsers,
                inactiveUsers,
                churnedCustomers: churnedCount,
                droppedCustomers,
                totalGeneratedCourses,
                totalPreGeneratedCourses,
                totalTeamMembers,
                totalTickets,
                openTickets,
                closedTickets
            },
            charts: {
                revenueByMonth,
                usersByPlan,
                revenueByPlan
            }
        });

    } catch (err) {
        console.error('Error fetching dashboard analytics:', err.message);
        res.status(500).send('Server Error');
    }
};