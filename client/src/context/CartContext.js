import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sphere_cart');
      if (stored) setItems(JSON.parse(stored));
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sphere_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (template) => {
    setItems(prev => {
      const existing = prev.find(item => item.templateId === template._id);
      if (existing) {
        return prev.map(item => item.templateId === template._id ? { ...item, quantity: item.quantity + 1 } : item);
      }

      return [
        ...prev,
        {
          templateId: template._id,
          name: template.name,
          price: template.price,
          salePrice: template.salePrice,
          onSale: template.onSale,
          imageUrl: template.imageUrl,
          quantity: 1
        }
      ];
    });
  };

  const removeFromCart = (templateId) => {
    setItems(prev => prev.filter(item => item.templateId !== templateId));
  };

  const updateQuantity = (templateId, quantity) => {
    if (quantity <= 0) return removeFromCart(templateId);
    setItems(prev => prev.map(item => item.templateId === templateId ? { ...item, quantity } : item));
  };

  const clearCart = () => setItems([]);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const total = useMemo(
    () => items.reduce((sum, item) => sum + ((item.onSale && typeof item.salePrice === 'number' ? item.salePrice : item.price) * item.quantity), 0),
    [items]
  );

  return (
    <CartContext.Provider value={{ items, itemCount, total, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
