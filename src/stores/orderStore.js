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
    persistOrders() {
      localStorage.setItem("orders", JSON.stringify(this.orders));
    },
  },
});
