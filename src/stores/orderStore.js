import { defineStore } from "pinia";

export const useOrderStore = defineStore("orderStore", {
  state: () => ({
    orders: JSON.parse(localStorage.getItem("orders") || "[]"),
  }),
  actions: {
    addOrder(order) {
      this.orders.push(order);
      this.persistOrders();
    },
    updateOrder(originalName, updatedOrder) {
      const idx = this.orders.findIndex((o) => o.name === originalName);
      if (idx > -1) {
        this.orders[idx] = { ...updatedOrder };
      }
      this.persistOrders();
    },

    deleteOrder(orderName) {
      this.orders = this.orders.filter((order) => order.name !== orderName);
    },

    persistOrders() {
      localStorage.setItem("orders", JSON.stringify(this.orders));
    },
  },
});
