import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const useShuttleStore = defineStore("shuttle", () => {
  const simple = ref([]);
  const shuttleDetails = ref([]);
  const shelfDetails = ref([]);
  const shelfCounters = ref({});

  // Function to load state from localStorage
  const loadState = () => {
    if (localStorage.getItem("shuttleStore")) {
      const savedState = JSON.parse(localStorage.getItem("shuttleStore"));
      simple.value = savedState.simple || [];
      shuttleDetails.value = savedState.shuttleDetails || [];
      shelfDetails.value = savedState.shelfDetails || [];
      shelfCounters.value = savedState.shelfCounters || {};
    }
  };

  // Function to save state to localStorage
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
    saveState(); // Save new state
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
    saveState(); // Save new state
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
      saveState(); // Save new state
    }
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
    saveState(); // Save new state
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
    saveState(); // Save new state
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

  // Load state when the store initializes
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
