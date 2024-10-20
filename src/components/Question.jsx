/* eslint-disable react/prop-types */

export default function Question({ question, onAnswerSelected }) {
  return (
    <div className="question-container">
      <h2 className="question-text">{question.questionText}</h2>
      <div className="answers-container">
        {question.answers.map(answer => (
          <button className="answer-button" 
            key={answer} 
            onClick={() => onAnswerSelected(answer)}
          >
            {answer}
          </button>
        ))}
      </div>
    </div>
  );
}