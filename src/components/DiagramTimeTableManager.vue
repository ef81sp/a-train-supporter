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
            :options="shouldRecordTimeStoppingStationList"
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
            :options="endStationOptions"
            optionLabel="name"
            optionValue="id"
            optionDisabled="disabled"
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
            :options="boundForOptions"
            optionLabel="key"
            optionValue="key"
            optionDisabled="disabled"
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
            :min="1"
            v-model="turnCycleTime"
            class="w-10"
          />
        </div>
      </div>
      <div>
        <Checkbox id="isShowPreview" binary v-model="isShowPreview" />
        <label for="isShowPreview">プレビューを表示する</label>
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
import { DiagramData } from "@/types/diagram";
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
    const nextDepartureTime = ref<Date>();
    const turnCycleTime = ref<number>(30);
    const boundForOptions = ref([
      { key: "A", disabled: false },
      { key: "B", disabled: false },
      // { key: "AB", disabled: false },
      // { key: "BA", disabled: false },
    ]);
    const boundFor = ref<"A" | "B" | "AB" | "BA">("A");

    const store = useStore();
    // データ源泉 =======================================
    const stationList = computed(() => store.state.stationList);
    const shouldRecordTimeStoppingStationList = computed(() =>
      store.getters.getShouldRecordTimeStationList.filter((v) =>
        trainType.value?.stoppingStationList.includes(v.id)
      )
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
        : shouldRecordTimeStoppingStationList.value[0]?.id
    );
    const endStation = ref<stationId>(
      shouldRecordTimeStoppingStationList.value[
        shouldRecordTimeStoppingStationList.value.length - 1
      ]?.id
    );
    const endStationOptions = computed(() =>
      shouldRecordTimeStoppingStationList.value.map((v) => {
        return {
          ...v,
          disabled: v.id === startStation.value,
        };
      })
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

    const __updateWithLataestDataOnTheList = (newData?: DiagramData) => {
      if (!newData) return;
      nextDepartureTime.value = dayjs(
        roundMinute(newData.time, turnCycleTime.value),
        DATE_FORMAT
      ).toDate();

      [startStation.value, endStation.value] = [
        newData.stationId,
        calcEndStation(newData),
      ];
      switch (boundFor.value) {
        case "A":
          // boundFor.value = "B";
          break;
        case "B":
          // boundFor.value = "A";
          break;
        case "AB":
        case "BA":
        default:
          break;
      }
      function calcEndStation(newData: DiagramData) {
        if (newData.stationId === stationList.value.startingStationId) {
          return stationList.value.endingStationId;
        } else if (newData.stationId === stationList.value.endingStationId) {
          return stationList.value.startingStationId;
        }
        if (boundFor.value === "A") {
          return stationList.value.endingStationId;
        } else if (boundFor.value === "B") {
          return stationList.value.startingStationId;
        }
        return stationList.value.endingStationId;
      }
    };
    // initialize
    watch(
      () => props.diagramDataSetId,
      () => {
        if (latestDataOnTheList.value) {
          __updateWithLataestDataOnTheList(latestDataOnTheList.value);
        } else {
          startStation.value = stationList.value.startingStationId;
          endStation.value = stationList.value.endingStationId;
          nextDepartureTime.value = dayjs(
            "2021-10-14 04:30",
            DATE_FORMAT
          ).toDate();
        }
      }
    );
    watch(latestDataOnTheList, (newData) => {
      __updateWithLataestDataOnTheList(newData);
    });
    watch(turnCycleTime, (newCycleTime) => {
      if (!newCycleTime) return;
      if (!latestDataOnTheList.value) return;
      nextDepartureTime.value = dayjs(
        roundMinute(latestDataOnTheList.value.time, newCycleTime),
        DATE_FORMAT
      ).toDate();
    });
    watch(startStation, (newStartStation) => {
      switch (newStartStation) {
        case stationList.value.startingStationId: {
          boundForOptions.value.forEach((v) => {
            if (v.key[0] !== "A") {
              v.disabled = true;
            } else {
              v.disabled = false;
            }
          });
          // if (boundFor.value.length >= 2) {
          //   boundFor.value = "AB";
          // } else {
          boundFor.value = "A";
          // }
          break;
        }
        case stationList.value.endingStationId: {
          boundForOptions.value.forEach((v) => {
            if (v.key[0] !== "B") {
              v.disabled = true;
            } else {
              v.disabled = false;
            }
          });
          // if (boundFor.value.length >= 2) {
          //   boundFor.value = "BA";
          // } else {
          boundFor.value = "B";
          // }
          break;
        }
        default:
          boundForOptions.value.forEach((v) => {
            if (v.key[0] !== "A") {
              v.disabled = false;
            }
          });
          break;
      }
    });
    watch(endStation, (newEndStation) => {
      /* if (newEndStation === startStation.value) {
        switch (startStation.value) {
          case stationList.value.startingStationId:
            boundFor.value = "AB";
            break;
          case stationList.value.endingStationId:
            boundFor.value = "BA";
            break;
          default:
        }
      } else*/ if (
        newEndStation === stationList.value.startingStationId ||
        newEndStation === stationList.value.endingStationId
      ) {
        switch (startStation.value) {
          case stationList.value.startingStationId:
            boundFor.value = "A";
            break;
          case stationList.value.endingStationId:
            boundFor.value = "B";
            break;
          default:
        }
      }
    });
    // watch(boundFor, (newBoundFor, oldBoundFor) => {
    //   if (
    //     endStation.value !== stationList.value.startingStationId &&
    //     endStation.value !== stationList.value.endingStationId
    //   ) {
    //     return;
    //   }

    //   if (newBoundFor.length === 2 && oldBoundFor.length === 1) {
    //     endStation.value = startStation.value;
    //   }
    //   if (newBoundFor.length === 1 && oldBoundFor.length === 2) {
    //     if (startStation.value === stationList.value.startingStationId) {
    //       endStation.value = stationList.value.endingStationId;
    //     }
    //     if (startStation.value === stationList.value.endingStationId) {
    //       endStation.value = stationList.value.startingStationId;
    //     }
    //   }
    // });
    const showingTrainId = computed(() => store.state.showingTrainId);

    // プレビュー
    const previewData = computed<DiagramData[]>(() => {
      if (!trainType.value) return [];
      if (!selectedDiagramDataSet.value) return [];

      const generatedPreviewChartData = generateChartData({
        startTime: dayjs(nextDepartureTime.value).format(DATE_FORMAT),
        trainType: trainType.value,
        startStation: startStation.value,
        endStation: endStation.value,
        boundFor: boundFor.value,
        terminalStation: store.getters.getTerminalStation,
        turnCycleTime: turnCycleTime.value,
      });

      return selectedDiagramDataSet.value.data.length
        ? [
            selectedDiagramDataSet.value.data[
              selectedDiagramDataSet.value.data.length - 1
            ],
            ...generatedPreviewChartData,
          ]
        : generatedPreviewChartData;
    });
    const isShowPreview = computed({
      get: () => store.state.isShowPreview,
      set: () => {
        store.commit("updateIsShowPreview", { value: !isShowPreview.value });
      },
    });
    watch(previewData, (newData) => {
      store.commit("updateInputtingPreviewDiagramDatas", { data: newData });
    });
    // ロジック =======================================
    const add = () => {
      if (!selectedDiagramDataSetData.value) return;

      if (!trainType.value) return;

      store.dispatch("updateDiagramData", {
        id: showingTrainId.value,
        data: selectedDiagramDataSetData.value.length
          ? [...selectedDiagramDataSetData.value, ...previewData.value]
          : previewData.value,
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
      endStationOptions,
      shouldRecordTimeStoppingStationList,
      buttonColorStyle,
      boundForOptions,
      boundFor,
      selectedDiagramDataSet,
      selectedDiagramDataSetData,
      add,
      isVisibleCopyModal,
      copyFrom,
      previewData,
      isShowPreview,
    };
  },
});
</script>

<style>
.p-inputnumber-input {
  width: inherit;
}
</style>
