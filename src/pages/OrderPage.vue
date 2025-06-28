<template>
  <q-page padding>
    <div class="row q-col-gutter-lg">
      <!-- Left: Orders List -->
      <div class="col-12 col-md-4">
        <q-card flat bordered>
          <q-card-section class="bg-blue-grey-1 text-grey-8">
            <div class="row items-center justify-between">
              <div class="text-h6">Existing Orders</div>
              <q-btn
                color="primary"
                icon="add"
                label="Add New Order"
                dense
                @click="
                  () => {
                    showOrderDialog = true;
                    isEditing = false;
                  }
                "
              />
            </div>
          </q-card-section>
          <q-list>
            <q-item
              v-for="orderItem in orderStore.orders"
              :key="orderItem.name"
              clickable
              :active="selectedOrder && selectedOrder.name === orderItem.name"
              @click="selectedOrder = orderItem"
            >
              <q-item-section>
                <q-item-label>{{ orderItem.name }}</q-item-label>
                <q-item-label caption>
                  Direction: {{ orderItem.direction }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  dense
                  round
                  color="primary"
                  icon="edit"
                  @click.stop="editOrder(orderItem)"
                  size="sm"
                  class="q-ml-xs"
                />
                <q-btn
                  flat
                  dense
                  round
                  color="negative"
                  icon="delete"
                  @click.stop="deleteOrder(orderItem)"
                  size="sm"
                />
              </q-item-section>
            </q-item>
            <q-item v-if="orderStore.orders.length === 0">
              <q-item-section class="text-grey-6"
                >No orders found</q-item-section
              >
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Right: Order Details + Lines -->
      <div class="col-12 col-md-8">
        <!-- Order Lines Table for selected order -->
        <q-card v-if="selectedOrder" flat bordered>
          <q-card-section class="bg-grey-1 text-grey-8">
            <div class="text-h6">
              Order Lines for "{{ selectedOrder.name }}"
            </div>
            <div class="q-mt-sm q-mb-sm">
              <div>
                <strong>Direction:</strong> {{ selectedOrder.direction }}
              </div>
              <div v-if="selectedOrder.info1">
                <strong>Info 1:</strong> {{ selectedOrder.info1 }}
              </div>
              <div v-if="selectedOrder.info2">
                <strong>Info 2:</strong> {{ selectedOrder.info2 }}
              </div>
              <div v-if="selectedOrder.info3">
                <strong>Info 3:</strong> {{ selectedOrder.info3 }}
              </div>
              <div v-if="selectedOrder.info4">
                <strong>Info 4:</strong> {{ selectedOrder.info4 }}
              </div>
              <div v-if="selectedOrder.info5">
                <strong>Info 5:</strong> {{ selectedOrder.info5 }}
              </div>
            </div>
          </q-card-section>
          <q-table
            flat
            :rows="selectedOrder.orderLines"
            :columns="orderLineColumns"
            row-key="materialname"
            :dense="$q.screen.lt.md"
          >
            <template v-slot:no-data>
              <q-card-section class="text-center text-grey-6">
                No order lines for this order.
              </q-card-section>
            </template>
          </q-table>
        </q-card>
        <div v-else class="text-grey-6 q-pa-md">
          <em>Select an order to see its lines.</em>
        </div>
      </div>
    </div>

    <!-- Add/Edit Order Dialog -->
    <q-dialog v-model="showOrderDialog" maximized>
      <q-card style="min-width: 600px; max-width: 900px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            {{ isEditing ? "Edit Order" : "Add New Order" }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="submitOrder">
            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">Order Details</div>
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="order.name"
                    label="Order Name"
                    outlined
                    dense
                    :disable="isEditing"
                    :rules="[(val) => !!val || 'Order Name is required']"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="order.direction"
                    label="Direction"
                    outlined
                    dense
                    :options="directionOptions"
                    :rules="[(val) => !!val || 'Direction is required']"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="order.info1"
                    label="Info 1"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="order.info2"
                    label="Info 2"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="order.info3"
                    label="Info 3"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="order.info4"
                    label="Info 4"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="order.info5"
                    label="Info 5"
                    outlined
                    dense
                  />
                </div>
              </div>
            </div>

            <fieldset class="q-field-group q-mt-md">
              <legend class="q-fieldset-legend text-subtitle1">
                Order Lines
              </legend>
              <div
                v-for="(line, index) in order.orderLines"
                :key="index"
                class="q-mb-md line-item-card"
              >
                <q-btn
                  dense
                  round
                  color="negative"
                  icon="delete"
                  @click="removeOrderLine(index)"
                  flat
                  class="float-right"
                />
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-md-3">
                    <q-select
                      v-model="line.materialname"
                      label="Material Name"
                      outlined
                      dense
                      :options="materialOptions"
                      emit-value
                      option-label="name"
                    />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-input
                      v-model.number="line.quantity"
                      label="Quantity"
                      outlined
                      dense
                      type="number"
                      :rules="[
                        (val) =>
                          (val !== null && val >= 0) ||
                          'Required, non-negative',
                      ]"
                    />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-input
                      v-model="line.info1"
                      label="Line Info 1"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-input
                      v-model="line.info2"
                      label="Line Info 2"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-input
                      v-model="line.info3"
                      label="Line Info 3"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-input
                      v-model="line.info4"
                      label="Line Info 4"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-input
                      v-model="line.info5"
                      label="Line Info 5"
                      outlined
                      dense
                    />
                  </div>
                </div>
              </div>
              <div class="q-mt-sm">
                <q-btn
                  outline
                  color="primary"
                  label="Add Order Line"
                  icon="add"
                  @click="addOrderLine"
                />
              </div>
            </fieldset>

            <div class="q-mt-lg text-right">
              <q-btn
                type="submit"
                color="primary"
                :label="isEditing ? 'Update Order' : 'Submit Order'"
                :icon="isEditing ? 'save' : 'send'"
              />
              <q-btn
                flat
                color="grey"
                label="Cancel"
                icon="close"
                class="q-ml-sm"
                @click="
                  () => {
                    showOrderDialog = false;
                    isEditing = false;
                  }
                "
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { useOrderStore } from "../stores/orderStore";
import { useMaterialStore } from "../stores/useMaterialStore";
import { reactive, computed, ref, watch } from "vue";
import { useQuasar } from "quasar";

export default {
  setup() {
    const orderStore = useOrderStore();
    const materialStore = useMaterialStore();
    const $q = useQuasar();

    const selectedOrder = ref(null);
    const showOrderDialog = ref(false);
    const isEditing = ref(false);
    const editingOrderName = ref("");

    const order = reactive({
      name: "",
      direction: "",
      info1: "",
      info2: "",
      info3: "",
      info4: "",
      info5: "",
      orderLines: [],
    });

    const directionOptions = [
      { label: "Put", value: "put" },
      { label: "Pick", value: "pick" },
    ];

    function copyOrderData(src) {
      order.name = src.name;
      order.direction = src.direction;
      order.info1 = src.info1 || "";
      order.info2 = src.info2 || "";
      order.info3 = src.info3 || "";
      order.info4 = src.info4 || "";
      order.info5 = src.info5 || "";
      order.orderLines = src.orderLines
        ? src.orderLines.map((line) => ({ ...line }))
        : [];
    }

    function resetOrderForm() {
      order.name = "";
      order.direction = "";
      order.info1 = "";
      order.info2 = "";
      order.info3 = "";
      order.info4 = "";
      order.info5 = "";
      order.orderLines = [];
    }

    function editOrder(orderToEdit) {
      copyOrderData(orderToEdit);
      editingOrderName.value = orderToEdit.name;
      isEditing.value = true;
      showOrderDialog.value = true;
    }

    function submitOrder() {
      if (!order.name) {
        $q.notify({
          type: "negative",
          message: "Order Name is required.",
        });
        return;
      }
      order.direction =
        order.direction && order.direction.value
          ? order.direction.value
          : order.direction;

      if (!order.direction) {
        $q.notify({
          type: "negative",
          message: "Direction is required.",
        });
        return;
      }
      for (const line of order.orderLines) {
        line.materialname =
          line.materialname && line.materialname.name
            ? line.materialname.name
            : line.materialname;
        if (line.quantity === null || line.quantity < 0) {
          $q.notify({
            type: "negative",
            message: "All order line quantities must be non-negative numbers.",
          });
          return;
        }
      }
      if (isEditing.value) {
        orderStore.updateOrder(
          editingOrderName.value,
          JSON.parse(JSON.stringify(order))
        );
        $q.notify({
          type: "positive",
          message: `Order "${order.name}" updated!`,
          position: "top",
        });
      } else {
        orderStore.addOrder(JSON.parse(JSON.stringify(order)));
        $q.notify({
          type: "positive",
          message: `Order "${order.name}" added successfully!`,
          position: "top",
        });
      }
      resetOrderForm();
      isEditing.value = false;
      editingOrderName.value = "";
      showOrderDialog.value = false;
    }

    function addOrderLine() {
      order.orderLines.push({
        materialname: "",
        quantity: null,
        info1: "",
        info2: "",
        info3: "",
        info4: "",
        info5: "",
      });
    }

    function removeOrderLine(index) {
      order.orderLines.splice(index, 1);
    }

    function deleteOrder(orderRow) {
      $q.dialog({
        title: "Confirm Delete",
        message: `Are you sure you want to delete the order "${orderRow.name}"?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        orderStore.deleteOrder(orderRow.name);
        if (selectedOrder.value && selectedOrder.value.name === orderRow.name) {
          selectedOrder.value = null;
        }
        $q.notify({
          type: "positive",
          message: `Order "${orderRow.name}" deleted.`,
          position: "top",
        });
      });
    }

    const materialOptions = computed(() => materialStore.materials || []);

    // -- REACTIVE selectedOrder AFTER UPDATE --
    watch(
      () => orderStore.orders.map((o) => o.name),
      () => {
        if (selectedOrder.value) {
          const updated = orderStore.orders.find(
            (o) => o.name === selectedOrder.value.name
          );
          selectedOrder.value = updated || null;
        }
      }
    );
    // -----------------------------------------

    return {
      order,
      directionOptions,
      addOrderLine,
      removeOrderLine,
      submitOrder,
      orderStore,
      materialOptions,
      selectedOrder,
      deleteOrder,
      showOrderDialog,
      isEditing,
      editOrder,
    };
  },
  data() {
    return {
      orderLineColumns: [
        {
          name: "materialname",
          label: "Material Name",
          align: "left",
          field: "materialname",
        },
        {
          name: "quantity",
          label: "Quantity",
          align: "right",
          field: "quantity",
          format: (val) => `${val || 0}`,
          sortable: true,
        },
        { name: "info1", label: "Info 1", align: "left", field: "info1" },
        { name: "info2", label: "Info 2", align: "left", field: "info2" },
        { name: "info3", label: "Info 3", align: "left", field: "info3" },
        { name: "info4", label: "Info 4", align: "left", field: "info4" },
        { name: "info5", label: "Info 5", align: "left", field: "info5" },
      ],
    };
  },
};
</script>

<style scoped>
.q-field-group {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 16px;
  position: relative;
  margin-bottom: 24px;
}

.q-fieldset-legend {
  position: absolute;
  top: -10px;
  left: 10px;
  background-color: white;
  padding: 0 8px;
  font-weight: 500;
  color: #555;
}

.nested-table-container {
  background-color: #f8f8f8;
  border-top: 1px solid #eee;
}

.line-item-card {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fcfcfc;
  margin-bottom: 12px;
  padding-right: 40px;
}

.line-item-card:last-child {
  margin-bottom: 0;
}

.line-item-card .absolute-top-right {
  top: 4px;
  right: 4px;
}

@media (max-width: 600px) {
  .q-dialog .q-card {
    min-width: 100vw !important;
    max-width: 100vw !important;
    border-radius: 0 !important;
    padding: 0 !important;
  }
}
</style>
