// useShuttleStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { useBinStore } from "./useBinStore";

export const useShuttleStore = defineStore("shuttle", () => {
  const simple = ref([]);
  const shuttleDetails = ref([]);
  const shelfDetails = ref([]);
  const shelfCounters = ref({});
  const binShelves = ref({}); // **Moved from BinStore**

  const loadState = () => {
    if (localStorage.getItem("shuttleStore")) {
      const savedState = JSON.parse(localStorage.getItem("shuttleStore"));
      simple.value = savedState.simple || [];
      shuttleDetails.value = savedState.shuttleDetails || [];
      shelfDetails.value = savedState.shelfDetails || [];
      shelfCounters.value = savedState.shelfCounters || {};
      binShelves.value = savedState.binShelves || {};
    }
  };

  const saveState = () => {
    localStorage.setItem(
      "shuttleStore",
      JSON.stringify({
        simple: simple.value,
        shuttleDetails: shuttleDetails.value,
        shelfDetails: shelfDetails.value,
        shelfCounters: shelfCounters.value,
        binShelves: binShelves.value,
      })
    );
  };

  const getNextShuttleNumber = () => {
    const numbers = simple.value
      .map((shuttle) => parseInt(shuttle.label.split(" ")[1], 10))
      .sort((a, b) => a - b);
    let nextNumber = 1;
    for (let i = 0; i < numbers.length; i++) {
      if (numbers[i] !== nextNumber) break;
      nextNumber++;
    }
    return nextNumber;
  };

  const addShuttle = () => {
    const nextShuttleNumber = getNextShuttleNumber();
    const newShuttleLabel = `Shuttle ${String(nextShuttleNumber).padStart(
      3,
      "0"
    )}`;

    simple.value.push({
      label: newShuttleLabel,
      children: [],
    });
    shuttleDetails.value.push({
      name: newShuttleLabel,
      editName: newShuttleLabel,
      title: `${newShuttleLabel} Setup`,
      width: 200,
      depth: 300,
      empty: true, // New shuttle is empty on creation
    });
    shelfCounters.value[newShuttleLabel] = 1;
    saveState();
  };

  const addShelfToSelectedShuttle = (selectedShuttle) => {
    if (!selectedShuttle) return;
    const currentShelfCount = shelfCounters.value[selectedShuttle];
    const newShelfLabel = `${selectedShuttle} - Shelve ${String(
      currentShelfCount
    ).padStart(3, "0")}`;
    const shuttleIndex = simple.value.findIndex(
      (shuttle) => shuttle.label === selectedShuttle
    );
    simple.value[shuttleIndex].children.push({
      label: newShelfLabel,
      icon: "view_module",
    });
    shelfDetails.value.push({
      name: newShelfLabel,
      title: `New ${newShelfLabel}`,
      content: ["20 Bins 20x20", "10 Bins 50x50"],
    });
    shelfCounters.value[selectedShuttle] += 1;
    binShelves.value[newShelfLabel] = [];

    // Set empty = false for this shuttle
    const shuttleDetail = shuttleDetails.value.find(
      (sd) => sd.name === selectedShuttle
    );
    if (shuttleDetail) {
      shuttleDetail.empty = false;
    }

    saveState();
    return newShelfLabel;
  };

  const updateShuttle = (oldShuttle) => {
    const oldName = oldShuttle.name;
    const newName = oldShuttle.editName;
    const width = oldShuttle.width;
    const depth = oldShuttle.depth;

    console.log(oldName, newName, width, depth);

    const shuttle = simple.value.find((sh) => sh.label === oldName);
    const shuttleDetail = shuttleDetails.value.find(
      (sd) => sd.name === oldName
    );

    // Allow update ONLY if empty
    if (!shuttleDetail || shuttleDetail.empty !== true) return;

    // Update shuttle label in simple array
    if (shuttle) {
      if (newName && newName !== oldName) {
        shuttle.label = newName;

        // Update all shelf labels under this shuttle
        shuttle.children.forEach((child) => {
          const suffix = child.label.split(" - ")[1];
          const oldShelfLabel = child.label;
          child.label = `${newName} - ${suffix}`;

          // Update shelf name/title
          const shelf = shelfDetails.value.find(
            (s) => s.name === `${oldName} - ${suffix}`
          );
          if (shelf) {
            shelf.name = child.label;
            shelf.title = `New ${child.label}`;
          }

          // Rename binShelves key if exists
          if (binShelves.value[oldShelfLabel]) {
            binShelves.value[child.label] = binShelves.value[oldShelfLabel];
            delete binShelves.value[oldShelfLabel];
          }
        });

        // Update any references in shelfCounters if necessary
        shelfCounters.value[newName] = shelfCounters.value[oldName];
        delete shelfCounters.value[oldName];
      }
    }

    // Update shuttleDetails properties
    if (shuttleDetail) {
      if (newName && newName !== oldName) {
        shuttleDetail.name = newName;
        shuttleDetail.editName = newName;
        shuttleDetail.title = `${newName} Setup`;
      }
      if (typeof width === "number") {
        shuttleDetail.width = width;
      }
      if (typeof depth === "number") {
        shuttleDetail.depth = depth;
      }
    }

    saveState();
  };
  const removeShuttle = (shuttleName) => {
    simple.value = simple.value.filter(
      (shuttle) => shuttle.label !== shuttleName
    );
    shuttleDetails.value = shuttleDetails.value.filter(
      (shuttle) => shuttle.name !== shuttleName
    );
    shelfDetails.value = shelfDetails.value.filter(
      (shelf) => !shelf.name.startsWith(shuttleName)
    );
    delete shelfCounters.value[shuttleName];
    // Remove bins from all shelves under this shuttle
    Object.keys(binShelves.value).forEach((shelfName) => {
      if (shelfName.startsWith(shuttleName)) {
        delete binShelves.value[shelfName];
      }
    });
    saveState();
  };

  const removeShelf = (shelfName) => {
    shelfDetails.value = shelfDetails.value.filter(
      (shelf) => shelf.name !== shelfName
    );
    let parentShuttle;
    simple.value.forEach((shuttle) => {
      shuttle.children = shuttle.children.filter((child) => {
        if (child.label === shelfName) {
          parentShuttle = shuttle.label;
          return false;
        }
        return true;
      });
    });
    delete binShelves.value[shelfName];

    // If the shuttle now has no shelfs, set its empty = true
    if (parentShuttle) {
      const hasShelves =
        simple.value.find((shuttle) => shuttle.label === parentShuttle)
          ?.children.length > 0;
      const shuttleDetail = shuttleDetails.value.find(
        (sd) => sd.name === parentShuttle
      );
      if (shuttleDetail) {
        shuttleDetail.empty = !hasShelves;
      }
    }

    saveState();
  };

  const getShelfWidth = (shelf) => {
    const shuttle = shuttleDetails.value.find((s) =>
      s.name.includes(shelf.name.split(" - ")[0])
    );
    return shuttle ? shuttle.width : 100;
  };

  const getShelfDepth = (shelf) => {
    const shuttle = shuttleDetails.value.find((s) =>
      s.name.includes(shelf.name.split(" - ")[0])
    );
    return shuttle ? shuttle.depth : 100;
  };

  // ================ BIN METHODS MOVED IN ================

  const addBinToShelf = (shelfName, bin) => {
    const shuttleWidth = getShelfWidth({ name: shelfName });
    const shuttleDepth = getShelfDepth({ name: shelfName });

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
    if (selectedBin && selectedShelf && binShelves.value[selectedShelf]) {
      binShelves.value[selectedShelf] = binShelves.value[selectedShelf].filter(
        (bin) => bin !== selectedBin
      );
      saveState();
    }
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

  const isShuttleEmpty = (shuttleName) => {
    const shuttleDetail = shuttleDetails.value.find(
      (sd) => sd.name === shuttleName
    );
    return !!(shuttleDetail && shuttleDetail.empty === true);
  };
  loadState();

  return {
    // structure
    simple,
    shuttleDetails,
    shelfDetails,
    shelfCounters,
    binShelves,

    // structure operations
    addShuttle,
    addShelfToSelectedShuttle,
    updateShuttle,
    removeShuttle,
    removeShelf,
    getShelfWidth,
    getShelfDepth,
    isShuttleEmpty,

    // bin operations (now managed here)
    addBinToShelf,
    removeBinFromShelf,
    setDescriptionForBins,

    // state mgmt
    saveState,
  };
});
