<template>
  <div class="grid p-1">
    <div class="col-9">
      <Panel header="ダイヤグラム" class="my-2">
        <Chart
          type="line"
          :data="data"
          :options="graphOptions"
          ref="chartComponent"
          :height="100"
        />
      </Panel>

      <Panel header="種別" class="my-2">
        <template #icons>
          <Button class="p-button-sm"> 種別ふやす </Button>
        </template>
        <div class="grid">
          <DiagramTrainTypeManager :trainTypeId="1" class="col" />
          <!-- <DiagramTrainTypeManager :trainTypeId="1" class="col" />
          <DiagramTrainTypeManager :trainTypeId="1" class="col" /> -->
        </div>
      </Panel>
    </div>
    <div class="col">
      <Panel header="時刻" class="my-2">
        <DiagramTimeTableManager
          :diagramDataSetId="1"
          :trainTypeId="1"
          :refreshChart="chartComponent?.refresh"
        />
      </Panel>
    </div>
  </div>
</template>

<script lang="ts">
import "chartjs-adapter-date-fns";
import { computed, defineComponent, onMounted, ref } from "vue";
import { useStore } from "@/store";

import { formatDdHhmmToHhmm } from "@/logics/diagram";
import Chart from "primevue/chart";

import DiagramTimeTableManager from "./DiagramTimeTableManager.vue";
import DiagramTrainTypeManager from "./DiagramTrainTypeManager.vue";

const graphOptions = {
  tension: 0,
  animation: {
    duration: 50,
  },
  responsive: true,
  maintainAspectRatio: true,
  parsing: {
    xAxisKey: "time",
    yAxisKey: "station",
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
  scales: {
    x: {
      min: "2021-10-14 04:00",
      max: "2021-10-15 02:00",
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
};

export default defineComponent({
  components: {
    Chart,
    DiagramTimeTableManager,
    DiagramTrainTypeManager,
  },
  setup() {
    const chartComponent = ref<Chart>();

    const store = useStore();
    const ltdExp = computed(() => store.getters.getTrainType(1));

    const data = computed(() => store.state.diagramData);

    return {
      data,
      graphOptions,
      ltdExp,
      formatDdHhmmToHhmm,
      chartComponent,
    };
  },
});
</script>


<style scoped>
</style>