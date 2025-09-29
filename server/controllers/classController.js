const Class = require('../models/Class');

// 1. Create a controller object
const classController = {};

// 2. Attach your functions to the object
// Get all classes for a specific institute
classController.getClassesByInstitute = async (req, res) => {
  try {
    const classes = await Class.find({ institute: req.params.instituteId });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new class
classController.createClass = async (req, res) => {
  try {
    const newClass = new Class({
      name: req.body.name,
      institute: req.body.instituteId,
    });
    const savedClass = await newClass.save();
    res.status(201).json(savedClass);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a class
classController.updateClass = async (req, res) => {
    // Logic to find by req.params.id and update
};

// Delete a class
classController.deleteClass = async (req, res) => {
    // Logic to find by req.params.id and delete
};

// 3. Export the single controller object
module.exports = classController;