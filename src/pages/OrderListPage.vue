<template>
  <q-page class="q-pa-md">
    <div class="d-flex">
      <q-input outlined v-model="selectedDate" label="配送日期" dense readonly class="q-mr-sm">
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="selectedDate" mask="YYYY-MM-DD" />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-select
        standout
        outlined
        v-model="selectedCity"
        :options="cityOptions"
        label="配送縣市"
        class="q-mr-sm q-mb-sm select-w"
        dense
      />

      <q-select
        standout
        outlined
        v-model="selectedOrderStatus"
        :options="orderStatusOptions"
        label="訂單狀態"
        class="q-mr-sm q-mb-sm select-w"
        dense
      />

      <q-select
        standout
        outlined
        v-model="selectedPayStatus"
        :options="payOptions"
        label="付款狀態"
        class="q-mr-sm q-mb-sm select-w"
        dense
      />

      <q-select
        standout
        outlined
        v-model="selectedFulfillmentStatus"
        :options="fulfillmentOptions"
        label="出貨狀態"
        class="q-mr-sm q-mb-sm select-w"
        dense
      />
    </div>

    <q-table
      title="Order List"
      :rows="orders"
      :columns="columns"
      row-key="id"
      selection="multiple"
      v-model:selected="selectedRows"
      :loading="orders.length === 0"
      :pagination="pagination"
      @update:pagination="(val) => Object.assign(pagination, val)"
      :rows-per-page-options="[5, 10, 15, 20]"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td>
            <q-checkbox
              v-model="props.selected"
              @update:model-value="(val) => handleCheckboxChange(val, props.row)"
            />
          </q-td>
          <q-td>
            {{ props.row.order_name }}
          </q-td>
          <q-td>
            {{ props.row.customer_name }}
          </q-td>
          <q-td> $ {{ props.row.total_price }} </q-td>
          <q-td>
            {{ props.row.created_at }}
          </q-td>
          <q-td>
            <div>
              {{ orderStatusName(props.row.order_status) }} /
              {{ financialStatusName(props.row.financial_status) }}
            </div>
            {{ fulfillmentStatusName(props.row.fulfillment_status) }} /
          </q-td>
          <q-td>
            <div v-if="props.row.delivery">
              <div>
                {{ props.row.delivery_date }}
              </div>
              <div>
                {{ props.row.delivery_time }}
              </div>
            </div>
          </q-td>

          <q-td>
            {{ props.row.receiver_address }}
          </q-td>
          <q-td>
            {{ props.row.internal_note }}
          </q-td>
        </q-tr>
      </template>
      <template v-slot:bottom="scope">
        <div class="q-pa-sm full-width row justify-start">
          <!-- 每頁筆數選擇器 -->
          <q-select
            filled
            v-model="pagination.rowsPerPage"
            :options="pageSizeOptions"
            label="每頁顯示筆數"
            class="q-mr-sm"
          />

          <!-- 分頁按鈕 -->
          <q-pagination
            v-model="pagination.page"
            :max="
              Math.ceil(
                ((scope.pagination && scope.pagination.rowsNumber) || 0) / pagination.rowsPerPage,
              )
            "
            boundary-numbers
            max-pages="5"
            dense
            class="q-mr-sm"
            style="display: none"
          />

          <!-- 顯示總筆數 -->
          <div class="q-gutter-sm">
            <span>
              顯示 {{ pagination.rowsPerPage * (pagination.page - 1) + 1 }} 到
              {{
                Math.min(
                  pagination.rowsPerPage * pagination.page,
                  (pagination && pagination.rowsNumber) || 0,
                )
              }}
              / {{ (pagination && pagination.rowsNumber) || 0 }} 筆
            </span>
          </div>
        </div>
      </template>
      <template v-slot:no-data>
        <div class="text-center text-grey q-pa-md text-weight-bold text-primary">
          😕 沒有找到符合條件的訂單喔～
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { IOrder } from 'src/interface/order';
import { useRouter } from 'vue-router';
import { tokenExpired } from 'src/utils/errorhandle';
import {
  getOrder,
  orderStatusName,
  financialStatusName,
  fulfillmentStatusName,
} from 'src/utils/order';

const router = useRouter();

const orders = ref<IOrder[]>([]);
const selectedRows = ref<IOrder[]>([]);
const columns = [
  { name: 'order_name', label: '訂單編號', field: 'order_name' },
  { name: 'customer_name', label: '顧客', field: 'customer_name' },
  { name: 'total_price', label: '金額', field: 'total_price' },
  { name: 'created_at', label: '訂單成立時間', field: 'created_at' },
  { name: 'order_status', label: '訂單狀態', field: 'order_status' },
  {
    name: 'delivery',
    label: '配送日期與時段',
    field: 'delivery',
  },
  { name: 'receiver_address', label: '配送地址', field: 'receiver_address' },
  { name: 'internal_note', label: '備註', field: 'internal_note' },
];

// 分頁控制設定
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

// 每頁筆數選項
const pageSizeOptions = [5, 10, 20, 50, 100];
const cityOptions = ref<string[]>(['台中市', '台南市', '台北市', '新北市', '高雄市']);
const orderStatusOptions = [
  { label: '已開啟', value: 'open' },
  { label: '已取消', value: 'cancelled' },
];
const payOptions = [
  { label: '已收到款項', value: 'paid' },
  { label: '未收到款項', value: 'pending' },
];
const fulfillmentOptions = [
  { label: '已收貨', value: 'received' },
  { label: '未出貨', value: 'preparing' },
];

const fetchOrders = async () => {
  try {
    const payload = {
      delivery_date: selectedDate?.value || undefined,
      city: [selectedCity.value],
      order_status: selectedOrderStatus.value?.value,
      financial_status: selectedPayStatus.value?.value,
      fulfillment_status: selectedFulfillmentStatus.value?.value,
      page: pagination.value.page,
      size: pagination.value.rowsPerPage,
    };
    const response = await getOrder(payload);

    orders.value = response.data.content.map((list: IOrder) => ({ ...list, delivery: true }));
    pagination.value.rowsNumber = response.data.size || response.data.content.length;
  } catch (error: unknown) {
    const isTokenExpired = tokenExpired(error);
    if (isTokenExpired) {
      await router.push('/login');
    }
  }
};

const selectedCity = ref('');
const selectedDate = ref('');
const selectedOrderStatus = ref<{ label: string; value: string } | null>(null);
const selectedPayStatus = ref<{ label: string; value: string } | null>(null);
const selectedFulfillmentStatus = ref<{ label: string; value: string } | null>(null);

const handleCheckboxChange = (checked: boolean, row: IOrder) => {
  const index = selectedRows.value.findIndex((r) => r.id === row.id);

  if (checked && index === -1) {
    selectedRows.value.push(row);
  } else if (!checked && index !== -1) {
    selectedRows.value.splice(index, 1);
  }
};

onMounted(fetchOrders);

watch(
  [selectedDate, selectedCity, selectedOrderStatus, selectedPayStatus, selectedFulfillmentStatus],
  async () => {
    pagination.value.page = 1; // 每次篩選要重設回第 1 頁
    await fetchOrders();
  },
);

watch(() => pagination.value.page, fetchOrders);
watch(() => pagination.value.rowsPerPage, fetchOrders);
</script>
<style scoped>
.q-mr-sm {
  width: 150px;
}

.q-gutter-sm {
  display: flex;
  align-items: center;
}

.d-flex {
  display: flex;
}

.select-w {
  width: 180px;
}
</style>
