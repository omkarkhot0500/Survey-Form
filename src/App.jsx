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
    // Save responses in memory
    const newResponse = {
      sessionId,
      timestamp: new Date().toISOString(),
      answers,
      status: 'COMPLETED'
    };
    
    console.log('Survey submitted:', newResponse);
    
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
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
    <div style={{
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      textAlign: 'center',
      maxWidth: '500px',
      width: '100%'
    }}>
      <h1 style={{ marginBottom: '20px', color: '#333' }}>Welcome! 👋</h1>
      <p style={{ marginBottom: '15px', color: '#666' }}>We value your feedback and would love to hear about your experience with us.</p>
      <p style={{ marginBottom: '30px', color: '#666' }}>This survey will take just a few minutes to complete.</p>
      <button 
        onClick={onStart}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '5px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
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
    <div style={{
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      maxWidth: '600px',
      width: '100%'
    }}>
      <div style={{ marginBottom: '30px' }}>
        <span style={{ color: '#666', fontSize: '14px' }}>Question {questionNumber} of {totalQuestions}</span>
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#e0e0e0',
          borderRadius: '2px',
          marginTop: '8px'
        }}>
          <div 
            style={{
              width: `${(questionNumber / totalQuestions) * 100}%`,
              height: '100%',
              backgroundColor: '#007bff',
              borderRadius: '2px',
              transition: 'width 0.3s ease'
            }}
          ></div>
        </div>
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>{question.text}</h2>
        
        <QuestionInput
          question={question}
          value={answer}
          onChange={(value) => onAnswerChange(question.id, value)}
        />
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          {canGoBack && (
            <button 
              onClick={onPrevious}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Previous
            </button>
          )}
        </div>
        
        <div>
          {!question.required && !isLastQuestion && (
            <button 
              onClick={onSkip}
              style={{
                backgroundColor: 'transparent',
                color: '#666',
                border: '1px solid #ccc',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Skip
            </button>
          )}
        </div>
        
        <div>
          {isLastQuestion ? (
            <button 
              onClick={onSubmit}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Submit Survey
            </button>
          ) : (
            <button 
              onClick={onNext}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
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
    <div style={{ textAlign: 'center' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '15px',
        flexWrap: 'wrap'
      }}>
        {Array.from({ length: max }, (_, i) => i + 1).map(num => (
          <button
            key={num}
            onClick={() => onChange(num)}
            style={{
              width: '40px',
              height: '40px',
              border: value === num ? '2px solid #007bff' : '2px solid #ddd',
              backgroundColor: value === num ? '#007bff' : 'white',
              color: value === num ? 'white' : '#333',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {num}
          </button>
        ))}
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14px',
        color: '#666'
      }}>
        <span>Poor</span>
        <span>Excellent</span>
      </div>
    </div>
  );
}

// Text Input Component
function TextInput({ value, onChange }) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Please share your thoughts..."
        rows={4}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #ddd',
          borderRadius: '5px',
          fontSize: '14px',
          resize: 'vertical'
        }}
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
    <div style={{
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      textAlign: 'center',
      maxWidth: '500px',
      width: '100%'
    }}>
      <h1 style={{ marginBottom: '20px', color: '#333' }}>Thank You! 🎉</h1>
      <p style={{ marginBottom: '15px', color: '#666' }}>Your feedback has been successfully submitted.</p>
      <p style={{ marginBottom: '30px', color: '#666' }}>We appreciate you taking the time to share your thoughts with us.</p>
      <div>
        <p style={{ color: '#999' }}>Returning to start in {countdown} seconds...</p>
      </div>
    </div>
  );
}

// Confirmation Dialog Component
function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#333' }}>Submit Survey</h3>
        <p style={{ marginBottom: '30px', color: '#666' }}>Are you sure you want to submit your responses?</p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button 
            onClick={onCancel}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Yes, Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default App