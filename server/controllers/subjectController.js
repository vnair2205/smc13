const Subject = require('../models/Subject');

const subjectController = {};

// Get all subjects for a specific institute
subjectController.getSubjectsByInstitute = async (req, res) => {
  try {
    const subjects = await Subject.find({ institute: req.params.instituteId });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new subject
subjectController.createSubject = async (req, res) => {
  try {
    const newSubject = new Subject({
      name: req.body.name,
      institute: req.body.instituteId,
    });
    const savedSubject = await newSubject.save();
    res.status(201).json(savedSubject);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add update and delete functions here

module.exports = subjectController;