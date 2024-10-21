export default function Question({ question, onAnswerSelected, showAnswers }) {
  return (
    <div className="question-container">
      <h2 className="question-text">{question.questionText}</h2>
      <div className="answers-container">
        {question.answers.map(answer => {
          const isCorrect = question.correctAnswer === answer;
          const isIncorrect = question.selectedAnswer === answer && question.correctAnswer !== answer;
          const buttonClass = showAnswers ? 
            `answer-btn reveal ${isCorrect ? 'correct' : isIncorrect ? 'incorrect' : ''}` 
            : 'answer-btn';

          return (
            <button className={buttonClass} 
              key={answer} 
              onClick={() => !showAnswers && onAnswerSelected(answer)}
            >
            {answer}
            </button>
          );
        })}
      </div>
    </div>
  );
}