import { useState, useEffect } from 'react'

// Survey questions configuration
const SURVEY_QUESTIONS = [
  {
    id: 1,
    text: "How satisfied are you with our service?",
    type: "rating-5",
    required: true
  },
  {
    id: 2,
    text: "How likely are you to recommend us to a friend or colleague?",
    type: "rating-10",
    required: true
  },
  {
    id: 3,
    text: "How would you rate the value for money of our product?",
    type: "rating-5",
    required: false
  },
  {
    id: 4,
    text: "How satisfied are you with the quality of our customer support?",
    type: "rating-5",
    required: false
  },
  {
    id: 5,
    text: "Do you have any suggestions for improvement?",
    type: "text",
    required: false
  }
];

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome'); // welcome, survey, thankyou
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sessionId, setSessionId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Generate unique session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Start survey
  const startSurvey = () => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setCurrentScreen('survey');
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  // Handle answer change
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Navigation functions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < SURVEY_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const skipQuestion = () => {
    const currentQuestion = SURVEY_QUESTIONS[currentQuestionIndex];
    handleAnswerChange(currentQuestion.id, null);
    goToNextQuestion();
  };

  // Submit survey
  const handleSubmit = () => {
    setShowConfirmDialog(true);
  };

  const confirmSubmit = () => {
    // Save responses (using state instead of localStorage for this environment)
    const newResponse = {
      sessionId,
      timestamp: new Date().toISOString(),
      answers,
      status: 'COMPLETED'
    };
    
    setShowConfirmDialog(false);
    setCurrentScreen('thankyou');
    
    // Auto-redirect after 5 seconds
    setTimeout(() => {
      setCurrentScreen('welcome');
    }, 5000);
  };

  const cancelSubmit = () => {
    setShowConfirmDialog(false);
  };

  // Current question
  const currentQuestion = SURVEY_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === SURVEY_QUESTIONS.length - 1;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {currentScreen === 'welcome' && (
        <WelcomeScreen onStart={startSurvey} />
      )}
      
      {currentScreen === 'survey' && (
        <SurveyScreen
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={SURVEY_QUESTIONS.length}
          answer={answers[currentQuestion.id] || ''}
          onAnswerChange={handleAnswerChange}
          onNext={goToNextQuestion}
          onPrevious={goToPreviousQuestion}
          onSkip={skipQuestion}
          onSubmit={handleSubmit}
          canGoBack={currentQuestionIndex > 0}
          isLastQuestion={isLastQuestion}
        />
      )}
      
      {currentScreen === 'thankyou' && (
        <ThankYouScreen />
      )}
      
      {showConfirmDialog && (
        <ConfirmDialog
          onConfirm={confirmSubmit}
          onCancel={cancelSubmit}
        />
      )}
    </div>
  );
}

// Welcome Screen Component
function WelcomeScreen({ onStart }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome! 👋</h1>
      <p className="text-gray-600 mb-4">We value your feedback and would love to hear about your experience with us.</p>
      <p className="text-gray-600 mb-6">This survey will take just a few minutes to complete.</p>
      <button 
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        onClick={onStart}
      >
        Start Survey
      </button>
    </div>
  );
}

// Survey Screen Component
function SurveyScreen({ 
  question, 
  questionNumber, 
  totalQuestions, 
  answer, 
  onAnswerChange, 
  onNext, 
  onPrevious, 
  onSkip, 
  onSubmit, 
  canGoBack, 
  isLastQuestion 
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
      <div className="mb-6">
        <span className="text-sm text-gray-500 mb-2 block">Question {questionNumber} of {totalQuestions}</span>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">{question.text}</h2>
        
        <QuestionInput
          question={question}
          value={answer}
          onChange={(value) => onAnswerChange(question.id, value)}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          {canGoBack && (
            <button 
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              onClick={onPrevious}
            >
              Previous
            </button>
          )}
        </div>
        
        <div>
          {!question.required && !isLastQuestion && (
            <button 
              className="text-gray-500 hover:text-gray-700 font-medium underline"
              onClick={onSkip}
            >
              Skip
            </button>
          )}
        </div>
        
        <div>
          {isLastQuestion ? (
            <button 
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
              onClick={onSubmit}
            >
              Submit Survey
            </button>
          ) : (
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              onClick={onNext}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Question Input Component
function QuestionInput({ question, value, onChange }) {
  if (question.type === 'rating-5') {
    return <RatingInput max={5} value={value} onChange={onChange} />;
  } else if (question.type === 'rating-10') {
    return <RatingInput max={10} value={value} onChange={onChange} />;
  } else if (question.type === 'text') {
    return <TextInput value={value} onChange={onChange} />;
  }
  return null;
}

// Rating Input Component
function RatingInput({ max, value, onChange }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-2 mb-4 justify-center">
        {Array.from({ length: max }, (_, i) => i + 1).map(num => (
          <button
            key={num}
            className={`w-12 h-12 rounded-full border-2 font-semibold transition-all duration-200 flex items-center justify-center ${
              value === num 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
            onClick={() => onChange(num)}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between w-full max-w-xs text-sm text-gray-500">
        <span>Poor</span>
        <span>Excellent</span>
      </div>
    </div>
  );
}

// Text Input Component
function TextInput({ value, onChange }) {
  return (
    <div className="w-full">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Please share your thoughts..."
        rows={4}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
      />
    </div>
  );
}

// Thank You Screen Component
function ThankYouScreen() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Thank You! 🎉</h1>
      <p className="text-gray-600 mb-4">Your feedback has been successfully submitted.</p>
      <p className="text-gray-600 mb-6">We appreciate you taking the time to share your thoughts with us.</p>
      <div className="text-gray-500">
        <p>Returning to start in {countdown} seconds...</p>
      </div>
    </div>
  );
}

// Confirmation Dialog Component
function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Submit Survey</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to submit your responses?</p>
        <div className="flex gap-3 justify-end">
          <button 
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            onClick={onConfirm}
          >
            Yes, Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default App