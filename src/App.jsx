import { useEffect, useState } from "react";
import { crearOrden } from "./services/orders";
const MENU = [
  { id: 1, nombre: "Burger", emoji: "🍔", precio: 4.99 },
  { id: 2, nombre: "Fries", emoji: "🍟", precio: 1.49 },
  { id: 3, nombre: "Hotdog", emoji: "🌭", precio: 3.49 },
  { id: 4, nombre: "Taco", emoji: "🌮", precio: 3.99 },
  { id: 5, nombre: "Pizza", emoji: "🍕", precio: 7.99 },
  { id: 6, nombre: "Donut", emoji: "🍩", precio: 1.49 },
  { id: 7, nombre: "Popcorn", emoji: "🍿", precio: 1.99 },
  { id: 8, nombre: "Soda", emoji: "🥤", precio: 1.50 }
];

function App() {
  const [cart, setCart] = useState({});
  const [showOrder, setShowOrder] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [comment, setComment] = useState("");

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
    setShowPayment(true);
  };

  const finalizePayment = async () => {
    const tg = window.Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;

    // 1. Obtener la ubicación al iniciar la finalización del pago
    let shippingAddress = "Ubicación no proporcionada"; // Valor por defecto
    let lat = null;
    let lng = null;

    try {
      if (navigator.geolocation) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        });
        const { latitude, longitude } = position.coords;
        lat = latitude;
        lng = longitude;
        shippingAddress = `Lat: ${latitude}, Lng: ${longitude}`;
        console.log("Ubicación obtenida:", shippingAddress);
      } else {
        console.log("Geolocalización no soportada por el navegador.");
      }
    } catch (err) {
      console.error("Error obteniendo ubicación:", err.message);
      // Opcional: notificar al usuario que no se pudo obtener la ubicación.
      alert(`No se pudo obtener la ubicación: ${err.message}. Se usará una dirección por defecto.`);
    }

    // 2. Construir los items de la orden
    const orderItems = Object.entries(cart).map(([itemId, quantity]) => {
      const item = MENU.find(m => m.id === Number(itemId));
      return {
        product_id: item.id,
        price: item.precio,
        quantity: quantity
      };
    });

    const payload = {
      telegram_user_id: user?.id,          //  ID real del usuario
      telegram_username: user?.first_name,   //  username si existe
      direccion_envio: shippingAddress,
      lat: lat,
      lng: lng,
      items: orderItems,
      comentario: comment,
      total_price: getTotal(),
      is_paid: true
    };
    console.log("Payload listo:", JSON.stringify(payload, null, 2));

    try {
      //  aquí llamo a tu servicio
      const result = await crearOrden(payload);
      console.log("Orden creada en backend:", result);

      // Si quieres, puedes notificar a Telegram que todo salió bien
      if (tg) {
        tg.sendData(JSON.stringify({ status: "success", orderId: result.id }));
        // Opcional: cerrar la mini app después de un éxito
        // tg.close();
      }
      setShowPayment(false);
      setShowConfirmation(true);
      setCart({}); // Limpiar el carrito
    } catch (error) {
      console.error("Error creando la orden:", error);
      console.error("Error creando la orden:", error.response?.data || error.message);
      if (tg) {
        tg.sendData(JSON.stringify({ status: "error" }));
      }
    }

  };

  const getTotal = () => {
    return Object.entries(cart).reduce((sum, [itemId, quantity]) => {
      //const item = MENU.find(m => m.id === itemId);
      const item = MENU.find(m => m.id === Number(itemId));
      return sum + (item.precio * quantity);
    }, 0);
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  // Vista de confirmación de pago
  if (showConfirmation) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#000',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '20px',
        margin: 0,
        overflow: 'hidden'
      }}>
        <div style={{
          fontSize: '80px',
          marginBottom: '20px'
        }}>
          ✅
        </div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '600',
          margin: '0 0 10px 0'
        }}>
          ¡Pago Confirmado!
        </h1>
        <p style={{
          fontSize: '17px',
          color: '#888',
          maxWidth: '300px',
          lineHeight: '1.5',
          marginBottom: '40px'
        }}>
          Tu orden ha sido recibida y se está preparando. ¡Gracias por tu compra!
        </p>
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
            onClick={() => {
              setShowConfirmation(false);
              setShowOrder(false);
              // Opcional: cerrar la Mini App de Telegram
              window.Telegram?.WebApp.close();
            }}
            style={{
              width: '100%',
              padding: '16px',
              background: '#00C853',
              color: '#fff',
              border: 'none',
              borderRadius: '14px',
              fontSize: '17px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // Vista de pago con QR
  if (showPayment) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#000',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        paddingBottom: '100px',
        margin: 0,
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          textAlign: 'center',
          borderBottom: '1px solid #1a1a1a',
          position: 'relative'
        }}>
          <button
            onClick={() => setShowPayment(false)}
            style={{
              position: 'absolute',
              left: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#0A84FF',
              fontSize: '17px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span style={{ fontSize: '20px' }}>‹</span> Atrás
          </button>
          <h1 style={{
            margin: '0 0 5px 0',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            Realizar Pago
          </h1>
          <p style={{
            margin: 0,
            color: '#666',
            fontSize: '13px'
          }}>
            Escanea el código QR
          </p>
        </div>

        {/* Payment Content */}
        <div style={{
          padding: '40px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          {/* Amount */}
          <div style={{
            marginBottom: '30px'
          }}>
            <div style={{
              fontSize: '16px',
              color: '#888',
              marginBottom: '8px'
            }}>
              Total a pagar
            </div>
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#00C853'
            }}>
              ${getTotal().toFixed(2)}
            </div>
          </div>

          {/* QR Code */}
          <div style={{
            width: '280px',
            height: '280px',
            background: '#fff',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '30px',
            padding: '20px',
            boxShadow: '0 4px 20px rgba(0, 200, 83, 0.3)'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%23000' d='M0 0h10v10H0zM20 0h10v10H20zM30 0h10v10H30zM50 0h10v10H50zM60 0h10v10H60zM70 0h10v10H70zM90 0h10v10H90zM0 10h10v10H0zM90 10h10v10H90zM0 20h10v10H0zM20 20h10v10H20zM30 20h10v10H30zM40 20h10v10H40zM60 20h10v10H60zM70 20h10v10H70zM90 20h10v10H90zM0 30h10v10H0zM90 30h10v10H90zM0 40h10v10H0zM20 40h10v10H20zM40 40h10v10H40zM50 40h10v10H50zM60 40h10v10H60zM70 40h10v10H70zM90 40h10v10H90zM10 50h10v10H10zM20 50h10v10H20zM40 50h10v10H40zM50 50h10v10H50zM70 50h10v10H70zM0 60h10v10H0zM30 60h10v10H30zM40 60h10v10H40zM50 60h10v10H50zM60 60h10v10H60zM80 60h10v10H80zM90 60h10v10H90zM0 70h10v10H0zM90 70h10v10H90zM0 80h10v10H0zM20 80h10v10H20zM30 80h10v10H30zM40 80h10v10H40zM60 80h10v10H60zM70 80h10v10H70zM90 80h10v10H90zM0 90h10v10H0zM90 90h10v10H90z'/%3E%3C/svg%3E")`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }} />
          </div>

          {/* Instructions */}
          <div style={{
            maxWidth: '320px',
            marginBottom: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px'
            }}>
              Instrucciones de pago
            </h3>
            <ol style={{
              textAlign: 'left',
              color: '#888',
              fontSize: '14px',
              lineHeight: '1.8',
              paddingLeft: '20px',
              margin: 0
            }}>
              <li>Abre tu aplicación de pagos móviles</li>
              <li>Escanea el código QR mostrado arriba</li>
              <li>Confirma el monto de ${getTotal().toFixed(2)}</li>
              <li>Completa el pago</li>
            </ol>
          </div>

          {/* Payment Methods */}
          <div style={{
            display: 'flex',
            gap: '15px',
            marginTop: '20px',
            opacity: 0.7
          }}>
            <div style={{
              padding: '8px 16px',
              background: '#1a1a1a',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600'
            }}>

            </div>
            <div style={{
              padding: '8px 16px',
              background: '#1a1a1a',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
            </div>
            <div style={{
              padding: '8px 16px',
              background: '#1a1a1a',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
            </div>
          </div>
        </div>

        {/* Confirm Payment Button */}
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
            onClick={finalizePayment}
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
              letterSpacing: '0.5px',
              marginBottom: '10px'
            }}
          >
            ✓ Confirmar Pago Realizado
          </button>
          <button
            onClick={() => setShowPayment(false)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              color: '#888',
              border: '1px solid #333',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // Vista de orden
  if (showOrder) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#000',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        paddingBottom: '100px',
        margin: 0,
        overflow: 'hidden'
      }}>

        <div style={{
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            margin: 0
          }}>
            Tú Orden
          </h2>
          <button style={{
            background: 'none',
            border: 'none',
            color: '#00C853',
            fontSize: '17px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Edit
          </button>
        </div>

        {/* Order Items */}
        <div style={{ padding: '0 20px' }}>
          {Object.entries(cart).map(([itemId, quantity]) => {
            const item = MENU.find(m => m.id === Number(itemId));
            return (
              <div key={itemId} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px 0',
                borderBottom: '1px solid #1a1a1a'
              }}>
                <div style={{ fontSize: '48px', marginRight: '15px' }}>
                  {item.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}>
                    {item.nombre} <span style={{ color: '#FF9800' }}>{quantity}x</span>
                  </div>
                  <div style={{
                    fontSize: '15px',
                    color: '#888'
                  }}>
                    Meat™
                  </div>
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '600'
                }}>
                  ${(item.precio * quantity).toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Comment Section */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #1a1a1a'
        }}>
          <div style={{
            fontSize: '17px',
            color: '#666',
            marginBottom: '10px'
          }}>
            Alguna Observación ?
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Cualquier petición especial, detalle, último deseo, etc."
            style={{
              width: '100%',
              minHeight: '80px',
              background: 'transparent',
              border: 'none',
              color: '#888',
              fontSize: '15px',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none',
              padding: '0'
            }}
          />
        </div>

        {/* Pay Button */}
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
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              letterSpacing: '0.5px'
            }}
          >
            Confirmar Pedido: ${getTotal().toFixed(2)}
          </button>
        </div>
      </div>
    );
  }

  // Vista de menú principal
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#000',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: totalItems > 0 ? '100px' : '20px',
      margin: 0,
      overflow: 'hidden'
    }}>
      {/* Menu Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0',
        padding: '0',
        margin: '0',
        width: '100%'
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
                  {item.nombre} · ${item.precio.toFixed(2)}
                </div>
              </div>

              {/* Action Buttons */}
              {inCart ? (
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
            onClick={() => setShowOrder(true)}
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
            Ver Orden
          </button>
        </div>
      )}
    </div>
  );
}

export default App;