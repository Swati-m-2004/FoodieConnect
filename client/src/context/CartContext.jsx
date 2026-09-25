import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('foodie_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [restaurant, setRestaurant] = useState(() => {
    const saved = localStorage.getItem('foodie_cart_restaurant');
    return saved ? JSON.parse(saved) : null;
  });

  const [conflictData, setConflictData] = useState(null);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('foodie_cart', JSON.stringify(cartItems));
    localStorage.setItem('foodie_cart_restaurant', JSON.stringify(restaurant));
  }, [cartItems, restaurant]);

  const addToCart = (food, targetRestaurant) => {
    // Check if cart already has items from a different restaurant
    if (restaurant && cartItems.length > 0 && restaurant._id.toString() !== targetRestaurant._id.toString()) {
      setConflictData({ food, restaurant: targetRestaurant });
      setIsConflictModalOpen(true);
      return;
    }

    // Set active restaurant if not already set
    if (!restaurant || cartItems.length === 0) {
      setRestaurant({
        _id: targetRestaurant._id,
        name: targetRestaurant.name,
        deliveryFee: targetRestaurant.deliveryFee || 30,
        minOrderAmount: targetRestaurant.minOrderAmount || 100,
        deliveryRadius: targetRestaurant.deliveryRadius || 5,
        location: targetRestaurant.location
      });
    }

    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.foodId === food._id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [
          ...prev,
          {
            foodId: food._id,
            name: food.name,
            price: food.price,
            image: food.image,
            isVegetarian: food.isVegetarian,
            quantity: 1
          }
        ];
      }
    });
  };

  const confirmClearAndAdd = () => {
    if (conflictData) {
      const { food, restaurant: newRest } = conflictData;
      setRestaurant({
        _id: newRest._id,
        name: newRest.name,
        deliveryFee: newRest.deliveryFee || 30,
        minOrderAmount: newRest.minOrderAmount || 100,
        deliveryRadius: newRest.deliveryRadius || 5,
        location: newRest.location
      });
      setCartItems([
        {
          foodId: food._id,
          name: food.name,
          price: food.price,
          image: food.image,
          isVegetarian: food.isVegetarian,
          quantity: 1
        }
      ]);
      setConflictData(null);
      setIsConflictModalOpen(false);
    }
  };

  const cancelConflict = () => {
    setConflictData(null);
    setIsConflictModalOpen(false);
  };

  const updateQuantity = (foodId, delta) => {
    setCartItems(prev => {
      return prev
        .map(item => {
          if (item.foodId === foodId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (foodId) => {
    setCartItems(prev => prev.filter(item => item.foodId !== foodId));
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurant(null);
    localStorage.removeItem('foodie_cart');
    localStorage.removeItem('foodie_cart_restaurant');
  };

  // Dynamic calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cartItems.length > 0 && restaurant ? restaurant.deliveryFee || 30 : 0;
  const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
  const discount = 0;
  const totalAmount = Math.round((subtotal + deliveryFee + tax - discount) * 100) / 100;
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        restaurant,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        deliveryFee,
        tax,
        discount,
        totalAmount,
        totalCount,
        isConflictModalOpen,
        conflictData,
        confirmClearAndAdd,
        cancelConflict
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
