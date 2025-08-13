import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate
} from "react-router-dom";
import VoiceInput from "./VoiceInput";
import BarcodeScanner from "./BarcodeScanner";
import GroceryList from "./GroceryList";
import CalorieTracker from "./CalorieTracker";
import PersonalMealPlanner from "./PersonalMealPlanner";
import LandingPage from "./LandingPage";
import RecipeFinder from "./RecipeFinder";
import Login from "./Login";
import Signup from "./Signup";
import axios from "axios";
import { auth } from "./firebase";
import { useAuth } from "./AuthContext";

const SPOONACULAR_API_KEY = "9520b4f67cb740ffa98014414f056f43";

// Theme configuration
const theme = {
  colors: {
    primary: "#2E7D32",
    primaryLight: "#4CAF50",
    primaryDark: "#1B5E20",
    secondary: "#007acc",
    background: "#f9f9f9",
    cardBg: "#ffffff",
    text: "#333333",
    textLight: "#666666",
    border: "#e0e0e0",
  },
  shadows: {
    small: "0 2px 8px rgba(0,0,0,0.1)",
    medium: "0 4px 12px rgba(0,0,0,0.15)",
    large: "0 8px 24px rgba(0,0,0,0.2)",
  },
  borderRadius: {
    small: "8px",
    medium: "12px",
    large: "16px",
  },
  transitions: {
    fast: "all 0.2s ease",
    medium: "all 0.3s ease",
    slow: "all 0.5s ease",
  },
};

// Navigation component
const Navigation = () => {
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header style={{
      background: "white",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <NavLink 
          to="/" 
          style={{
            fontSize: "1.8rem",
            fontWeight: "700",
            color: "#1B5E20",
            textDecoration: "none",
          }}
        >
          Smart<span style={{ color: "#2E7D32" }}>Grocery</span>Hub
        </NavLink>
        
        {/* Show navigation links only when authenticated */}
        {currentUser ? (
          <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            <NavLink
              to="/"
              end
              style={({ isActive }) => ({
                textDecoration: "none",
                color: isActive ? "#2E7D32" : "#333333",
                fontWeight: isActive ? "600" : "500",
                position: "relative",
                transition: "all 0.3s ease",
                ...(isActive && {
                  "::after": {
                    content: '""',
                    position: "absolute",
                    bottom: "-8px",
                    left: 0,
                    width: "100%",
                    height: "3px",
                    backgroundColor: "#2E7D32",
                  }
                })
              })}
            >
              Home
            </NavLink>
            <NavLink
              to="/recipe-finder"
              style={({ isActive }) => ({
                textDecoration: "none",
                color: isActive ? "#2E7D32" : "#333333",
                fontWeight: isActive ? "600" : "500",
                position: "relative",
                transition: "all 0.3s ease",
                ...(isActive && {
                  "::after": {
                    content: '""',
                    position: "absolute",
                    bottom: "-8px",
                    left: 0,
                    width: "100%",
                    height: "3px",
                    backgroundColor: "#2E7D32",
                  }
                })
              })}
            >
              Recipe Finder
            </NavLink>
            <NavLink
              to="/grocery-list"
              style={({ isActive }) => ({
                textDecoration: "none",
                color: isActive ? "#2E7D32" : "#333333",
                fontWeight: isActive ? "600" : "500",
                position: "relative",
                transition: "all 0.3s ease",
                ...(isActive && {
                  "::after": {
                    content: '""',
                    position: "absolute",
                    bottom: "-8px",
                    left: 0,
                    width: "100%",
                    height: "3px",
                    backgroundColor: "#2E7D32",
                  }
                })
              })}
            >
              Grocery List
            </NavLink>
            <NavLink
              to="/calorie-tracker"
              style={({ isActive }) => ({
                textDecoration: "none",
                color: isActive ? "#2E7D32" : "#333333",
                fontWeight: isActive ? "600" : "500",
                position: "relative",
                transition: "all 0.3s ease",
                ...(isActive && {
                  "::after": {
                    content: '""',
                    position: "absolute",
                    bottom: "-8px",
                    left: 0,
                    width: "100%",
                    height: "3px",
                    backgroundColor: "#2E7D32",
                  }
                })
              })}
            >
              Calorie Tracker
            </NavLink>
            <NavLink
              to="/personal-meal-planner"
              style={({ isActive }) => ({
                textDecoration: "none",
                color: isActive ? "#2E7D32" : "#333333",
                fontWeight: isActive ? "600" : "500",
                position: "relative",
                transition: "all 0.3s ease",
                ...(isActive && {
                  "::after": {
                    content: '""',
                    position: "absolute",
                    bottom: "-8px",
                    left: 0,
                    width: "100%",
                    height: "3px",
                    backgroundColor: "#2E7D32",
                  }
                })
              })}
            >
              Meal Planner
            </NavLink>
            <button 
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "#333",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "1rem"
              }}
            >
              Logout
            </button>
          </nav>
        ) : (
          // Show nothing when not authenticated
          <div></div>
        )}
      </div>
    </header>
  );
};

// Footer component
const Footer = () => (
  <footer
    style={{
      marginTop: "60px",
      padding: "3rem 2rem",
      background: "#1B5E20",
      color: "white",
    }}
  >
    <div style={{
      maxWidth: "1200px",
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "2rem",
    }}>
      <div>
        <div style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem" }}>
          SmartGroceryHub
        </div>
        <p>Your intelligent food assistant for smarter shopping and healthier eating.</p>
      </div>
      <div>
        <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Features</h3>
        <ul style={{ listStyle: "none" }}>
          <li style={{ marginBottom: "0.5rem" }}><NavLink to="/recipe-finder" style={{ color: "white", textDecoration: "none" }}>Recipe Finder</NavLink></li>
          <li style={{ marginBottom: "0.5rem" }}><NavLink to="/grocery-list" style={{ color: "white", textDecoration: "none" }}>Grocery Lists</NavLink></li>
          <li style={{ marginBottom: "0.5rem" }}><NavLink to="/calorie-tracker" style={{ color: "white", textDecoration: "none" }}>Calorie Tracker</NavLink></li>
          <li style={{ marginBottom: "0.5rem" }}><NavLink to="/personal-meal-planner" style={{ color: "white", textDecoration: "none" }}>Meal Planner</NavLink></li>
        </ul>
      </div>
      <div>
        <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Company</h3>
        <ul style={{ listStyle: "none" }}>
          <li style={{ marginBottom: "0.5rem" }}>
            <button 
              onClick={() => alert('About Us page would go here')} 
              style={{ 
                background: "none", 
                border: "none", 
                color: "white", 
                cursor: "pointer", 
                padding: 0,
                textAlign: "left"
              }}
            >
              About Us
            </button>
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <button 
              onClick={() => alert('Blog page would go here')} 
              style={{ 
                background: "none", 
                border: "none", 
                color: "white", 
                cursor: "pointer", 
                padding: 0,
                textAlign: "left"
              }}
            >
              Blog
            </button>
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <button 
              onClick={() => alert('Contact page would go here')} 
              style={{ 
                background: "none", 
                border: "none", 
                color: "white", 
                cursor: "pointer", 
                padding: 0,
                textAlign: "left"
              }}
            >
              Contact
            </button>
          </li>
        </ul>
      </div>
    </div>
    <div style={{ 
      textAlign: "center", 
      marginTop: "3rem", 
      paddingTop: "2rem", 
      borderTop: "1px solid rgba(255, 255, 255, 0.1)" 
    }}>
      <p>© {new Date().getFullYear()} Smart Grocery Hub. All rights reserved.</p>
    </div>
  </footer>
);

// Main App component
function App() {
  const { currentUser, loading } = useAuth();
  const [groceryList, setGroceryList] = useState(() => {
    const saved = localStorage.getItem("groceryList");
    return saved ? JSON.parse(saved) : [];
  });

  const [nutritionData, setNutritionData] = useState(() => {
    const saved = localStorage.getItem("nutritionData");
    return saved ? JSON.parse(saved) : [];
  });

  const [calorieTotal, setCalorieTotal] = useState(() => {
    const saved = localStorage.getItem("calorieTotal");
    return saved ? parseInt(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem("groceryList", JSON.stringify(groceryList));
    localStorage.setItem("nutritionData", JSON.stringify(nutritionData));
    localStorage.setItem("calorieTotal", calorieTotal.toString());
  }, [groceryList, nutritionData, calorieTotal]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f9f9f9'
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f9f9f9",
          color: "#333333",
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
        }}
      >
        {currentUser ? (
          <>
            <Navigation />
            <main>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route
                  path="/recipe-finder"
                  element={
                    <RecipeFinder
                      groceryList={groceryList}
                      addItemToGroceryList={setGroceryList}
                    />
                  }
                />
                <Route
                  path="/grocery-list"
                  element={
                    <GroceryList
                      groceryList={groceryList}
                      setGroceryList={setGroceryList}
                    />
                  }
                />
                <Route
                  path="/calorie-tracker"
                  element={
                    <CalorieTracker
                      groceryList={groceryList}
                      nutritionData={nutritionData}
                      setNutritionData={setNutritionData}
                      calorieTotal={calorieTotal}
                      setCalorieTotal={setCalorieTotal}
                    />
                  }
                />
                <Route
                  path="/personal-meal-planner"
                  element={<PersonalMealPlanner />}
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
          </>
        ) : (
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;