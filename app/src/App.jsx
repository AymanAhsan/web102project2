import { useState } from 'react'
import QAjson from './qa.json'
import './App.css'

function App() {
  const [allCards] = useState(QAjson.questions) // Keep original data intact
  const [qaData, setQaData] = useState(QAjson.questions)
  const [masteredCards, setMasteredCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [showMasteredList, setShowMasteredList] = useState(false)

  // Advance to the next card and reset flip
  function handleNext() {
    setShowAnswer(false)
    setCurrentIndex((currentIndex + 1) % qaData.length)
    // Clear feedback and correctness state when navigating
    setFeedback('')
    setIsCorrect(null)
  }

  function handleBack() {
    setShowAnswer(false)
    setCurrentIndex((currentIndex - 1 + qaData.length) % qaData.length)
    // Clear feedback and correctness state when navigating
    setFeedback('')
    setIsCorrect(null)
  }

  function handleShuffle() {
    const shuffledData = [...qaData];
    for (let i = shuffledData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledData[i], shuffledData[j]] = [shuffledData[j], shuffledData[i]];
    }
    setQaData(shuffledData); 
    setCurrentIndex(0);
    setShowAnswer(false);
    // Reset current streak when shuffling
    setStreak(0);
    // Clear feedback and correctness state when shuffling
    setFeedback('')
    setIsCorrect(null)
  }  function handleAnswerInput(event) {
    // Prevent default form submission behavior
    event.preventDefault();
    
    const currentAnswer = qaData[currentIndex].answer;
    
    // Clean up input and answer for comparison
    const cleanInput = userInput.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    const cleanAnswer = currentAnswer.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    
    // Check for partial match
    const isPartialMatch = cleanAnswer.includes(cleanInput) || cleanInput.includes(cleanAnswer);
    
    // Words match check - calculate what percentage of key words match
    const answerWords = cleanAnswer.split(" ");
    const inputWords = cleanInput.split(" ");
    
    let matchedWords = 0;
    for (const word of inputWords) {
      if (word.length > 2) { // Only check words with more than 2 characters
        if (answerWords.some(answerWord => answerWord.includes(word) || word.includes(answerWord))) {
          matchedWords++;
        }
      }
    }
    
    const wordMatchPercentage = inputWords.length > 0 ? (matchedWords / inputWords.length) * 100 : 0;
    
    // Determine if the answer is correct based on partial matches or word similarities
    const correct = isPartialMatch || wordMatchPercentage > 50;
    
    setIsCorrect(correct);
    
    if (correct) {
      // Increment correct count and current streak
      setCorrectCount(correctCount + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      // Update longest streak if current streak is longer
      if (newStreak > longestStreak) {
        setLongestStreak(newStreak);
      }
      
      setFeedback('Correct! Good job!');
      setShowAnswer(true);
    } else {
      // Reset streak on incorrect answer
      setStreak(0);
      setFeedback('Not quite right. Try again or click the card to see the answer.');
    }
    
    // Reset input after submission
    setUserInput('');
  }
  
  function handleInputChange(e) {
    setUserInput(e.target.value);
    // Clear previous feedback when user starts typing again
    if (feedback) {
      setFeedback('');
      setIsCorrect(null);
    }
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

  // Destructure the current question object only if we have cards
  // This prevents the error when qaData is empty
  const question = qaData.length > 0 ? qaData[currentIndex].question : '';
  const answer = qaData.length > 0 ? qaData[currentIndex].answer : '';

  return (
    <div className="app">
      <h3>Flashcard Quiz</h3>
      <p>How well do you know computers?</p>
      <div className="stats-container">
        <p>Cards: {qaData.length}</p>
        <p>Mastered: {masteredCards.length}</p>
        <p>Current streak: <span className="streak">{streak}</span></p>
        <p>Longest streak: <span className="longest-streak">{longestStreak}</span></p>
      </div>
        
      {!showMasteredList && qaData.length > 0 && questionCard(question, answer)}
      
      {!showMasteredList && qaData.length === 0 && (
        <div className="empty-deck">
          <h3>Great job, you're a master! 🎓</h3>
          <p>You've mastered all {masteredCards.length} cards in the deck.</p>
          <button className="reset-button" onClick={() => {
            // Reset all cards from mastered back to qaData
            setQaData([...allCards]);
            setMasteredCards([]);
          }}>
            Reset All Cards
          </button>
        </div>
      )}
      
      {showMasteredList && (
        <div className="mastered-list">
          <h4>Mastered Cards</h4>
          {masteredCards.length === 0 ? (
            <p>You haven't mastered any cards yet.</p>
          ) : (
            <ul>
              {masteredCards.map((card, index) => (
                <li key={index} className="mastered-card">
                  <p>{card.question}</p>
                  <button onClick={() => {
                    // Move this card back to qaData
                    setQaData([...qaData, card]);
                    
                    // Remove from mastered cards
                    const newMasteredCards = masteredCards.filter((_, i) => i !== index);
                    setMasteredCards(newMasteredCards);
                  }}>
                    Move Back to Deck
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="answer-form-container">
        <form onSubmit={handleAnswerInput}>
          <input 
            className='answer-input' 
            type='text' 
            placeholder='Type your answer here...'
            value={userInput}
            onChange={handleInputChange}
          />
          <button className='submit-button' type='submit'>
            Submit
          </button>
        </form>
        {feedback && (
          <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
            {feedback}
          </div>
        )}
      </div>
      <div className="button-container">
        <button className='back-button' onClick={handleBack}>
          Back
        </button>
        <button className="next-button" onClick={handleNext}>
          Next
        </button>
        <button className='shuffle-button' onClick={handleShuffle}>
          Shuffle
        </button>
        {isCorrect && !feedback.includes("mastered") && (
          <button className='mastered-button' onClick={() => {
            // Add current card to mastered list
            const currentCard = qaData[currentIndex];
            setMasteredCards([...masteredCards, currentCard]);
            
            // Remove from active cards
            const newQaData = qaData.filter((_, index) => index !== currentIndex);
            setQaData(newQaData);
            
            // Ensure we're showing question side (front) of the next card
            setShowAnswer(false);
            
            // Adjust currentIndex if needed
            if (currentIndex >= newQaData.length) {
              setCurrentIndex(0);
            }
            
            setFeedback('Card mastered! It has been removed from the deck.');
            // Reset correct state to hide the mastered button
            setIsCorrect(null);
          }}>
            Mark as Mastered
          </button>
        )}
        <button className='list-button' onClick={() => setShowMasteredList(!showMasteredList)}>
          {showMasteredList ? 'Hide Mastered' : 'Show Mastered'}
        </button>
      </div>
    </div>
  )
}

export default App
