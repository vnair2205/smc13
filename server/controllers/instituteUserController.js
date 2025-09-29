const InstituteUser = require('../models/InstituteUser');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

const instituteUserController = {};

const generatePassword = () => crypto.randomBytes(8).toString('hex');

instituteUserController.createInstituteUser = async (req, res) => {
  const { studentId, firstName, lastName, email, phone, instituteId, classId, sectionId, guardian } = req.body;
  try {
    const studentPassword = generatePassword();
    const salt = await bcrypt.genSalt(10);
    const hashedStudentPassword = await bcrypt.hash(studentPassword, salt);
    let guardianData = {};
    if (guardian && guardian.email) {
      const guardianPassword = generatePassword();
      const hashedGuardianPassword = await bcrypt.hash(guardianPassword, salt);
      guardianData = { ...guardian, password: hashedGuardianPassword };
      await sendEmail({
        to: guardian.email,
        subject: 'Your Guardian Account Credentials for SeekMYCOURSE',
        text: `Hello ${guardian.firstName}, Your login email is ${guardian.email} and your password is: ${guardianPassword}`,
      });
    }
    const newUser = new InstituteUser({
      studentId,
      firstName,
      lastName,
      email,
      phone,
      password: hashedStudentPassword,
      institute: instituteId,
      class: classId,
      section: sectionId,
      guardian: guardianData,
    });
    const savedUser = await newUser.save();
    await sendEmail({
      to: email,
      subject: 'Your Student Account Credentials for SeekMYCOURSE',
      text: `Hello ${firstName}, Your login email is ${email} and your password is: ${studentPassword}`,
    });
    res.status(201).json(savedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// Add functions to get, update, and delete users

module.exports = instituteUserController;