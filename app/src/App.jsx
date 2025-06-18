import { useState } from 'react'
import QAjson from './qa.json'
import './App.css'

function App() {
  const [qaData] = useState(QAjson.questions)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  // Advance to the next card and reset flip
  function handleNext() {
    setShowAnswer(false)
    setCurrentIndex((currentIndex + 1) % qaData.length)
  }

  function questionCard(question, answer) {
  return (
    <div className="question-card-container">
      <div 
        className={`question-card ${showAnswer ? 'flipped' : ''}`}
        onClick={() => setShowAnswer(!showAnswer)}
      >
        <div className="card-inner">
          <div className="card-front">
            <p>{question}</p>
          </div>
          <div className="card-back">
            <p>{answer}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

  // Destructure the current question object
  const {question, answer } = qaData[currentIndex]

  return (
    <div className="app">
      <h3>Flashcard Quiz</h3>
      <p>How well do you know computers?</p>
      <p>Number of cards: {qaData.length}</p>
        {questionCard(question, answer)}
      <button className="next-button" onClick={handleNext}>
        Next
      </button>
    </div>
  )
}

export default App
