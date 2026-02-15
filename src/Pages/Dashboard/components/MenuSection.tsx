
import React from "react";
import { Search, Plus, Minus } from "lucide-react";
import { type Dish } from "../data";

interface MenuSectionProps {
    dishes: Dish[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    dietFilter: string;
    setDietFilter: (filter: string) => void;
    cartItems: Record<string, number>; // dishId -> quantity
    onaddToCart: (dish: Dish) => void;
    onRemoveFromCart: (dish: Dish) => void;
    onUpdateQuantity: (dish: Dish, qty: number) => void;
    categories: string[];
}

const MenuSection: React.FC<MenuSectionProps> = ({
    dishes,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    dietFilter,
    setDietFilter,
    cartItems,
    onaddToCart,
    onRemoveFromCart,

    onUpdateQuantity,
    categories,
}) => {
    return (
        <div className="menu-section">
            {/* Header & Filters */}
            <div className="menu-header">
                <div className="search-bar">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search in products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filters">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="category-select"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <select
                        value={dietFilter}
                        onChange={(e) => setDietFilter(e.target.value)}
                        className="diet-select"
                    >
                        <option value="All">All Diet</option>
                        <option value="Veg">Veg</option>
                        <option value="Non-Veg">Non-Veg</option>
                    </select>
                </div>
            </div>

            {/* Category Tabs (Optional visual enhancement) */}
            <div className="category-tabs">
                <button
                    className={`tab ${selectedCategory === 'All' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('All')}
                >
                    Show All
                </button>
                {categories.filter(c => c !== 'All').map(cat => (
                    <button
                        key={cat}
                        className={`tab ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Dish Grid */}
            <div className="dish-grid">
                {dishes.map((dish) => {
                    const quantity = cartItems[dish.id] || 0;
                    return (
                        <div key={dish.id} className="dish-card">

                            <div className="dish-info">
                                <h3>{dish.name}</h3>
                                <p className="dish-price">₹{dish.price.toFixed(2)}</p>
                            </div>

                            <div className="dish-actions">
                                {quantity === 0 ? (
                                    <button
                                        className="add-btn"
                                        onClick={() => onaddToCart(dish)}
                                    >
                                        <Plus size={16} /> Add
                                    </button>
                                ) : (
                                    <div className="qty-controls">
                                        <button onClick={() => onRemoveFromCart(dish)} className="qty-btn minus">
                                            <Minus size={14} />
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => onUpdateQuantity(dish, parseInt(e.target.value) || 0)}
                                            className="qty-input"
                                        />
                                        <button onClick={() => onaddToCart(dish)} className="qty-btn plus">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                {dishes.length === 0 && (
                    <div className="no-results">
                        <p>No dishes found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuSection;
