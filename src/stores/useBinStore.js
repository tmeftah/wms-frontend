// useBinStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { useShuttleStore } from "./useShuttleStore";

export const useBinStore = defineStore("bin", () => {
  const bins = ref([]);
  const binShelves = ref({});

  const loadState = () => {
    if (localStorage.getItem("binStore")) {
      const savedState = JSON.parse(localStorage.getItem("binStore"));
      bins.value = savedState.bins || [];
      binShelves.value = savedState.binShelves || {};
    }
  };

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
    saveState();
  };

  const addBinToShelf = (shelfName, bin) => {
    const shuttleStore = useShuttleStore();
    const shuttleWidth = shuttleStore.getShelfWidth({ name: shelfName });
    const shuttleDepth = shuttleStore.getShelfDepth({ name: shelfName });

    if (!binShelves.value[shelfName]) {
      binShelves.value[shelfName] = [];
    }
    const shelfBins = binShelves.value[shelfName];

    let position = { x: 0, y: 0 };
    let placed = false;

    for (
      let possibleY = 0;
      !placed && possibleY + bin.depth <= shuttleDepth;

    ) {
      for (
        let possibleX = 0;
        !placed && possibleX + bin.width <= shuttleWidth;

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
      shelfBins.push({ ...bin, position, description: bin.description || "" });
      saveState();
    }
  };

  const removeBinFromShelf = (selectedShelf, selectedBin) => {
    if (selectedBin && selectedShelf) {
      binShelves.value[selectedShelf] = binShelves.value[selectedShelf].filter(
        (bin) => bin !== selectedBin
      );
    }
    saveState();
  };

  const setDescriptionForBins = (shelfName, binsToDescribe, description) => {
    if (!binShelves.value[shelfName]) return;
    binShelves.value[shelfName].forEach((bin) => {
      if (binsToDescribe.includes(bin)) {
        bin.description = description;
      }
    });
    saveState();
  };

  loadState();

  return {
    bins,
    binShelves,
    addBin,
    addBinToShelf,
    removeBinFromShelf,
    setDescriptionForBins,
  };
});
