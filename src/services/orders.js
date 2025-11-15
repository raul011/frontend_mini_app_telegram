// services/orders.js
import api from "./api";

export const crearOrden = async (ordenData) => {
    try {
        const response = await api.post("/orders", ordenData);
        return response.data;
    } catch (error) {
        console.error("Error creando la orden:", error);
        throw error;
    }
};