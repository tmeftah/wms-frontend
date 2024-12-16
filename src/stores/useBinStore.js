import { defineStore } from "pinia";
import { ref } from "vue";

export const useBinStore = defineStore("bin", () => {
  const bins = ref([]);
  const binShelves = ref({});

  // Function to load state from localStorage
  const loadState = () => {
    if (localStorage.getItem("binStore")) {
      const savedState = JSON.parse(localStorage.getItem("binStore"));
      bins.value = savedState.bins || [];
      binShelves.value = savedState.binShelves || {};
    }
  };

  // Function to save state to localStorage
  const saveState = () => {
    localStorage.setItem(
      "binStore",
      JSON.stringify({
        bins: bins.value,
        binShelves: binShelves.value,
      })
    );
  };

  const addBin = (bin) => {
    bins.value.push(bin);
    saveState(); // Save new state
  };

  const addBinToShelf = (shelfName, bin) => {
    if (!binShelves.value[shelfName]) {
      binShelves.value[shelfName] = [];
    }
    const shelfBins = binShelves.value[shelfName];

    // Determine position for the bin on the shelf
    const shelfWidth = 100; // Replace with actual shelf width
    const shelfDepth = 50; // Replace with actual shelf depth
    let position = { x: 0, y: 0 };
    let placed = false;

    const canFit = (binToPlace, posX, posY) =>
      posX + binToPlace.width <= shelfWidth &&
      posY + binToPlace.depth <= shelfDepth;

    for (let possibleY = 0; !placed && possibleY + bin.depth <= shelfDepth; ) {
      for (
        let possibleX = 0;
        !placed && possibleX + bin.width <= shelfWidth;

      ) {
        if (
          shelfBins.every(
            (existingBin) =>
              !(
                existingBin.position.x < possibleX + bin.width &&
                possibleX < existingBin.position.x + existingBin.width &&
                existingBin.position.y < possibleY + bin.depth &&
                possibleY < existingBin.position.y + existingBin.depth
              )
          )
        ) {
          position = { x: possibleX, y: possibleY };
          placed = true;
        }
        if (!placed) possibleX += bin.width;
      }
      if (!placed) possibleY += bin.depth;
    }

    if (placed) {
      // Allow adding the same bin multiple times by not removing the bin from the list
      shelfBins.push({ ...bin, position });
      saveState(); // Save new state
    }
  };

  const removeBinFromShelf = (shelfName, bin) => {
    if (binShelves.value[shelfName]) {
      binShelves.value[shelfName] = binShelves.value[shelfName].filter(
        (b) => b.name !== bin.name
      );
      saveState(); // Save new state
    }
  };

  // Load state when the store initializes
  loadState();

  return {
    bins,
    binShelves,
    addBin,
    addBinToShelf,
    removeBinFromShelf,
  };
});
