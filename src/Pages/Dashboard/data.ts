
export interface Dish {
    id: string;
    name: string;
    price: number;
    category: string;
    isVeg: boolean;

}

export const CATEGORIES = ["All", "Rice", "Beverages", "Salads", "Soup", "Pizza", "Burger"];

export const MOCK_DISHES: Dish[] = [
    { id: "1", name: "Shrimp Basil Salad", price: 10.00, category: "Salads", isVeg: false },
    { id: "2", name: "Onion Rings", price: 5.00, category: "Snacks", isVeg: true },
    { id: "3", name: "Smoked Bacon", price: 12.00, category: "Snacks", isVeg: false },
    { id: "4", name: "Fresh Tomatoes", price: 4.00, category: "Salads", isVeg: true },
    { id: "5", name: "Chicken Burger", price: 10.00, category: "Burger", isVeg: false },
    { id: "6", name: "Red Onion Rings", price: 4.50, category: "Snacks", isVeg: true },
    { id: "7", name: "Beef Burger", price: 11.00, category: "Burger", isVeg: false },
    { id: "8", name: "Grilled Burger", price: 10.50, category: "Burger", isVeg: false },
    { id: "9", name: "Chicken Pizza", price: 14.00, category: "Pizza", isVeg: false },
    { id: "10", name: "Veggie Pizza", price: 12.00, category: "Pizza", isVeg: true },
    { id: "11", name: "Fried Rice", price: 9.00, category: "Rice", isVeg: true },
    { id: "12", name: "Lemonade", price: 3.00, category: "Beverages", isVeg: true },
];
