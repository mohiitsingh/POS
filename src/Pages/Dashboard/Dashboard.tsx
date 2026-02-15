
import { useState, useMemo } from "react";
import MenuSection from "./components/MenuSection";
import BillingSection, { type CartItem } from "./components/BillingSection";
import { useMenu } from "../../Contexts/MenuContext";
import { type Dish } from "./data";
import "./Dashboard.css";

const Dashboard = () => {
    // Context
    const { menuItems, categories } = useMenu();

    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [dietFilter, setDietFilter] = useState("All");
    const [cart, setCart] = useState<CartItem[]>([]);

    // Mapped Data
    const categoryNames = useMemo(() => ["All", ...categories.filter(c => c.isActive).map(c => c.name)], [categories]);

    const allDishes: Dish[] = useMemo(() => {
        return menuItems
            .filter(item => item.isActive)
            .map(item => {
                const category = categories.find(c => c.id === item.categoryId);
                return {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    category: category ? category.name : "Unknown",
                    isVeg: item.isVeg ?? false,
                };
            });
    }, [menuItems, categories]);

    // Filter Logic
    const filteredDishes = useMemo(() => {
        return allDishes.filter((dish) => {
            const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === "All" || dish.category === selectedCategory;
            const matchesDiet = dietFilter === "All"
                ? true
                : dietFilter === "Veg" ? dish.isVeg
                    : !dish.isVeg;

            return matchesSearch && matchesCategory && matchesDiet;
        });
    }, [searchQuery, selectedCategory, dietFilter, allDishes]);

    // Cart Handlers
    const cartItemsMap = useMemo(() => {
        const map: Record<string, number> = {};
        cart.forEach(item => map[item.id] = item.quantity);
        return map;
    }, [cart]);

    const handleAddToCart = (dish: Dish) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === dish.id);
            if (existing) {
                return prev.map(item =>
                    item.id === dish.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...dish, quantity: 1 }];
        });
    };

    const handleRemoveFromCart = (dish: Dish) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === dish.id);
            if (existing && existing.quantity > 1) {
                return prev.map(item =>
                    item.id === dish.id
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            }
            return prev.filter(item => item.id !== dish.id);
        });
    };

    const handleUpdateQuantity = (dish: Dish, qty: number) => {
        if (qty <= 0) {
            handleRemoveItemCompletely(dish.id);
            return;
        }
        setCart(prev => {
            const existing = prev.find(item => item.id === dish.id);
            if (existing) {
                return prev.map(item =>
                    item.id === dish.id ? { ...item, quantity: qty } : item
                );
            }
            return [...prev, { ...dish, quantity: qty }];
        });
    };

    const handleRemoveItemCompletely = (dishId: string) => {
        setCart(prev => prev.filter(item => item.id !== dishId));
    };

    const handleClearBill = () => {
        if (cart.length > 0) {
            if (window.confirm("Are you sure you want to clear the current bill?")) {
                setCart([]);
            }
        } else {
            setCart([]);
        }
    };

    const handleLoadCart = (items: CartItem[]) => {
        setCart(items);
    };

    return (
        <div className="pos-dashboard">
            {/* Left Panel: Menu */}
            <MenuSection
                dishes={filteredDishes}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                dietFilter={dietFilter}
                setDietFilter={setDietFilter}
                cartItems={cartItemsMap}
                onaddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onUpdateQuantity={handleUpdateQuantity}
                categories={categoryNames}
            />

            {/* Right Panel: Billing */}
            <BillingSection
                cart={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItemCompletely}
                onClearBill={handleClearBill}
                onLoadCart={handleLoadCart}
            />
        </div>
    );
};

export default Dashboard;
