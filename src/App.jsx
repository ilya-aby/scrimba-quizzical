import { useState, useEffect } from 'react'
import { decode } from 'html-entities';
import { nanoid } from 'nanoid';
import Question from './components/Question.jsx';

const APIConfig = {
  baseUrl: 'https://opentdb.com/api.php',
  amount: 5,        // Questions per fetch
  category: 11,     // Film
  type: 'multiple'  // Only multiple-choice, no true/false
}

const GameStates = {
  INTRO: 'intro',
  PLAYING: 'playing',
  END: 'end'
}

export default function App() {

  const [gameState, setGameState] = useState(GameStates.INTRO);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);

  const fetchQuestions = async () => {
    const response = await fetch(`${APIConfig.baseUrl}?amount=${APIConfig.amount}&category=${APIConfig.category}&type=${APIConfig.type}`);
    const data = await response.json();

    data.results.forEach(question => {
      question.question = decode(question.question);
      question.correct_answer = decode(question.correct_answer);
      question.incorrect_answers = question.incorrect_answers.map(answer => decode(answer));
    });

    const newQuestions = data.results.map(question => ({
      questionText: question.question,
      answers: [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5),
      correctAnswer: question.correct_answer,
      selectedAnswer: null,
      id: nanoid()
    }));

    setScore(0);
    setCurrentQuestionIndex(0);
    setQuestions(newQuestions);
  }

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAnswerSelected = (answer) => {
    if(currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      setGameState(GameStates.END);
    }

    if(answer === questions[currentQuestionIndex].correctAnswer) {
      setScore(prevScore => prevScore + 1);
    }

    setQuestions(prevQuestions => prevQuestions.map(question => 
      question.id === questions[currentQuestionIndex].id ? { ...question, selectedAnswer: answer } : question
    ));
  }

  return (
    <div className="game-container">
      {gameState === GameStates.INTRO && (  
        <>
          <div>
            <h1>Quizzical</h1>
            <p className="subtitle">Test your knowledge</p>
          </div>
          <button onClick={() => setGameState(GameStates.PLAYING)}>Start quiz</button>
        </>
      )}
      {gameState === GameStates.PLAYING && questions.length > 0 && (
        <Question 
          key={questions[currentQuestionIndex].id}
          question={questions[currentQuestionIndex]}
          onAnswerSelected={handleAnswerSelected}
          showAnswers={false}
        />
      )}
      {gameState === GameStates.END && (
        <>
          <h2>You scored {score} / {questions.length} correct answers</h2>
          <button onClick={() => {
            setQuestions([]);
            fetchQuestions();
            setGameState(GameStates.PLAYING);
          }}>Play again</button>
          {questions.map(question => (
            <>
              <hr />
              <Question 
                key={question.id}
                question={question}
                onAnswerSelected={null}
                showAnswers={true}
              />
            </>
          ))}
        </>
      )}
    </div>
  )
}