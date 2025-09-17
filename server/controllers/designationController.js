// server/controllers/designationController.js
const Designation = require('../models/Designation');

exports.getDesignations = async (req, res) => {
  try {
    const designations = await Designation.find().sort({ name: 1 });
    res.json(designations);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

exports.addDesignation = async (req, res) => {
  try {
    const newDesignation = new Designation({ name: req.body.name });
    await newDesignation.save();
    res.status(201).json(newDesignation);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
        return res.status(400).json({ msg: 'Designation already exists.' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
};

exports.updateDesignation = async (req, res) => {
  try {
    const designation = await Designation.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
    if (!designation) {
        return res.status(404).json({ msg: 'Designation not found.' });
    }
    res.json(designation);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// --- THIS IS THE CORRECTED FUNCTION ---
exports.deleteDesignation = async (req, res) => {
  try {
    const designation = await Designation.findByIdAndDelete(req.params.id);
    if (!designation) {
      return res.status(404).json({ msg: 'Designation not found.' });
    }
    res.json({ msg: 'Designation removed.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};