<template>
  <DataTable
    :value="necessaryTimeArray"
    class="my-1 p-datatable-sm min-w-max max-w-full"
    editMode="cell"
    @cell-edit-complete="onCellEditComplete"
  >
    <template #header>
      {{ `${boundFor}線` }}
    </template>
    <Column field="from" header="発" class="w-4 max-w-0">
      <template #body="slotProps">
        {{ getStationName(slotProps.data.from) }}
      </template>
    </Column>
    <Column field="to" header="着" class="w-4 max-w-0">
      <template #body="slotProps">
        {{ getStationName(slotProps.data.to) }}
      </template>
    </Column>
    <Column field="necessaryTime" header="分" class="max-w-0">
      <template #editor="{ data, column }">
        <InputNumber v-model="data[column.props.field]" class="w-3rem" />
      </template>
    </Column>
    <template #footer>
      合計{{
        necessaryTimeArray.reduce((prev, cur) => prev + cur.necessaryTime, 0)
      }}分
    </template>
  </DataTable>
</template>

<script lang="ts">
import { NecessaryTime, NecessaryTimeMap, stationId } from "@/types";
import { computed, defineComponent, PropType, ref } from "vue";
import rfdc from "rfdc";
import { useStore } from "@/store";

const clonedeep = rfdc();

export default defineComponent({
  props: {
    trainTypeId: Number,
    modelValue: Object as PropType<NecessaryTimeMap>,
    boundFor: String as PropType<"A" | "B">,
  },
  emits: ["update:modelValue"],
  setup(props, context) {
    const necessaryTimeArray = computed(() => {
      if (!props.modelValue) return [];
      return [...props.modelValue.values()];
    });
    const store = useStore();

    const getStationName = computed(
      () => (id: stationId) => store.getters.getStation(id)?.name
    );
    const onCellEditComplete = (
      e: Event & { data: NecessaryTime; field: string }
    ) => {
      if (!props.modelValue) return;
      const newNecessaryTimeMap = clonedeep(props.modelValue);
      newNecessaryTimeMap.set(e.data.id, e.data);
      context.emit("update:modelValue", newNecessaryTimeMap);
    };

    return {
      necessaryTimeArray,
      onCellEditComplete,
      getStationName,
    };
  },
});
</script>
