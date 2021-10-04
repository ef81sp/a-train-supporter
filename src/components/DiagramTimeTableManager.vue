<template>
  <template v-if="selectedDiagramDataSet">
    <p class="font-bold">
      {{ selectedDiagramDataSet.label }}
    </p>
    <div class="formgrid grid">
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
      <div class="field col-4">
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
      <div class="field col-4">
        <label
          for="next-nextDepartureTime"
          class="col-fixed text-sm"
          style="display: block"
        >
          次発
        </label>
        <Calendar
          id="next-nextDepartureTime"
          :timeOnly="true"
          hourFormat="24"
          v-model="nextDepartureTime"
          class="w-10"
        />
      </div>
      <div class="field col-4">
        <label
          for="turn-cycle-nextDepartureTime"
          class="col-fixed text-sm"
          style="display: block"
        >
          折返周期(分)
        </label>
        <InputNumber
          id="turn-cycle-nextDepartureTime"
          mode="decimal"
          v-model="turnCycleTime"
          class="w-10"
        />
      </div>
    </div>
    <Button label="ふやす" @click="add" />
    <DataTable
      :value="selectedDiagramDataSet?.data"
      :scrollable="true"
      scrollHeight="50vh"
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
  roundMinute,
} from "@/logics/diagram";
import dayjs from "dayjs";
import { useStore } from "@/store";
import { DATE_FORMAT } from "@/common/const";
export default defineComponent({
  props: {
    diagramDataSetId: { type: Number, default: undefined },
    trainTypeId: { type: Number, default: undefined },
    refreshChart: Function,
  },
  setup(props) {
    const nextDepartureTime = ref();
    const turnCycleTime = ref<number>(30);
    const boundFor = ref<"A" | "B" | "AB" | "BA">("AB");

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

    const latestDataOnTheList = computed(() =>
      selectedDiagramDataSet.value?.data.length
        ? selectedDiagramDataSet.value.data[
            selectedDiagramDataSet.value.data.length - 1
          ]
        : undefined
    );

    nextDepartureTime.value = selectedDiagramDataSet.value?.data.length
      ? dayjs(
          selectedDiagramDataSet.value.data[
            selectedDiagramDataSet.value.data.length - 1
          ].time
        )
          .add(8, "m")
          .toDate()
      : dayjs("2021-10-14 04:00:00").toDate();

    watch(latestDataOnTheList, (newData) => {
      if (!newData) return;
      nextDepartureTime.value = dayjs(
        roundMinute(newData.time, turnCycleTime.value),
        DATE_FORMAT
      ).toDate();
      startStation.value = newData.station;
      endStation.value = newData.station;
    });
    watch(turnCycleTime, (newCycleTime) => {
      if (!newCycleTime) return;
      if (!latestDataOnTheList.value) return;
      nextDepartureTime.value = dayjs(
        roundMinute(latestDataOnTheList.value.time, newCycleTime),
        DATE_FORMAT
      ).toDate();
    });

    const showingTrainId = computed(() => store.state.showingTrainId);

    const add = () => {
      if (!selectedDiagramDataSet.value) return;
      if (!props.trainTypeId) return;

      const trainType = store.getters.getTrainType(props.trainTypeId);
      if (!trainType) return;

      store.commit("updateDiagramData", {
        id: showingTrainId.value,
        data: [
          ...selectedDiagramDataSet.value?.data,
          ...generateChartData({
            startTime: nextDepartureTime.value,
            trainType,
            startStation: startStation.value,
            endStation: endStation.value,
            boundFor: boundFor.value,
            terminalStation: store.getters.getTerminalStation,
            turnCycleTime: turnCycleTime.value,
          }),
        ],
      });
      props.refreshChart && props.refreshChart();
    };

    return {
      nextDepartureTime,
      turnCycleTime,
      startStation,
      endStation,
      stationList,
      boundFor,
      formatDdHhmmToHhmm,
      selectedDiagramDataSet,
      add,
    };
  },
});
</script>

<style>
.p-inputnumber-input {
  width: inherit;
}
</style>