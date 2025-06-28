<template>
  <q-page padding>
    <div class="q-gutter-md">
      <!-- Add New Order Section -->
      <q-card flat bordered class="q-mb-lg">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Add New Order</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="submitOrder">
            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">Order Details</div>

              <div class="row q-col-gutter-sm">
                <q-input
                  v-model="order.name"
                  label="Order Name"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Order Name is required']"
                />
                <q-input v-model="order.info1" label="Info 1" outlined dense />

                <q-input v-model="order.info2" label="Info 2" outlined dense />

                <q-input v-model="order.info3" label="Info 3" outlined dense />

                <q-input v-model="order.info4" label="Info 4" outlined dense />

                <q-input v-model="order.info5" label="Info 5" outlined dense />
              </div>
            </div>

            <fieldset class="q-field-group q-mt-md">
              <legend class="q-fieldset-legend text-subtitle1">
                Order Lines
              </legend>

              <div v-for="(line, index) in order.orderLines" :key="index">
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
                  <q-input
                    v-model="line.materialname"
                    label="Material Name"
                    outlined
                    dense
                  />

                  <q-input
                    v-model.number="line.quantity"
                    label="Quantity"
                    outlined
                    dense
                    type="number"
                    :rules="[
                      (val) =>
                        (val !== null && val >= 0) || 'Required, non-negative',
                    ]"
                  />

                  <q-input
                    v-model="line.info1"
                    label="Line Info 1"
                    outlined
                    dense
                  />

                  <q-input
                    v-model="line.info2"
                    label="Line Info 2"
                    outlined
                    dense
                  />

                  <q-input
                    v-model="line.info3"
                    label="Line Info 3"
                    outlined
                    dense
                  />

                  <q-input
                    v-model="line.info4"
                    label="Line Info 4"
                    outlined
                    dense
                  />

                  <q-input
                    v-model="line.info5"
                    label="Line Info 5"
                    outlined
                    dense
                  />
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
                label="Submit Order"
                icon="send"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <!-- Display Table for Orders -->
      <q-card flat bordered>
        <q-card-section class="bg-blue-grey-1 text-grey-8">
          <div class="text-h6">Existing Orders</div>
        </q-card-section>

        <q-table
          flat
          :rows="orderStore.orders"
          :columns="columns"
          row-key="name"
          class="q-mt-none"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th auto-width />
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td auto-width>
                <q-btn
                  size="sm"
                  color="accent"
                  round
                  dense
                  @click="props.expand = !props.expand"
                  :icon="
                    props.expand ? 'keyboard_arrow_up' : 'keyboard_arrow_down'
                  "
                />
              </q-td>
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                {{ props.row[col.field] }}
              </q-td>
            </q-tr>

            <!-- Expanded section for the tree table display -->
            <q-tr v-show="props.expand" :props="props">
              <q-td colspan="100%" class="nested-table-container q-pa-md">
                <div class="text-subtitle2 q-mb-sm">
                  Order Lines for {{ props.row.name }}
                </div>
                <q-table
                  flat
                  bordered
                  :rows="props.row.orderLines"
                  :columns="orderLineColumns"
                  hide-bottom
                  hide-header-scrollbar
                  class="nested-table"
                  :dense="$q.screen.lt.md"
                >
                  <template v-slot:no-data>
                    <q-card-section class="text-center text-grey-6">
                      No order lines added for this order.
                    </q-card-section>
                  </template>
                </q-table>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:no-data>
            <q-card-section class="full-width text-center text-grey-6 q-py-lg">
              No orders found. Start by adding a new order above!
            </q-card-section>
          </template>
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { useOrderStore } from "../stores/orderStore";
import { reactive } from "vue";
import { useQuasar } from "quasar";

export default {
  setup() {
    const orderStore = useOrderStore();
    const $q = useQuasar();

    const order = reactive({
      name: "",
      info1: "",
      info2: "",
      info3: "",
      info4: "",
      info5: "",
      orderLines: [],
    });

    const addOrderLine = () => {
      order.orderLines.push({
        materialname: "",
        quantity: null,
        info1: "",
        info2: "",
        info3: "",
        info4: "",
        info5: "",
      });
    };

    const removeOrderLine = (index) => {
      order.orderLines.splice(index, 1);
    };

    const submitOrder = () => {
      // Basic client-side validation
      if (!order.name) {
        $q.notify({
          type: "negative",
          message: "Order Name is required.",
        });
        return;
      }
      // Check if all order lines have valid quantities
      for (const line of order.orderLines) {
        if (line.quantity === null || line.quantity < 0) {
          $q.notify({
            type: "negative",
            message: "All order line quantities must be non-negative numbers.",
          });
          return;
        }
      }

      orderStore.addOrder(JSON.parse(JSON.stringify(order)));

      $q.notify({
        type: "positive",
        message: `Order "${order.name}" added successfully!`,
        position: "top",
      });

      // Reset form after submission
      order.name = "";
      order.info1 = "";
      order.info2 = "";
      order.info3 = "";
      order.info4 = "";
      order.info5 = "";
      order.orderLines = [];
    };

    return {
      order,
      addOrderLine,
      removeOrderLine,
      submitOrder,
      orderStore,
    };
  },
  data() {
    return {
      columns: [
        {
          name: "name",
          label: "Order Name",
          align: "left",
          field: "name",
          sortable: true,
        },
        { name: "info1", label: "Info 1", align: "left", field: "info1" },
        { name: "info2", label: "Info 2", align: "left", field: "info2" },
        { name: "info3", label: "Info 3", align: "left", field: "info3" },
        { name: "info4", label: "Info 4", align: "left", field: "info4" },
        { name: "info5", label: "Info 5", align: "left", field: "info5" },
      ],
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
/* Fieldset styling for better grouping */
.q-field-group {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 16px;
  position: relative;
  margin-bottom: 24px;
}

.q-fieldset-legend {
  position: absolute;
  top: -10px; /* Adjust based on font size to align vertically */
  left: 10px;
  background-color: white;
  padding: 0 8px;
  font-weight: 500;
  color: #555;
}

/* Nested table styling */
.nested-table-container {
  background-color: #f8f8f8;
  border-top: 1px solid #eee;
}

/* Specific style for each order line to give it a card-like feel */
.line-item-card {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fcfcfc;
  margin-bottom: 12px; /* Space between line items */
  padding-right: 40px; /* Make space for the delete button */
}

.line-item-card:last-child {
  margin-bottom: 0; /* No bottom margin for the last item */
}

/* Adjust delete button positioning within the order line */
.line-item-card .absolute-top-right {
  top: 4px;
  right: 4px;
}
</style>
