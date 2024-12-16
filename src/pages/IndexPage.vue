<template>
  <div>
    <q-splitter v-model="splitterModel" style="height: 400px">
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
            <div class="q-gutter-md q-mb-md">
              <div class="text-h4">{{ shelf.title }}</div>
              <q-btn
                @click="showBinSelector(shelf.name)"
                label="Add Bin to Shelf"
                color="primary"
                class="q-mb-md"
              />
              <!-- SVG representing the shelf and bins -->
              <div class="shelf-container">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                  <rect
                    v-for="(bin, index) in binStore.binShelves[shelf.name]"
                    :key="index"
                    :x="
                      (bin.position.x / shuttleStore.getShelfWidth(shelf)) * 100
                    "
                    :y="
                      (bin.position.y / shuttleStore.getShelfDepth(shelf)) * 100
                    "
                    :width="
                      (bin.width / shuttleStore.getShelfWidth(shelf)) * 100
                    "
                    :height="
                      (bin.depth / shuttleStore.getShelfDepth(shelf)) * 100
                    "
                    :fill="selectedBin === bin ? '#FFD54F' : '#42A5F5'"
                    :stroke="selectedBin === bin ? '#FF9800' : '#0D47A1'"
                    :stroke-width="selectedBin === bin ? 2 : 0.5"
                    @click.stop="selectBin(shelf.name, bin)"
                  />
                </svg>
              </div>
              <p v-for="content in shelf.content" :key="content">
                {{ content }}
              </p>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-splitter>

    <!-- Dialog for managing bins -->
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
                <q-item-label
                  >{{ bin.name }} ({{ bin.width }}x{{
                    bin.depth
                  }})</q-item-label
                >
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
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useShuttleStore } from "../stores/useShuttleStore";
import { useBinStore } from "../stores/useBinStore";

export default {
  setup() {
    const shuttleStore = useShuttleStore();
    const binStore = useBinStore();

    const splitterModel = ref(50);
    const selected = ref("Shuttle 001");
    const selectedShuttle = ref("");
    const showBinDialog = ref(false);
    const binData = ref({
      name: "",
      width: 0,
      depth: 0,
    });
    const selectedBin = ref(null); // Track the selected bin
    const selectedShelf = ref(null); // Track the selected shelf

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
      binData.value = { name: "", width: 0, depth: 0 }; // Reset form
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

    const selectBin = (shelfName, bin) => {
      selectedShelf.value = shelfName;
      selectedBin.value = bin;
    };

    const removeSelectedBin = () => {
      if (selectedBin.value && selectedShelf.value) {
        binStore.binShelves[selectedShelf.value] = binStore.binShelves[
          selectedShelf.value
        ].filter((bin) => bin !== selectedBin.value);
        selectedBin.value = null;
        selectedShelf.value = null;
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Delete" && selectedBin.value) {
        removeSelectedBin();
      }
    };

    // Add and remove event listeners for keydown
    onMounted(() => {
      window.addEventListener("keydown", handleKeyDown);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });

    return {
      splitterModel,
      selected,
      selectedShuttle,
      showBinDialog,
      binData,
      selectedBin,
      selectedShelf,
      shuttleStore,
      binStore,
      updateSelectedShuttle,
      onShuttleNameChange,
      addNewBin,
      selectBinForShelf,
      showBinSelector,
      selectBin,
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
/* Styles to ensure the SVG scales responsively */
.shelf-container {
  width: 100%;
  height: 300px; /* You can adjust this height for better UX */
  max-width: 100%;
  max-height: 100%;
}

svg {
  width: 100%;
  height: 100%;
}
</style>
