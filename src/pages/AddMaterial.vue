<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="q-mb-lg">
      <q-card class="shadow-3">
        <q-tabs
          v-model="selectedTab"
          dense
          active-color="primary"
          indicator-color="primary"
          align="left"
          class="text-primary bg-grey-1"
        >
          <q-tab name="materials" icon="layers" label="Materials" />
          <q-tab
            name="properties"
            icon="fact_check"
            label="Material Properties"
          />
        </q-tabs>
        <q-separator />

        <q-tab-panels v-model="selectedTab" animated>
          <!-- MATERIAL TAB -->
          <q-tab-panel name="materials" class="q-pa-none">
            <q-card-section>
              <div class="row items-center">
                <q-btn
                  label="Add Material"
                  color="primary"
                  dense
                  icon="add"
                  @click="openMaterialDialog()"
                  class="q-mr-md"
                />
                <q-space />
                <q-input
                  dense
                  filled
                  debounce="200"
                  v-model="mFilters.name"
                  placeholder="Search…"
                  class="q-mr-xs"
                  prefix="🔎"
                />
              </div>
            </q-card-section>
            <q-table
              :rows="filteredMaterials"
              :columns="materialColumns"
              row-key="name"
              flat
              square
              separator="cell"
              class="shadow-2"
              hide-pagination
              :rows-per-page-options="[25, 50, 100]"
              :virtual-scroll="filteredMaterials.length > 30"
            >
              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th
                    v-for="col in materialColumns"
                    :key="col.name"
                    class="bg-primary text-white text-no-wrap text-weight-bold"
                  >
                    {{ col.label }}
                  </q-th>
                  <q-th
                    class="bg-primary text-white text-no-wrap"
                    style="width: 10%"
                    >Actions</q-th
                  >
                </q-tr>
              </template>
              <template v-slot:body="props">
                <q-tr
                  :props="props"
                  class="hover-row"
                  :class="{ 'bg-blue-1': props.rowIndex % 2 === 1 }"
                >
                  <q-td
                    v-for="col in materialColumns"
                    :key="col.name"
                    style="vertical-align: top"
                  >
                    <template v-if="col.name === 'property'">
                      <div v-if="props.row.property">
                        <div class="text-h6 text-blue-10 q-mb-xs">
                          <q-icon
                            name="fact_check"
                            class="q-mr-xs"
                            color="primary"
                          />
                          {{ props.row.property.name }}
                        </div>
                        <div class="row q-gutter-xs q-mb-xs">
                          <q-badge
                            v-if="props.row.property.serialNumber"
                            color="secondary"
                            label="SN"
                          />
                          <q-badge
                            v-if="props.row.property.lotNumber"
                            color="accent"
                            label="Lot"
                          />
                          <q-badge
                            v-if="props.row.property.qualification"
                            color="positive"
                            label="Qual."
                          />
                        </div>
                      </div>
                      <span v-else class="text-grey-6">N/A</span>
                    </template>
                    <template v-else-if="col.name === 'storage'">
                      <q-btn
                        round
                        dense
                        size="sm"
                        icon="warehouse"
                        :color="
                          props.row.storageRules?.length
                            ? 'accent'
                            : 'blue-grey-2'
                        "
                        title="Edit Storage Rules"
                        @click.stop="openStorageRules(props.row)"
                      />
                      <div
                        v-if="
                          props.row.storageRules &&
                          props.row.storageRules.length
                        "
                        class="q-pt-xs"
                      >
                        <q-badge
                          v-for="(rule, idx) in props.row.storageRules"
                          :key="idx"
                          color="info"
                          class="q-mr-xs q-mb-xs"
                          :label="rule.bin"
                        >
                          <q-tooltip>
                            <div>
                              Max: <b>{{ rule.maxItems }}</b>
                            </div>
                            <div>
                              Mix:
                              <q-icon
                                :color="rule.allowMix ? 'green' : 'grey'"
                                :name="rule.allowMix ? 'check' : 'clear'"
                              />
                            </div>
                            <div>
                              Default:
                              <q-icon
                                :color="rule.isDefault ? 'blue' : 'grey'"
                                :name="rule.isDefault ? 'star' : 'star_outline'"
                              />
                            </div>
                          </q-tooltip>
                        </q-badge>
                      </div>
                      <div v-else class="text-grey-6 text-xs">
                        All bins allowed
                      </div>
                    </template>
                    <template v-else-if="col.name === 'unit_of_measure'">
                      <q-badge
                        outline
                        color="blue-grey"
                        :label="props.row.unit_of_measure.label"
                      />
                    </template>
                    <template v-else>
                      <div v-if="col.field && props.row[col.field]">
                        {{ props.row[col.field] }}
                      </div>
                      <div v-else class="text-grey-5">—</div>
                    </template>
                  </q-td>
                  <q-td>
                    <q-btn
                      round
                      dense
                      size="sm"
                      icon="edit"
                      color="secondary"
                      @click.stop="openMaterialDialog(true, props.row)"
                      title="Edit Material"
                    />
                    <q-btn
                      round
                      dense
                      size="sm"
                      icon="delete"
                      color="negative"
                      @click.stop="deleteMaterial(props.row)"
                      title="Remove"
                    />
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-tab-panel>

          <!-- PROPERTIES TAB -->
          <q-tab-panel name="properties" class="q-pa-none">
            <q-card-section>
              <div class="row items-center">
                <q-btn
                  label="Add Property"
                  color="accent"
                  icon="add"
                  dense
                  @click="openPropertyDialog()"
                  class="q-mr-md"
                />
                <q-space />
                <q-input
                  dense
                  filled
                  debounce="200"
                  v-model="pFilters.name"
                  placeholder="Search…"
                  class="q-mr-xs"
                  prefix="🔎"
                />
              </div>
            </q-card-section>
            <q-table
              :rows="filteredProperties"
              :columns="propertyColumns"
              row-key="name"
              square
              flat
              separator="cell"
              class="shadow-2"
              :rows-per-page-options="[25, 50, 100]"
              hide-pagination
            >
              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th
                    v-for="col in propertyColumns"
                    :key="col.name"
                    class="bg-primary text-white text-no-wrap text-weight-bold"
                    >{{ col.label }}</q-th
                  >
                  <q-th
                    class="bg-primary text-white text-no-wrap text-weight-bold"
                    style="width: 10%"
                    >Actions</q-th
                  >
                </q-tr>
              </template>
              <template v-slot:body="props">
                <q-tr
                  :props="props"
                  class="hover-row"
                  :class="{ 'bg-blue-1': props.rowIndex % 2 === 1 }"
                >
                  <q-td key="name" :props="props"
                    ><span class="text-weight-bold text-indigo-10">{{
                      props.row.name
                    }}</span></q-td
                  >
                  <q-td key="serialNumber" :props="props">
                    <q-icon
                      :name="props.row.serialNumber ? 'check' : 'close'"
                      :color="props.row.serialNumber ? 'positive' : 'grey-6'"
                    />
                  </q-td>
                  <q-td key="lotNumber" :props="props">
                    <q-icon
                      :name="props.row.lotNumber ? 'check' : 'close'"
                      :color="props.row.lotNumber ? 'accent' : 'grey-6'"
                    />
                  </q-td>
                  <q-td key="qualification" :props="props">
                    <q-icon
                      :name="props.row.qualification ? 'check' : 'close'"
                      :color="props.row.qualification ? 'accent' : 'grey-6'"
                    />
                  </q-td>
                  <q-td>
                    <q-btn
                      icon="edit"
                      color="secondary"
                      round
                      dense
                      size="sm"
                      @click="openPropertyDialog(true, props.row)"
                      title="Edit"
                    />
                    <q-btn
                      icon="delete"
                      color="negative"
                      round
                      dense
                      size="sm"
                      @click="deleteProperty(props.row)"
                      title="Delete"
                    />
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>

    <!-- MATERIAL PROPERTY DIALOG -->
    <q-dialog v-model="propertyDialogVisible" persistent>
      <q-card class="q-pa-none">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>
            <q-icon name="settings" class="q-mr-sm" />
            {{ isEditingProperty ? "Edit" : "Add" }} Material Property
          </q-toolbar-title>
          <q-btn flat round dense icon="close" @click="closePropertyDialog" />
        </q-toolbar>
        <q-card-section class="q-pt-md">
          <q-form @submit.prevent="saveMaterialProperty">
            <q-input
              v-model="propertyForm.name"
              label="Property Name"
              outlined
              required
              dense
              class="q-mb-sm"
              autofocus
            />
            <div class="row q-gutter-sm">
              <q-toggle v-model="propertyForm.lotNumber" label="Lot" dense />
              <q-toggle
                v-model="propertyForm.qualification"
                label="Qualification"
                dense
              />
              <q-toggle
                v-model="propertyForm.serialNumber"
                label="Serial Number"
                dense
              />
            </div>
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="grey-7"
            @click="closePropertyDialog"
          />
          <q-btn
            unelevated
            label="Save"
            color="primary"
            :disable="!propertyForm.name"
            @click="saveMaterialProperty"
            icon="check"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- MATERIAL EDIT DIALOG -->
    <q-dialog v-model="materialDialogVisible" persistent>
      <q-card>
        <q-toolbar class="bg-secondary text-white">
          <q-toolbar-title>
            <q-icon name="edit_note" class="q-mr-sm" />
            {{ isEditingMaterial ? "Edit" : "Add" }} Material
          </q-toolbar-title>
          <q-btn flat round dense icon="close" @click="closeMaterialDialog" />
        </q-toolbar>
        <q-card-section>
          <q-form @submit.prevent="saveMaterial">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="materialForm.name"
                  label="Material Name"
                  outlined
                  dense
                  required
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="materialForm.property"
                  :options="materialPropertyOptions"
                  label="Property"
                  outlined
                  dense
                  map-options
                  option-value="id"
                  option-label="label"
                  emit-value
                  required
                />
              </div>
            </div>
            <div class="row q-col-gutter-md q-mt-xs">
              <div v-for="i in 5" :key="`ei${i}`" class="col-12 col-md-4">
                <q-input
                  v-model="materialForm[`info${i}`]"
                  :label="`Info ${i}`"
                  outlined
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="materialForm.unit_of_measure"
                  :options="unitOptions"
                  label="Unit"
                  outlined
                  dense
                  required
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="grey-7"
            @click="closeMaterialDialog"
          />
          <q-btn
            unelevated
            label="Save"
            color="primary"
            icon="check"
            :disable="
              !materialForm.name ||
              materialForm.property == null ||
              !materialForm.unit_of_measure
            "
            @click="saveMaterial"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- STORAGE RULES DIALOG -->
    <q-dialog v-model="storageRuleDialogVisible" persistent>
      <q-card>
        <q-toolbar class="bg-accent text-white">
          <q-toolbar-title>
            <q-icon name="warehouse" class="q-mr-sm" />
            Set Storage Rules:
            <span class="text-weight-bold">{{ storageRuleTarget?.name }}</span>
          </q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section>
          <q-form
            @submit.prevent="addStorageRule"
            class="row items-end q-gutter-sm q-mb-md"
          >
            <q-select
              v-model="storageRuleForm.bin"
              :options="binOptions"
              label="Bin"
              outlined
              dense
              map-options
              option-label="name"
              option-value="name"
              emit-value
              use-input
              fill-input
              required
              :disable="binOptions.length === 0"
            />
            <q-input
              v-model.number="storageRuleForm.maxItems"
              label="Max Items"
              type="number"
              outlined
              dense
              min="1"
              class="col-3"
              required
            />
            <q-btn
              type="submit"
              icon="add"
              color="accent"
              class="col-auto"
              :disable="!storageRuleForm.bin || !storageRuleForm.maxItems"
              label="Add"
              size="md"
            />
            <div>
              <q-toggle
                v-model="storageRuleForm.allowMix"
                label="Allow mix"
                dense
                class="col-auto"
              />
              <q-toggle
                v-model="storageRuleForm.isDefault"
                label="Is Default"
                dense
                class="col-auto"
              />
            </div>
          </q-form>
          <q-table
            flat
            dense
            hide-bottom
            :rows="storageRuleTarget?.storageRules || []"
            :columns="storageRuleColumns"
            row-key="bin"
            class="q-mb-md"
          >
            <template v-slot:body-cell-allowMix="props">
              <q-td>{{ props.row.allowMix ? "Yes" : "No" }}</q-td>
            </template>
            <template v-slot:body-cell-isDefault="props">
              <q-td>{{ props.row.isDefault ? "Yes" : "No" }}</q-td>
            </template>
            <template v-slot:body-cell-action="props">
              <q-td>
                <q-btn
                  color="negative"
                  icon="delete"
                  dense
                  flat
                  round
                  size="sm"
                  @click="removeStorageRule(props.row.bin)"
                />
              </q-td>
            </template>
            <template v-slot:no-data>
              <div class="q-pa-md text-grey-6">No bin rules yet.</div>
            </template>
          </q-table>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="grey-7" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, reactive } from "vue";
import { useMaterialStore } from "../stores/useMaterialStore";
import { useBinStore } from "../stores/useBinStore";

export default {
  setup() {
    const propertyDialogVisible = ref(false);
    const materialDialogVisible = ref(false);
    const storageRuleDialogVisible = ref(false);

    const selectedTab = ref("materials");

    const materialStore = useMaterialStore();
    const binStore = useBinStore();

    // PROPERTY DIALOG
    const isEditingProperty = ref(false);
    const propertyEditIndex = ref(null);
    const propertyForm = reactive({
      name: "",
      serialNumber: false,
      lotNumber: false,
      qualification: false,
    });

    // MATERIAL DIALOG
    const isEditingMaterial = ref(false);
    const materialEditIndex = ref(null);
    const materialForm = reactive({
      name: "",
      info1: "",
      info2: "",
      info3: "",
      info4: "",
      info5: "",
      property: null,
      unit_of_measure: null,
      storageRules: [],
    });

    // TABLE COLUMNS AND FILTERS
    const mFilters = ref({
      name: "",
      info1: "",
      info2: "",
      info3: "",
      info4: "",
      info5: "",
      property: "",
      unit_of_measure: "",
    });

    const materialColumns = [
      {
        name: "name",
        label: "Name",
        field: "name",
        align: "left",
        sortable: true,
      },
      {
        name: "info1",
        label: "Info 1",
        field: "info1",
        align: "left",
        sortable: true,
      },
      {
        name: "info2",
        label: "Info 2",
        field: "info2",
        align: "left",
        sortable: false,
      },
      {
        name: "info3",
        label: "Info 3",
        field: "info3",
        align: "left",
        sortable: false,
      },
      {
        name: "info4",
        label: "Info 4",
        field: "info4",
        align: "left",
        sortable: false,
      },
      {
        name: "info5",
        label: "Info 5",
        field: "info5",
        align: "left",
        sortable: false,
      },
      {
        name: "property",
        label: "Property",
        field: "property",
        align: "left",
        sortable: false,
      },
      {
        name: "unit_of_measure",
        label: "Unit",
        field: "unit_of_measure",
        align: "left",
        sortable: true,
      },
      {
        name: "storage",
        label: "Storage",
        field: "storage",
        align: "center",
        sortable: false,
      },
    ];

    const pFilters = ref({
      name: "",
    });
    const propertyColumns = [
      {
        name: "name",
        label: "Name",
        field: "name",
        align: "left",
        sortable: true,
      },
      {
        name: "serialNumber",
        label: "Serial",
        field: "serialNumber",
        align: "center",
      },
      {
        name: "lotNumber",
        label: "Lot",
        field: "lotNumber",
        align: "center",
      },
      {
        name: "qualification",
        label: "Qualification",
        field: "qualification",
        align: "center",
      },
    ];

    const unitOptions = [
      { label: "Kilograms", value: "kg" },
      { label: "Liters", value: "l" },
      { label: "Meters", value: "m" },
    ];
    const materialPropertyOptions = computed(() =>
      materialStore.materialProperties.map((property, index) => ({
        id: index,
        label: property.name,
      }))
    );
    const binOptions = computed(() =>
      (binStore.bins || []).map((b) => ({
        ...b,
        label: b.name,
        value: b.name,
      }))
    );

    // FILTERED rows
    const filteredMaterials = computed(() => {
      return materialStore.materials.filter((material) => {
        return Object.keys(mFilters.value).every((key) => {
          if (!mFilters.value[key]) return true;
          let val = material[key] || "";
          if (key === "property") {
            if (!material.property) return false;
            return (
              material.property.name &&
              material.property.name
                .toLowerCase()
                .includes(mFilters.value[key].trim().toLowerCase())
            );
          }
          return (
            val &&
            String(val)
              .toLowerCase()
              .includes(mFilters.value[key].trim().toLowerCase())
          );
        });
      });
    });
    const filteredProperties = computed(() => {
      return materialStore.materialProperties.filter(
        (p) =>
          !pFilters.value.name ||
          (p.name || "")
            .toLowerCase()
            .includes(pFilters.value.name.trim().toLowerCase())
      );
    });

    function resetMaterialFilters() {
      Object.keys(mFilters.value).forEach((k) => (mFilters.value[k] = ""));
    }

    // --- Storage RULES per-material dialog ---
    const storageRuleForm = ref({
      bin: "",
      maxItems: null,
      allowMix: false,
      isDefault: false,
    });
    const storageRuleTarget = ref(null);
    const storageRuleTargetIndex = ref(null);
    const storageRuleColumns = [
      { name: "bin", label: "Bin", field: "bin", align: "left" },
      {
        name: "maxItems",
        label: "Max Items",
        field: "maxItems",
        align: "right",
      },
      {
        name: "allowMix",
        label: "Allow Mix",
        field: "allowMix",
        align: "center",
      },
      {
        name: "isDefault",
        label: "Default",
        field: "isDefault",
        align: "center",
      },
      {
        name: "action",
        label: "",
        field: "",
        align: "center",
        sortable: false,
        style: "width:40px",
      },
    ];
    function openStorageRules(material) {
      if (!material.storageRules) material.storageRules = [];
      storageRuleTarget.value = material;
      storageRuleTargetIndex.value = materialStore.materials.indexOf(material);
      resetStorageRuleForm();
      storageRuleDialogVisible.value = true;
    }
    function addStorageRule() {
      if (
        !storageRuleForm.value.bin ||
        !storageRuleForm.value.maxItems ||
        storageRuleTarget.value == null ||
        storageRuleTargetIndex.value == null
      ) {
        return;
      }
      if (
        storageRuleForm.value.isDefault &&
        storageRuleTarget.value.storageRules.some((r) => r.isDefault)
      ) {
        storageRuleTarget.value.storageRules.forEach(
          (r) => (r.isDefault = false)
        );
      }
      if (
        storageRuleTarget.value.storageRules.some(
          (r) => r.bin === storageRuleForm.value.bin
        )
      ) {
        return;
      }
      storageRuleTarget.value.storageRules.push({ ...storageRuleForm.value });
      materialStore.updateMaterial(storageRuleTargetIndex.value, {
        ...storageRuleTarget.value,
      });
      resetStorageRuleForm();
    }
    function removeStorageRule(binName) {
      if (!storageRuleTarget.value || storageRuleTargetIndex.value == null)
        return;
      storageRuleTarget.value.storageRules =
        storageRuleTarget.value.storageRules.filter(
          (rule) => rule.bin !== binName
        );
      materialStore.updateMaterial(storageRuleTargetIndex.value, {
        ...storageRuleTarget.value,
      });
    }
    function resetStorageRuleForm() {
      storageRuleForm.value = {
        bin: "",
        maxItems: null,
        allowMix: false,
        isDefault: false,
      };
    }

    // --- Property dialog
    function openPropertyDialog(edit = false, property = null) {
      propertyDialogVisible.value = true;
      isEditingProperty.value = !!edit && property;
      if (edit && property) {
        propertyEditIndex.value = materialStore.materialProperties.findIndex(
          (p) => p.name === property.name
        );
        Object.assign(propertyForm, {
          name: property.name,
          serialNumber: property.serialNumber,
          lotNumber: property.lotNumber,
          qualification: property.qualification,
        });
      } else {
        propertyEditIndex.value = null;
        Object.assign(propertyForm, {
          name: "",
          serialNumber: false,
          lotNumber: false,
          qualification: false,
        });
      }
    }
    function closePropertyDialog() {
      propertyDialogVisible.value = false;
      propertyEditIndex.value = null;
    }
    function saveMaterialProperty() {
      const formObj = { ...propertyForm };
      if (isEditingProperty.value && propertyEditIndex.value !== null) {
        // Update property in store
        materialStore.updateMaterialProperty(propertyEditIndex.value, formObj);
        // Update all materials which use this property
        materialStore.materials.forEach((material, idx) => {
          if (material.property && material.property.name === formObj.name) {
            materialStore.updateMaterial(idx, {
              ...material,
              property: { ...formObj },
            });
          }
        });
      } else {
        materialStore.addMaterialProperty(formObj);
      }
      closePropertyDialog();
    }
    function deleteProperty(row) {
      const idx = materialStore.materialProperties.findIndex((p) => p === row);
      if (idx !== -1) {
        materialStore.materialProperties.splice(idx, 1);
        // Unassign property from materials using it
        materialStore.materials.forEach((mat, mIdx) => {
          if (mat.property && mat.property.name === row.name) {
            materialStore.updateMaterial(mIdx, {
              ...mat,
              property: null,
            });
          }
        });
        materialStore.persistToLocalStorage?.();
      }
    }

    // --- Material dialog
    function openMaterialDialog(edit = false, row = null) {
      materialDialogVisible.value = true;
      isEditingMaterial.value = !!edit && row;
      if (edit && row) {
        materialEditIndex.value = materialStore.materials.findIndex(
          (m) => m === row
        );
        Object.assign(materialForm, JSON.parse(JSON.stringify(row)));
        if (row.property && row.property.name) {
          const idx = materialStore.materialProperties.findIndex(
            (p) => p.name === row.property.name
          );
          materialForm.property = idx >= 0 ? idx : null;
        }
      } else {
        materialEditIndex.value = null;
        Object.assign(materialForm, {
          name: "",
          info1: "",
          info2: "",
          info3: "",
          info4: "",
          info5: "",
          property: null,
          unit_of_measure: null,
          storageRules: [],
        });
      }
    }
    function closeMaterialDialog() {
      materialDialogVisible.value = false;
      materialEditIndex.value = null;
    }
    function saveMaterial() {
      let propObj = null;
      if (materialForm.property !== null) {
        propObj = materialStore.materialProperties[materialForm.property];
      }
      const toSave = {
        ...materialForm,
        property: propObj,
        storageRules: materialForm.storageRules || [],
      };
      if (isEditingMaterial.value && materialEditIndex.value !== null) {
        materialStore.updateMaterial(materialEditIndex.value, toSave);
      } else {
        materialStore.addMaterial(toSave);
      }
      closeMaterialDialog();
    }
    function deleteMaterial(row) {
      const idx = materialStore.materials.findIndex((m) => m === row);
      if (idx !== -1) {
        materialStore.materials.splice(idx, 1);
        materialStore.persistToLocalStorage?.();
      }
    }

    function filterTable() {}

    return {
      selectedTab,
      filteredMaterials,
      materialColumns,
      mFilters,
      openMaterialDialog,
      closeMaterialDialog,
      saveMaterial,
      materialDialogVisible,
      materialForm,
      isEditingMaterial,
      deleteMaterial,
      filteredProperties,
      propertyColumns,
      pFilters,
      openPropertyDialog,
      closePropertyDialog,
      saveMaterialProperty,
      propertyDialogVisible,
      propertyForm,
      isEditingProperty,
      deleteProperty,
      binOptions,
      openStorageRules,
      addStorageRule,
      removeStorageRule,
      storageRuleForm,
      storageRuleColumns,
      storageRuleDialogVisible,
      storageRuleTarget,
      storageRuleTargetIndex,
      resetStorageRuleForm,
      unitOptions,
      materialPropertyOptions,
      filterTable,
      resetMaterialFilters,
    };
  },
};
</script>
