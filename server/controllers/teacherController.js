const Teacher = require('../models/Teacher');
const bcrypt = require('bcryptjs');

const teacherController = {};

// Get all teachers for a specific institute
teacherController.getTeachersByInstitute = async (req, res) => {
  try {
    const teachers = await Teacher.find({ institute: req.params.instituteId })
      .populate('class', 'name')
      .populate('section', 'name')
      .populate('subject', 'name');
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new teacher
teacherController.createTeacher = async (req, res) => {
  const { firstName, lastName, email, password, instituteId, classId, sectionId, subjectId } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newTeacher = new Teacher({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      institute: instituteId,
      class: classId,
      section: sectionId,
      subject: subjectId,
    });

    const savedTeacher = await newTeacher.save();
    res.status(201).json(savedTeacher);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
// Add update and delete functions here

module.exports = teacherController;