<template>
  <div>
    <!-- SPLITTER LAYOUT -->
    <q-splitter
      v-model="splitterModel"
      separator-style="{ backgroundColor: '#ff0000', }"
      :limits="[30, 70]"
    >
      <template v-slot:separator>
        <q-avatar
          color="info"
          text-color="white"
          size="30px"
          icon="drag_indicator"
        />
      </template>
      <!-- LEFT: SHUTTLES & SHELVES -->
      <template v-slot:before>
        <q-card class="q-pa-lg q-mt-md" flat>
          <div class="text-h6 q-mb-lg">Shuttles &amp; Shelves</div>
          <div class="row q-col-gutter-sm q-mb-lg">
            <q-btn
              @click="shuttleStore.addShuttle"
              label="Add Shuttle"
              color="primary"
              icon="add"
              flat
            />
            <q-btn
              @click="shuttleStore.addShelfToSelectedShuttle(selectedShuttle)"
              label="Add Shelf"
              :disable="!selectedShuttle"
              color="secondary"
              icon="add_circle"
              flat
            />
            <q-btn
              @click="showBinDialog = true"
              label="Manage Bins"
              color="accent"
              icon="dashboard"
              flat
            />
          </div>
          <q-separator spaced color="grey-3" />
          <q-scroll-area style="height: 80vh">
            <q-tree
              :nodes="shuttleStore.simple"
              node-key="label"
              selected-color="primary"
              v-model:selected="selected"
              default-expand-all
              @update:selected="updateSelectedShuttle"
              dense
              bordered
            />
          </q-scroll-area>
        </q-card>
      </template>

      <!-- RIGHT: TABS FOR SHELVES/SHUTTLES -->
      <template v-slot:after>
        <q-tab-panels
          v-model="selected"
          animated
          transition-prev="jump-up"
          transition-next="jump-up"
        >
          <!-- SHUTTLE DETAIL TAB -->
          <q-tab-panel
            v-for="shuttle in shuttleStore.shuttleDetails"
            :key="shuttle.name"
            :name="shuttle.name"
          >
            <q-card class="q-pa-lg q-mt-md" flat bordered>
              <div class="q-gutter-md q-mb-md row items-center">
                <div class="text-h4 text-primary">{{ shuttle.title }}</div>
              </div>
              <div class="q-gutter-md row items-center">
                <q-input
                  v-model="shuttle.editName"
                  label="Shuttle Name"
                  filled
                  class="q-mb-md"
                  @blur="onShuttleUpdate(shuttle)"
                  :readonly="!shuttleStore.isShuttleEmpty(shuttle.name)"
                  dense
                />

                <q-input
                  v-model="shuttle.width"
                  label="Width"
                  filled
                  type="number"
                  class="q-mb-md"
                  dense
                  @change="onShuttleUpdate(shuttle)"
                  :readonly="!shuttleStore.isShuttleEmpty(shuttle.name)"
                />
                <q-input
                  v-model="shuttle.depth"
                  label="Depth"
                  filled
                  type="number"
                  class="q-mb-md"
                  dense
                  @change="onShuttleUpdate(shuttle)"
                  :readonly="!shuttleStore.isShuttleEmpty(shuttle.name)"
                />
                <q-btn
                  @click="shuttleStore.removeShuttle(shuttle.name)"
                  label="Remove Shuttle"
                  color="negative"
                  outlined
                  class="q-mb-md"
                  icon="delete"
                  flat
                  dense
                />
              </div>
            </q-card>
          </q-tab-panel>

          <!-- SHELF DETAIL TAB -->
          <q-tab-panel
            v-for="shelf in shuttleStore.shelfDetails"
            :key="shelf.name"
            :name="shelf.name"
          >
            <!-- SHELF SVG + CONTROLS -->
            <q-card flat bordered class="q-mt-md q-pa-none">
              <div class="shelf-container-box q-pa-md">
                <div class="text-h6 text-primary q-mb-sm">
                  {{ shelf.title }}
                </div>
                <q-separator spaced class="q-mb-sm" />
                <div class="row q-gutter-sm q-mb-md">
                  <q-btn
                    @click="showBinSelector(shelf.name)"
                    label="Add Bin to Shelf"
                    color="primary"
                    icon="add_box"
                    dense
                  />
                  <q-btn
                    @click="shuttleStore.removeShelf(shelf.name)"
                    label="Remove Shelf"
                    color="negative"
                    icon="delete_outline"
                    outlined
                    dense
                  />
                  <q-btn
                    color="accent"
                    icon="edit"
                    label="Set All Bin Descriptions"
                    @click="openBinDescriptionDialogForAll(shelf.name)"
                    dense
                  />
                  <q-btn
                    color="primary"
                    icon="content_copy"
                    label="Duplicate Shelf"
                    @click="openDuplicateShelfDialog(shelf.name)"
                    dense
                  />
                </div>
                <!-- SVG SHELF LAYOUT -->
                <div class="svg-scroll-wrapper">
                  <svg
                    :ref="(el) => (svgRefs[shelf.name] = el)"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    style="
                      touch-action: none;
                      user-select: none;
                      cursor: crosshair;
                    "
                    class="svg-shelf"
                    @mousedown="onSvgMouseDown(shelf.name, $event)"
                  >
                    <g
                      v-for="(bin, index) in shuttleStore.binShelves[
                        shelf.name
                      ]"
                      :key="bin.name + '-' + index"
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
                        :fill="getBinFillColor(bin, shelf.name)"
                        :stroke="
                          isBinSelected(bin, shelf.name) ? '#FF9800' : '#0D47A1'
                        "
                        stroke-width="0.5"
                        @click.stop="selectBin(shelf.name, bin, $event)"
                        @mousedown.stop="
                          onBinMouseDown(shelf.name, bin, $event)
                        "
                        @contextmenu.prevent.stop="
                          openBinDescriptionDialog(shelf.name, bin, $event)
                        "
                        :title="bin.description || ''"
                        style="pointer-events: auto; cursor: pointer"
                      />
                    </g>
                    <template v-if="isSelecting && currentShelf === shelf.name">
                      <rect
                        :x="Math.min(selectRect.x1, selectRect.x2)"
                        :y="Math.min(selectRect.y1, selectRect.y2)"
                        :width="Math.abs(selectRect.x2 - selectRect.x1)"
                        :height="Math.abs(selectRect.y2 - selectRect.y1)"
                        fill="rgba(33,150,243,0.2)"
                        stroke="#2196F3"
                        stroke-width="0.5"
                        pointer-events="none"
                      />
                      <text
                        :x="(selectRect.x1 + selectRect.x2) / 2"
                        :y="(selectRect.y1 + selectRect.y2) / 2"
                        text-anchor="middle"
                        dominant-baseline="middle"
                        fill="#2196F3"
                        font-size="9"
                        pointer-events="none"
                        class="selection-text"
                      >
                        Selection
                      </text>
                    </template>
                  </svg>
                </div>
              </div>
            </q-card>
            <!-- TABLE OF BINS ON SHELF -->
            <q-card class="q-mt-lg" flat bordered>
              <q-card-section>
                <div class="text-h6 q-mb-md">Bins on Shelf</div>
                <q-table
                  :rows="shuttleStore.binShelves[shelf.name] || []"
                  :columns="columns"
                  :row-key="rowKey"
                  :rows-per-page-options="[0]"
                  flat
                  dense
                  virtual-scroll
                  separator="horizontal"
                  :pagination="{ rowsPerPage: 0 }"
                  v-model:selected="selectedBinsPerShelf[shelf.name]"
                  selection="multiple"
                  style="max-height: 330px"
                >
                  <template v-slot:body-cell-number="props">
                    <q-td
                      :class="{
                        'bg-amber-1': isBinSelected(props.row, shelf.name),
                        'text-black': isBinSelected(props.row, shelf.name),
                      }"
                    >
                      {{ Math.round(props.row.position.x) }}+{{
                        Math.round(props.row.position.y)
                      }}
                    </q-td>
                  </template>
                  <template v-slot:body-cell-name="props">
                    <q-td>{{ props.row.name }}</q-td>
                  </template>
                  <template v-slot:body-cell-description="props">
                    <q-td>{{ props.row.description }}</q-td>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-splitter>

    <!-- BIN MANAGER DIALOG (IMPROVED DESIGN) -->
    <q-dialog v-model="showBinDialog" persistent>
      <q-card style="width: 760px; max-width: 97vw; min-height: 470px">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title
            ><q-icon name="inventory_2" class="q-mr-sm" />Bin
            Manager</q-toolbar-title
          >
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-separator />
        <q-card-section class="row q-gutter-x-lg">
          <!-- LEFT: ADD BIN FORM -->
          <div class="col-5 q-pa-md bg-grey-2 bin-form">
            <div class="text-subtitle1 q-mb-md text-weight-medium q-pl-xs">
              New Bin
            </div>
            <q-form @submit.prevent="addNewBin">
              <q-input
                v-model="binData.name"
                label="Name..."
                outlined
                dense
                class="q-mb-md"
                autocomplete="off"
              />
              <div class="row q-gutter-sm q-mb-md">
                <q-input
                  v-model.number="binData.width"
                  label="Width"
                  type="number"
                  outlined
                  dense
                  class="col"
                />
                <q-input
                  v-model.number="binData.depth"
                  label="Depth"
                  type="number"
                  outlined
                  dense
                  class="col"
                />
              </div>
              <q-btn
                unelevated
                label="Add Bin"
                color="primary"
                class="full-width"
                icon="add"
                type="submit"
                :disable="!binData.name || !binData.width || !binData.depth"
              />
            </q-form>
          </div>

          <!-- RIGHT: BIN TABLE -->
          <div class="col q-pa-none">
            <div
              class="flex items-center justify-between q-mb-sm q-pl-xs q-pr-xs"
            >
              <div class="text-subtitle1 text-weight-medium">All Bins</div>
              <q-input
                v-model="binsFilter"
                dense
                debounce="200"
                filled
                placeholder="Filter Bins..."
                style="min-width: 160px"
              />
            </div>
            <q-table
              :rows="filteredBins"
              :columns="binTableColumns"
              row-key="name"
              dense
              flat
              hide-bottom
              class="bins-table shadow-1"
              style="max-height: 325px; overflow: auto"
            >
              <template v-slot:body-cell-action="props">
                <q-td class="text-center q-px-xs">
                  <q-btn
                    v-if="Boolean(selectedShuttle)"
                    color="secondary"
                    icon="add_circle"
                    flat
                    dense
                    size="sm"
                    title="Add to shelf"
                    @click="selectBinForShelf(props.row)"
                  />
                </q-td>
              </template>
              <template v-slot:no-data>
                <div class="text-grey-7 text-center q-pa-md">
                  No bins found.
                </div>
              </template>
            </q-table>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-mt-xs">
          <q-space />
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- BIN DESCRIPTION DIALOG -->
    <q-dialog v-model="showBinDescriptionDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6 text-primary">
            Set Description for
            {{
              selectedShelf && selectedBinsPerShelf[selectedShelf]
                ? selectedBinsPerShelf[selectedShelf].length
                : 0
            }}
            Bin<span
              v-if="
                selectedShelf && selectedBinsPerShelf[selectedShelf]?.length > 1
              "
              >s</span
            >
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
        <q-separator spaced />
        <q-card-actions align="right">
          <q-btn
            color="primary"
            label="Apply"
            icon="done"
            @click="setDescriptionForSelectedBins"
          />
          <q-btn flat label="Cancel" icon="close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DUPLICATE SHELF DIALOG -->
    <q-dialog v-model="showDuplicateShelfDialog">
      <q-card style="min-width: 350px">
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
          <q-toggle v-model="duplicateBins" label="Copy Bins" />
          <q-toggle
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
import { ref, computed, reactive, onMounted, onBeforeUnmount } from "vue";
import { useShuttleStore } from "../stores/useShuttleStore";
import { useBinStore } from "../stores/useBinStore";
import { useQuasar } from "quasar";

export default {
  setup() {
    const $q = useQuasar();
    const shuttleStore = useShuttleStore();
    const binStore = useBinStore();

    const selectedBinsPerShelf = reactive({});
    const binsFilter = ref("");

    // Original columns for shelf bin-table
    const columns = [
      {
        name: "number",
        label: "#(X+Y)",
        field: (row) =>
          row.position
            ? Math.round(row.position.x) + "+" + Math.round(row.position.y)
            : "",
        align: "left",
      },
      {
        name: "name",
        label: "Bin Name",
        field: "name",
        align: "left",
      },
      {
        name: "description",
        label: "Description",
        field: "description",
        align: "left",
      },
    ];

    // Table columns for bin manager
    const binTableColumns = [
      {
        name: "name",
        label: "Name",
        field: "name",
        align: "left",
        sortable: true,
      },
      {
        name: "width",
        label: "W",
        field: "width",
        align: "right",
        sortable: true,
        style: "width:75px",
      },
      {
        name: "depth",
        label: "D",
        field: "depth",
        align: "right",
        sortable: true,
        style: "width:75px",
      },
      {
        name: "action",
        label: "",
        align: "center",
        field: "",
        sortable: false,
        style: "width: 48px",
      },
    ];

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
      width: null,
      depth: null,
    });

    const selectedShelf = ref(null);

    // Drag selection state
    const svgRefs = {};
    const isSelecting = ref(false);
    const selectRect = ref({ x1: 0, y1: 0, x2: 0, y2: 0 });
    const currentShelf = ref("");

    // For dragging bins
    const draggingBin = ref(null);
    const dragStart = ref({ x: 0, y: 0 });
    const binOffset = ref({ x: 0, y: 0 });

    // --- Table filtering for Bin Manager ---
    const filteredBins = computed(() => {
      if (!binsFilter.value) return binStore.bins;
      const f = binsFilter.value.trim().toLowerCase();
      return binStore.bins.filter(
        (bin) =>
          (bin.name || "").toLowerCase().includes(f) ||
          String(bin.width).includes(f) ||
          String(bin.depth).includes(f)
      );
    });

    function getSvgCoords(event, shelfName) {
      const svg = svgRefs[shelfName];
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      };
    }

    function rowKey(row) {
      return `${row.name}-${Math.round(row.position.x)}-${Math.round(
        row.position.y
      )}`;
    }

    function onSvgMouseDown(shelfName, event) {
      if (event.button !== 0) return;
      currentShelf.value = shelfName;
      isSelecting.value = true;
      if (!event.ctrlKey && !event.metaKey) {
        selectedBinsPerShelf[shelfName] = [];
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

      const shelfBins = shuttleStore.binShelves[shelfName] || [];
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

      if (originEvent && (originEvent.ctrlKey || originEvent.metaKey)) {
        selectedBinsPerShelf[shelfName] = [
          ...(selectedBinsPerShelf[shelfName] || []),
          ...binsInRect.filter(
            (b) => !(selectedBinsPerShelf[shelfName] || []).includes(b)
          ),
        ];
      } else {
        selectedBinsPerShelf[shelfName] = binsInRect;
      }
    }

    function onSvgMouseUp() {
      isSelecting.value = false;
    }

    /** -- Drag Bin Handlers -- */
    function onBinMouseDown(shelfName, bin, event) {
      if (event.button !== 0) return; // Only left mouse
      draggingBin.value = { bin, shelfName };

      const coords = getSvgCoords(event, shelfName);
      const shelfWidth = shuttleStore.getShelfWidth({ name: shelfName });
      const shelfDepth = shuttleStore.getShelfDepth({ name: shelfName });
      const binX = (bin.position.x / shelfWidth) * 100;
      const binY = (bin.position.y / shelfDepth) * 100;

      binOffset.value = {
        x: coords.x - binX,
        y: coords.y - binY,
      };

      dragStart.value = coords;

      document.addEventListener("mousemove", onBinMouseMove);
      document.addEventListener("mouseup", onBinMouseUp);
    }

    function onBinMouseMove(event) {
      if (!draggingBin.value) return;
      const { bin, shelfName } = draggingBin.value;
      const coords = getSvgCoords(event, shelfName);
      const shelfWidth = shuttleStore.getShelfWidth({ name: shelfName });
      const shelfDepth = shuttleStore.getShelfDepth({ name: shelfName });

      let newX = coords.x - binOffset.value.x;
      let newY = coords.y - binOffset.value.y;

      newX = Math.max(0, Math.min(100 - (bin.width / shelfWidth) * 100, newX));
      newY = Math.max(0, Math.min(100 - (bin.depth / shelfDepth) * 100, newY));

      const realX = (newX / 100) * shelfWidth;
      const realY = (newY / 100) * shelfDepth;

      if (
        !isBinMovementOverlapping(
          bin,
          shelfName,
          realX,
          realY,
          bin.width,
          bin.depth
        )
      ) {
        bin.position.x = realX;
        bin.position.y = realY;
      }
    }

    function onBinMouseUp(event) {
      draggingBin.value = null;
      document.removeEventListener("mousemove", onBinMouseMove);
      document.removeEventListener("mouseup", onBinMouseUp);
    }

    function isBinMovementOverlapping(currentBin, shelfName, x, y, w, h) {
      const bins = shuttleStore.binShelves[shelfName] || [];
      return bins.some((bin) => {
        if (bin === currentBin) return false;
        return !(
          x + w <= bin.position.x ||
          x >= bin.position.x + bin.width ||
          y + h <= bin.position.y ||
          y >= bin.position.y + bin.depth
        );
      });
    }
    /** -- End Drag Bin Handlers -- */

    const showBinDescriptionDialog = ref(false);
    const descriptionInput = ref("");

    const updateSelectedShuttle = (newSelection) => {
      if (!newSelection) return;
      const parts = newSelection.split(" - ");
      selectedShuttle.value = parts.length > 1 ? parts[0] : newSelection;
    };

    const onShuttleUpdate = (shuttle) => {
      shuttleStore.updateShuttle(shuttle);
    };

    const addNewBin = () => {
      binStore.addBin({ ...binData.value });
      binData.value = { name: "", width: null, depth: null };
    };

    const selectBinForShelf = (bin) => {
      if (selectedShuttle.value) {
        shuttleStore.addBinToShelf(selectedShuttle.value, bin);
      }
    };

    const showBinSelector = (shelfName) => {
      selectedShuttle.value = shelfName;
      showBinDialog.value = true;
    };

    function isBinSelected(bin, shelfName) {
      const arr = selectedBinsPerShelf[shelfName];
      if (!arr) return false;
      return arr.includes(bin);
    }

    const selectBin = (shelfName, bin, event) => {
      selectedShelf.value = shelfName;
      if (isSelecting.value) return;
      if (!selectedBinsPerShelf[shelfName])
        selectedBinsPerShelf[shelfName] = [];
      if (event && (event.ctrlKey || event.metaKey)) {
        if (selectedBinsPerShelf[shelfName].includes(bin)) {
          selectedBinsPerShelf[shelfName] = selectedBinsPerShelf[
            shelfName
          ].filter((b) => b !== bin);
        } else {
          selectedBinsPerShelf[shelfName] = [
            ...selectedBinsPerShelf[shelfName],
            bin,
          ];
        }
      } else {
        selectedBinsPerShelf[shelfName] = [bin];
      }
    };

    function onTableSelection(shelfName, { rows }) {
      selectedShelf.value = shelfName;
      selectedBinsPerShelf[shelfName] = rows;
    }

    function openBinDescriptionDialog(shelfName, bin) {
      selectedShelf.value = shelfName;
      if (!selectedBinsPerShelf[shelfName])
        selectedBinsPerShelf[shelfName] = [];
      if (!selectedBinsPerShelf[shelfName].includes(bin)) {
        selectedBinsPerShelf[shelfName] = [bin];
      }
      showBinDescriptionDialog.value = true;
      descriptionInput.value =
        selectedBinsPerShelf[shelfName][0]?.description || "";
    }

    function setDescriptionForSelectedBins() {
      if (
        !selectedShelf.value ||
        !selectedBinsPerShelf[selectedShelf.value]?.length
      )
        return;
      shuttleStore.setDescriptionForBins(
        selectedShelf.value,
        selectedBinsPerShelf[selectedShelf.value],
        descriptionInput.value
      );
      showBinDescriptionDialog.value = false;
      selectedBinsPerShelf[selectedShelf.value] = [];
    }

    function removeSelectedBin() {
      if (
        selectedShelf.value &&
        selectedBinsPerShelf[selectedShelf.value]?.length
      ) {
        const toRemove = selectedBinsPerShelf[selectedShelf.value];
        toRemove.forEach((bin) => {
          shuttleStore.removeBinFromShelf(selectedShelf.value, bin);
        });
        selectedBinsPerShelf[selectedShelf.value] = [];
      }
    }

    function handleKeyDown(event) {
      if (
        event.key === "Delete" &&
        selectedShelf.value &&
        selectedBinsPerShelf[selectedShelf.value]?.length
      ) {
        $q.dialog({
          title: "Confirm Deletion",
          message:
            "Are you sure you want to delete the selected bin(s)? This action cannot be undone.",

          cancel: true, // Show a cancel button
          persistent: true, // Prevent closing by clicking outside

          focus: "cancel",
        })
          .onOk(() => {
            // User clicked 'OK' or 'Yes'
            removeSelectedBin();
          })
          .onCancel(() => {
            // User clicked 'Cancel' or outside dialog
            $q.notify({
              message: "Deletion cancelled.",
              color: "info",
              icon: "info",
              position: "bottom",
            });
          })
          .onDismiss(() => {
            // Dialog was dismissed (e.g., by hitting escape or clicking outside if not persistent)
            // This is often good for cleanup or logging, but onCancel usually covers user rejection.
            console.log("Dialog dismissed");
          });
      }
    }

    onMounted(() => {
      window.addEventListener("keydown", handleKeyDown);
    });
    onBeforeUnmount(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });

    function getBinFillColor(bin, shelfName) {
      if (
        selectedBinsPerShelf[shelfName] &&
        selectedBinsPerShelf[shelfName].includes(bin)
      ) {
        return bin.description ? "#FFD54F" : "#E57373";
      }
      return bin.description ? "#42A5F5" : "#B0BEC5";
    }

    function openBinDescriptionDialogForAll(shelfName) {
      const shelfBins = shuttleStore.binShelves[shelfName] || [];
      if (!shelfBins.length) return;
      selectedShelf.value = shelfName;
      selectedBinsPerShelf[shelfName] = [...shelfBins];
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

        if (duplicateBins.value && shuttleStore.binShelves[origShelfName]) {
          const binsForNewShelf = shuttleStore.binShelves[origShelfName].map(
            (bin) => {
              const newBin = { ...JSON.parse(JSON.stringify(bin)) };
              if (!duplicateDescriptions.value) {
                newBin.description = "";
              }
              return newBin;
            }
          );
          shuttleStore.binShelves[newShelf] = binsForNewShelf;
          shuttleStore.$patch({ binShelves: { ...shuttleStore.binShelves } });
          shuttleStore.saveState();
        } else {
          shuttleStore.binShelves[newShelf] = [];
          shuttleStore.$patch({ binShelves: { ...shuttleStore.binShelves } });
          shuttleStore.saveState();
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
      columns,
      binTableColumns,
      binsFilter,
      filteredBins,
      shelfToDuplicate,
      duplicateCount,
      duplicateBins,
      duplicateDescriptions,
      showDuplicateShelfDialog,
      selectedShelf,
      selectedBinsPerShelf,
      svgRefs,
      isSelecting,
      selectRect,
      currentShelf,
      rowKey,
      onSvgMouseDown,
      selectBin,
      getBinFillColor,
      isBinSelected,
      openBinDescriptionDialog,
      openBinDescriptionDialogForAll,
      setDescriptionForSelectedBins,
      showBinDescriptionDialog,
      descriptionInput,
      addNewBin,
      selectBinForShelf,
      showBinSelector,
      updateSelectedShuttle,
      onShuttleUpdate,
      removeSelectedBin,
      runDuplicateShelf,
      openDuplicateShelfDialog,
      onTableSelection,
      onBinMouseDown,
    };
  },
};
</script>

<style scoped>
.shelf-container-box {
  background: linear-gradient(135deg, #fafdff 0%, #dbeef9 100%);
  border-radius: 12px;
  box-shadow: 0 2px 8px #d1e5f5;
}
.svg-scroll-wrapper {
  width: 100%;
  max-width: 510px;
  height: 270px;
  overflow-x: auto;
  overflow-y: auto;
  margin: 0 auto;
  background-color: #e7f4fd;
  border-radius: 8px;
  border: 1.5px dashed #90caf9;
  padding: 6px;
  box-sizing: border-box;
}
.svg-shelf {
  width: 100%;
  height: 250px;
  min-width: 100%;

  border: 5px #d3d3d3 dashed;
  background-color: transparent;
  user-select: none;
  display: block;
}
.q-mt-lg {
  margin-top: 32px;
}
.q-mt-md {
  margin-top: 16px;
}
.q-gutter-md {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Bin Manager dialog enhancements */
.bin-form {
  border-radius: 8px;
  background-color: #f6fafd !important;
  box-shadow: 0 1px 8px #cadbe8cc;
  min-height: 330px;
}
.bins-table thead th {
  background: #eef4fb;
  font-weight: 500;
  font-size: 1rem;
  border-bottom: 1.5px solid #d5e4f5;
}
.bins-table .q-td {
  font-size: 1rem;
  padding-top: 6px !important;
  padding-bottom: 6px !important;
}
.bins-table {
  background: #f7fafe;
  border-radius: 9px;
  box-shadow: 0 1px 4px #d8e5f8a8;
}
.q-toolbar-title {
  font-size: 1.13rem;
  font-weight: bold;
  letter-spacing: 0.5px;
}
.q-table__bottom,
.q-table__bottom-row {
  border-top: none !important;
}
.q-table__top {
  border-bottom: none !important;
}
.q-table .q-btn {
  margin: 0;
}
.q-table th,
.q-table td {
  vertical-align: middle !important;
}

.selection-text {
  font-family: sans-serif; /* Or any preferred font */
  opacity: 0.8; /* Make it slightly transparent if desired */
}
</style>
