// src/stores/useBinStore.js
import { defineStore } from "pinia";
import { ref } from "vue";

export const useBinStore = defineStore("bin", () => {
  const bins = ref([]);
  const binShelves = ref({});

  const addBin = (bin) => {
    bins.value.push(bin);
  };

  const addBinToShelf = (shelfName, bin) => {
    if (!binShelves.value[shelfName]) {
      binShelves.value[shelfName] = [];
    }
    const shelfBins = binShelves.value[shelfName];

    const shelfWidth = 100; // Placeholder for actual shelf width
    const shelfDepth = 50; // Placeholder for actual shelf depth

    // Implement a simple bin placement logic
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
    }
  };

  return {
    bins,
    binShelves,
    addBin,
    addBinToShelf,
  };
});
