const TestUser = require('../models/TestUser');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const csv = require('csv-parser');
const streamifier = require('streamifier');

// Add a single test user
exports.addTestUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, plan } = req.body;
    const existingUser = await TestUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    const testUser = new TestUser({ firstName, lastName, email, phoneNumber, password, plan });
    await testUser.save();
    res.status(201).json(testUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get all test users
exports.getTestUsers = async (req, res) => {
  try {
    const testUsers = await TestUser.find().populate('plan');
    res.status(200).json(testUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update a test user
exports.updateTestUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phoneNumber, plan } = req.body;

    const user = await TestUser.findById(id);
    if (!user) {
        return res.status(404).json({ message: 'Test user not found' });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.phoneNumber = phoneNumber;
    user.plan = plan;

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Bulk upload test users from a CSV file
exports.bulkUploadTestUsers = async (req, res) => {
    const { plan } = req.body;
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const results = [];
    const stream = streamifier.createReadStream(req.file.buffer);

    stream.pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                for (const user of results) {
                    const { FirstName, LastName, Email, CountryCode, PhoneNumber, Password } = user;
                    const newUser = new TestUser({
                        firstName: FirstName,
                        lastName: LastName,
                        email: Email,
                        phoneNumber: `${CountryCode}${PhoneNumber}`,
                        password: Password,
                        plan: plan
                    });
                    await newUser.save();
                }
                res.status(201).json({ message: 'Bulk upload successful' });
            } catch (error) {
                res.status(500).json({ message: 'Error during bulk upload', error });
            }
        });
};