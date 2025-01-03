<template>
  <q-page padding>
    <div class="q-gutter-md">
      <q-card-section>
        <div class="text-h6">Add New Order</div>
      </q-card-section>

      <q-form @submit.prevent="submitOrder">
        <div class="inline-inputs">
          <q-input v-model="order.name" label="Order Name" dense filled />
          <q-input v-model="order.info1" label="Info 1" dense filled />
          <q-input v-model="order.info2" label="Info 2" dense filled />
          <q-input v-model="order.info3" label="Info 3" dense filled />
          <q-input v-model="order.info4" label="Info 4" dense filled />
          <q-input v-model="order.info5" label="Info 5" dense filled />
        </div>

        <q-list bordered>
          <q-item-divider>Order Lines</q-item-divider>
          <div
            v-for="(line, index) in order.orderLines"
            :key="index"
            class="inline-inputs"
          >
            <q-input
              v-model="line.materialname"
              label="Material Name"
              dense
              filled
            />
            <q-input
              v-model="line.quantity"
              label="Quantity"
              dense
              filled
              type="number"
            />

            <q-input v-model="line.info1" label="Info 1" dense filled />
            <q-input v-model="line.info2" label="Info 2" dense filled />
            <q-input v-model="line.info3" label="Info 3" dense filled />
            <q-input v-model="line.info4" label="Info 4" dense filled />
            <q-input v-model="line.info5" label="Info 5" dense filled />

            <q-btn
              dense
              round
              color="negative"
              icon="remove"
              @click="removeOrderLine(index)"
            />
          </div>

          <q-btn
            flat
            color="primary"
            label="Add Order Line"
            @click="addOrderLine"
          />
        </q-list>

        <q-btn type="submit" color="primary" label="Submit Order" />
      </q-form>

      <q-space />

      <!-- Display Table for Orders -->
      <q-table
        flat
        bordered
        title="Orders"
        :rows="orderStore.orders"
        :columns="columns"
        row-key="name"
        class="q-mt-lg"
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
                :icon="props.expand ? 'remove' : 'add'"
              />
            </q-td>
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              {{ props.row[col.name] }}
            </q-td>
          </q-tr>

          <!-- Expanded section for the tree table display -->
          <q-tr v-show="props.expand" :props="props" class="nested-row">
            <q-td colspan="100%" class="text-left">
              <q-table
                :rows="props.row.orderLines"
                :columns="orderLineColumns"
                flat
                dense
                hide-bottom
                class="nested-table"
              >
                <template v-slot:header="lineProps">
                  <q-tr :props="lineProps">
                    <q-th
                      v-for="col in lineProps.cols"
                      :key="col.name"
                      :props="lineProps"
                    >
                      {{ col.label }}
                    </q-th>
                  </q-tr>
                </template>

                <template v-slot:body="lineProps">
                  <q-tr :props="lineProps">
                    <q-td
                      v-for="col in lineProps.cols"
                      :key="col.name"
                      :props="lineProps"
                    >
                      {{ lineProps.row[col.name] }}
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script>
import { useOrderStore } from "../stores/orderStore";
import { reactive } from "vue";

export default {
  setup() {
    const orderStore = useOrderStore();

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
        quantity: 0,
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
      orderStore.addOrder({ ...order });
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
        { name: "name", label: "Order Name", align: "left" },
        { name: "info1", label: "Info 1", align: "left" },
        { name: "info2", label: "Info 2", align: "left" },
        { name: "info3", label: "Info 3", align: "left" },
        { name: "info4", label: "Info 4", align: "left" },
        { name: "info5", label: "Info 5", align: "left" },
      ],
      orderLineColumns: [
        { name: "materialname", label: "Material Name", align: "left" },
        { name: "quantity", label: "Quantity", align: "left", sortable: true },
        { name: "info1", label: "Info 1", align: "left" },
        { name: "info2", label: "Info 2", align: "left" },
        { name: "info3", label: "Info 3", align: "left" },
        { name: "info4", label: "Info 4", align: "left" },
        { name: "info5", label: "Info 5", align: "left" },
      ],
    };
  },
};
</script>

<style scoped>
.inline-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.q-input {
  flex: 1;
  min-width: 180px;
}

.order-line {
  margin-top: 1rem;
}

.nested-row {
  background-color: #f0f0f0;
}

.nested-table {
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 5px;
}
</style>
