const PreGenCategory = require('../models/PreGenCategory');
const PreGenSubCategory1 = require('../models/PreGenSubCategory1');
const PreGenSubCategory2 = require('../models/PreGenSubCategory2');
const csv = require('csv-parser');
const streamifier = require('streamifier');

// --- Create Operations ---
exports.createCategory = async (req, res) => {
    try {
        const newCategory = new PreGenCategory({ name: req.body.name });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(400).json({ msg: 'Error creating category. It may already exist.' });
    }
};

exports.getSubCategories1ByParent = async (req, res) => {
    try {
        const subCategories = await PreGenSubCategory1.find({ parentCategory: req.params.parentId }).sort({ name: 1 });
        res.json(subCategories);
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.createSubCategory1 = async (req, res) => {
    try {
        const { name, parentCategory } = req.body;
        const newSubCategory1 = new PreGenSubCategory1({ name, parentCategory });
        await newSubCategory1.save();
        res.status(201).json(newSubCategory1);
    } catch (error) {
        res.status(400).json({ msg: 'Error creating subcategory. It may already exist under this parent.' });
    }
};

exports.createSubCategory2 = async (req, res) => {
    try {
        const { name, parentSubCategory1 } = req.body;
        const newSubCategory2 = new PreGenSubCategory2({ name, parentSubCategory1 });
        await newSubCategory2.save();
        res.status(201).json(newSubCategory2);
    } catch (error) {
        res.status(400).json({ msg: 'Error creating subcategory. It may already exist under this parent.' });
    }
};

// --- Read Operations (Corrected) ---
exports.getCategories = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const options = { page, limit, sort: { name: 1 } };
        const data = await PreGenCategory.paginate({}, options);
        res.json(data);
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.getSubCategories1 = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const options = {
            page,
            limit,
            sort: { name: 1 },
            populate: { path: 'parentCategory', select: 'name' }
        };
        const data = await PreGenSubCategory1.paginate({}, options);
        res.json(data);
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.getSubCategories2 = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const options = {
            page,
            limit,
            sort: { name: 1 },
            populate: { 
                path: 'parentSubCategory1', 
                select: 'name',
                populate: {
                    path: 'parentCategory',
                    select: 'name'
                }
            }
        };
        const data = await PreGenSubCategory2.paginate({}, options);
        res.json(data);
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
};


exports.updateCategory = async (req, res) => {
    try {
        const category = await PreGenCategory.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
        if (!category) return res.status(404).json({ msg: 'Category not found' });
        res.json(category);
    } catch (error) {
        res.status(400).json({ msg: 'Error updating category.' });
    }
};

exports.updateSubCategory1 = async (req, res) => {
    try {
        const subCategory1 = await PreGenSubCategory1.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!subCategory1) return res.status(404).json({ msg: 'Subcategory not found' });
        res.json(subCategory1);
    } catch (error) {
        res.status(400).json({ msg: 'Error updating subcategory.' });
    }
};

// --- NEW: Delete Operations ---
exports.deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        // Find all subcategories1 linked to this category
        const subCategories1 = await PreGenSubCategory1.find({ parentCategory: categoryId });
        const subCategories1Ids = subCategories1.map(sc => sc._id);

        // Find and delete all subcategories2 linked to those subcategories1
        await PreGenSubCategory2.deleteMany({ parentSubCategory1: { $in: subCategories1Ids } });
        
        // Delete all subcategories1
        await PreGenSubCategory1.deleteMany({ parentCategory: categoryId });

        // Finally, delete the category itself
        await PreGenCategory.findByIdAndDelete(categoryId);

        res.json({ msg: 'Category and all associated subcategories deleted.' });
    } catch (error) {
        res.status(500).json({ msg: 'Server error during deletion.' });
    }
};

exports.deleteSubCategory1 = async (req, res) => {
    try {
        const subCategory1Id = req.params.id;
        // Delete all subcategories2 linked to this subcategory1
        await PreGenSubCategory2.deleteMany({ parentSubCategory1: subCategory1Id });

        // Delete the subcategory1 itself
        await PreGenSubCategory1.findByIdAndDelete(subCategory1Id);

        res.json({ msg: 'Subcategory and associated subcategories deleted.' });
    } catch (error) {
        res.status(500).json({ msg: 'Server error during deletion.' });
    }
};

exports.deleteSubCategory2 = async (req, res) => {
    try {
        await PreGenSubCategory2.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Subcategory deleted.' });
    } catch (error) {
        res.status(500).json({ msg: 'Server error during deletion.' });
    }
};


exports.updateSubCategory2 = async (req, res) => {
    try {
        const subCategory2 = await PreGenSubCategory2.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!subCategory2) return res.status(404).json({ msg: 'Subcategory not found' });
        res.json(subCategory2);
    } catch (error) {
        res.status(400).json({ msg: 'Error updating subcategory.' });
    }
};

exports.getSubCategories2ByParent = async (req, res) => {
    try {
        const subCategories = await PreGenSubCategory2.find({ parentSubCategory1: req.params.parentId }).sort({ name: 1 });
        res.json(subCategories);
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
};
// --- Bulk Upload ---
exports.bulkUpload = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded.' });
    }
    const results = [];
    const stream = streamifier.createReadStream(req.file.buffer);
    stream.pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                for (const row of results) {
                    const categoryName = row['Category Name']?.trim();
                    const subCat1Name = row['Sub Category 1 Name']?.trim();
                    const subCat2Name = row['Sub Category 2 Name']?.trim();
                    if (!categoryName) continue;
                    let category = await PreGenCategory.findOneAndUpdate({ name: categoryName }, { name: categoryName }, { upsert: true, new: true });
                    if (!subCat1Name) continue;
                    let subCategory1 = await PreGenSubCategory1.findOneAndUpdate({ name: subCat1Name, parentCategory: category._id }, { name: subCat1Name, parentCategory: category._id }, { upsert: true, new: true });
                    if (!subCat2Name) continue;
                    await PreGenSubCategory2.findOneAndUpdate({ name: subCat2Name, parentSubCategory1: subCategory1._id }, { name: subCat2Name, parentSubCategory1: subCategory1._id }, { upsert: true, new: true });
                }
                res.status(200).json({ msg: 'Bulk upload successful!' });
            } catch (error) {
                res.status(500).json({ msg: 'An error occurred during the bulk upload process.' });
            }
        });
};