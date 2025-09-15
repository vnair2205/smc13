// server/seed/createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Admin = require('../models/Admin');

dotenv.config({ path: './.env' });

connectDB();

const createAdminUser = async () => {
  try {
    const adminExists = await Admin.findOne({ email: 'vishnu@seekmycourse.com' });

    if (adminExists) {
      console.log('Admin user already exists.');
      process.exit();
    }

    const newAdmin = new Admin({
      email: 'vishnu@seekmycourse.com',
      password: 'Vishnu@456', // The model will hash this automatically
    });

    await newAdmin.save();
    console.log('Admin user created successfully!');
    process.exit();
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();