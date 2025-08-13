// GroceryList.js
import React, { useState, useRef, useEffect } from "react";
import './GroceryList.css';

const DEFAULT_CATEGORIES = ['Produce', 'Dairy', 'Meat', 'Pantry', 'Other'];

const CATEGORY_KEYWORDS = {
  milk: 'Dairy',
  cheese: 'Dairy',
  yogurt: 'Dairy',
  butter: 'Dairy',
  egg: 'Dairy',
  eggs: 'Dairy',
  apple: 'Produce',
  banana: 'Produce',
  orange: 'Produce',
  spinach: 'Produce',
  lettuce: 'Produce',
  tomato: 'Produce',
  carrot: 'Produce',
  chicken: 'Meat',
  beef: 'Meat',
  pork: 'Meat',
  fish: 'Meat',
  steak: 'Meat',
  bacon: 'Meat',
  rice: 'Pantry',
  pasta: 'Pantry',
  flour: 'Pantry',
  sugar: 'Pantry',
  cereal: 'Pantry',
  bread: 'Pantry'
};

export default function GroceryList({ groceryList, setGroceryList }) {
  const [newItem, setNewItem] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [category, setCategory] = useState('Produce');
  const [customCategories, setCustomCategories] = useState(DEFAULT_CATEGORIES);
  const [newCategory, setNewCategory] = useState("");
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [showTutorial, setShowTutorial] = useState(true);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);
  const [suggestedItems, setSuggestedItems] = useState([]);
  
  const newItemRef = useRef(null);
  const categoryColors = {
    Produce: '#8BC34A',
    Dairy: '#FFECB3',
    Meat: '#FFCDD2',
    Pantry: '#D7CCC8',
    Other: '#E1BEE7',
    Auto: '#B3E5FC'
  };

  // Focus on input when component mounts
  useEffect(() => {
    if (newItemRef.current) {
      newItemRef.current.focus();
    }
  }, []);

  // Detect category based on keywords
  const detectCategory = (itemName) => {
    const lowerCaseItem = itemName.toLowerCase();
    
    if (CATEGORY_KEYWORDS[lowerCaseItem]) {
      return CATEGORY_KEYWORDS[lowerCaseItem];
    }
    
    for (const [keyword, cat] of Object.entries(CATEGORY_KEYWORDS)) {
      if (lowerCaseItem.includes(keyword)) {
        return cat;
      }
    }
    
    return 'Other';
  };

  // Add new category
  const addNewCategory = () => {
    if (newCategory.trim() && !customCategories.includes(newCategory)) {
      setCustomCategories([...customCategories, newCategory]);
      setCategory(newCategory);
      setNewCategory("");
      setShowCategoryInput(false);
    }
  };

  // Delete a category
  const deleteCategory = (catToDelete) => {
    if (DEFAULT_CATEGORIES.includes(catToDelete)) {
      alert("Default categories cannot be deleted");
      return;
    }

    const updatedList = groceryList.map(item => 
      item.category === catToDelete ? { ...item, category: 'Other' } : item
    );

    setGroceryList(updatedList);
    setCustomCategories(customCategories.filter(cat => cat !== catToDelete));
    if (category === catToDelete) setCategory('Other');
  };

  // Add item to grocery list
  const addItemToGroceryList = () => {
    if (!newItem.trim()) return;
    
    const detectedCategory = detectCategory(newItem);
    const finalCategory = category === 'Auto' ? detectedCategory : category;
    
    const itemWithDetails = {
      id: Date.now(),
      name: newItem.trim(),
      category: finalCategory,
      quantity: quantity.trim(),
      purchased: false
    };

    const exists = groceryList.some(
      item => item.name.toLowerCase() === newItem.trim().toLowerCase()
    );
    
    if (!exists) {
      setGroceryList((prev) => [...prev, itemWithDetails]);
    }
    
    setNewItem("");
    setQuantity("1");
  };

  // Remove item from grocery list
  const removeItemFromGroceryList = (itemToRemove) => {
    setGroceryList((prev) => 
      prev.filter((item) => item.id !== itemToRemove.id)
    );
  };

  // Toggle purchased status
  const togglePurchased = (item) => {
    setGroceryList(prev =>
      prev.map(i =>
        i.id === item.id ? { ...i, purchased: !i.purchased } : i
      )
    );
  };

  // Start editing an item
  const startEditing = (item) => {
    setEditingItem({ ...item });
  };

  // Save edited item
  const saveEditing = () => {
    if (editingItem && editingItem.name.trim()) {
      setGroceryList(prev =>
        prev.map(item => 
          item.id === editingItem.id ? { ...editingItem } : item
        )
      );
      setEditingItem(null);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingItem(null);
  };

  // Clear all purchased items
  const clearPurchased = () => {
    setGroceryList(prev => prev.filter(item => !item.purchased));
  };

  // Handle drag start
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.setData("text/plain", item.id.toString());
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drop on category
  const handleDropOnCategory = (e, targetCategory) => {
    e.preventDefault();
    if (draggedItem) {
      setGroceryList(prev => 
        prev.map(item => 
          item.id === draggedItem.id ? { ...item, category: targetCategory } : item
        )
      );
    }
  };

  // Toggle category collapse
  const toggleCategoryCollapse = (cat) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  // Get popular suggestions
  const getPopularSuggestions = () => {
    const popularItems = [
      'Milk', 'Eggs', 'Bread', 'Bananas', 'Apples', 
      'Chicken', 'Rice', 'Pasta', 'Tomatoes', 'Cheese'
    ];
    
    return popularItems.filter(item => 
      !groceryList.some(gItem => gItem.name.toLowerCase() === item.toLowerCase())
    );
  };

  // Add suggested item
  const addSuggestedItem = (item) => {
    const detectedCategory = detectCategory(item);
    
    const itemWithDetails = {
      id: Date.now(),
      name: item,
      category: detectedCategory,
      quantity: "1",
      purchased: false
    };

    setGroceryList((prev) => [...prev, itemWithDetails]);
  };

  // Filter items based on search query
  const filteredItems = groceryList.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grocery-list-container">
      <div className="grocery-header">
        <h2>
          <i className="fas fa-shopping-cart"></i> Grocery List
          <span className="item-count">{groceryList.length} items</span>
        </h2>
        
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {showTutorial && (
        <div className="tutorial-card">
          <div className="tutorial-content">
            <h3>Welcome to SmartGroceryHub!</h3>
            <p>Quick tips to get started:</p>
            <ul>
              <li><i className="fas fa-lightbulb"></i> Add items with the form below</li>
              <li><i className="fas fa-lightbulb"></i> Drag items between categories</li>
              <li><i className="fas fa-lightbulb"></i> Click items to edit them</li>
              <li><i className="fas fa-lightbulb"></i> Collapse categories with the arrow</li>
            </ul>
          </div>
          <button 
            className="close-tutorial"
            onClick={() => setShowTutorial(false)}
          >
            Got it!
          </button>
        </div>
      )}
      
      <div className="smart-features">
        <button 
          className="smart-suggestion-btn"
          onClick={() => setShowSmartSuggestions(!showSmartSuggestions)}
        >
          <i className="fas fa-magic"></i> 
          {showSmartSuggestions ? 'Hide Suggestions' : 'Show Smart Suggestions'}
        </button>
        
        <button 
          className="clear-purchased-btn"
          onClick={clearPurchased}
          disabled={!groceryList.some(item => item.purchased)}
        >
          <i className="fas fa-trash-alt"></i> Clear Purchased Items
        </button>
      </div>
      
      {showSmartSuggestions && (
        <div className="smart-suggestions">
          <h4>Popular Items You Might Need:</h4>
          <div className="suggestion-grid">
            {getPopularSuggestions().map((item, index) => (
              <div 
                key={index} 
                className="suggestion-item"
                onClick={() => addSuggestedItem(item)}
              >
                {item}
                <i className="fas fa-plus"></i>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Category Management */}
      <div className="category-management">
        <div className="category-tabs">
          {[...customCategories, 'Auto'].map((cat) => (
            <div key={cat} className="category-tab-container">
              <button
                onClick={() => setCategory(cat)}
                className={`category-tab ${category === cat ? 'active' : ''}`}
                style={{ backgroundColor: categoryColors[cat] || '#e0e0e0' }}
              >
                {cat}
                {!DEFAULT_CATEGORIES.includes(cat) && cat !== 'Auto' && (
                  <span
                    className="delete-category"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCategory(cat);
                    }}
                  >
                    ×
                  </span>
                )}
              </button>
            </div>
          ))}
          
          <button
            className="new-category-btn"
            onClick={() => setShowCategoryInput(!showCategoryInput)}
          >
            {showCategoryInput ? <i className="fas fa-times"></i> : <i className="fas fa-plus"></i>}
            {showCategoryInput ? ' Cancel' : ' New Category'}
          </button>
        </div>
        
        {showCategoryInput && (
          <div className="new-category-form">
            <input
              type="text"
              placeholder="New category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="category-input"
            />
            <button
              onClick={addNewCategory}
              className="add-category-btn"
            >
              <i className="fas fa-check"></i> Add
            </button>
          </div>
        )}
      </div>

      {/* Add Item Form */}
      <div className="add-item-form">
        <div className="item-input-container">
          <input
            ref={newItemRef}
            type="text"
            placeholder={`Add ${category === 'Auto' ? 'item (auto-categorize)' : category + ' item'}`}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="item-input"
            onKeyPress={(e) => e.key === 'Enter' && addItemToGroceryList()}
          />
          
          <input
            type="text"
            placeholder="Qty"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="quantity-input"
          />
        </div>
        
        <button
          onClick={addItemToGroceryList}
          className="add-item-btn"
        >
          <i className="fas fa-plus"></i> Add Item
        </button>
      </div>

      {/* Grocery List by Categories */}
      <div className="grocery-categories">
        {customCategories.map(cat => {
          const categoryItems = filteredItems.filter(item => item.category === cat);
          
          return categoryItems.length > 0 && (
            <div 
              key={cat} 
              className="category-card"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropOnCategory(e, cat)}
            >
              <div 
                className="category-header"
                onClick={() => toggleCategoryCollapse(cat)}
              >
                <div className="category-title">
                  <i className={`fas fa-chevron-${collapsedCategories[cat] ? 'right' : 'down'}`}></i>
                  <h3>{cat}</h3>
                  <span className="item-count-badge">{categoryItems.length}</span>
                </div>
                <div className="category-actions">
                  <span className="drag-hint">
                    <i className="fas fa-arrows-alt"></i> Drop items here
                  </span>
                </div>
              </div>
              
              {!collapsedCategories[cat] && (
                <ul className="grocery-items">
                  {categoryItems.map((item) => (
                    <li 
                      key={item.id}
                      className={`grocery-item ${item.purchased ? 'purchased' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                    >
                      <div className="item-content">
                        <div className="item-checkbox">
                          <input
                            type="checkbox"
                            checked={item.purchased}
                            onChange={() => togglePurchased(item)}
                            id={`item-${item.id}`}
                          />
                          <label htmlFor={`item-${item.id}`}></label>
                        </div>
                        
                        {editingItem && editingItem.id === item.id ? (
                          <div className="edit-form">
                            <input
                              type="text"
                              value={editingItem.name}
                              onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                              className="edit-input"
                            />
                            <input
                              type="text"
                              value={editingItem.quantity}
                              onChange={(e) => setEditingItem({...editingItem, quantity: e.target.value})}
                              className="edit-quantity"
                            />
                            <div className="edit-actions">
                              <button 
                                className="save-edit"
                                onClick={saveEditing}
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button 
                                className="cancel-edit"
                                onClick={cancelEditing}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="item-details"
                            onClick={() => startEditing(item)}
                          >
                            <span className="item-name">
                              {item.name}
                              {item.purchased && <span className="purchased-badge">Purchased</span>}
                            </span>
                            <span className="item-quantity">({item.quantity})</span>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => removeItemFromGroceryList(item)}
                        className="remove-item-btn"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Uncategorized items */}
      {filteredItems.filter(item => !customCategories.includes(item.category)).length > 0 && (
        <div className="category-card uncategorized">
          <div className="category-header">
            <div className="category-title">
              <h3>Other</h3>
              <span className="item-count-badge">
                {filteredItems.filter(item => !customCategories.includes(item.category)).length}
              </span>
            </div>
          </div>
          <ul className="grocery-items">
            {filteredItems
              .filter(item => !customCategories.includes(item.category))
              .map((item) => (
                <li 
                  key={item.id}
                  className={`grocery-item ${item.purchased ? 'purchased' : ''}`}
                >
                  <div className="item-content">
                    <div className="item-checkbox">
                      <input
                        type="checkbox"
                        checked={item.purchased}
                        onChange={() => togglePurchased(item)}
                        id={`item-${item.id}`}
                      />
                      <label htmlFor={`item-${item.id}`}></label>
                    </div>
                    <div className="item-details">
                      <span className="item-name">
                        {item.name}
                        {item.purchased && <span className="purchased-badge">Purchased</span>}
                      </span>
                      <span className="item-quantity">({item.quantity})</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItemFromGroceryList(item)}
                    className="remove-item-btn"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
      
      {groceryList.length === 0 && (
        <div className="empty-state">
          <i className="fas fa-shopping-basket"></i>
          <h3>Your grocery list is empty</h3>
          <p>Start by adding items above or try our smart suggestions!</p>
        </div>
      )}
    </div>
  );
}