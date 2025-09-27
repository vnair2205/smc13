// server/controllers/adminController.js
const Admin = require('../models/Admin');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Chat = require('../models/Chat'); 





// Admin Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const payload = { admin: { id: admin.id } };
    jwt.sign(
      payload,
      process.env.JWT_ADMIN_SECRET, // Use a separate secret for admins
      { expiresIn: '8h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ msg: 'Admin not found' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        admin.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        admin.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await admin.save();

        const resetUrl = `${req.protocol}://${req.get('host')}/admin/reset-password/${resetToken}`;

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: `"SeekMYCOURSE" <${process.env.SMTP_USER}>`,
            to: admin.email,
            subject: 'Password Reset Request',
            html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
                   <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>
                   <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
        });

        res.status(200).json({ msg: 'Email sent' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const admin = await Admin.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!admin) {
            return res.status(400).json({ msg: 'Password reset token is invalid or has expired' });
        }

        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(req.body.password, salt);
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpires = undefined;
        await admin.save();

        res.status(200).json({ msg: 'Password has been reset' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Add a new team member
exports.addTeamMember = async (req, res) => {
  const { firstName, lastName, email, password, designation, department } = req.body;
  try {
    let member = await Admin.findOne({ email });
    if (member) {
      return res.status(400).json({ msg: 'Team member already exists' });
    }

    member = new Admin({
      firstName,
      lastName,
      email,
      password,
      designation,
      department,
      profilePicture: req.file ? req.file.path : undefined,
    });

    const salt = await bcrypt.genSalt(10);
    member.password = await bcrypt.hash(password, salt);
    await member.save();
    res.json(member);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all team members
exports.getTeamMembers = async (req, res) => {
  try {
    const members = await Admin.find().populate('designation').populate('department');
    res.json(members);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update a team member
exports.updateTeamMember = async (req, res) => {
  const { firstName, lastName, email, designation, department } = req.body;
  const { id } = req.params;

  const memberFields = { firstName, lastName, email, designation, department };
  if (req.file) {
    memberFields.profilePicture = req.file.path;
  }

  try {
    let member = await Admin.findById(id);
    if (!member) {
      return res.status(404).json({ msg: 'Team member not found' });
    }

    member = await Admin.findByIdAndUpdate(id, { $set: memberFields }, { new: true });
    res.json(member);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete a team member
exports.deleteTeamMember = async (req, res) => {
  try {
    let member = await Admin.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ msg: 'Team member not found' });
    }
    await Admin.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Team member removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


// --- NEW USER MANAGEMENT FUNCTIONS ---

// Get User Statistics
exports.getUserStats = async (req, res) => {
  try {
    // V V V THIS IS THE FIX V V V
    // We will count 'active' users specifically, and then count all others
    // as 'inactive' for the purpose of the stat card.

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    
    // Any user whose status is NOT 'active' is considered inactive.
    // This correctly includes 'inactive', 'pending_payment', and 'unverified'.
    const inactiveUsers = await User.countDocuments({ status: { $ne: 'active' } });

    res.json({
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers, // This will now be the correct count.
    });
    // ^ ^ ^ END OF THE FIX ^ ^ ^

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// Get All Users with Pagination, Search, and Filter
exports.getUsers = async (req, res) => {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;

    try {
        const query = {};
        if (search) {
            query.email = { $regex: search, $options: 'i' };
        }

        // 👇 FIX: Correctly filter by subscription status
        if (status) {
            const subscriptions = await Subscription.find({ status }).select('user');
            const userIds = subscriptions.map(sub => sub.user);
            query._id = { $in: userIds };
        }

        const users = await User.find(query)
            .populate({
                path: 'activeSubscription',
                populate: {
                    path: 'plan',
                    model: 'SubscriptionPlan'
                }
            })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await User.countDocuments(query);

        res.json({
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Single User Details
exports.getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate({
                path: 'activeSubscription',
                populate: { path: 'plan', model: 'SubscriptionPlan' }
            })
            .select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        // --- FIX STARTS HERE ---
        let correctCoursesRemaining = user.coursesRemaining; // Default to the stored value

        // If the user has an active plan, recalculate the remaining courses to ensure accuracy
        if (user.activeSubscription && user.activeSubscription.plan) {
            const totalCoursesInPlan = user.activeSubscription.plan.coursesPerMonth;

            // Count the number of courses created by the user within the current subscription period
            const coursesUsedThisPeriod = await Course.countDocuments({
                user: user._id,
                createdAt: {
                    $gte: user.activeSubscription.startDate,
                    $lte: user.activeSubscription.endDate,
                },
            });

            correctCoursesRemaining = totalCoursesInPlan - coursesUsedThisPeriod;
        }
        // --- FIX ENDS HERE ---


        const subscriptionHistory = await Subscription.find({ user: req.params.id })
            .populate({
                path: 'plan',
                model: 'SubscriptionPlan'
            })
            .sort({ startDate: -1 });

        const userDetails = {
            ...user.toObject(),
            subscriptionHistory: subscriptionHistory,
            coursesRemaining: correctCoursesRemaining, // Override with the freshly calculated value
        };


        res.json(userDetails);

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
};
// Admin Changes User Subscription Plan
exports.changeUserPlan = async (req, res) => {
    const { userId, newPlanId } = req.body;

    try {
        const user = await User.findById(userId);
        const newPlan = await SubscriptionPlan.findById(newPlanId);

        if (!user || !newPlan) {
            return res.status(404).json({ msg: 'User or Plan not found' });
        }

        if (user.activeSubscription) {
            await Subscription.findByIdAndUpdate(user.activeSubscription, { status: 'cancelled' });
        }

        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        const newSubscription = new Subscription({
            user: userId,
            plan: newPlanId,
            razorpay_payment_id: `admin_changed_${Date.now()}`,
            razorpay_order_id: `admin_changed_${Date.now()}`,
            razorpay_signature: 'admin_changed',
            startDate: new Date(),
            endDate: endDate,
            status: 'active',
        });

        await newSubscription.save();

        user.activeSubscription = newSubscription._id;
        user.coursesRemaining = newPlan.coursesPerMonth;
        user.status = 'active';
        await user.save();

        res.json({ msg: "User's plan has been successfully changed.", user });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// Manually Add Course Count for a User
exports.addCourseCount = async (req, res) => {
    const { userId, additionalCourses } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.coursesRemaining += Number(additionalCourses);
        await user.save();

        res.json({ msg: `${additionalCourses} courses added successfully.`, coursesRemaining: user.coursesRemaining });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getAllUsers = async (req, res) => {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;

    try {
        const query = {};
        if (search) {
            query.email = { $regex: search, $options: 'i' };
        }
        if (status) {
            query.status = status;
        }

        // --- FIX STARTS HERE ---
        // We need to use .populate() to get the details from the linked documents.
        // We also explicitly .select('+phoneNumber') to ensure it's included.
        const users = await User.find(query)
            .select('+phoneNumber') // 1. Explicitly include the phone number
            .populate({
                path: 'activeSubscription', // 2. Populate the activeSubscription field
                populate: {
                    path: 'plan', // 3. Within the subscription, populate the plan details
                    model: 'SubscriptionPlan',
                    select: 'name' // Only select the 'name' field from the plan
                }
            })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .exec();
        // --- FIX ENDS HERE ---

        const count = await User.countDocuments(query);

        res.json({
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
        });

    } catch (err) {
        console.error('Error fetching users:', err.message);
        res.status(500).send('Server Error');
    }
};


exports.updateUserDetails = async (req, res) => {
    // Destructure all possible fields from the request body
    const { email, phoneNumber, billingAddress } = req.body;
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ msg: 'Email is already in use' });
            }
            user.email = email;
        }

        // Update phone number if provided
        if (phoneNumber) {
            user.phoneNumber = phoneNumber;
        }

        // Update billing address if provided
        if (billingAddress) {
            user.billingAddress = {
                ...user.billingAddress, // Preserve any existing fields
                ...billingAddress      // Overwrite with new data
            };
        }

        await user.save();
        res.json({ msg: 'User details updated successfully', user });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getUserCourses = async (req, res) => {
    try {
        // Find all courses that belong to the user ID specified in the URL
        const courses = await Course.find({ user: req.params.userId }).sort({ createdAt: -1 });
        
        if (!courses) {
            // Even if there are no courses, we return an empty array, not an error.
            return res.json([]);
        }

        res.json(courses);

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
};

exports.getCourseDetails = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate('user', 'firstName lastName email'); // Also get user details

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

exports.getCourseForUser = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    
    if (course.user.toString() !== req.params.userId) {
      return res.status(401).json({ msg: 'User does not own this course' });
    }

    res.json(course);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// FIX: Add "exports." here as well
exports.getChatForUserCourse = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      course: req.params.courseId,
      user: req.params.userId
    });

    if (!chat) {
      return res.json([]); 
    }

    res.json(chat.messages);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};


exports.getUserAllCourses = async (req, res) => {
    try {
        const { userId } = req.params;

        const selfGeneratedCourses = await Course.find({ user: userId }).lean();
        const userWithPreGenCourses = await User.findById(userId)
            .populate('preGeneratedCourses.course')
            .lean();

        const formattedSelfGenerated = selfGeneratedCourses.map(course => {
            // --- ROBUST PROGRESS CALCULATION ---
            const subtopics = course.index?.subtopics || [];
            const totalLessons = subtopics.reduce((acc, sub) => acc + (sub.lessons?.length || 0), 0);
            const completedLessons = subtopics.reduce((acc, sub) => {
                const lessons = sub.lessons || [];
                return acc + lessons.filter(l => l.isCompleted).length;
            }, 0);
            const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
            // --- END OF FIX ---

            return {
                _id: course._id,
                title: course.topic || "Untitled Course",
                thumbnailUrl: course.thumbnailUrl,
                progress: progress,
                date: course.createdAt,
                type: 'Self-Generated',
                isCompleted: course.status === 'Completed',
            };
        });

        let formattedPreGenerated = [];
        if (userWithPreGenCourses && userWithPreGenCourses.preGeneratedCourses) {
            formattedPreGenerated = userWithPreGenCourses.preGeneratedCourses.map(userCourse => {
                const course = userCourse.course;
                if (!course || !course.index) return null; // Safety check

                // --- ROBUST PROGRESS CALCULATION ---
                const subtopics = course.index?.subtopics || [];
                const totalLessons = subtopics.reduce((acc, sub) => acc + (sub.lessons?.length || 0), 0);
                const completedLessons = userCourse.progress?.filter(p => p.isCompleted).length || 0;
                const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
                // --- END OF FIX ---

                return {
                    _id: course._id,
                    title: course.title,
                    thumbnailUrl: course.thumbnailUrl,
                    progress: progress,
                    date: userCourse.startedAt,
                    type: 'Pre-Generated',
                    isCompleted: progress >= 100,
                };
            }).filter(Boolean);
        }

        const allCourses = [...formattedSelfGenerated, ...formattedPreGenerated];
        allCourses.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(allCourses);

    } catch (error) {
        console.error('Error fetching user courses for admin:', error);
        res.status(500).json({ msg: 'Server error while fetching user courses' });
    }
};


exports.getUserGeneratedCourses = async (req, res) => {
  try {
    const { page = 1, limit = 100, search = '', status = '' } = req.query;

    const query = {
      isPreGenerated: { $ne: true } 
    };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      // Find users matching the email search to include in the course query
      const users = await User.find({ email: searchRegex }).select('_id');
      const userIds = users.map(user => user._id);

      query.$or = [
        { topic: searchRegex },
        { user: { $in: userIds } }
      ];
    }

    if (status) {
      query.status = status;
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      populate: {
        path: 'user',
        select: 'firstName lastName email'
      },
      sort: { createdAt: -1 }
    };

    const paginatedCourses = await Course.paginate(query, options);

    // V V V THIS IS THE FIX V V V
    const response = {
        ...paginatedCourses,
    };

    // If this is the first page load without filters, get the grand total.
    if (page === 1 && !search && !status) {
        response.grandTotal = await Course.countDocuments({ isPreGenerated: { $ne: true } });
    }
    // ^ ^ ^ END OF THE FIX ^ ^ ^

    res.json(response);

  } catch (error) {
    console.error('Error fetching user-generated courses:', error);
    res.status(500).json({ msg: 'Server error while fetching courses.' });
  }
};

exports.getCourseDetailsForAdmin = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).populate('user', 'firstName lastName');
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    console.error('Error fetching course details for admin:', error);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/admin/course-chat/:courseId
// @desc    Admin gets chat history for a specific course
// @access  Private (Admin)
exports.getCourseChatHistory = async (req, res) => {
  try {
    // Step 1: Find the course to get the user ID
    const course = await Course.findById(req.params.courseId).select('user');
    if (!course || !course.user) {
        return res.status(404).json({ msg: 'Course or associated user not found' });
    }

    // Step 2: Find the specific chat session for that user and course
    const chatSession = await Chat.findOne({
      user: course.user,
      course: req.params.courseId
    });

    // Step 3: If a session is found, return its 'messages' array. Otherwise, return an empty array.
    if (chatSession) {
      res.json(chatSession.messages);
    } else {
      res.json([]);
    }

  } catch (err) {
    console.error('Error in getCourseChatHistory:', err.message);
    res.status(500).send('Server Error');
  }
};


exports.getUserAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ user: req.params.userId }).populate('user', 'firstName lastName');
    res.json(courses);
  } catch (error) {
    console.error('Error fetching user courses for admin:', error);
    res.status(500).send('Server Error');
  }
};


