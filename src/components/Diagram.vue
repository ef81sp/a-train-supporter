<template>
  <div class="grid p-1">
    <div class="col-9">
      <Panel class="my-2">
        <template #header> ダイヤグラム </template>
        <Chart
          type="line"
          :data="data"
          :options="graphOptions"
          ref="chartComponent"
        />
      </Panel>

      <Panel class="my-2">
        <template #header>種別</template>

        <DataTable :value="ltdExpArray" class="m-2">
          <template #header> 所要時間 - ときわ</template>
          <Column field="from" header="発駅" />
          <Column field="to" header="着駅" />
          <Column field="necessaryTime" header="所要時間(分)" />
        </DataTable>
      </Panel>
    </div>
    <div class="col">
      <!-- <ScrollPanel style="height: 100vh"> -->
      <Panel class="my-2">
        <template #header> {{ data.datasets[0].label }} </template>
        <Button label="1往復ふやす" @click="addRound" />

        <DataTable
          :value="data.datasets[0].data"
          :scrollable="true"
          scrollHeight="100vh"
        >
          <Column field="station" header="駅" />
          <Column field="time" header="時刻">
            <template #body="slotProps">
              {{ formatDdHhmmToHhmm(slotProps.data.time) }}
            </template>
          </Column>
        </DataTable>
      </Panel>
      <!-- </ScrollPanel> -->
    </div>
  </div>
</template>

<script lang="ts">
import "chartjs-adapter-date-fns";
import { computed, defineComponent, onMounted, ref } from "vue";
import { useStore } from "@/store";
import { ChartData, PluginChartOptions, ChartOptions } from "chart.js";

import {
  addMinute,
  generateChartData,
  formatDdHhmmToHhmm,
} from "@/logics/diagram";
import { DiagramData } from "@/types/diagram";
import Chart from "primevue/chart";

type lineChartData = ChartData<"line", { x: string; y: number }[]>;

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
    const chartComponent = ref<Chart>();

    const store = useStore();
    const ltdExp = computed(() => store.getters.getTrainType(1));
    const terminalStation = computed(() => store.getters.getTerminalStation);
    const ltdExpArray = computed(() => {
      if (!ltdExp.value) return [];
      return [...ltdExp.value.necessaryTimes.values()];
    });

    const data = computed(() => store.state.diagramData);
    const ltdExpData = computed(() => data.value.datasets[0].data);

    const addRound = () => {
      const currentTime = ltdExpData.value[ltdExpData.value.length - 1].time;
      const startTime = addMinute(currentTime, 10);
      const newRound = ltdExp.value
        ? generateChartData(startTime, ltdExp.value, terminalStation.value)
        : [];
      store.commit("updateDiagramData", {
        id: 1,
        data: ltdExpData.value.concat(newRound),
      });
      chartComponent.value?.refresh();
    };

    return {
      data,
      graphOptions,
      ltdExpArray,
      addRound,
      formatDdHhmmToHhmm,
      chartComponent,
    };
  },
  components: {
    Chart,
  },
});
</script>


<style scoped>
</style>