// src/stores/useShuttleStore.js
import { defineStore } from "pinia";
import { ref } from "vue";

export const useShuttleStore = defineStore("shuttle", () => {
  const simple = ref([
    {
      label: "Shuttle 001",
      children: [
        { label: "Shuttle 001 - Shelve 001", icon: "view_module" },
        { label: "Shuttle 001 - Shelve 002", icon: "view_module" },
        { label: "Shuttle 001 - Shelve 003", icon: "view_module" },
      ],
    },
  ]);

  const shuttleDetails = ref([
    {
      name: "Shuttle 001",
      editName: "Shuttle 001",
      title: "Shuttle 001 Setup",
      width: 200, // example width
      depth: 300, // example depth (serves as height)
    },
  ]);

  const shelfDetails = ref([
    {
      name: "Shuttle 001 - Shelve 001",
      title: "Welcome",
      content: ["Lorem ipsum dolor sit.", "Another lorem ipsum paragraph."],
    },
    {
      name: "Shuttle 001 - Shelve 002",
      title: "Food",
      content: ["Lorem ipsum dolor sit.", "Another lorem ipsum paragraph."],
    },
    {
      name: "Shuttle 001 - Shelve 003",
      title: "Room view",
      content: ["Lorem ipsum dolor sit.", "Another lorem ipsum paragraph."],
    },
  ]);

  const shelfCounters = ref({ "Shuttle 001": 4 });

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
