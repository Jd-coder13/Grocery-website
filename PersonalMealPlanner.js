import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PersonalMealPlanner.css';

const PersonalMealPlanner = () => {
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    activityLevel: 'sedentary',
    goal: 'maintain',
    dietaryPreferences: [],
    allergies: []
  });

  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formValid, setFormValid] = useState(false);

  // Nutritionix API credentials - REPLACE WITH YOUR OWN
  const APP_ID = 'fb8f7ebb';
  const APP_KEY = '7a83e9d8aa9eb8293760781d75de74ea';
  const NUTRIENTS_API = 'https://trackapi.nutritionix.com/v2/natural/nutrients';
  const SEARCH_API = 'https://trackapi.nutritionix.com/v2/search/instant';

  const dietOptions = [
    'balanced', 'high-protein', 'low-carb', 'low-fat',
    'vegetarian', 'vegan', 'gluten-free', 'dairy-free'
  ];

  const allergyOptions = [
    'peanuts', 'tree nuts', 'dairy', 'eggs',
    'soy', 'wheat', 'fish', 'shellfish'
  ];

  // Validate form on input change
  useEffect(() => {
    const isValid = 
      userData.name.trim() !== '' &&
      userData.age !== '' &&
      userData.height !== '' &&
      userData.weight !== '' &&
      parseInt(userData.age) >= 12 &&
      parseInt(userData.age) <= 120 &&
      parseInt(userData.height) >= 100 &&
      parseInt(userData.height) <= 250 &&
      parseInt(userData.weight) >= 30 &&
      parseInt(userData.weight) <= 300;
    
    setFormValid(isValid);
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleCheckboxChange = (type, value) => {
    setUserData(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  };

  const calculateCalorieNeeds = () => {
    const { age, height, weight, gender, activityLevel, goal } = userData;
    
    if (!age || !height || !weight) {
      throw new Error('Please fill in all required fields');
    }

    // Convert to numbers
    const numHeight = Number(height);
    const numWeight = Number(weight);
    const numAge = Number(age);

    if (isNaN(numHeight)) throw new Error('Height must be a number');
    if (isNaN(numWeight)) throw new Error('Weight must be a number');
    if (numHeight < 100 || numHeight > 250) throw new Error('Height must be 100-250cm');
    if (numWeight < 30 || numWeight > 300) throw new Error('Weight must be 30-300kg');

    // Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * numWeight + 6.25 * numHeight - 5 * numAge + 5;
    } else {
      bmr = 10 * numWeight + 6.25 * numHeight - 5 * numAge - 161;
    }

    // Activity factors
    const activityFactors = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };

    // Goal adjustment
    const goalFactors = {
      lose: 0.8,
      maintain: 1,
      gain: 1.2
    };

    return Math.round(bmr * activityFactors[activityLevel] * goalFactors[goal]);
  };

  const generateMealPlan = async () => {
    setLoading(true);
    setError(null);
    setMealPlan(null);

    try {
      const calories = calculateCalorieNeeds();
      const diet = userData.dietaryPreferences.join(',');
      const allergies = userData.allergies.join(',');

      // Get meal suggestions - improved query
      const mealResponse = await axios.get(SEARCH_API, {
        params: {
          query: `healthy ${diet} meals ${allergies ? 'without ' + allergies : ''}`,
          branded: false,
          common: true,
          detailed: true
        },
        headers: {
          'x-app-id': APP_ID,
          'x-app-key': APP_KEY,
          'x-remote-user-id': '0'
        }
      });

      // Filter and get nutrition data for meals
      const validMeals = mealResponse.data.common.filter(meal => meal.photo && meal.photo.thumb);
      const meals = await Promise.all(
        validMeals.slice(0, 3).map(async (item) => {
          try {
            const nutritionResponse = await axios.post(NUTRIENTS_API, {
              query: `${item.food_name}`
            }, {
              headers: {
                'x-app-id': APP_ID,
                'x-app-key': APP_KEY,
                'x-remote-user-id': '0'
              }
            });

            return {
              recipe: {
                label: item.food_name,
                calories: nutritionResponse.data.foods[0]?.nf_calories || 0,
                image: item.photo?.thumb || '',
                nutrients: {
                  protein: nutritionResponse.data.foods[0]?.nf_protein || 0,
                  carbs: nutritionResponse.data.foods[0]?.nf_total_carbohydrate || 0,
                  fat: nutritionResponse.data.foods[0]?.nf_total_fat || 0
                }
              }
            };
          } catch (err) {
            console.error('Error getting nutrition data:', err);
            return {
              recipe: {
                label: item.food_name,
                calories: 0,
                image: item.photo?.thumb || '',
                nutrients: {
                  protein: 0,
                  carbs: 0,
                  fat: 0
                }
              }
            };
          }
        })
      );

      // Calculate total nutrients
      const totalNutrients = meals.reduce((acc, meal) => ({
        calories: acc.calories + (meal.recipe.calories || 0),
        protein: acc.protein + (meal.recipe.nutrients.protein || 0),
        carbs: acc.carbs + (meal.recipe.nutrients.carbs || 0),
        fat: acc.fat + (meal.recipe.nutrients.fat || 0)
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      setMealPlan({
        userInfo: {
          name: userData.name,
          dailyCalories: calories,
          bmi: (userData.weight / ((userData.height/100) ** 2)).toFixed(1)
        },
        meals,
        nutrients: totalNutrients
      });

    } catch (err) {
      let errorMessage = 'Failed to generate meal plan. Please try again.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Invalid API credentials. Check your Nutritionix ID and Key.';
      } else if (err.message.includes('Network Error')) {
        errorMessage = 'Cannot reach Nutritionix servers. Check your connection.';
      } else if (err.response?.status === 429) {
        errorMessage = 'API limit reached. Please wait before trying again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMealPlan(null);
    setError(null);
    setUserData({
      name: '',
      age: '',
      gender: 'male',
      height: '',
      weight: '',
      activityLevel: 'sedentary',
      goal: 'maintain',
      dietaryPreferences: [],
      allergies: []
    });
  };

  return (
    <div className="meal-planner-container">
      <div className="meal-planner-header">
        <h2>Personalized Meal Planner</h2>
        <p>Create your custom meal plan based on your dietary preferences, goals, and nutritional needs</p>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!mealPlan ? (
        <div className="meal-planner-form">
          <h3>Tell Us About Yourself</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Name*</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                placeholder="Your full name"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Age*</label>
              <input
                type="number"
                className="form-control"
                name="age"
                value={userData.age}
                onChange={handleInputChange}
                min="12"
                max="120"
                placeholder="Your age"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Gender</label>
              <select
                className="form-control"
                name="gender"
                value={userData.gender}
                onChange={handleInputChange}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Height (cm)*</label>
              <input
                type="number"
                className="form-control"
                name="height"
                value={userData.height}
                onChange={handleInputChange}
                min="100"
                max="250"
                placeholder="Your height"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Weight (kg)*</label>
              <input
                type="number"
                className="form-control"
                name="weight"
                value={userData.weight}
                onChange={handleInputChange}
                min="30"
                max="300"
                placeholder="Your weight"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Activity Level</label>
              <select
                className="form-control"
                name="activityLevel"
                value={userData.activityLevel}
                onChange={handleInputChange}
              >
                <option value="sedentary">Sedentary (little exercise)</option>
                <option value="lightly_active">Lightly Active</option>
                <option value="moderately_active">Moderately Active</option>
                <option value="very_active">Very Active</option>
                <option value="extremely_active">Extremely Active</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Primary Goal</label>
              <select
                className="form-control"
                name="goal"
                value={userData.goal}
                onChange={handleInputChange}
              >
                <option value="lose">Weight Loss</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Weight Gain</option>
              </select>
            </div>
          </div>

          <div className="preferences-group">
            <h3>Dietary Preferences</h3>
            <div className="checkbox-container">
              {dietOptions.map(option => (
                <div 
                  key={option} 
                  className={`checkbox-item ${userData.dietaryPreferences.includes(option) ? 'checked' : ''}`}
                  onClick={() => handleCheckboxChange('dietaryPreferences', option)}
                >
                  <input
                    type="checkbox"
                    id={`diet-${option}`}
                    checked={userData.dietaryPreferences.includes(option)}
                    onChange={() => {}}
                  />
                  <label htmlFor={`diet-${option}`}>
                    {option.split('-').map(w => 
                      w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="preferences-group">
            <h3>Allergies</h3>
            <div className="checkbox-container">
              {allergyOptions.map(option => (
                <div 
                  key={option} 
                  className={`checkbox-item ${userData.allergies.includes(option) ? 'checked' : ''}`}
                  onClick={() => handleCheckboxChange('allergies', option)}
                >
                  <input
                    type="checkbox"
                    id={`allergy-${option}`}
                    checked={userData.allergies.includes(option)}
                    onChange={() => {}}
                  />
                  <label htmlFor={`allergy-${option}`}>
                    {option.split(' ').map(w => 
                      w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <button
            className="generate-btn"
            onClick={generateMealPlan}
            disabled={loading || !formValid}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Generating Meal Plan...
              </>
            ) : 'Generate Meal Plan'}
          </button>
        </div>
      ) : (
        <div className="meal-plan-display">
          <div className="plan-header">
            <h3>Your Personal Meal Plan</h3>
            <button
              className="generate-btn"
              onClick={resetForm}
              style={{ width: 'auto', padding: '10px 20px' }}
            >
              Create New Plan
            </button>
          </div>
          
          <div className="user-summary">
            <div className="user-summary-item">
              <h4>Name</h4>
              <p>{mealPlan.userInfo.name}</p>
            </div>
            <div className="user-summary-item">
              <h4>Daily Calories</h4>
              <p>{mealPlan.userInfo.dailyCalories}</p>
            </div>
            <div className="user-summary-item">
              <h4>BMI</h4>
              <p>{mealPlan.userInfo.bmi}</p>
            </div>
          </div>
          
          <div className="nutrition-summary">
            <h4>Daily Nutrition Summary</h4>
            <div className="nutrition-grid">
              <div className="nutrition-item">
                <div className="nutrition-value">{Math.round(mealPlan.nutrients.calories)}</div>
                <div className="nutrition-label">Calories</div>
              </div>
              <div className="nutrition-item">
                <div className="nutrition-value">{Math.round(mealPlan.nutrients.protein)}g</div>
                <div className="nutrition-label">Protein</div>
              </div>
              <div className="nutrition-item">
                <div className="nutrition-value">{Math.round(mealPlan.nutrients.carbs)}g</div>
                <div className="nutrition-label">Carbs</div>
              </div>
              <div className="nutrition-item">
                <div className="nutrition-value">{Math.round(mealPlan.nutrients.fat)}g</div>
                <div className="nutrition-label">Fat</div>
              </div>
            </div>
          </div>
          
          <h3>Today's Meals</h3>
          
          <div className="meal-cards">
            {mealPlan.meals.map((meal, index) => (
              <div key={index} className="meal-card">
                {meal.recipe.image && (
                  <img 
                    src={meal.recipe.image} 
                    alt={meal.recipe.label}
                    className="meal-image"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.parentNode.removeChild(e.target);
                    }}
                  />
                )}
                <div className="meal-content">
                  <h3 className="meal-title">{meal.recipe.label}</h3>
                  <div className="meal-nutrients">
                    <div className="nutrient-item">
                      <div className="nutrient-icon">🔥</div>
                      <div>
                        <div className="nutrient-value">{Math.round(meal.recipe.calories)} cal</div>
                        <div>Energy</div>
                      </div>
                    </div>
                    <div className="nutrient-item">
                      <div className="nutrient-icon">💪</div>
                      <div>
                        <div className="nutrient-value">{Math.round(meal.recipe.nutrients.protein)}g</div>
                        <div>Protein</div>
                      </div>
                    </div>
                    <div className="nutrient-item">
                      <div className="nutrient-icon">🍞</div>
                      <div>
                        <div className="nutrient-value">{Math.round(meal.recipe.nutrients.carbs)}g</div>
                        <div>Carbs</div>
                      </div>
                    </div>
                    <div className="nutrient-item">
                      <div className="nutrient-icon">🥑</div>
                      <div>
                        <div className="nutrient-value">{Math.round(meal.recipe.nutrients.fat)}g</div>
                        <div>Fat</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalMealPlanner;