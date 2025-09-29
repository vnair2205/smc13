const Section = require('../models/Section');

const sectionController = {};

// Get all sections for a specific institute
sectionController.getSectionsByInstitute = async (req, res) => {
  try {
    const sections = await Section.find({ institute: req.params.instituteId }).populate('class', 'name');
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new section
sectionController.createSection = async (req, res) => {
  try {
    const newSection = new Section({
      name: req.body.name,
      class: req.body.classId,
      institute: req.body.instituteId,
    });
    const savedSection = await newSection.save();
    res.status(201).json(savedSection);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add update and delete functions here

module.exports = sectionController;