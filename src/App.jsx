// frontend/src/App.jsx
import { useEffect, useState } from "react";

function App() {
  const [menu, setMenu] = useState([]);
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    fetch("https://backend-bot-ihc-1.onrender.com/menu")
      .then(res => res.json())
      .then(data => setMenu(data.menu));
  }, []);

  const agregarAlCarrito = (item) => {
    setCarrito([...carrito, item]);
  };

  const confirmarPedido = async () => {
    const chatId = 123456789; // Simulado, luego lo pasas dinámico
    const res = await fetch("https://backend-bot-ihc-1.onrender.com/pedido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, items: carrito })
    });
    const data = await res.json();
    alert(`Pedido confirmado. Total: $${data.total}`);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Restaurant Aguilar 🍕</h1>
      <h2>Menú</h2>
      <ul>
        {menu.map(item => (
          <li key={item.id}>
            {item.nombre} - ${item.precio.toFixed(2)}
            <button onClick={() => agregarAlCarrito(item)}>Agregar</button>
          </li>
        ))}
      </ul>

      <h2>Carrito</h2>
      <ul>
        {carrito.map((item, idx) => (
          <li key={idx}>{item.nombre} - ${item.precio.toFixed(2)}</li>
        ))}
      </ul>

      {carrito.length > 0 && (
        <button onClick={confirmarPedido}>Confirmar Pedido</button>
      )}
    </div>
  );
}

export default App;