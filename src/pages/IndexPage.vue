<template>
  <div>
    <q-splitter v-model="splitterModel">
      <template v-slot:before>
        <div class="q-pa-md">
          <q-btn
            @click="shuttleStore.addShuttle"
            label="Add Shuttle"
            color="primary"
            class="q-mb-md"
          />
          <q-btn
            @click="shuttleStore.addShelfToSelectedShuttle(selectedShuttle)"
            label="Add Shelf"
            :disable="!selectedShuttle"
            color="secondary"
            class="q-mb-md"
          />
          <q-btn
            @click="showBinDialog = true"
            label="Manage Bins"
            color="accent"
            class="q-mb-md"
          />
          <q-tree
            :nodes="shuttleStore.simple"
            node-key="label"
            selected-color="primary"
            v-model:selected="selected"
            default-expand-all
            @update:selected="updateSelectedShuttle"
          />
        </div>
      </template>

      <template v-slot:after>
        <q-tab-panels
          v-model="selected"
          animated
          transition-prev="jump-up"
          transition-next="jump-up"
        >
          <q-tab-panel
            v-for="shuttle in shuttleStore.shuttleDetails"
            :key="shuttle.name"
            :name="shuttle.name"
          >
            <div class="q-gutter-md q-mb-md">
              <div class="text-h4">{{ shuttle.title }}</div>
              <q-input
                v-model="shuttle.editName"
                label="Shuttle Name"
                filled
                class="q-mb-md"
                @blur="onShuttleNameChange(shuttle)"
              />
              <q-input
                v-model="shuttle.width"
                label="Width"
                filled
                type="number"
                class="q-mb-md"
              />
              <q-input
                v-model="shuttle.depth"
                label="Depth"
                filled
                type="number"
                class="q-mb-md"
              />
              <q-btn
                @click="shuttleStore.removeShuttle(shuttle.name)"
                label="Remove Shuttle"
                color="negative"
                outlined
                class="q-mb-md"
              />
            </div>
          </q-tab-panel>

          <q-tab-panel
            v-for="shelf in shuttleStore.shelfDetails"
            :key="shelf.name"
            :name="shelf.name"
          >
            <div class="display: flex; flex-direction: column;">
              <div class="text-h4">{{ shelf.title }}</div>
              <q-btn
                @click="showBinSelector(shelf.name)"
                label="Add Bin to Shelf"
                color="primary"
                class="q-mb-md"
              />
              <q-btn
                @click="shuttleStore.removeShelf(shelf.name)"
                label="Remove Shelf"
                color="negative"
                outlined
                class="q-mb-md"
              />
              <div class="shelf-container">
                <!-- Add Description for ALL bins on this shelf -->
                <q-btn
                  class="q-mb-sm"
                  color="accent"
                  icon="edit"
                  label="Set Description for All Bins"
                  @click="openBinDescriptionDialogForAll(shelf.name)"
                />

                <!-- Button to duplicate shelf and bins -->
                <q-btn
                  class="q-mb-sm q-ml-sm"
                  color="primary"
                  icon="content_copy"
                  label="Duplicate Shelf (with bins)"
                  @click="openDuplicateShelfDialog(shelf.name)"
                />

                <svg
                  :ref="(el) => (svgRefs[shelf.name] = el)"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  style="touch-action: none; user-select: none"
                  @mousedown="onSvgMouseDown(shelf.name, $event)"
                >
                  <g
                    v-for="(bin, index) in binStore.binShelves[shelf.name]"
                    :key="index"
                  >
                    <rect
                      :x="
                        (bin.position.x / shuttleStore.getShelfWidth(shelf)) *
                        100
                      "
                      :y="
                        (bin.position.y / shuttleStore.getShelfDepth(shelf)) *
                        100
                      "
                      :width="
                        (bin.width / shuttleStore.getShelfWidth(shelf)) * 100
                      "
                      :height="
                        (bin.depth / shuttleStore.getShelfDepth(shelf)) * 100
                      "
                      :fill="getBinFillColor(bin)"
                      :stroke="
                        selectedBins.includes(bin) ? '#FF9800' : '#0D47A1'
                      "
                      :stroke-width="selectedBins.includes(bin) ? 2 : 0.5"
                      @click.stop="selectBin(shelf.name, bin, $event)"
                      @contextmenu.prevent.stop="
                        openBinDescriptionDialog(shelf.name, bin, $event)
                      "
                      :title="bin.description || ''"
                      style="pointer-events: auto"
                    />
                    <!-- Bin number label (x+y) centered over rect -->
                    <!-- <text
                      :x="
                        ((bin.position.x + bin.width / 2) /
                          shuttleStore.getShelfWidth(shelf)) *
                        100
                      "
                      :y="
                        ((bin.position.y + bin.depth / 2) /
                          shuttleStore.getShelfDepth(shelf)) *
                        100
                      "
                      font-size="4"
                      fill="#222"
                      text-anchor="middle"
                      alignment-baseline="middle"
                      pointer-events="none"
                    >
                      {{ Math.round(bin.position.x) }}+{{
                        Math.round(bin.position.y)
                      }}
                    </text> -->
                  </g>
                  <!-- Selection rectangle (overlay) -->
                  <rect
                    v-if="isSelecting && currentShelf === shelf.name"
                    :x="Math.min(selectRect.x1, selectRect.x2)"
                    :y="Math.min(selectRect.y1, selectRect.y2)"
                    :width="Math.abs(selectRect.x2 - selectRect.x1)"
                    :height="Math.abs(selectRect.y2 - selectRect.y1)"
                    fill="rgba(33,150,243,0.2)"
                    stroke="#2196F3"
                    stroke-width="1"
                    pointer-events="none"
                  />
                </svg>
              </div>
              <!-- Table under shelf with Bin List & Description -->
              <q-table
                dense
                class="q-mt-md"
                :rows="binStore.binShelves[shelf.name] || []"
                :columns="[
                  {
                    name: 'number',
                    label: '#(X+Y)',
                    field: (row) =>
                      row.position
                        ? Math.round(row.position.x) +
                          '+' +
                          Math.round(row.position.y)
                        : '',
                    align: 'left',
                  },
                  {
                    name: 'name',
                    label: 'Bin Name',
                    field: 'name',
                    align: 'left',
                  },
                  {
                    name: 'description',
                    label: 'Description',
                    field: 'description',
                    align: 'left',
                  },
                ]"
                row-key="name"
                hide-bottom
                flat
                separator="horizontal"
                :pagination="{ rowsPerPage: 100 }"
              >
                <template v-slot:body-cell-number="props">
                  <q-td
                    >{{ Math.round(props.row.position.x) }}+{{
                      Math.round(props.row.position.y)
                    }}</q-td
                  >
                </template>
                <template v-slot:body-cell-name="props">
                  <q-td>{{ props.row.name }}</q-td>
                </template>
                <template v-slot:body-cell-description="props">
                  <q-td>{{ props.row.description }}</q-td>
                </template>
              </q-table>
              <!-- <div v-if="selectedBins.length && currentShelf === shelf.name">
                <div
                  v-for="bin in selectedBins"
                  :key="bin.name + '-' + bin.position.x + '-' + bin.position.y"
                >
                  <q-chip color="amber-2" class="q-mt-sm q-mr-sm">
                    {{ bin.name }} - {{ bin.description || "No description" }}
                  </q-chip>
                </div>
              </div> -->
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-splitter>

    <q-dialog v-model="showBinDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Manage Bins</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="binData.name" label="Bin Name" filled />
          <q-input
            v-model.number="binData.width"
            label="Width"
            filled
            type="number"
          />
          <q-input
            v-model.number="binData.depth"
            label="Depth"
            filled
            type="number"
          />
          <q-btn flat label="Add Bin" color="primary" @click="addNewBin" />
          <q-list bordered>
            <q-item v-for="bin in binStore.bins" :key="bin.name">
              <q-item-section>
                <q-item-label>
                  {{ bin.name }} ({{ bin.width }}x{{ bin.depth }})
                </q-item-label>
                <q-btn
                  flat
                  icon="add"
                  color="positive"
                  @click.stop="selectBinForShelf(bin)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showBinDescriptionDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">
            Set Description for Selected Bins ({{ selectedBins.length }})
          </div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="descriptionInput"
            type="textarea"
            label="Description"
            filled
            autofocus
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            color="primary"
            label="Apply"
            @click="setDescriptionForSelectedBins"
          />
          <q-btn flat label="Cancel" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Duplicate Shelf Dialog -->
    <q-dialog v-model="showDuplicateShelfDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">
            Duplicate Shelf:
            <span class="text-primary">{{ shelfToDuplicate }}</span>
          </div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model.number="duplicateCount"
            label="Number of Duplicates"
            type="number"
            min="1"
            filled
          />
          <q-checkbox
            v-model="duplicateBins"
            label="Copy Bins"
            class="q-mt-md"
          />
          <q-checkbox
            v-model="duplicateDescriptions"
            label="Copy Bin Descriptions"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Cancel" color="grey" v-close-popup />
          <q-btn label="Duplicate" color="primary" @click="runDuplicateShelf" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useShuttleStore } from "../stores/useShuttleStore";
import { useBinStore } from "../stores/useBinStore";

import { useQuasar } from "quasar";

export default {
  setup() {
    const $q = useQuasar();
    const shuttleStore = useShuttleStore();
    const binStore = useBinStore();

    const showDuplicateShelfDialog = ref(false);
    const shelfToDuplicate = ref("");
    const duplicateCount = ref(1);
    const duplicateBins = ref(true);
    const duplicateDescriptions = ref(true);

    const splitterModel = ref(30);
    const selected = ref("Shuttle 001");
    const selectedShuttle = ref("");
    const showBinDialog = ref(false);
    const binData = ref({
      name: "",
      width: 0,
      depth: 0,
    });

    const selectedBins = ref([]);
    const selectedShelf = ref(null);

    // Drag selection state
    const svgRefs = {};
    const isSelecting = ref(false);
    const selectRect = ref({ x1: 0, y1: 0, x2: 0, y2: 0 });
    const currentShelf = ref("");

    function getSvgCoords(event, shelfName) {
      const svg = svgRefs[shelfName];
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      };
    }

    function onSvgMouseDown(shelfName, event) {
      if (event.button !== 0) return;
      currentShelf.value = shelfName;
      isSelecting.value = true;
      // If Ctrl/Meta is NOT pressed, start a new selection. Otherwise add to existing selection.
      if (!(event.ctrlKey || event.metaKey)) {
        selectedBins.value = [];
      }
      const { x, y } = getSvgCoords(event, shelfName);
      selectRect.value = { x1: x, y1: y, x2: x, y2: y };
      const move = (e) => onSvgMouseMove(e, shelfName, event);
      const up = (e) => {
        onSvgMouseUp(e);
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    }

    function onSvgMouseMove(event, shelfName, originEvent) {
      if (!isSelecting.value) return;
      const { x, y } = getSvgCoords(event, shelfName);
      selectRect.value.x2 = x;
      selectRect.value.y2 = y;
      const [xMin, xMax] = [
        Math.min(selectRect.value.x1, x),
        Math.max(selectRect.value.x1, x),
      ];
      const [yMin, yMax] = [
        Math.min(selectRect.value.y1, y),
        Math.max(selectRect.value.y1, y),
      ];
      const shelfBins = binStore.binShelves[shelfName] || [];
      const binsInRect = shelfBins.filter((bin) => {
        const binX =
          (bin.position.x / shuttleStore.getShelfWidth({ name: shelfName })) *
          100;
        const binY =
          (bin.position.y / shuttleStore.getShelfDepth({ name: shelfName })) *
          100;
        const binW =
          (bin.width / shuttleStore.getShelfWidth({ name: shelfName })) * 100;
        const binH =
          (bin.depth / shuttleStore.getShelfDepth({ name: shelfName })) * 100;
        return !(
          binX + binW < xMin ||
          binX > xMax ||
          binY + binH < yMin ||
          binY > yMax
        );
      });

      // If Ctrl/Meta is pressed (preserved from mouseDown), add to existing
      if (originEvent && (originEvent.ctrlKey || originEvent.metaKey)) {
        selectedBins.value = [
          ...selectedBins.value,
          ...binsInRect.filter((b) => !selectedBins.value.includes(b)),
        ];
      } else {
        // No modifier: replace
        selectedBins.value = binsInRect;
      }
    }

    function onSvgMouseUp(event) {
      isSelecting.value = false;
    }

    // Description dialog state
    const showBinDescriptionDialog = ref(false);
    const descriptionInput = ref("");

    const updateSelectedShuttle = (newSelection) => {
      if (!newSelection) return;
      const parts = newSelection.split(" - ");
      selectedShuttle.value = parts.length > 1 ? parts[0] : newSelection;
    };

    const onShuttleNameChange = (shuttle) => {
      if (shuttle.name !== shuttle.editName) {
        shuttleStore.updateShuttleName(shuttle.name, shuttle.editName);
        shuttle.name = shuttle.editName;
        shuttle.title = `${shuttle.editName} Setup`;
      }
    };

    const addNewBin = () => {
      binStore.addBin({ ...binData.value });
      binData.value = { name: "", width: 0, depth: 0 };
    };

    const selectBinForShelf = (bin) => {
      if (selectedShuttle.value) {
        binStore.addBinToShelf(selectedShuttle.value, bin);
      }
    };

    const showBinSelector = (shelfName) => {
      selectedShuttle.value = shelfName;
      showBinDialog.value = true;
    };

    // Multi-bin select support
    const selectBin = (shelfName, bin, event) => {
      selectedShelf.value = shelfName;
      if (isSelecting.value) return;
      // Accept Control, Meta (Cmd/Strg), or Shift for additive selection
      if (event && (event.ctrlKey || event.metaKey)) {
        if (selectedBins.value.includes(bin)) {
          selectedBins.value = selectedBins.value.filter((b) => b !== bin);
        } else {
          selectedBins.value = [...selectedBins.value, bin];
        }
      } else {
        selectedBins.value = [bin];
      }
      currentShelf.value = shelfName;
    };

    const openBinDescriptionDialog = (shelfName, bin, event) => {
      selectedShelf.value = shelfName;
      currentShelf.value = shelfName;
      if (!selectedBins.value.includes(bin)) {
        selectedBins.value = [bin];
      }
      showBinDescriptionDialog.value = true;
      descriptionInput.value = selectedBins.value[0]?.description || "";
    };

    const setDescriptionForSelectedBins = () => {
      if (!selectedShelf.value || !selectedBins.value.length) return;
      binStore.setDescriptionForBins(
        selectedShelf.value,
        selectedBins.value,
        descriptionInput.value
      );
      showBinDescriptionDialog.value = false;
      selectedBins.value = [];
    };

    // Delete selected bins (optional)
    const removeSelectedBin = () => {
      if (selectedBins.value.length && selectedShelf.value) {
        selectedBins.value.forEach((bin) => {
          binStore.removeBinFromShelf(selectedShelf.value, bin);
        });
        selectedBins.value = [];
        selectedShelf.value = null;
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Delete" && selectedBins.value.length) {
        removeSelectedBin();
      }
    };

    onMounted(() => {
      window.addEventListener("keydown", handleKeyDown);
    });
    onBeforeUnmount(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });

    function getBinFillColor(bin) {
      // Selected and has description: yellowish
      if (selectedBins.value.includes(bin)) {
        return bin.description ? "#FFD54F" : "#E57373"; // yellow or red
      }
      // Not selected, but has description: blue; no description: grey
      return bin.description ? "#42A5F5" : "#B0BEC5";
    }

    function openBinDescriptionDialogForAll(shelfName) {
      const shelfBins = binStore.binShelves[shelfName] || [];
      if (!shelfBins.length) return;
      selectedShelf.value = shelfName;
      currentShelf.value = shelfName;
      selectedBins.value = [...shelfBins];
      showBinDescriptionDialog.value = true;
      descriptionInput.value = shelfBins[0].description || "";
    }

    function openDuplicateShelfDialog(shelfName) {
      shelfToDuplicate.value = shelfName;
      duplicateCount.value = 1;
      duplicateBins.value = true;
      duplicateDescriptions.value = true;
      showDuplicateShelfDialog.value = true;
    }

    function duplicateShelfWithBins(shelfName) {
      // Find the existing shelf object from shuttleStore
      const sourceShelf = shuttleStore.shelfDetails.find(
        (s) => s.name === shelfName
      );
      if (!sourceShelf) {
        $q.notify({ color: "negative", message: "Shelf not found!" });
        return;
      }
      // Add shelf to the store/shuttle
      const newShelf = shuttleStore.addShelfToSelectedShuttle(
        selectedShuttle.value
      );

      // Duplicate all bins in the shelf
      if (binStore.binShelves[shelfName]) {
        // Deep clone bins
        const binsForNewShelf = binStore.binShelves[shelfName].map((bin) => ({
          ...JSON.parse(JSON.stringify(bin)),
        }));
        binStore.binShelves[newShelf] = binsForNewShelf;
        binStore.$patch({ binShelves: { ...binStore.binShelves } });
        binStore.saveState();
      }
      $q.notify({
        color: "positive",
        message: `Shelf "${newShelf}" duplicated with bins.`,
      });
    }

    function runDuplicateShelf() {
      const origShelfName = shelfToDuplicate.value;
      if (!origShelfName || duplicateCount.value < 1) {
        $q.notify({ color: "negative", message: "Please enter valid values." });
        return;
      }
      const origShelf = shuttleStore.shelfDetails.find(
        (s) => s.name === origShelfName
      );
      if (!origShelf) {
        $q.notify({ color: "negative", message: "Shelf not found!" });
        return;
      }
      for (let i = 1; i <= duplicateCount.value; i++) {
        const newShelf = shuttleStore.addShelfToSelectedShuttle(
          selectedShuttle.value
        );

        // Duplicate bins if the checkbox is checked
        if (duplicateBins.value && binStore.binShelves[origShelfName]) {
          const binsForNewShelf = binStore.binShelves[origShelfName].map(
            (bin) => {
              const newBin = { ...JSON.parse(JSON.stringify(bin)) };
              if (!duplicateDescriptions.value) {
                newBin.description = "";
              }
              return newBin;
            }
          );
          binStore.binShelves[newShelf] = binsForNewShelf;
          binStore.$patch({ binShelves: { ...binStore.binShelves } });
          binStore.saveState();
        } else {
          // If not duplicating bins, create empty shelf.bins
          binStore.binShelves[newShelf] = [];
          binStore.$patch({ binShelves: { ...binStore.binShelves } });
          binStore.saveState();
        }
      }
      $q.notify({
        color: "positive",
        message: `Duplicated ${duplicateCount.value} shelf(es)${
          duplicateBins.value
            ? duplicateDescriptions.value
              ? " with bins and descriptions."
              : " with bins (no descriptions)."
            : " (no bins)."
        }`,
      });
      showDuplicateShelfDialog.value = false;
    }

    return {
      splitterModel,
      selected,
      selectedShuttle,
      showBinDialog,
      binData,
      shuttleStore,
      binStore,
      shelfToDuplicate,
      duplicateCount,
      duplicateBins,
      duplicateDescriptions,
      showDuplicateShelfDialog,

      getBinFillColor,
      updateSelectedShuttle,
      onShuttleNameChange,
      addNewBin,
      selectBinForShelf,
      showBinSelector,

      selectedBins,
      selectedShelf,
      selectBin,
      showBinDescriptionDialog,
      openBinDescriptionDialog,
      descriptionInput,
      setDescriptionForSelectedBins,
      openBinDescriptionDialogForAll,
      runDuplicateShelf,
      openDuplicateShelfDialog,

      svgRefs,
      isSelecting,
      selectRect,
      currentShelf,
      onSvgMouseDown,
    };
  },
};
</script>

<style scoped>
.q-pa-md {
  padding: 16px;
}
.q-mb-md {
  margin-bottom: 16px;
}
.q-gutter-md {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.shelf-container {
  width: 350px;
  height: 250px;
  max-width: 100%;
  max-height: 100%;
}
svg {
  width: 100%;
  height: 100%;
  user-select: none;
  background-color: #dff1fc;
  border: 1px dotted #616161;
  padding: 2px;
}
</style>
