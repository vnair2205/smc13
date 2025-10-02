// server/routes/knowledgebaseArticle.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
 getArticles,
  addArticle,
  updateArticle,
  deleteArticle,
  getArticleById
} = require('../controllers/knowledgebaseArticleController');

router.use(adminAuth);

router.route('/')
  .get(getArticles)
  .post(addArticle);

router.route('/:id')
  .get(getArticleById) // Add the GET method
  .put(updateArticle)
  .delete(deleteArticle);


module.exports = router;