// src/RecipeFinder.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RecipeFinder.css';

const SPOONACULAR_API_KEY = "9520b4f67cb740ffa98014414f056f43";

const RecipeFinder = ({ groceryList, addItemToGroceryList }) => {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRecipe, setExpandedRecipe] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [activeTab, setActiveTab] = useState('search');
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
    
    // Fetch popular recipes on load
    fetchPopularRecipes();
  }, []);

  // Save recent searches to localStorage
  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  const fetchPopularRecipes = async () => {
    try {
      const response = await axios.get(
        `https://api.spoonacular.com/recipes/random?number=4&apiKey=${SPOONACULAR_API_KEY}`
      );
      setPopularRecipes(response.data.recipes);
    } catch (error) {
      console.error("Error fetching popular recipes:", error);
    }
  };

  const startListening = () => {
    setIsListening(true);
    setVoiceText('Listening...');
    
    // This is a simulation - in a real app, you would integrate with the Web Speech API
    setTimeout(() => {
      const simulatedTranscript = "chicken, rice, vegetables";
      setVoiceText(simulatedTranscript);
      setIngredients(simulatedTranscript);
      
      setTimeout(() => {
        setIsListening(false);
        setVoiceText('');
      }, 1500);
    }, 2000);
  };

  const addIngredient = (ingredient) => {
    const cleaned = ingredient.toLowerCase().trim();
    if (!cleaned) return;
    const parts = ingredients.split(",").map((i) => i.trim().toLowerCase());
    if (!parts.includes(cleaned)) {
      setIngredients((prev) => (prev ? prev + ", " + cleaned : cleaned));
    }
  };

  const addGroceryToIngredients = (item) => addIngredient(item.name);

  const fetchRecipes = async () => {
    if (!ingredients.trim()) return;
    
    setLoading(true);
    setRecipes([]);
    setExpandedRecipe(null);
    
    try {
      const response = await axios.get(
        `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
          ingredients
        )}&number=8&apiKey=${SPOONACULAR_API_KEY}`
      );
      
      setRecipes(response.data);
      
      // Add to recent searches
      const newSearch = {
        id: Date.now(),
        query: ingredients,
        timestamp: new Date().toISOString(),
        count: response.data.length
      };
      
      setRecentSearches(prev => [newSearch, ...prev.slice(0, 4)]);
    } catch (error) {
      alert("Error fetching recipes");
      console.error(error);
    }
    
    setLoading(false);
  };

  const getRecipeDetails = async (recipeId) => {
    try {
      const response = await axios.get(
        `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY}`
      );
      setExpandedRecipe(response.data);
    } catch (error) {
      console.error("Error fetching recipe details:", error);
    }
  };

  const clearIngredients = () => {
    setIngredients("");
  };

  const loadRecentSearch = (query) => {
    setIngredients(query);
    setActiveTab('search');
  };

  return (
    <div className="recipe-finder-container">
      {/* Recipe Finder Header */}
      <div className="recipe-header">
        <h1>Recipe Finder</h1>
        <p>Discover delicious recipes based on your ingredients</p>
      </div>

      {/* Main Content Area */}
      <div className="recipe-main">
        {/* Left Panel - Input and Grocery List */}
        <div className="input-panel">
          <div className="input-card">
            <div className="tab-controls">
              <button 
                className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
                onClick={() => setActiveTab('search')}
              >
                Search Recipes
              </button>
              <button 
                className={`tab-btn ${activeTab === 'popular' ? 'active' : ''}`}
                onClick={() => setActiveTab('popular')}
              >
                Popular Recipes
              </button>
            </div>

            {activeTab === 'search' ? (
              <>
                <div className="input-group">
                  <label>Enter ingredients (comma separated)</label>
                  <div className="input-with-clear">
                    <input
                      type="text"
                      placeholder="e.g. tomato, chicken, rice"
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                    />
                    {ingredients && (
                      <button 
                        className="clear-btn"
                        onClick={clearIngredients}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                <div className="input-controls">
                  {/* Enhanced Voice Input Button */}
                  <button
                    className={`voice-btn ${isListening ? 'listening' : ''}`}
                    onClick={startListening}
                  >
                    <div className="voice-icon">
                      {isListening ? (
                        <div className="pulse-ring"></div>
                      ) : null}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                      </svg>
                    </div>
                    <span>{isListening ? "Listening..." : "Add by Voice"}</span>
                  </button>
                  
                  {voiceText && (
                    <div className="voice-result">
                      <p>{voiceText}</p>
                    </div>
                  )}

                  <button
                    className="primary-btn"
                    onClick={fetchRecipes}
                    disabled={loading || !ingredients.trim()}
                  >
                    {loading ? "Searching..." : "Find Recipes"}
                  </button>
                </div>

              </>
            ) : (
              <div className="popular-recipes">
                <h3>Trending Recipes</h3>
                <div className="popular-grid">
                  {popularRecipes.map((recipe) => (
                    <div 
                      key={recipe.id} 
                      className="popular-card"
                      onClick={() => getRecipeDetails(recipe.id)}
                    >
                      <img src={recipe.image} alt={recipe.title} />
                      <h4>{recipe.title}</h4>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && activeTab === 'search' && (
              <div className="recent-searches">
                <h3>Recent Searches</h3>
                <div className="search-tags">
                  {recentSearches.map((search) => (
                    <div 
                      key={search.id} 
                      className="search-tag"
                      onClick={() => loadRecentSearch(search.query)}
                    >
                      {search.query}
                      <span className="result-count">{search.count} recipes</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Grocery List */}
          <div className="grocery-card">
            <h3>Your Grocery List</h3>
            <p>Click items to add to ingredients</p>
            
            {groceryList.length === 0 ? (
              <div className="empty-grocery">
                <div className="empty-icon">🛒</div>
                <p>Your grocery list is empty</p>
              </div>
            ) : (
              <ul className="grocery-items">
                {groceryList.map((item, idx) => (
                  <li
                    key={idx}
                    onClick={() => addGroceryToIngredients(item)}
                  >
                    <span className="item-name">{item.name}</span>
                    <span className="item-category">{item.category}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Panel - Recipe Results */}
        <div className="results-panel">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Finding delicious recipes for you...</p>
            </div>
          ) : recipes.length > 0 ? (
            <div className="recipe-grid">
              {recipes.map((recipe) => (
                <div 
                  key={recipe.id} 
                  className={`recipe-card ${expandedRecipe?.id === recipe.id ? 'expanded' : ''}`}
                  onClick={() => getRecipeDetails(recipe.id)}
                >
                  <div className="recipe-image">
                    <img src={recipe.image} alt={recipe.title} />
                    <div className="recipe-stats">
                      <span>🍽️ {recipe.servings || 2} servings</span>
                      <span>⏱️ {recipe.readyInMinutes || 30} min</span>
                    </div>
                  </div>
                  <div className="recipe-info">
                    <h3>{recipe.title}</h3>
                    <div className="ingredient-stats">
                      <span className="used">Used: {recipe.usedIngredientCount}</span>
                      <span className="missing">Missing: {recipe.missedIngredientCount}</span>
                    </div>
                    
                    {expandedRecipe?.id === recipe.id && (
                      <div className="recipe-details">
                        <h4>Instructions:</h4>
                        <div 
                          className="instructions" 
                          dangerouslySetInnerHTML={{ __html: expandedRecipe.instructions || "No instructions available" }} 
                        />
                        
                        <h4>Missing Ingredients:</h4>
                        <ul className="missing-ingredients">
                          {expandedRecipe.missedIngredients?.map((ing, i) => (
                            <li key={i}>{ing.original}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-results">
              <div className="empty-icon">👩‍🍳</div>
              <h3>No recipes yet</h3>
              <p>Enter ingredients above to discover delicious recipes!</p>
              <p>Try: "chicken, rice, vegetables"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeFinder;