// services/api.js
import axios from "axios";

const API_URL = "https://backend-bot-ihc-1.onrender.com";

// Crear una instancia de axios con configuración base
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// Aquí puedes agregar interceptores si necesitas manejar tokens JWT
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default api;