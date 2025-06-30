// useBinStore.js
import { defineStore } from "pinia";
import { ref } from "vue";

export const useBinStore = defineStore("bin", () => {
  const bins = ref([]);

  const loadState = () => {
    if (localStorage.getItem("binStore")) {
      const savedState = JSON.parse(localStorage.getItem("binStore"));
      bins.value = savedState.bins || [];
    }
  };

  const saveState = () => {
    localStorage.setItem(
      "binStore",
      JSON.stringify({
        bins: bins.value,
      })
    );
  };

  const addBin = (bin) => {
    bins.value.push(bin);
    saveState();
  };

  loadState();

  return {
    bins,
    addBin,
    saveState,
  };
});
