// src/stores/useMaterialStore.js
import { defineStore } from "pinia";

export const useMaterialStore = defineStore("material", {
  state: () => ({
    materials: JSON.parse(localStorage.getItem("materials")) || [],

    materialProperties:
      JSON.parse(localStorage.getItem("materialProperties")) || [], // Persistence for properties
  }),
  actions: {
    addMaterial(material) {
      this.materials.push(material);
      this.persistToLocalStorage();
    },
    addMaterialProperty(property) {
      this.materialProperties.push(property);
      this.persistToLocalStorage();
    },
    updateMaterialProperty(index, property) {
      this.materialProperties.splice(index, 1, property);
      this.persistToLocalStorage();
    },
    resetMaterials() {
      this.materials = [];
      this.materialProperties = [];
      this.persistToLocalStorage();
    },
    persistToLocalStorage() {
      localStorage.setItem("materials", JSON.stringify(this.materials));
      localStorage.setItem(
        "materialProperties",
        JSON.stringify(this.materialProperties)
      );
    },
  },
});
