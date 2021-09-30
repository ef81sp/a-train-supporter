<template>
  <div>
    <Chart type="line" :data="data" :options="graphOptions" class="m-5" />
  </div>
  <Button label="1往復ふやす" @click="addRound" />
  <div class="flex flex-row justify-content-center flex-wrap">
    <DataTable :value="ltdExpData" class="m-2">
      <template #header> ときわ </template>
      <Column field="station" header="駅" />
      <Column field="time" header="時刻">
        <template #body="slotProps">
          {{ formatDdHhmmToHhmm(slotProps.data.time) }}
        </template>
      </Column>
    </DataTable>
    <DataTable :value="ltdExpArray" class="m-2">
      <template #header> 所要時間 </template>
      <Column field="from" header="発駅" />
      <Column field="to" header="着駅" />
      <Column field="necessaryTime" header="所要時間(分)" />
    </DataTable>
  </div>
</template>

<script lang="ts">
import "chartjs-adapter-date-fns";
import { computed, defineComponent, ref } from "vue";
import { useStore } from "@/store";
import { ChartData, PluginChartOptions, ChartOptions } from "chart.js";

import {
  addMinute,
  generateChartData,
  formatDdHhmmToHhmm,
} from "@/logics/diagram";
import { DiagramData } from "@/types/diagram";

type lineChartData = ChartData<"line", { x: string; y: number }[]>;

const graphOptions = {
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
      min: "14 04:00",
      max: "15 02:00",
      type: "time",
      time: {
        parser: "dd HH:mm",
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
  setup() {
    const store = useStore();
    const labels = store.getters.getJunctionStationNameList;
    const ltdExp = store.getters.getTrainType("特急");
    const terminalStation = store.getters.getTerminalStation;
    const startTime = "14 04:30";
    const ltdExpArray = computed(() => {
      if (!ltdExp) return [];
      return [...ltdExp.necessaryTimes.values()];
    });
    const ltdExpData = ref<DiagramData[]>([]);
    ltdExpData.value = ltdExp
      ? generateChartData(startTime, ltdExp, terminalStation)
      : [];

    const data = computed(() => {
      return {
        labels,
        datasets: [
          {
            label: "ときわ",
            data: ltdExpData.value,
            fill: false,
            borderColor: "#FF2222",
            tension: 0,
          },
        ],
      };
    });

    const addRound = () => {
      const currentTime = ltdExpData.value[ltdExpData.value.length - 1].time;
      const startTime = addMinute(currentTime, 10);
      const newRound = ltdExp
        ? generateChartData(startTime, ltdExp, terminalStation)
        : [];
      ltdExpData.value = ltdExpData.value.concat(newRound);
    };
    return {
      data,
      graphOptions,
      ltdExpData,
      ltdExpArray,
      addRound,
      formatDdHhmmToHhmm,
    };
  },
});
</script>


<style scoped>
</style>