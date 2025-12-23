import client from "./clientServices";

export const OrderService = {
  getSellers: async () => {
    const res = await client.get("/sellers?limit=999");
    return res.data.data ?? [];
  },

  getProducts: async () => {
    const res = await client.get("/products?limit=999");
    return res.data.products ?? res.data.data ?? [];
  },

  async getOrderById(id: number) {
    const res = await client.get(`/orders/${id}`);
    return res.data.data;
  },

  async getOrders() {
    const res = await client.get("/orders");
    return res.data.data;
  },

  createOrder: async (payload: any) => {
    return client.post("/orders/sell", payload);
  },

  updateOrder: async (orderId: number, payload: any) => {
    return client.put(`/orders/${orderId}`, payload);
  },
};
