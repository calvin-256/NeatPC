'use client';
import { useState } from 'react';
import PageTransition from '@/components/PageTransition';

export default function Home() {
  const [step, setStep] = useState(0);
  const [budget, setBudget] = useState('');
  const [useCase, setUseCase] = useState('');

  const nextStep = () => setStep((prev) => prev + 1);

  return (
    <PageTransition>
      {step === 0 && (
        <div className="hero">
          <h1>Find Your Perfect Device.</h1>
          <p>We use AI to analyze live market prices and match you with the laptop or phone that fits your exact needs, budget, and lifestyle.</p>
          <br />
          <br />
          <button className="btn" onClick={nextStep}>Start the Quiz</button>
        </div>
      )}

      {step === 1 && (
        <div className="quiz-container">
          <h2>What is your primary major or profession?</h2>
          <div className="options-grid">
            <div className="card option" onClick={() => { setUseCase('Computer Science'); nextStep(); }}>
              <h3>Computer Science</h3>
              <p>Coding, VMs, heavy multitasking</p>
            </div>
            <div className="card option" onClick={() => { setUseCase('Graphic Design'); nextStep(); }}>
              <h3>Design / Creator</h3>
              <p>Video editing, rendering, Adobe CC</p>
            </div>
            <div className="card option" onClick={() => { setUseCase('Business'); nextStep(); }}>
              <h3>Business / Comm</h3>
              <p>Office apps, web browsing, battery life</p>
            </div>
          </div>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Or type something else..." 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setUseCase(e.currentTarget.value);
                nextStep();
              }
            }}
          />
        </div>
      )}

      {step === 2 && (
        <div className="quiz-container">
          <h2>What&apos;s your maximum budget?</h2>
          <input 
            type="number" 
            className="input-field" 
            placeholder="e.g. 1500" 
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
          <button className="btn" onClick={nextStep} style={{marginTop: '2rem'}}>Next</button>
        </div>
      )}

      {step === 3 && (
        <div className="quiz-container">
          <h2>Analyzing the market...</h2>
          <p>Our AI is checking current prices to find the best {useCase} devices under ${budget}.</p>
          {/* Here is where the chatbot/results UI will go */}
          <div className="card" style={{marginTop: '2rem', width: '100%'}}>
            <h3>AI Agent Chat</h3>
            <p style={{color: '#a1a1aa', marginTop: '1rem'}}>
              &gt; I found 3 great laptops for your budget. The M3 MacBook Air is currently on sale for $1099. Should we prioritize battery life or screen size?
            </p>
            <input type="text" className="input-field" placeholder="Reply to the agent..." />
          </div>
        </div>
      )}
    </PageTransition>
  );
}

