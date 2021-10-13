<template>
  <Panel header="時刻" class="my-2">
    <template #icons> </template>
    <template v-if="selectedDiagramDataSet">
      <p class="font-bold">
        <span :style="{ color: trainType?.lineColor }">■</span>
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
            optionLabel="name"
            optionValue="id"
            class="w-10 text-left"
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
            optionLabel="name"
            optionValue="id"
            class="w-10 text-left"
          />
        </div>
        <div class="field col-4">
          <label
            for="boundFor"
            class="col-fixed text-sm"
            style="display: block"
          >
            方面
          </label>
          <Dropdown
            id="boundFor"
            v-model="boundFor"
            :options="['A', 'B', 'AB', 'BA']"
            class="w-10 text-left"
          />
        </div>
        <div class="field col-4 p-0">
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
            class="col-fixed text-sm p-0"
            style="display: block"
          >
            折返周期<span class="text-xs">(分)</span>
          </label>
          <InputNumber
            id="turn-cycle-nextDepartureTime"
            mode="decimal"
            v-model="turnCycleTime"
            class="w-10"
          />
        </div>
      </div>
      <SplitButton
        label="ふやす"
        @click="add"
        class="p-button-sm my-2"
        :model="[
          { label: '別列車からコピー', icon: 'pi pi-copy', command: copyFrom },
        ]"
      />
      <DiagramTimeTableManagerCopyFromOtherTrain
        v-model:visible="isVisibleCopyModal"
        :diagramDataSet="selectedDiagramDataSet"
      />
      <DiagramTimeTableManagerTable v-model="selectedDiagramDataSetData" />
    </template>
  </Panel>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { generateChartData, roundMinute } from "@/logics/diagram";
import dayjs from "dayjs";
import { useStore } from "@/store";
import { DATE_FORMAT } from "@/common/const";
import { stationId } from "@/types";
import DiagramTimeTableManagerTable from "@/components/DiagramTimeTableManagerTable.vue";
import DiagramTimeTableManagerCopyFromOtherTrain from "@/components/DiagramTimeTableManagerCopyFromOtherTrain.vue";
export default defineComponent({
  components: {
    DiagramTimeTableManagerTable,
    DiagramTimeTableManagerCopyFromOtherTrain,
  },
  props: {
    diagramDataSetId: { type: Number, default: undefined },
    refreshChart: Function,
  },
  setup(props) {
    const nextDepartureTime = ref();
    const turnCycleTime = ref<number>(30);
    const boundFor = ref<"A" | "B" | "AB" | "BA">("AB");

    const store = useStore();
    // データ源泉 =======================================
    const stationList = computed(
      () => store.getters.getShouldRecordTimeStationList
    );
    const trainType = computed(() =>
      store.getters.getTrainTypeByTrainId(props.diagramDataSetId || 0)
    );

    const buttonColorStyle = computed(() => ({
      backgroundColor: trainType.value?.lineColor,
      borderColor: trainType.value?.lineColor,
    }));

    const selectedDiagramDataSet = computed(() => {
      return store.getters.getTrainDiagramDataSetById(
        props.diagramDataSetId || -1
      );
    });
    const selectedDiagramDataSetData = computed({
      get: () => selectedDiagramDataSet.value?.data,
      set: (v) => {
        if (!v) return;
        store.dispatch("updateDiagramData", {
          id: showingTrainId.value,
          data: v,
        });
      },
    });

    // フォーム =======================================
    const startStation = ref<stationId>(
      selectedDiagramDataSetData.value?.length
        ? selectedDiagramDataSetData.value[
            selectedDiagramDataSetData.value.length - 1
          ].stationId
        : stationList.value[0].id
    );
    const endStation = ref<stationId>(
      stationList.value[stationList.value.length - 1].id
    );

    const latestDataOnTheList = computed(() =>
      selectedDiagramDataSetData.value?.length
        ? selectedDiagramDataSetData.value[
            selectedDiagramDataSetData.value.length - 1
          ]
        : undefined
    );

    nextDepartureTime.value = selectedDiagramDataSetData.value?.length
      ? dayjs(
          roundMinute(
            selectedDiagramDataSetData.value[
              selectedDiagramDataSetData.value.length - 1
            ].time,
            turnCycleTime.value
          ),
          DATE_FORMAT
        ).toDate()
      : dayjs("2021-10-14 04:30:00").toDate();

    watch(latestDataOnTheList, (newData) => {
      if (!newData) return;
      nextDepartureTime.value = dayjs(
        roundMinute(newData.time, turnCycleTime.value),
        DATE_FORMAT
      ).toDate();
      startStation.value = newData.stationId;
      endStation.value = newData.stationId;
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

    // ロジック =======================================
    const add = () => {
      if (!selectedDiagramDataSetData.value) return;

      if (!trainType.value) return;

      store.dispatch("updateDiagramData", {
        id: showingTrainId.value,
        data: [
          ...selectedDiagramDataSetData.value,
          ...generateChartData({
            startTime: nextDepartureTime.value,
            trainType: trainType.value,
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

    const isVisibleCopyModal = ref(false);
    const copyFrom = () => {
      isVisibleCopyModal.value = true;
    };

    return {
      trainType,
      nextDepartureTime,
      turnCycleTime,
      startStation,
      endStation,
      stationList,
      buttonColorStyle,
      boundFor,
      selectedDiagramDataSet,
      selectedDiagramDataSetData,
      add,
      isVisibleCopyModal,
      copyFrom,
    };
  },
});
</script>

<style>
.p-inputnumber-input {
  width: inherit;
}
</style>