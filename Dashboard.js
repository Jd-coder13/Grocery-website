// src/Dashboard.js
import React from 'react';
import { useAuth } from './AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Grocery<span>Hub</span> Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>
      
      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome, {currentUser.email}!</h2>
          <p>You're now ready to start managing your groceries.</p>
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon">🛒</div>
              <h3>0</h3>
              <p>Active Lists</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <h3>0</h3>
              <p>Saved Recipes</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <h3>0</h3>
              <p>Meal Plans</p>
            </div>
          </div>
        </div>
        
        <div className="quick-actions">
          <button className="action-btn primary">
            Create New List
          </button>
          <button className="action-btn secondary">
            Browse Recipes
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;