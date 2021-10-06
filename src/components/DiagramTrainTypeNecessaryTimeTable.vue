<template>
  <DataTable :value="necessaryTimeArray" class="m-2 p-datatable-sm">
    <template #header>
      {{ headerText }}
    </template>
    <Column field="from" header="発" />
    <Column field="to" header="着" />
    <Column field="necessaryTime" header="分" />
    <template #footer>
      合計{{
        necessaryTimeArray.reduce((prev, cur) => prev + cur.necessaryTime, 0)
      }}分
    </template>
  </DataTable>
</template>

<script lang="ts">
import { NecessaryTimeMap } from "@/types";
import { computed, defineComponent, PropType } from "vue";

export default defineComponent({
  props: {
    necessaryTime: Object as PropType<NecessaryTimeMap>,
    headerText: String,
  },
  setup(props) {
    const necessaryTimeArray = computed(() => {
      if (!props.necessaryTime) return [];
      return [...props.necessaryTime.values()];
    });

    return {
      necessaryTimeArray,
    };
  },
});
</script>
