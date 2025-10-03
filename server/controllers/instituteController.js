const bcrypt = require('bcryptjs');
const csv = require('csv-parser');
const streamifier = require('streamifier');
const Institute = require('../models/Institute');
const InstituteAdmin = require('../models/InstituteAdmin');
const InstitutePlan = require('../models/institutePlan');
const Class = require('../models/Class');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const InstituteUser = require('../models/InstituteUser');
const sendEmail = require('../utils/sendEmail');


// Your existing createInstitute function
exports.createInstitute = async (req, res) => {
    const {
        instituteName, addressLine1, addressLine2, city, state, pinCode,
        institutePhoneNumber, instituteEmail, adminFirstName, adminLastName,
        adminEmail, adminPassword, adminPhoneNumber, planId
    } = req.body;

    try {
        let adminUser = await InstituteAdmin.findOne({ email: adminEmail });
        if (adminUser) {
            return res.status(400).json({ msg: 'An institute admin with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        adminUser = new InstituteAdmin({
            firstName: adminFirstName,
            lastName: adminLastName,
            email: adminEmail,
            password: hashedPassword,
            phoneNumber: adminPhoneNumber,
        });
        await adminUser.save();

        const newInstitute = new Institute({
            instituteName,
            address: { line1: addressLine1, line2: addressLine2, city, state, pinCode },
            institutePhoneNumber,
            instituteEmail,
            admin: adminUser._id,
            plan: planId,
        });

        const institute = await newInstitute.save();
        res.status(201).json(institute);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Your existing getInstitutes function
exports.getInstitutes = async (req, res) => {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const query = {};
    if (search) {
        query.instituteName = { $regex: search, $options: 'i' };
    }
    if (status) {
        query.status = status;
    }
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        populate: [
            { path: 'admin', model: 'InstituteAdmin', select: 'firstName lastName email phoneNumber' },
            { path: 'plan', select: 'name' }
        ],
        sort: { createdAt: -1 }
    };
    try {
        const institutes = await Institute.paginate(query, options);
        res.json(institutes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Your existing getInstituteStats function
exports.getInstituteStats = async (req, res) => {
    try {
        const total = await Institute.countDocuments();
        const active = await Institute.countDocuments({ status: 'active' });
        const inactive = await Institute.countDocuments({ status: 'inactive' });
        res.json({ total, active, inactive });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// --- NEW FUNCTIONS ---

exports.getInstituteById = async (req, res) => {
    try {
        const institute = await Institute.findById(req.params.id)
            .populate('plan')
            .populate('admin', '-password');

        if (!institute) {
            return res.status(404).json({ msg: 'Institute not found' });
        }

        const classes = await Class.find({ institute: req.params.id });
        const sections = await Section.find({ institute: req.params.id }).populate('class', 'name');
        const subjects = await Subject.find({ institute: req.params.id });
        const teachers = await Teacher.find({ institute: req.params.id }).populate('class section subject', 'name');

        const { page = 1, limit = 10 } = req.query;
        const users = await InstituteUser.paginate({ institute: req.params.id }, { page, limit, populate: 'class section' });

        res.json({ institute, classes, sections, subjects, teachers, users });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateInstitutePlan = async (req, res) => {
    try {
        const { planId } = req.body;
        const institute = await Institute.findByIdAndUpdate(
            req.params.id,
            { $set: { plan: planId } },
            { new: true }
        ).populate('plan');

        if (!institute) {
            return res.status(404).json({ msg: 'Institute not found' });
        }
        res.json(institute);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.addClass = async (req, res) => {
    try {
        const { name } = req.body;
        const newClass = new Class({ name, institute: req.params.id });
        await newClass.save();
        res.status(201).json(newClass);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addSection = async (req, res) => {
    try {
        const { name, classId } = req.body;
        const newSection = new Section({ name, class: classId, institute: req.params.id });
        await newSection.save();
        const populatedSection = await Section.findById(newSection._id).populate('class', 'name');
        res.status(201).json(populatedSection);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addSubject = async (req, res) => {
    try {
        const { name } = req.body;
        const newSubject = new Subject({ name, institute: req.params.id });
        await newSubject.save();
        res.status(201).json(newSubject);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.bulkUploadSubjects = async (req, res) => {
    const results = [];
    const instituteId = req.params.id;
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const stream = streamifier.createReadStream(req.file.buffer);
    stream.pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                const subjectsToInsert = results.map(row => ({
                    name: row['Subject Name'],
                    institute: instituteId,
                }));
                const insertedSubjects = await Subject.insertMany(subjectsToInsert);
                res.status(201).json(insertedSubjects);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });
};

exports.addTeacher = async (req, res) => {
    try {
        const { firstName, lastName, email, password, classId, sectionId, subjectId } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newTeacher = new Teacher({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            class: classId,
            section: sectionId,
            subject: subjectId,
            institute: req.params.id,
        });

        await newTeacher.save();
        res.status(201).json(newTeacher);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addInstituteUser = async (req, res) => {
    const {
        studentId, firstName, lastName, email, phone, classId, sectionId,
        guardianFirstName, guardianLastName, guardianEmail, guardianPhone // <-- Add guardianPhone
    } = req.body;
    const instituteId = req.params.id;


    try {
        const password = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new InstituteUser({
            studentId,
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            class: classId,
            section: sectionId,
            institute: instituteId,
        });

        if (guardianEmail) {
            const guardianPassword = Math.random().toString(36).slice(-8);
            const guardianHashedPassword = await bcrypt.hash(guardianPassword, salt);
            newUser.guardian = {
                firstName: guardianFirstName,
                lastName: guardianLastName,
                email: guardianEmail,
                password: guardianHashedPassword,
                  phone: guardianPhone,
            };

            await sendEmail({
                to: guardianEmail,
                subject: 'Your Guardian Account Credentials for SeekMYCOURSE',
                html: `<p>Hello ${guardianFirstName},</p><p>A guardian account has been created for you. Your login details are:</p><p>Email: ${guardianEmail}</p><p>Password: ${guardianPassword}</p>`,
            });
        }

        await newUser.save();

        await sendEmail({
            to: email,
            subject: 'Your Student Account Credentials for SeekMYCOURSE',
            html: `<p>Hello ${firstName},</p><p>A student account has been created for you. Your login details are:</p><p>Email: ${email}</p><p>Password: ${password}</p>`,
        });

        const populatedUser = await InstituteUser.findById(newUser._id).populate('class section');
        res.status(201).json(populatedUser);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


exports.updateInstituteDetails = async (req, res) => {
    const { instituteName, instituteEmail, institutePhoneNumber, address } = req.body;

    try {
        const institute = await Institute.findById(req.params.id);
        if (!institute) {
            return res.status(404).json({ msg: 'Institute not found' });
        }

        institute.instituteName = instituteName;
        institute.instituteEmail = instituteEmail;
        institute.institutePhoneNumber = institutePhoneNumber;
        institute.address = address;

        await institute.save();
        res.json(institute);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


exports.updateClass = async (req, res) => {
    try {
        const { name } = req.body;
        const updatedClass = await Class.findByIdAndUpdate(
            req.params.classId,
            { $set: { name } },
            { new: true }
        );
        if (!updatedClass) {
            return res.status(404).json({ msg: 'Class not found' });
        }
        res.json(updatedClass);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// @route   DELETE api/institutes/classes/:classId
// @desc    Delete a class
// @access  Private (Admin)
exports.deleteClass = async (req, res) => {
    try {
        const deletedClass = await Class.findByIdAndDelete(req.params.classId);
        if (!deletedClass) {
            return res.status(404).json({ msg: 'Class not found' });
        }
        // Optional: Also delete associated sections, subjects, etc. if needed
        res.json({ msg: 'Class deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


exports.updateSection = async (req, res) => {
    try {
        const { name, classId } = req.body;
        const updatedSection = await Section.findByIdAndUpdate(
            req.params.sectionId,
            { $set: { name, class: classId } },
            { new: true }
        ).populate('class', 'name');

        if (!updatedSection) {
            return res.status(404).json({ msg: 'Section not found' });
        }
        res.json(updatedSection);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   DELETE api/institutes/sections/:sectionId
// @desc    Delete a section
// @access  Private (Admin)
exports.deleteSection = async (req, res) => {
    try {
        const deletedSection = await Section.findByIdAndDelete(req.params.sectionId);
        if (!deletedSection) {
            return res.status(404).json({ msg: 'Section not found' });
        }
        res.json({ msg: 'Section deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT api/institutes/subjects/:subjectId
// @desc    Update a subject
// @access  Private (Admin)
exports.updateSubject = async (req, res) => {
    try {
        const { name } = req.body;
        const updatedSubject = await Subject.findByIdAndUpdate(
            req.params.subjectId,
            { $set: { name } },
            { new: true }
        );
        if (!updatedSubject) {
            return res.status(404).json({ msg: 'Subject not found' });
        }
        res.json(updatedSubject);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   DELETE api/institutes/subjects/:subjectId
// @desc    Delete a subject
// @access  Private (Admin)
exports.deleteSubject = async (req, res) => {
    try {
        const deletedSubject = await Subject.findByIdAndDelete(req.params.subjectId);
        if (!deletedSubject) {
            return res.status(404).json({ msg: 'Subject not found' });
        }
        res.json({ msg: 'Subject deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


exports.updateTeacher = async (req, res) => {
    try {
        const { firstName, lastName, email, password, classId, sectionId, subjectId } = req.body;

        const updatedFields = {
            firstName, lastName, email,
            class: classId,
            section: sectionId,
            subject: subjectId,
        };

        // If a new password is provided, hash and update it
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updatedFields.password = await bcrypt.hash(password, salt);
        }

        const teacher = await Teacher.findByIdAndUpdate(
            req.params.teacherId,
            { $set: updatedFields },
            { new: true }
        );

        if (!teacher) {
            return res.status(404).json({ msg: 'Teacher not found' });
        }
        res.json(teacher);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   DELETE api/institutes/teachers/:teacherId
// @desc    Delete a teacher
// @access  Private (Admin)
exports.deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndDelete(req.params.teacherId);
        if (!teacher) {
            return res.status(404).json({ msg: 'Teacher not found' });
        }
        res.json({ msg: 'Teacher deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};



// @route   PUT api/institutes/users/:userId
// @desc    Update an institute user
// @access  Private (Admin)
exports.updateInstituteUser = async (req, res) => {
    try {
        const {
            studentId, firstName, lastName, email, phone, classId, sectionId,
            guardianFirstName, guardianLastName, guardianEmail
        } = req.body;

        const updatedFields = {
            studentId, firstName, lastName, email, phone,
            class: classId,
            section: sectionId,
            guardian: {
                firstName: guardianFirstName,
                lastName: guardianLastName,
                email: guardianEmail,
            }
        };

        const user = await InstituteUser.findByIdAndUpdate(
            req.params.userId,
            { $set: updatedFields },
            { new: true }
        ).populate('class section');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   DELETE api/institutes/users/:userId
// @desc    Delete an institute user
// @access  Private (Admin)
exports.deleteInstituteUser = async (req, res) => {
    try {
        const user = await InstituteUser.findByIdAndDelete(req.params.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   POST api/institutes/:id/users/bulk-upload
// @desc    Bulk upload institute users from CSV
// @access  Private (Admin)
exports.bulkUploadInstituteUsers = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const { classId, sectionId } = req.body;
    
    if (!classId || !sectionId) {
        return res.status(400).json({ 
            errors: ['Please select a class and a section before uploading.'] 
        });
    }

    const results = [];
    const errors = [];
    let processedCount = 0;
    const instituteId = req.params.id;
    
    const csvData = req.file.buffer.toString('utf8');
    const stream = require('stream');
    const readable = new stream.Readable();
    readable._read = () => {};
    readable.push(csvData);
    readable.push(null);

    readable.pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            for (const [index, row] of results.entries()) {
                const rowIndex = index + 2;
                try {
                    const {
                        'Student ID': studentId, 'First Name': firstName, 'Last Name': lastName, Email: email, Phone: phone,
                        'Guardian First Name': guardianFirstName, 'Guardian Last Name': guardianLastName,
                        'Guardian Email': guardianEmail, 'Guardian Phone': guardianPhone
                    } = row;
                    
                    if (!studentId || !firstName || !lastName || !email) {
                        errors.push(`Row ${rowIndex}: Missing required fields.`);
                        continue;
                    }

                    const existingUser = await InstituteUser.findOne({ email, institute: instituteId });
                    if (existingUser) {
                        errors.push(`Row ${rowIndex}: A user with email '${email}' already exists.`);
                        continue;
                    }

                    const password = Math.random().toString(36).slice(-8);
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);

                    const newUser = new InstituteUser({
                        institute: instituteId,
                        studentId, firstName, lastName, email, phone,
                        password: hashedPassword,
                        class: classId,
                        section: sectionId,
                    });
                    
                    if (guardianEmail) {
                        const guardianPassword = Math.random().toString(36).slice(-8);
                        const guardianHashedPassword = await bcrypt.hash(guardianPassword, salt);
                        newUser.guardian = {
                            firstName: guardianFirstName, lastName: guardianLastName,
                            email: guardianEmail, phone: guardianPhone,
                            password: guardianHashedPassword
                        };
                        
                        // --- THIS IS THE FIX (Part 1) ---
                        // Added the full email options for the guardian
                        await sendEmail({
                            to: guardianEmail,
                            subject: 'Your Guardian Account Credentials for SeekMYCOURSE',
                            html: `<p>Hello ${guardianFirstName || ''},</p><p>A guardian account has been created for you. Your login details are:</p><p>Email: ${guardianEmail}</p><p>Password: ${guardianPassword}</p>`,
                        });
                    }

                    await newUser.save();

                    // --- THIS IS THE FIX (Part 2) ---
                    // Added the full email options for the student
                    await sendEmail({
                        to: email,
                        subject: 'Your Student Account Credentials for SeekMYCOURSE',
                        html: `<p>Hello ${firstName},</p><p>A student account has been created for you. Your login details are:</p><p>Email: ${email}</p><p>Password: ${password}</p>`,
                    });

                    processedCount++;

                } catch (err) {
                    errors.push(`Row ${rowIndex}: An unexpected error occurred - ${err.message}`);
                }
            }

            if (errors.length > 0) {
                return res.status(400).json({
                    message: `Processed ${processedCount} of ${results.length} records with errors.`,
                    errors,
                });
            }

            res.status(201).json({ message: `Successfully uploaded ${processedCount} users.` });
        });
};