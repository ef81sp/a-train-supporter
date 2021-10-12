<template>
  <div class="grid p-1">
    <div class="col-12 flex justify-content-end"><DiagramMenu /></div>
    <div class="col-12">
      <Panel header="駅設定" :toggleable="true">
        <DiagramStationManager />
      </Panel>
    </div>
    <div class="col-12 md:col-8">
      <Panel header="ダイヤグラム" class="my-2">
        <Chart
          type="line"
          :data="data"
          :options="graphOptions"
          ref="chartRef"
        />
      </Panel>

      <Panel header="種別と所要時間" class="my-1 time-table-manager-panel">
        <template #icons>
          <Button
            class="p-button-sm"
            icon="pi pi-plus"
            @click="addInitialTrainType"
            :disabled="!canAddTrainType"
            label="種別追加"
          />
        </template>
        <div class="flex overflow-x-scroll">
          <DiagramTrainTypeManager
            v-for="trainTypeId in trainTypes.keys()"
            :key="trainTypeId"
            :trainTypeId="trainTypeId"
            class="col"
          />
        </div>
      </Panel>
    </div>
    <div class="col">
      <Panel header="時刻" class="my-2">
        <DiagramTimeTableManager
          :diagramDataSetId="showingTrainId"
          :refreshChart="chartRef?.refresh"
        />
      </Panel>
    </div>
  </div>
</template>

<script lang="ts">
import "chartjs-adapter-date-fns";
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { useStore } from "@/store";

import { formatDdHhmmToHhmm } from "@/logics/diagram";
import Chart from "primevue/chart";

import DiagramMenu from "./DiagramMenu.vue";
import DiagramTimeTableManager from "./DiagramTimeTableManager.vue";
import DiagramTrainTypeManager from "./DiagramTrainTypeManager.vue";
import DiagramStationManager from "./DiagramStationManager.vue";

export default defineComponent({
  components: {
    Chart,
    DiagramMenu,
    DiagramTimeTableManager,
    DiagramTrainTypeManager,
    DiagramStationManager,
  },
  setup() {
    const chartRef = ref<Chart>();
    const graphOptions = computed(() => ({
      tension: 0,
      animation: false,
      responsive: true,
      aspectRatio: matchMedia("(max-width: 640px)").matches ? 2 : 3,
      parsing: {
        xAxisKey: "time",
        yAxisKey: "name",
      },
      indexAxis: "y",
      showLine: true,
      plugins: {
        legend: {
          labels: {
            color: "#495057",
          },
        },
      },
      elements: {
        line: {
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          min:
            store.getters.getMinAndMaxTimeOnDiagramData.min ||
            "2021-10-14: 04:30",
          max: store.getters.getMinAndMaxTimeOnDiagramData.max,
          type: "time",
          time: {
            parser: "yyyy-MM-dd HH:mm",
            unit: "minute",
            stepSize: 5,
            displayFormats: { minute: "HH:mm" },
            tooltipFormat: "HH:mm",
          },
          ticks: {
            color: "#495057",
          },
          grid: {
            color: "#ebedef",
          },
          position: "top",
        },
        y: {
          ticks: {
            color: "#495057",
            source: "labels",
          },
          grid: {
            color: "#ebedef",
          },
        },
      },
    }));

    const store = useStore();
    const ltdExp = computed(() => store.getters.getTrainType(1));
    const trainTypes = computed(() => store.state.trainTypes);

    const data = computed(() => store.getters.getChatrJsData);

    const showingTrainId = computed(() => store.state.showingTrainId);

    const canAddTrainType = computed<boolean>(() => trainTypes.value.size < 6);
    const addInitialTrainType = () => {
      store.dispatch("addInitialTrainType");
    };

    onMounted(() => {
      if (!chartRef.value) return;
      store.commit("setChartRefresh", { chartRefresh: chartRef.value.refresh });
    });

    return {
      data,
      graphOptions,
      ltdExp,
      trainTypes,
      formatDdHhmmToHhmm,
      chartRef,
      showingTrainId,
      canAddTrainType,
      addInitialTrainType,
    };
  },
});
</script>

<style lang="css" scoped>
::v-deep(.p-panel.time-table-manager-panel) .p-panel-content {
  padding: 0 0.5rem;
}
</style>