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
    <Column class="max-w-min">
      <template #header>
        <Button
          icon="pi pi-trash"
          class="p-button-warning p-button-sm"
          @click="deleteTime"
        />
      </template>
      <template #body="slotProps">
        <Checkbox
          v-model="checkBoxesForDelete[slotProps.index]"
          :binary="true"
          @input="(v) => onChangeCheckbox(slotProps.index, v)"
        />
      </template>
    </Column>
  </DataTable>
</template>
<script lang="ts">
import DiagramTimeTableManagerTimeEditor from "@/components/DiagramTimeTableManagerTimeEditor.vue";
import { DiagramData } from "@/types/diagram";
import { computed, defineComponent, PropType, ref, watch } from "vue";
import { useStore } from "@/store";
import { stationId } from "@/types";
import { formatDdHhmmToHhmm } from "@/logics/diagram";
import rfdc from "rfdc";
import { DATE_FORMAT } from "@/common/const";
import dayjs from "dayjs";

const clonedeep = rfdc();

export default defineComponent({
  components: {
    DiagramTimeTableManagerTimeEditor,
  },
  props: {
    modelValue: { type: Object as PropType<DiagramData[]>, required: true },
  },
  emits: ["update:modelValue"],
  setup(props, context) {
    const store = useStore();
    const getStationName = computed(
      () => (id: stationId) => store.getters.getStation(id)?.name
    );

    const copy = ref(clonedeep(props.modelValue));
    const checkBoxesForDelete = ref<boolean[]>(
      props.modelValue.map(() => false)
    );
    watch(
      () => props.modelValue,
      () => {
        copy.value = clonedeep(props.modelValue);
      }
    );
    const onCellEditComplete = (e: { data: DiagramData; index: number }) => {
      const from = dayjs(props.modelValue[e.index].time, DATE_FORMAT);
      const to = dayjs(e.data.time, DATE_FORMAT);
      const offset = to.diff(from, "minutes");
      copy.value.forEach((v, idx) => {
        if (idx <= e.index) return;
        v.time = dayjs(v.time, DATE_FORMAT)
          .add(offset, "minutes")
          .format(DATE_FORMAT);
      });
      context.emit("update:modelValue", copy.value);
    };
    const onChangeCheckbox = (index: number, value: boolean) => {
      if (value) {
        let hasTrue = false;
        for (let i = 0; i < checkBoxesForDelete.value.length; i++) {
          if (i === index) {
            checkBoxesForDelete.value[i] = value;
            break;
          } else {
            if (!hasTrue && checkBoxesForDelete.value[i]) {
              hasTrue = true;
            }
            if (hasTrue) {
              checkBoxesForDelete.value[i] = value;
            }
          }
        }
      } else {
        for (let i = index; i < checkBoxesForDelete.value.length; i++) {
          if (i > index && !checkBoxesForDelete.value[i]) {
            break;
          }
          checkBoxesForDelete.value[i] = value;
        }
      }
    };
    const resetCheckbox = () => {
      checkBoxesForDelete.value = props.modelValue.map(() => false);
    };
    const deleteTime = () => {
      context.emit(
        "update:modelValue",
        copy.value.filter((v, i) => !checkBoxesForDelete.value[i])
      );
      resetCheckbox();
    };
    return {
      getStationName,
      formatDdHhmmToHhmm,
      copy,
      onCellEditComplete,
      checkBoxesForDelete,
      onChangeCheckbox,
      deleteTime,
    };
  },
});
</script>
