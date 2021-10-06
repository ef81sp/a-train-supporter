<template>
  <DataTable
    :value="necessaryTimeArray"
    class="m-2 p-datatable-sm min-w-max"
    editMode="cell"
    @cell-edit-complete="onCellEditComplete"
  >
    <template #header>
      {{ `${boundFor}線` }}
    </template>
    <Column field="from" header="発" class="w-5 min-w-max" />
    <Column field="to" header="着" class="w-5 min-w-max" />
    <Column field="necessaryTime" header="分" class="w-5 max-w-min">
      <template #editor="{ data, column }">
        <InputNumber
          :modelValue="data[column.props.field]"
          class="w-3rem"
          @input="onChangeCellValue"
        />
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
import { NecessaryTime, NecessaryTimeMap } from "@/types";
import { computed, defineComponent, PropType, ref } from "vue";
import clonedeep from "lodash.clonedeep";
import { useStore } from "@/store";

export default defineComponent({
  props: {
    trainTypeId: Number,
    necessaryTimeMap: Object as PropType<NecessaryTimeMap>,
    boundFor: String as PropType<"A" | "B">,
  },
  setup(props) {
    const necessaryTimeArray = computed(() => {
      if (!props.necessaryTimeMap) return [];
      return [...props.necessaryTimeMap.values()];
    });
    const store = useStore();
    const necessaryTimeOnCell = ref(0); // Vuex由来の値をv-modelにあてるわけにはいかない

    const onCellEditComplete = (
      e: Event & { data: NecessaryTime; field: string }
    ) => {
      if (!props.necessaryTimeMap) return;

      const newNecessaryTimeMap = clonedeep(props.necessaryTimeMap);
      const target = newNecessaryTimeMap.get(e.data.id);
      if (!target) return;
      if (target.necessaryTime === necessaryTimeOnCell.value) return;

      target.necessaryTime = necessaryTimeOnCell.value;
      store.dispatch("updateTrainTypeNecessaryTimeTable", {
        trainTypeId: props.trainTypeId,
        boundFor: props.boundFor,
        newNecessaryTimeMap,
      });
    };

    const onChangeCellValue = (e: Event & { value: number }) => {
      necessaryTimeOnCell.value = e.value;
    };

    return {
      necessaryTimeArray,
      onCellEditComplete,
      onChangeCellValue,
    };
  },
});
</script>
