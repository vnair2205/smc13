const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// Re-use the exact same sub-schemas from your existing Course.js model
const VideoHistorySchema = new mongoose.Schema({
  videoUrl: { type: String },
  videoChannelId: { type: String },
  videoChannelTitle: { type: String }
});

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  englishTitle: { type: String },
  content: { type: String },
  videoUrl: { type: String },
  videoChannelId: { type: String },
  videoChannelTitle: { type: String },
  videoHistory: [VideoHistorySchema],
  videoChangeCount: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false }
});

const SubtopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  englishTitle: { type: String },
  lessons: [LessonSchema]
});

const QuizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true }
});


const PreGenCourseSchema = new mongoose.Schema({
  // --- Category Links ---
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'PreGenCategory', required: true },
  subCategory1: { type: mongoose.Schema.Types.ObjectId, ref: 'PreGenSubCategory1', required: true },
  subCategory2: { type: mongoose.Schema.Types.ObjectId, ref: 'PreGenSubCategory2', required: true },

  // --- Core Course Content (from Course.js) ---
  topic: { type: String, required: true },
  englishTopic: { type: String },
  objective: { type: [String] },
  englishObjective: { type: [String] },
  outcome: { type: String },
  englishOutcome: { type: String },
  language: { type: String, default: 'en' },
  languageName: { type: String, default: 'English' },
  nativeName: { type: String, default: 'English' },
  numSubtopics: { type: Number, default: 1 },
  thumbnailUrl: { type: String },
  index: {
    subtopics: [SubtopicSchema]
  },
  quiz: [QuizQuestionSchema],
  // Note: We omit user-specific fields like 'user', 'score', 'status', 'notes'
}, { timestamps: true });

PreGenCourseSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('PreGenCourse', PreGenCourseSchema);