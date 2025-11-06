import { useEffect, useState } from "react";

const MENU = [
  { id: "cake", nombre: "Cake", emoji: "🍰", precio: 0, isNew: true, isReward: true },
  { id: "burger", nombre: "Burger", emoji: "🍔", precio: 4.99 },
  { id: "fries", nombre: "Fries", emoji: "🍟", precio: 1.49 },
  { id: "hotdog", nombre: "Hotdog", emoji: "🌭", precio: 3.49 },
  { id: "taco", nombre: "Taco", emoji: "🌮", precio: 3.99 },
  { id: "pizza", nombre: "Pizza", emoji: "🍕", precio: 7.99 },
  { id: "donut", nombre: "Donut", emoji: "🍩", precio: 1.49 },
  { id: "popcorn", nombre: "Popcorn", emoji: "🍿", precio: 1.99 },
  { id: "soda", nombre: "Soda", emoji: "🥤", precio: 1.50 }
];

function App() {
  const [cart, setCart] = useState({});

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.setBackgroundColor('#000000');
      tg.setHeaderColor('#000000');
    }
  }, []);

  const addItem = (itemId) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeItem = (itemId) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const confirmOrder = () => {
    const tg = window.Telegram?.WebApp;
    const orderItems = Object.entries(cart).map(([itemId, quantity]) => {
      const item = MENU.find(m => m.id === itemId);
      return {
        nombre: `${item.emoji} ${item.nombre}`,
        precio: item.precio,
        cantidad: quantity
      };
    });

    if (tg && orderItems.length > 0) {
      tg.sendData(JSON.stringify(orderItems));
    }
  };

  const getTotal = () => {
    return Object.entries(cart).reduce((sum, [itemId, quantity]) => {
      const item = MENU.find(m => m.id === itemId);
      return sum + (item.precio * quantity);
    }, 0);
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: totalItems > 0 ? '100px' : '20px'
    }}>


      {/* Menu Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0',
        padding: '0',
        margin: '0'
      }}>
        {MENU.map((item) => {
          const quantity = cart[item.id] || 0;
          const inCart = quantity > 0;

          return (
            <div key={item.id} style={{
              background: '#000',
              borderBottom: '1px solid #1a1a1a',
              borderRight: '1px solid #1a1a1a',
              padding: '20px 10px',
              textAlign: 'center',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              {/* Badge NEW */}
              {item.isNew && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: '#00C853',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  padding: '3px 6px',
                  borderRadius: '4px',
                  letterSpacing: '0.5px'
                }}>
                  NEW
                </div>
              )}

              {/* Star Badge */}
              {item.isReward && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  fontSize: '16px'
                }}>
                  ⭐
                </div>
              )}

              {/* Quantity Badge */}
              {inCart && (
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: '#FF9800',
                  color: '#fff',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: '2px solid #000',
                  zIndex: 10
                }}>
                  {quantity}
                </div>
              )}

              {/* Item Image */}
              <div style={{
                fontSize: '64px',
                marginBottom: '8px',
                lineHeight: 1
              }}>
                {item.emoji}
              </div>

              {/* Item Info */}
              <div style={{
                marginBottom: '10px',
                width: '100%'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '2px',
                  whiteSpace: 'nowrap'
                }}>
                  {item.nombre} · {item.precio === 0 ? '⭐1' : `$${item.precio.toFixed(2)}`}
                </div>
              </div>

              {/* Action Buttons */}
              {item.isReward ? (
                <button style={{
                  width: '90%',
                  padding: '10px',
                  background: '#00C853',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}>
                  BUY
                </button>
              ) : inCart ? (
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  justifyContent: 'center',
                  width: '90%'
                }}>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{
                      width: '42px',
                      height: '42px',
                      background: '#D32F2F',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    −
                  </button>
                  <button
                    onClick={() => addItem(item.id)}
                    style={{
                      width: '42px',
                      height: '42px',
                      background: '#FF9800',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addItem(item.id)}
                  style={{
                    width: '90%',
                    padding: '10px',
                    background: '#FF9800',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  ADD
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Fixed Bottom Button */}
      {totalItems > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          padding: '12px 16px 20px 16px',
          background: 'linear-gradient(to top, #000 80%, transparent)',
          zIndex: 100
        }}>
          <button
            onClick={confirmOrder}
            style={{
              width: '100%',
              padding: '16px',
              background: '#00C853',
              color: '#fff',
              border: 'none',
              borderRadius: '14px',
              fontSize: '17px',
              fontWeight: 'bold',
              cursor: 'pointer',
              letterSpacing: '0.5px'
            }}
          >
            VIEW ORDER
          </button>
        </div>
      )}
    </div>
  );
}

export default App;