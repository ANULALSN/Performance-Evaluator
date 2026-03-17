/**
 * Strips all sensitive data from quiz before sending to students
 */
const toStudentDTO = (quiz) => ({
  _id: quiz._id,
  title: quiz.title,
  description: quiz.description,
  techStack: quiz.techStack,
  difficulty: quiz.difficulty,
  timeLimit: quiz.timeLimit,
  passingScore: quiz.passingScore,
  questionCount: quiz.questions.length,
  questions: quiz.questions.map(q => ({
    _id: q._id,
    question: q.question,
    options: q.options
  }))
});

/**
 * Full data for admin (includes correctIndex + explanation)
 */
const toAdminDTO = (quiz) => quiz.toObject ? quiz.toObject() : quiz;

module.exports = {
  toStudentDTO,
  toAdminDTO
};
