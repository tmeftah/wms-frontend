<template>
  <q-dialog v-model="propertyDialogVisible">
    <q-card>
      <q-card-section>
        <div class="text-h6">Add/Edit Material Property</div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="newProperty.name"
          label="Property Name"
          dense
          outlined
          required
        />
        <q-checkbox
          v-model="newProperty.serialNumber"
          label="Serial Number Enabled"
          dense
        />
        <q-checkbox
          v-model="newProperty.lotNumber"
          label="Lot Number Enabled"
          dense
        />
        <q-checkbox
          v-model="newProperty.qualification"
          label="Qualification Required"
          dense
        />
        <q-input
          v-model="newProperty.storageRules"
          label="Storage Rules (Comma-separated Bins/Shelves)"
          dense
          outlined
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="propertyDialogVisible = false" />
        <q-btn
          flat
          label="Save"
          color="primary"
          @click="saveMaterialProperty"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-page padding>
    <div class="q-gutter-md">
      <!-- Inline Form -->
      <q-btn
        label="Add Property"
        color="secondary"
        @click="openPropertyDialog"
        dense
      />
      <q-form @submit="submitForm" class="row q-col-gutter-sm">
        <div class="col-auto">
          <q-input
            v-model="material.name"
            label="Material Name"
            hide-bottom-space
            outlined
            dense
            required
          />
        </div>

        <div v-for="i in 6" :key="`info${i}`" class="col-auto">
          <q-input
            v-model="material[`info${i}`]"
            :label="`Info ${i}`"
            hide-bottom-space
            outlined
            dense
          />
        </div>

        <div class="col-auto">
          <q-select
            v-model="material.property"
            :options="materialPropertyOptions"
            label="Material Property"
            hide-bottom-space
            outlined
            dense
            map-options
            option-value="id"
            option-label="label"
            clearable
          />
        </div>

        <div class="col-auto">
          <q-select
            v-model="material.unit_of_measure"
            :options="unitOptions"
            label="Unit"
            hide-bottom-space
            outlined
            dense
            required
          />
        </div>

        <div class="col-auto">
          <q-btn label="Add" type="submit" color="primary" dense />
          <q-btn
            label="Reset"
            @click="resetMaterials"
            color="secondary"
            flat
            dense
          />
        </div>
      </q-form>

      <q-separator spaced />

      <!-- Bordered Table with Separator and Filters Under Headers -->
      <q-table
        :rows="formattedMaterials"
        :columns="columns"
        row-key="name"
        class="full-width"
        bordered
        flat
        separator="cell"
      >
        <!-- Default Header -->
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th
              v-for="(col, colIndex) in columns"
              :key="col.name"
              :props="props"
              :style="{ width: columnWidths[colIndex] }"
              class="resizable-th"
              @mousedown="colIndex > 0 ? onMouseDown(colIndex, $event) : null"
            >
              <div v-if="colIndex > 0" class="resize-handle"></div>
              <div class="header-content">
                <span>{{ col.label }}</span>
              </div>
            </q-th>
          </q-tr>
          <!-- Filter Inputs Row -->
          <q-tr>
            <q-th v-for="col in columns" :key="col.name">
              <q-input
                v-model="filters[col.name]"
                dense
                outlined
                hide-bottom-space
              />
            </q-th>
          </q-tr>
        </template>
        <template v-slot:body-cell-property="props">
          <q-td :props="props">
            <div v-if="props.row.property">
              <div>Name: {{ props.row.property.name }}</div>
              <div>
                Serial Number:
                {{ props.row.property.serialNumber ? "Yes" : "No" }}
              </div>
              <div>
                Lot Number: {{ props.row.property.lotNumber ? "Yes" : "No" }}
              </div>
              <div>
                Qualification:
                {{ props.row.property.qualification ? "Yes" : "No" }}
              </div>
            </div>
            <div v-else>N/A</div>
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script>
import { useMaterialStore } from "../stores/useMaterialStore";
import { ref } from "vue";

export default {
  setup() {
    const propertyDialogVisible = ref(false);
    const materialStore = useMaterialStore();
    const isEditing = ref(false);
    const editIndex = ref(null);
    const newProperty = ref({
      serialNumber: false,
      lotNumber: false,
      qualification: false,
      storageRules: "",
    });

    const columns = [
      {
        name: "name",
        label: "Name",
        align: "left",
        field: "name",
        sortable: true,
      },
      {
        name: "info1",
        label: "Info 1",
        align: "left",
        field: "info1",
        sortable: true,
      },
      {
        name: "info2",
        label: "Info 2",
        align: "left",
        field: "info2",
        sortable: true,
      },
      {
        name: "info3",
        label: "Info 3",
        align: "left",
        field: "info3",
        sortable: true,
      },
      {
        name: "info4",
        label: "Info 4",
        align: "left",
        field: "info4",
        sortable: true,
      },
      {
        name: "info5",
        label: "Info 5",
        align: "left",
        field: "info5",
        sortable: true,
      },
      {
        name: "unit_of_measure",
        label: "Unit of Measure",
        align: "left",
        field: "unit_of_measure",
        sortable: true,
      },

      {
        name: "property",
        label: "Material Property",
        align: "left",
        field: "property",
        sortable: false,
      },
    ];

    const columnWidths = ref(Array(columns.length).fill("150px"));

    const startX = ref(0);
    const startWidth = ref(0);
    let currentColIndex = -1;

    const onMouseDown = (index, event) => {
      if (event.target.classList.contains("resize-handle")) {
        currentColIndex = index;
        startX.value = event.pageX;
        startWidth.value = parseInt(
          window.getComputedStyle(event.target.closest(".resizable-th")).width,
          10
        );
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        event.preventDefault();
      }
    };

    const onMouseMove = (event) => {
      if (currentColIndex >= 0) {
        const newWidth = startWidth.value + (event.pageX - startX.value);
        columnWidths.value.splice(currentColIndex, 1, `${newWidth}px`);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      currentColIndex = -1;
    };

    const saveMaterialProperty = () => {
      const propertyToSave = { ...newProperty.value };
      if (isEditing.value) {
        materialStore.updateMaterialProperty(editIndex.value, propertyToSave);
      } else {
        materialStore.addMaterialProperty(propertyToSave);
      }
      resetPropertyForm();
      propertyDialogVisible.value = false;
    };

    const resetPropertyForm = () => {
      newProperty.value = {
        name: "",
        serialNumber: false,
        lotNumber: false,
        qualification: false,
        storageRules: "",
      };
      isEditing.value = false;
      editIndex.value = null;
    };

    return {
      propertyDialogVisible,
      newProperty,
      saveMaterialProperty,
      resetPropertyForm,
      materialStore,
      columns,
      columnWidths,
      onMouseDown,
      isEditing,
      editIndex,
    };
  },
  data() {
    return {
      material: {
        name: "",
        info1: "",
        info2: "",
        info3: "",
        info4: "",
        info5: "",
        property: null, // New field to link with a material property
      },
      materialProperties: [],
      unitOptions: [
        { label: "Kilograms", value: "kg" },
        { label: "Liters", value: "l" },
        { label: "Meters", value: "m" },
      ],
      filters: {
        name: "",
        info1: "",
        info2: "",
        info3: "",
        info4: "",
        info5: "",
        property: "",
        unit_of_measure: "",
      },
    };
  },
  computed: {
    filteredMaterials() {
      return this.materialStore.materials.filter((material) => {
        return Object.keys(this.filters).every((key) => {
          const filterValue = this.filters[key].toLowerCase();
          return String(material[key]).toLowerCase().includes(filterValue);
        });
      });
    },

    materialPropertyOptions() {
      return this.materialStore.materialProperties.map((property, index) => ({
        id: index,
        label: property.name,
      }));
    },
    formattedMaterials() {
      return this.materialStore.materials;
    },
  },
  methods: {
    submitForm() {
      // Assign the selected material property to the new material

      if (this.material.property !== null) {
        const selectedProperty =
          this.materialStore.materialProperties[this.material.property.id];
        this.material.property = {
          ...selectedProperty,
        };
      }
      this.materialStore.addMaterial({ ...this.material });
      this.resetForm();
    },
    resetForm() {
      this.material = {
        name: "",
        info1: "",
        info2: "",
        info3: "",
        info4: "",
        info5: "",
        property: null,
        unit_of_measure: null,
      };
    },
    resetMaterials() {
      this.materialStore.resetMaterials();
    },

    openPropertyDialog() {
      this.propertyDialogVisible = true;
    },
  },
};
</script>

<style scoped>
.q-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.full-width {
  width: 100%;
}
.header-content {
  display: flex;
  align-items: center;
}
.resize-handle {
  width: 5px;
  cursor: ew-resize;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 10;
}
.resizable-th {
  position: relative; /* Ensure positioning relative to itself */
}
</style>
