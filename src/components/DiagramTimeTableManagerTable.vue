<template>
  <DataTable
    :value="copy"
    :scrollable="true"
    editMode="cell"
    @cell-edit-complete="onCellEditComplete"
    scrollHeight="50vh"
    class="p-datatable-sm"
  >
    <Column field="station" header="駅">
      <template #body="slotProps">
        {{ getStationName(slotProps.data.stationId) }}
      </template>
    </Column>
    <Column field="time" header="時刻">
      <template #body="slotProps">
        {{ formatDdHhmmToHhmm(slotProps.data.time) }}
      </template>
      <template #editor="slotProps">
        <DiagramTimeTableManagerTimeEditor v-model="slotProps.data['time']" />
      </template>
    </Column>
  </DataTable>
</template>
<script lang="ts">
import DiagramTimeTableManagerTimeEditor from "@/components/DiagramTimeTableManagerTimeEditor.vue";
import { DiagramData } from "@/types/diagram";
import { computed, defineComponent, PropType, ref, watch } from "vue";
import clonedeep from "lodash.clonedeep";
import { useStore } from "@/store";
import { stationId } from "@/types";
import { formatDdHhmmToHhmm } from "@/logics/diagram";

export default defineComponent({
  components: {
    DiagramTimeTableManagerTimeEditor,
  },
  props: {
    modelValue: Object as PropType<DiagramData[]>,
  },
  emits: ["update:modelValue"],
  setup(props, context) {
    const store = useStore();
    const getStationName = computed(
      () => (id: stationId) => store.getters.getStation(id)?.name
    );

    const copy = ref(clonedeep(props.modelValue));
    watch(
      () => props.modelValue,
      () => {
        copy.value = clonedeep(props.modelValue);
      }
    );
    const onCellEditComplete = () => {
      context.emit("update:modelValue", copy.value);
    };
    return {
      getStationName,
      formatDdHhmmToHhmm,
      copy,
      onCellEditComplete,
    };
  },
});
</script>
