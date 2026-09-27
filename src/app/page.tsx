'use client';
import { useState } from 'react';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui';

export default function Home() {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState('laptop');
  const [budget, setBudget] = useState('');
  const [primaryUse, setPrimaryUse] = useState('');
  
  // AI Results
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);

  const nextStep = () => setStep((prev) => prev + 1);

  const submitQuiz = async () => {
    nextStep(); // Move to step 4 (Loading/Results)
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget,
          category,
          primaryUse,
          preferences: ['best value', 'highly rated'] // hardcoded for now, can be expanded
        })
      });
      const data = await res.json();
      setAnalysis(data.analysis || data.error);
      setRecommendedIds(data.recommendedProductIds || []);
    } catch (e) {
      setAnalysis("We encountered an error connecting to our AI brain. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      {step === 0 && (
        <div className="hero">
          <h1>Find Your Perfect Device.</h1>
          <p>We use AI to analyze live market prices and match you with the laptop or phone that fits your exact needs, budget, and lifestyle.</p>
          <br />
          <br />
          <Button onClick={nextStep} variant="primary" size="lg">Start the Quiz</Button>
        </div>
      )}

      {step === 1 && (
        <div className="quiz-container">
          <h2>What kind of device are you looking for?</h2>
          <div className="options-grid">
            <div className={`card option ${category === 'laptop' ? 'selected' : ''}`} onClick={() => { setCategory('laptop'); nextStep(); }}>
              <h3>Laptop</h3>
              <p>For work, school, and gaming</p>
            </div>
            <div className={`card option ${category === 'phone' ? 'selected' : ''}`} onClick={() => { setCategory('phone'); nextStep(); }}>
              <h3>Phone</h3>
              <p>Smartphones and mobile devices</p>
            </div>
            <div className={`card option ${category === 'desktop' ? 'selected' : ''}`} onClick={() => { setCategory('desktop'); nextStep(); }}>
              <h3>Desktop PC</h3>
              <p>Pre-builts and workstations</p>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="quiz-container">
          <h2>What is your primary major or profession?</h2>
          <div className="options-grid">
            <div className="card option" onClick={() => { setPrimaryUse('Computer Science'); nextStep(); }}>
              <h3>Computer Science</h3>
              <p>Coding, VMs, heavy multitasking</p>
            </div>
            <div className="card option" onClick={() => { setPrimaryUse('Graphic Design'); nextStep(); }}>
              <h3>Design / Creator</h3>
              <p>Video editing, rendering, Adobe CC</p>
            </div>
            <div className="card option" onClick={() => { setPrimaryUse('Business'); nextStep(); }}>
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
                setPrimaryUse(e.currentTarget.value);
                nextStep();
              }
            }}
          />
        </div>
      )}

      {step === 3 && (
        <div className="quiz-container">
          <h2>What&apos;s your maximum budget?</h2>
          <input 
            type="number" 
            className="input-field" 
            placeholder="e.g. 1500" 
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
          <Button onClick={submitQuiz} style={{marginTop: '2rem'}}>Find My Match</Button>
        </div>
      )}

      {step === 4 && (
        <div className="quiz-container">
          {isLoading ? (
            <>
              <h2>Analyzing the market...</h2>
              <p>Our AI is checking current prices to find the best {primaryUse} {category}s under ${budget}.</p>
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div className="skeleton" style={{ height: '20px', width: '100%' }}></div>
                 <div className="skeleton" style={{ height: '20px', width: '80%' }}></div>
                 <div className="skeleton" style={{ height: '20px', width: '90%' }}></div>
              </div>
            </>
          ) : (
            <>
              <h2>Your Results Are Ready!</h2>
              <div className="card" style={{marginTop: '2rem', width: '100%'}}>
                <h3>AI Agent Analysis</h3>
                <p style={{color: '#a1a1aa', marginTop: '1rem'}}>
                  {analysis}
                </p>
                
                {recommendedIds.length > 0 && (
                  <div style={{marginTop: '1.5rem'}}>
                    <h4>Recommended Product IDs:</h4>
                    <ul style={{ color: '#a1a1aa', marginTop: '0.5rem', listStyle: 'disc', paddingLeft: '1.5rem' }}>
                      {recommendedIds.map(id => <li key={id}>{id}</li>)}
                    </ul>
                  </div>
                )}
                
                <input type="text" className="input-field" placeholder="Reply to the agent..." style={{marginTop: '1.5rem'}} />
              </div>
              <Button onClick={() => setStep(0)} variant="outline" style={{marginTop: '1rem'}}>Start Over</Button>
            </>
          )}
        </div>
      )}
    </PageTransition>
  );
}
