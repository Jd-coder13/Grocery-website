// CalorieTracker.js
import React, { useState, useEffect } from 'react';
import './CalorieTracker.css';

const NUTRITIONIX_APP_ID = 'fb8f7ebb';
const NUTRITIONIX_APP_KEY = '7a83e9d8aa9eb8293760781d75de74ea';

export default function CalorieTracker({ 
  groceryList, 
  nutritionData, 
  setNutritionData,
  calorieTotal,
  setCalorieTotal
}) {
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');
  const [servingSize, setServingSize] = useState('100g');
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  
  // New state for quick check feature
  const [previewItem, setPreviewItem] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchNutritionData = async (query, isPreview = false) => {
    const loadingState = isPreview ? setPreviewLoading : setLoading;
    loadingState(true);
    setError(null);
    
    try {
      const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-id': NUTRITIONIX_APP_ID,
          'x-app-key': NUTRITIONIX_APP_KEY
        },
        body: JSON.stringify({
          query: query,
          timezone: 'US/Eastern'
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.foods || data.foods.length === 0) {
        throw new Error('No nutrition data found for this item');
      }

      const foodItem = {
        ...data.foods[0],
        mealType,
        id: Date.now()
      };
      
      if (isPreview) {
        setPreviewItem(foodItem);
        setShowPreview(true);
      } else {
        setNutritionData([...(nutritionData || []), foodItem]);
        setCalorieTotal(prev => prev + Math.round(data.foods[0].nf_calories));
      }
    } catch (error) {
      console.error("Error fetching nutrition data:", error);
      setError(error.message || "Couldn't fetch nutrition data. Please try another item.");
    } finally {
      loadingState(false);
    }
  };

  const handleAddNutrition = () => {
    if (!selectedItem && !searchQuery) {
      setError('Please select or enter a food item');
      return;
    }
    
    const query = searchQuery ? `${searchQuery} ${servingSize}` : `${selectedItem} ${servingSize}`;
    fetchNutritionData(query);
    setSearchQuery('');
  };

  const handleQuickCheck = () => {
    if (!selectedItem && !searchQuery) {
      setError('Please select or enter a food item');
      return;
    }
    
    const query = searchQuery ? `${searchQuery} ${servingSize}` : `${selectedItem} ${servingSize}`;
    fetchNutritionData(query, true);
  };

  const addPreviewToTracker = () => {
    if (previewItem) {
      setNutritionData([...(nutritionData || []), previewItem]);
      setCalorieTotal(prev => prev + Math.round(previewItem.nf_calories));
      setShowPreview(false);
    }
  };

  const removeNutritionItem = (id) => {
    const removedItem = nutritionData.find(item => item.id === id);
    if (removedItem) {
      setCalorieTotal(prev => prev - Math.round(removedItem.nf_calories));
      setNutritionData(nutritionData.filter(item => item.id !== id));
    }
  };

  const clearAllItems = () => {
    if (window.confirm('Are you sure you want to clear all tracked items?')) {
      setNutritionData([]);
      setCalorieTotal(0);
    }
  };

  const getCaloriePercentage = () => {
    return Math.min(Math.round((calorieTotal / dailyGoal) * 100), 100);
  };

  const getMealData = (meal) => {
    return nutritionData.filter(item => item.mealType === meal);
  };

  const getMealCalories = (meal) => {
    return getMealData(meal).reduce((sum, item) => sum + Math.round(item.nf_calories), 0);
  };

  const getMacroPercentages = () => {
    const totalCarbs = nutritionData.reduce((sum, item) => sum + (item.nf_total_carbohydrate || 0), 0);
    const totalProtein = nutritionData.reduce((sum, item) => sum + (item.nf_protein || 0), 0);
    const totalFat = nutritionData.reduce((sum, item) => sum + (item.nf_total_fat || 0), 0);
    const total = totalCarbs + totalProtein + totalFat;
    
    return {
      carbs: Math.round((totalCarbs / total) * 100) || 0,
      protein: Math.round((totalProtein / total) * 100) || 0,
      fat: Math.round((totalFat / total) * 100) || 0
    };
  };

  const getPopularSuggestions = () => {
    return [
      'Apple', 'Banana', 'Chicken Breast', 'Brown Rice', 
      'Salmon', 'Eggs', 'Whole Wheat Bread', 'Greek Yogurt',
      'Oatmeal', 'Broccoli', 'Almonds', 'Avocado'
    ];
  };

  const addSuggestedItem = (item) => {
    setSearchQuery(item);
  };

  return (
    <div className="calorie-tracker-container">
      {/* Quick Check Modal */}
      {showPreview && previewItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Nutrition Preview</h3>
              <button className="close-modal" onClick={() => setShowPreview(false)}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="food-preview">
                <div className="food-preview-info">
                  <h4 className="food-preview-name">{previewItem.food_name}</h4>
                  <div className="food-preview-details">
                    <span>Serving: {previewItem.serving_qty} {previewItem.serving_unit}</span>
                    <span>Weight: {previewItem.serving_weight_grams}g</span>
                  </div>
                </div>
              </div>
              
              <div className="modal-nutrition">
                <div className="modal-nutrient">
                  <div className="modal-value">{Math.round(previewItem.nf_calories)}</div>
                  <div className="modal-label">Calories</div>
                </div>
                <div className="modal-nutrient">
                  <div className="modal-value">{Math.round(previewItem.nf_total_carbohydrate || 0)}g</div>
                  <div className="modal-label">Carbs</div>
                </div>
                <div className="modal-nutrient">
                  <div className="modal-value">{Math.round(previewItem.nf_protein || 0)}g</div>
                  <div className="modal-label">Protein</div>
                </div>
                <div className="modal-nutrient">
                  <div className="modal-value">{Math.round(previewItem.nf_total_fat || 0)}g</div>
                  <div className="modal-label">Fat</div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="action-btn clear-btn"
                  onClick={() => setShowPreview(false)}
                >
                  Close Preview
                </button>
                <button 
                  className="action-btn add-food-btn"
                  onClick={addPreviewToTracker}
                >
                  Add to Tracker
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="calorie-header">
        <h2>
          <i className="fas fa-fire"></i> Calorie Tracker
        </h2>
        
        <div className="goal-control">
          <div className="goal-display" onClick={() => setShowGoalInput(!showGoalInput)}>
            <span>Daily Goal: {dailyGoal} cal</span>
            <i className={`fas fa-chevron-${showGoalInput ? 'up' : 'down'}`}></i>
          </div>
          
          {showGoalInput && (
            <div className="goal-input-container">
              <input
                type="number"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                min="500"
                max="5000"
                className="goal-input"
              />
              <button 
                className="save-goal-btn"
                onClick={() => setShowGoalInput(false)}
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="calorie-summary">
        <div className="calorie-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${getCaloriePercentage()}%` }}
            ></div>
          </div>
          <div className="progress-text">
            <span>{calorieTotal} / {dailyGoal} cal</span>
            <span>{getCaloriePercentage()}% of daily goal</span>
          </div>
        </div>
        
        <div className="macro-summary">
          <div className="macro-card carbs">
            <h4>Carbs</h4>
            <div className="macro-value">{getMacroPercentages().carbs}%</div>
          </div>
          <div className="macro-card protein">
            <h4>Protein</h4>
            <div className="macro-value">{getMacroPercentages().protein}%</div>
          </div>
          <div className="macro-card fat">
            <h4>Fat</h4>
            <div className="macro-value">{getMacroPercentages().fat}%</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <div className="food-input-section">
        <div className="meal-selector">
          <div className="meal-tabs">
            {['breakfast', 'lunch', 'dinner', 'snack'].map(meal => (
              <button
                key={meal}
                className={`meal-tab ${mealType === meal ? 'active' : ''}`}
                onClick={() => setMealType(meal)}
              >
                {meal.charAt(0).toUpperCase() + meal.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="input-group">
          <div className="search-container">
            <i className="fas fa-search"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setError(null);
              }}
              placeholder="Search for food items..."
              className="food-search"
            />
          </div>
          
          <select
            value={servingSize}
            onChange={(e) => setServingSize(e.target.value)}
            className="serving-select"
          >
            <option value="100g">100g</option>
            <option value="1 serving">1 serving</option>
            <option value="1 cup">1 cup</option>
            <option value="1 piece">1 piece</option>
          </select>
          
          <button
            onClick={handleQuickCheck}
            disabled={loading || previewLoading}
            className="quick-check-btn action-btn"
          >
            <i className="fas fa-binoculars"></i> Quick Check
          </button>
          
          <button
            onClick={handleAddNutrition}
            disabled={loading || previewLoading}
            className="add-food-btn action-btn"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Adding...
              </>
            ) : (
              <>
                <i className="fas fa-plus"></i> Add Food
              </>
            )}
          </button>
        </div>
        
        <div className="grocery-select">
          <select
            value={selectedItem}
            onChange={(e) => {
              setSelectedItem(e.target.value);
              setError(null);
            }}
            className="grocery-dropdown"
          >
            <option value="">Or select from grocery list</option>
            {groceryList.map((item, index) => (
              <option key={index} value={item.name}>{item.name}</option>
            ))}
          </select>
        </div>
        
        <div className="action-buttons">
          <button
            onClick={clearAllItems}
            disabled={nutritionData.length === 0}
            className="clear-btn action-btn"
          >
            <i className="fas fa-trash-alt"></i> Clear All Items
          </button>
        </div>
      </div>
      
      <div className="smart-suggestions">
        <h4>Popular Food Suggestions:</h4>
        <div className="suggestion-grid">
          {getPopularSuggestions().map((item, index) => (
            <div 
              key={index} 
              className="suggestion-item"
              onClick={() => addSuggestedItem(item)}
            >
              {item}
              <i className="fas fa-arrow-right"></i>
            </div>
          ))}
        </div>
      </div>
      
      <div className="meal-sections">
        {['breakfast', 'lunch', 'dinner', 'snack'].map(meal => {
          const mealItems = getMealData(meal);
          const mealCalories = getMealCalories(meal);
          
          return mealItems.length > 0 && (
            <div key={meal} className="meal-section">
              <div className="meal-header">
                <h3>
                  {meal.charAt(0).toUpperCase() + meal.slice(1)} 
                  <span className="meal-calories">{mealCalories} cal</span>
                </h3>
              </div>
              
              <div className="food-grid">
                {mealItems.map((food) => (
                  <div 
                    key={food.id}
                    className="food-card"
                  >
                    <div className="food-info">
                      <h4>{food.food_name}</h4>
                      <div className="food-macros">
                        <span>C: {Math.round(food.nf_total_carbohydrate || 0)}g</span>
                        <span>P: {Math.round(food.nf_protein || 0)}g</span>
                        <span>F: {Math.round(food.nf_total_fat || 0)}g</span>
                      </div>
                    </div>
                    
                    <div className="food-calories">
                      {Math.round(food.nf_calories)} cal
                      <button
                        onClick={() => removeNutritionItem(food.id)}
                        className="remove-food-btn"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {nutritionData && nutritionData.length === 0 && (
        <div className="empty-state">
          <i className="fas fa-utensils"></i>
          <h3>No food items tracked yet</h3>
          <p>Start by adding foods using the form above</p>
        </div>
      )}
    </div>
  );
}