import { useEffect, useState } from "react";

const MENU = [
  { id: "burger", nombre: "Burger 🍔", precio: 4.99 },
  { id: "fries", nombre: "Fries 🍟", precio: 1.49 },
  { id: "hotdog", nombre: "Hotdog 🌭", precio: 3.49 },
  { id: "taco", nombre: "Taco 🌮", precio: 3.99 },
  { id: "pizza", nombre: "Pizza 🍕", precio: 7.99 },
  { id: "donut", nombre: "Donut 🍩", precio: 1.49 },
  { id: "popcorn", nombre: "Popcorn 🍿", precio: 1.99 },
  { id: "soda", nombre: "Soda 🥤", precio: 1.50 }
];

function App() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready();
  }, []);

  const addItem = (item) => {
    setCart([...cart, item]);
  };

  const confirmOrder = () => {
    const tg = window.Telegram.WebApp;
    tg.sendData(JSON.stringify(cart)); // Envía datos al bot
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h1>Durger King 🍔</h1>
      {MENU.map((item) => (
        <div key={item.id} style={{ marginBottom: "0.5rem" }}>
          <span>{item.nombre} - ${item.precio.toFixed(2)}</span>
          <button
            style={{ marginLeft: "1rem", background: "orange", color: "white" }}
            onClick={() => addItem(item)}
          >
            ADD
          </button>
        </div>
      ))}
      <hr />
      <button
        style={{ background: "green", color: "white", padding: "0.5rem 1rem" }}
        onClick={confirmOrder}
      >
        VIEW ORDER 🛒
      </button>
    </div>
  );
}

export default App;