// src/stores/useMaterialStore.js
import { defineStore } from "pinia";

export const useMaterialStore = defineStore("material", {
  state: () => ({
    // Each material can now include its own storageRules array
    materials: JSON.parse(localStorage.getItem("materials")) || [],

    // Material properties array (without storage rules)
    materialProperties:
      JSON.parse(localStorage.getItem("materialProperties")) || [],
  }),
  actions: {
    addMaterial(material) {
      // Always ensure storageRules is an array (even if empty)
      if (!material.storageRules) {
        material.storageRules = [];
      }
      this.materials.push(material);
      this.persistToLocalStorage();
    },
    addMaterialProperty(property) {
      this.materialProperties.push(property);
      this.persistToLocalStorage();
    },
    updateMaterial(index, updatedMaterial) {
      // For in-place update of a material (including storageRules)
      this.materials.splice(index, 1, {
        ...updatedMaterial,
        storageRules: updatedMaterial.storageRules || [],
      });
      this.persistToLocalStorage();
    },
    addOrUpdateMaterialStorageRules(materialIndex, storageRules) {
      if (this.materials[materialIndex]) {
        // Replace the current storageRules with the new array
        this.materials[materialIndex].storageRules = storageRules;
        this.persistToLocalStorage();
      }
    },
    addMaterialStorageRule(materialIndex, rule) {
      if (this.materials[materialIndex]) {
        if (!this.materials[materialIndex].storageRules) {
          this.materials[materialIndex].storageRules = [];
        }
        this.materials[materialIndex].storageRules.push(rule);
        this.persistToLocalStorage();
      }
    },
    removeMaterialStorageRule(materialIndex, binName) {
      if (
        this.materials[materialIndex] &&
        Array.isArray(this.materials[materialIndex].storageRules)
      ) {
        this.materials[materialIndex].storageRules = this.materials[
          materialIndex
        ].storageRules.filter((rule) => rule.bin !== binName);
        this.persistToLocalStorage();
      }
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
