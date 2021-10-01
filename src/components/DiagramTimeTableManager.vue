<template>
  <template v-if="selectedDiagramDataSet">
    <p class="font-bold">
      {{ selectedDiagramDataSet.label }}
    </p>
    <div class="formgrid grid">
      <div class="field col-6">
        <label for="next-time" class="col-fixed text-sm" style="display: block">
          次発
        </label>
        <Calendar
          id="next-time"
          :timeOnly="true"
          hourFormat="24"
          v-model="time"
          class="w-10"
        />
      </div>
      <div class="field col-6">
        <label
          for="cycle-time"
          class="col-fixed text-sm"
          style="display: block"
        >
          周期(分)
        </label>
        <InputNumber
          id="cycle-time"
          mode="decimal"
          v-model="cycle"
          class="w-10"
        />
      </div>
      <div class="field col-6">
        <label
          for="startStation"
          class="col-fixed text-sm"
          style="display: block"
        >
          発駅
        </label>
        <Dropdown
          id="startStation"
          v-model="startStation"
          :options="stationList"
          class="w-10"
        />
      </div>
      <div class="field col-6">
        <label
          for="endStation"
          class="col-fixed text-sm"
          style="display: block"
        >
          着駅
        </label>
        <Dropdown
          id="endStation"
          v-model="endStation"
          :options="stationList"
          class="w-10"
        />
      </div>
      <div class="field col-6">
        <label for="boundFor" class="col-fixed text-sm" style="display: block">
          方面
        </label>
        <Dropdown
          id="boundFor"
          v-model="boundFor"
          :options="['A', 'B', 'AB', 'BA']"
          class="w-10"
        />
      </div>
    </div>
    <Button label="ふやす" @click="testAdd" />
    <DataTable
      :value="selectedDiagramDataSet?.data"
      :scrollable="true"
      scrollHeight="flex"
      class="p-datatable-sm"
    >
      <Column field="station" header="駅" />
      <Column field="time" header="時刻">
        <template #body="slotProps">
          {{ formatDdHhmmToHhmm(slotProps.data.time) }}
        </template>
      </Column>
    </DataTable>
  </template>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from "vue";
import {
  addMinute,
  formatDdHhmmToHhmm,
  generateChartData,
} from "@/logics/diagram";
import dayjs from "dayjs";
import { useStore } from "@/store";
export default defineComponent({
  props: {
    diagramDataSetId: { type: Number, default: undefined },
    trainTypeId: { type: Number, default: undefined },
    refreshChart: Function,
  },
  setup(props) {
    const time = ref();
    const cycle = ref<number>(0);
    const boundFor = ref<"A" | "B" | "AB" | "BA">("A");

    const store = useStore();

    const stationList = computed(
      () => store.getters.getShouldRecordTimeStationNameList
    );

    const selectedDiagramDataSet = computed(() => {
      if (props.diagramDataSetId == undefined) {
        return;
      }
      return store.getters.getTrainDiagramDataSetById(props.diagramDataSetId);
    });

    const startStation = ref<string>(
      selectedDiagramDataSet.value?.data.length
        ? selectedDiagramDataSet.value.data[
            selectedDiagramDataSet.value.data.length - 1
          ].station
        : stationList.value[0]
    );
    const endStation = ref<string>(
      stationList.value[stationList.value.length - 1]
    );

    const latestTimeOnTheList = computed(() =>
      selectedDiagramDataSet.value?.data.length
        ? selectedDiagramDataSet.value.data[
            selectedDiagramDataSet.value.data.length - 1
          ].time
        : ""
    );

    time.value = selectedDiagramDataSet.value?.data.length
      ? dayjs(
          selectedDiagramDataSet.value.data[
            selectedDiagramDataSet.value.data.length - 1
          ].time
        )
          .add(10, "m")
          .toDate()
      : dayjs("2021-10-14 04:00:00").toDate();

    watch(latestTimeOnTheList, (newTime) => {
      time.value = dayjs(newTime).toDate();
    });

    const testAdd = () => {
      if (!selectedDiagramDataSet.value) return;
      if (!props.trainTypeId) return;

      const trainType = store.getters.getTrainType(props.trainTypeId);
      if (!trainType) return;

      store.commit("updateDiagramData", {
        id: 1,
        data: [
          ...selectedDiagramDataSet.value?.data,
          ...generateChartData({
            startTime: time.value,
            trainType,
            startStation: startStation.value,
            endStation: endStation.value,
            boundFor: boundFor.value,
            terminalStation: store.getters.getTerminalStation,
          }),
        ],
      });
      props.refreshChart && props.refreshChart();
    };

    return {
      time,
      cycle,
      startStation,
      endStation,
      stationList,
      boundFor,
      formatDdHhmmToHhmm,
      selectedDiagramDataSet,
      testAdd,
    };
  },
});
</script>

<style>
.p-inputnumber-input {
  width: inherit;
}
</style>