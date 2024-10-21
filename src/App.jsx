import { useState, useEffect, Fragment } from 'react'
import { decode } from 'html-entities';
import { nanoid } from 'nanoid';
import Question from './components/Question.jsx';
import categories from './categories.js';

const APIConfig = {
  baseUrl: 'https://opentdb.com/api.php',
  amount: 5,        // Questions per fetch
  type: 'multiple'  // Only multiple-choice, no true/false
}

const GameStates = {
  INTRO: 'intro',
  LOADING: 'loading',
  PLAYING: 'playing',
  END: 'end',
  ERROR: 'error'
}

export default function App() {

  const [gameState, setGameState] = useState(GameStates.INTRO);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);

  useEffect(() => {
    if (gameState === GameStates.LOADING) {
      const fetchQuestions = async () => {
        try {
          const response = await fetch(`${APIConfig.baseUrl}?amount=${APIConfig.amount}&category=${selectedCategory}&type=${APIConfig.type}`);
          
          if (!response.ok) {
            throw new Error(`HTTP Error status: ${response.status}`);
          }
  
          const data = await response.json();
  
          const decodedResults = data.results.map(question => ({
            ...question,
            question: decode(question.question),
            correct_answer: decode(question.correct_answer),
            incorrect_answers: question.incorrect_answers.map(answer => decode(answer))
          }));
  
          const newQuestions = decodedResults.map(question => ({
            questionText: question.question,
            answers: [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5),
            correctAnswer: question.correct_answer,
            selectedAnswer: null,
            id: nanoid()
          }));
  
          setScore(0);
          setCurrentQuestionIndex(0);
          setQuestions(newQuestions);
          setGameState(GameStates.PLAYING);
        } catch (error) {
          setError(error.message);
          setGameState(GameStates.ERROR);
        }
      };
  
      fetchQuestions();
    }
  }, [gameState, selectedCategory]);

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

  const renderCategorySelector = () => {
    const renderCategoryOptions = () => {
      const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));
      return sortedCategories.map(category => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ));
    };

    return (
      <select 
        className="category-select" 
        onChange={(e) => setSelectedCategory(e.target.value)} 
        value={selectedCategory}
      >
        {renderCategoryOptions()}
      </select>
    );
  };

  return (
    <div className="game-container">
      {gameState === GameStates.INTRO && (  
        <>
          <div>
            <h1>Quizzical</h1>
            <p className="subtitle">Know it all?</p>
          </div>
          <button onClick={() => setGameState(GameStates.LOADING)}>Start quiz</button>
          {renderCategorySelector()}
        </>
      )}
      {gameState === GameStates.LOADING && (
        <div className="spinner"></div>
      )}
      {gameState === GameStates.ERROR && (
        <>
          <p className="error-message">Error fetching questions: {error}. Please try again later.</p>
          <button onClick={() => setGameState(GameStates.LOADING)}>Retry</button>
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
          <h2>{score} out of {questions.length} correct</h2>
          <button onClick={() => {
            setQuestions([]);
            setGameState(GameStates.LOADING);
          }}>Play again</button>
          {renderCategorySelector()}
          {questions.map(question => (
            <Fragment key={question.id}>
              <hr />
              <Question
                question={question}
                onAnswerSelected={null}
                showAnswers={true}
              />
            </Fragment>
          ))}
        </>
      )}
    </div>
  )
}