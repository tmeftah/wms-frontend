import { defineStore } from "pinia";
import { ref } from "vue";
import { useBinStore } from "./useBinStore"; // Import the bin store to manage related bins

export const useShuttleStore = defineStore("shuttle", () => {
  const simple = ref([]);
  const shuttleDetails = ref([]);
  const shelfDetails = ref([]);
  const shelfCounters = ref({});

  const loadState = () => {
    if (localStorage.getItem("shuttleStore")) {
      const savedState = JSON.parse(localStorage.getItem("shuttleStore"));
      simple.value = savedState.simple || [];
      shuttleDetails.value = savedState.shuttleDetails || [];
      shelfDetails.value = savedState.shelfDetails || [];
      shelfCounters.value = savedState.shelfCounters || {};
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
      })
    );
  };

  const addShuttle = () => {
    const shuttleCount = simple.value.length + 1;
    const newShuttleLabel = `Shuttle ${String(shuttleCount).padStart(3, "0")}`;

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
      content: ["Lorem ipsum dolor sit.", "Another lorem ipsum paragraph."],
    });

    shelfCounters.value[selectedShuttle] += 1;
    saveState();
  };

  const updateShuttleName = (oldName, newName) => {
    const shuttle = simple.value.find((sh) => sh.label === oldName);
    if (shuttle) {
      shuttle.label = newName;

      shuttle.children.forEach((child) => {
        const suffix = child.label.split(" - ")[1];
        child.label = `${newName} - ${suffix}`;

        const shelf = shelfDetails.value.find(
          (s) => s.name === `${oldName} - ${suffix}`
        );
        if (shelf) {
          shelf.name = child.label;
          shelf.title = `New ${child.label}`;
        }
      });
      saveState();
    }
  };

  const removeShuttle = (shuttleName) => {
    const binStore = useBinStore(); // Access the bin store
    simple.value = simple.value.filter(
      (shuttle) => shuttle.label !== shuttleName
    );
    shuttleDetails.value = shuttleDetails.value.filter(
      (shuttle) => shuttle.name !== shuttleName
    );

    // Remove all shelves associated with this shuttle
    shelfDetails.value = shelfDetails.value.filter(
      (shelf) => !shelf.name.startsWith(shuttleName)
    );
    delete shelfCounters.value[shuttleName];

    // Remove all bins from the removed shelves
    Object.keys(binStore.binShelves).forEach((shelfName) => {
      if (shelfName.startsWith(shuttleName)) {
        delete binStore.binShelves[shelfName];
      }
    });

    saveState();
    binStore.saveState(); // Save bin store changes
  };

  const removeShelf = (shelfName) => {
    const [shuttleName] = shelfName.split(" - Shelve");
    const shuttle = simple.value.find(
      (sh) => sh.label.trim() === shuttleName.trim()
    );
    if (shuttle) {
      shuttle.children = shuttle.children.filter(
        (child) => child.label.trim() !== shelfName.trim()
      );
    }
    shelfDetails.value = shelfDetails.value.filter(
      (shelf) => shelf.name.trim() !== shelfName.trim()
    );
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

  loadState();

  return {
    simple,
    shuttleDetails,
    shelfDetails,
    addShuttle,
    addShelfToSelectedShuttle,
    updateShuttleName,
    removeShuttle,
    removeShelf,
    getShelfWidth,
    getShelfDepth,
  };
});
