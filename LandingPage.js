import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './index.css';
import heroImage from './assets/hero-image.png';

const LandingPage = () => {
  const { currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: '🛒',
      title: 'Smart Shopping',
      description: 'Make personalized grocery lists and find recipes easily'
    },
    {
      icon: '📱',
      title: 'Mobile Friendly',
      description: 'Access your lists from any device, anywhere'
    },
    {
      icon: '🧑‍🍳',
      title: 'Meal Planning',
      description: 'Automatic meal suggestions based on your pantry'
    }
  ];

  const steps = [
    {
      title: 'How to get started',
      description: 'Simply click on the link provided or follow the instructions to begin.'
    },
    {
      title: 'Add Items',
      description: 'Use your voice to add items or by typing.'
    },
    {
      title: 'Shop Smart',
      description: 'Manage your grocery list and shop efficiently'
    }
  ];

  return (
    <div className="landing-page">
      {/* Header - Only contains the logo text */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <h1 className="logo-text">Grocery Website Reimagined</h1>
      </header>

      {/* Hero Section with Image */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Your intelligent food assistant for smarter shopping and healthier eating
            </h1>
            
            {/* Only show auth buttons if NOT logged in */}
            {!currentUser && (
              <div className="cta-buttons">
                <NavLink to="/signup" className="primary-cta">
                  Sign Up Now
                </NavLink>
                <NavLink to="/login" className="secondary-cta">
                  Log In
                </NavLink>
              </div>
            )}
          </div>
          <div className="hero-image-container">
            <img 
              src={heroImage} 
              alt="Smart grocery shopping illustration" 
              className="hero-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/600x400/e8f5e9/2e7d32?text=SmartGroceryHub';
              }}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-header">
          <h2>Why Choose SmartGroceryHub</h2>
          <p className="subtitle">Everything you need for stress-free grocery shopping</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="feature-card"
              style={{
                animation: `fadeInUp 0.5s ${index * 0.2}s forwards`,
                opacity: 0
              }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p className="subtitle">Get started in just three simple steps</p>
        </div>
        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className={`work-step ${activeStep === index ? 'active' : ''}`}>
              <div className="step-number">{index + 1}</div>
              <div className="step-content">
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="progress-indicator">
          {steps.map((_, index) => (
            <button
              key={index}
              className={`indicator-dot ${activeStep === index ? 'active' : ''}`}
              onClick={() => setActiveStep(index)}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* CTA Section - Only show if NOT logged in */}
      {!currentUser && (
        <section className="cta-section">
          <h2>Ready to Transform Your Grocery Experience?</h2>
          <p>Join thousands of happy customers today</p>
          <div className="cta-buttons">
            <NavLink to="/signup" className="primary-cta">
              Sign Up Now
            </NavLink>
            <NavLink to="/login" className="secondary-cta">
              Log In
            </NavLink>
          </div>
        </section>
      )}
    </div>
  );
};

export default LandingPage;