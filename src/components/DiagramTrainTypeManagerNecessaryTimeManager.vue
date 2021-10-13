<template>
  <Dialog v-model:visible="localVisible" @show="reset" class="dialog">
    <div>
      <p class="text-sm p-4">
        ゲーム内の時間拡張倍率・早回し倍率を選んで、列車の走行に合わせてボタンを押すと、ゲーム内時間でのだいたいの所要時間が測れます。
      </p>
      <!-- 時間倍率 -->
      <div class="formgrid grid">
        <div class="field col-6 text-center">
          <label for="multiplyers"> 時間拡張</label>
          <Dropdown
            v-model="selectedMultiplyer"
            :options="MULTIPLYERS"
            optionLabel="name"
            optionValue="value"
            placeholder="x3〜x450"
            id="multiplyers"
            :disabled="isStarted"
          />
        </div>
        <div class="field col-6 text-center">
          <label for="fast-forward">早回し</label>
          <Dropdown
            v-model="selectedFastForward"
            :options="FAST_FORWARDS"
            optionLabel="name"
            optionValue="value"
            placeholder="x1〜x3"
            id="fast-forward"
            :disabled="isStarted"
          />
        </div>
      </div>
      <!-- 種別 -->
      <div class="text-center">
        <div class="text-4xl">
          <span :style="{ color: trainType?.lineColor }">■</span>
          <span class="font-bold">
            {{ trainType?.name || "種別名" }}
          </span>
        </div>
      </div>
      <!-- 区間 -->
      <div class="grid text-center text-4xl px-8 my-2">
        <div class="col-12 text-3xl pb-0">採時区間</div>
        <div class="col pt-0">
          {{ getStation(nowStationInfo.sectionFrom)?.name }}
        </div>
        <div class="col pt-0"><span class="pi pi-angle-double-right" /></div>
        <div class="col pt-0">
          {{ getStation(nowStationInfo.sectionTo)?.name }}
        </div>
      </div>

      <!-- 駅表示と時計 -->
      <div class="grid my-2">
        <div class="col-6 text-6xl text-center" v-if="!nowStationInfo.finish">
          <span class="text-xl" v-if="isRunning">つぎは</span>
          <span class="text-xl" v-else>ただいま</span>
          {{ " " }}
          <span class="font-bold">
            {{ getStation(nowStationInfo.nextStation)?.name }}
          </span>
          {{ " " }}
          <span class="text-xl" v-if="isRunning">
            {{
              trainType.stoppingStationList.includes(nowStationInfo.nextStation)
                ? "停車"
                : "通過"
            }}
          </span>
          <span class="text-xl" v-else>停車中</span>
        </div>
        <div class="col-6 text-6xl text-center text-green-800 font-bold" v-else>
          終了
        </div>
        <div class="col-6 text-6xl text-center">{{ formattedTime }}</div>
      </div>
      <!-- ボタン類 -->
      <div>
        <div class="grid my-2">
          <MeasureNecessaryTimeRunningButton
            @click="onClickRunning"
            :isRunning="isRunning"
            class="col mx-1"
          />
          <Button
            class="p-button-info col mx-1 flex justify-content-center"
            @click="onClickPassing"
            :disabled="!isRunning"
          >
            <span class="pi pi-fast-forward mx-1" />通過
          </Button>
        </div>
        <div class="grid my-2">
          <Button
            label="タイマー止"
            class="p-button-warning col mx-1"
            @click="allStop"
            :disabled="!isStarted"
          />
          <Button
            label="リセット"
            class="p-button-danger col mx-1"
            @click="reset"
            :disabled="!isStarted"
          />
        </div>
      </div>
      <div class="grid">
        <div class="col-6">
          <DiagramTrainTypeNecessaryTimeTable
            :modelValue="recordedRap.a"
            boundFor="A"
            :editable="false"
          />
        </div>
        <div class="col-6">
          <DiagramTrainTypeNecessaryTimeTable
            :modelValue="recordedRap.b"
            boundFor="B"
            :editable="false"
          />
        </div>
      </div>
    </div>
    <template #footer>
      <Button label="確定" @click="submit" />
    </template>
  </Dialog>
</template>
<script lang="ts">
import MeasureNecessaryTimeRunningButton from "./MeasureNecessaryTimeRunningButton.vue";
import DiagramTrainTypeNecessaryTimeTable from "./DiagramTrainTypeNecessaryTimeTable.vue";
import Timer from "@/logics/Timer";
import { NecessaryTime, NecessaryTimeMap, TrainType } from "@/types";
import { generateInitialNecessaryTime } from "@/logics/diagram";
import dayjs, { Dayjs } from "dayjs";
import { computed, defineComponent, PropType, ref, watch } from "vue";
import { MULTIPLYERS, FAST_FORWARDS } from "@/common/const";
import { useStore } from "@/store";
import rfdc from "rfdc";
const clone = rfdc();

export default defineComponent({
  components: {
    MeasureNecessaryTimeRunningButton,
    DiagramTrainTypeNecessaryTimeTable,
  },
  props: {
    visible: { type: Boolean, required: true },
    trainType: { type: Object as PropType<TrainType>, required: true },
  },
  emits: ["update:visible", "update:trainType"],
  setup(props, context) {
    const localVisible = computed({
      get: () => props.visible,
      set: (value) => {
        context.emit("update:visible", value);
      },
    });

    const store = useStore();
    const stationList = computed(() => store.state.stationList);
    const getStation = store.getters.getStation;
    const __isRecordStation = (id: number) => {
      return stationList.value.stations.some(
        (v) => v.shouldRecordTime && v.id === id
      );
    };

    // 時計系
    const selectedMultiplyer = ref(60);
    const selectedFastForward = ref(10);
    const timer = ref(
      new Timer(selectedMultiplyer.value * selectedFastForward.value)
    );
    watch([selectedMultiplyer, selectedFastForward], () => {
      timer.value = new Timer(
        selectedMultiplyer.value * selectedFastForward.value
      );
    });
    const formattedTime = computed(() => {
      return timer.value.now.format("HH:mm");
    });

    const isRunning = ref(false);
    const isStarted = ref(false);

    // 記録系
    let temporaryStartTime: Dayjs;
    const recordedRap = ref<{
      a: NecessaryTimeMap;
      b: NecessaryTimeMap;
    }>({
      a: generateInitialNecessaryTime(stationList.value, "A"),
      b: generateInitialNecessaryTime(stationList.value, "B"),
    });
    const __initializeRecordedRap = () => {
      recordedRap.value = {
        a: generateInitialNecessaryTime(stationList.value, "A"),
        b: generateInitialNecessaryTime(stationList.value, "B"),
      };
    };

    const initialNowStationInfo: {
      sectionFrom: number;
      sectionTo: number;
      nextStation: number;
      forwards: "A" | "B";
      finish: boolean;
    } = {
      sectionFrom: 1,
      sectionTo:
        stationList.value.stations.find((v) => v.shouldRecordTime && v.id > 1)
          ?.id || 0,
      nextStation: 1,
      forwards: "A",
      finish: false,
    };
    const nowStationInfo = ref(clone(initialNowStationInfo));

    const __record = () => {
      const key = `${nowStationInfo.value.sectionFrom}-${nowStationInfo.value.sectionTo}`;
      const rec: NecessaryTime = {
        id: key,
        from: nowStationInfo.value.sectionFrom,
        to: nowStationInfo.value.sectionTo,
        necessaryTime: dayjs(timer.value.now).diff(
          temporaryStartTime,
          "minute"
        ),
      };
      if (nowStationInfo.value.forwards === "A") {
        recordedRap.value.a.set(key, rec);
      } else {
        recordedRap.value.b.set(key, rec);
      }
    };
    const __bumpSection = () => {
      nowStationInfo.value.sectionFrom = nowStationInfo.value.sectionTo;
      if (
        nowStationInfo.value.sectionTo === stationList.value.endingStationId
      ) {
        // 折返し
        nowStationInfo.value.forwards = "B";
      }
      if (nowStationInfo.value.forwards === "A") {
        nowStationInfo.value.sectionTo =
          stationList.value.stations.find(
            (v) => v.shouldRecordTime && v.id > nowStationInfo.value.sectionFrom
          )?.id || 0;
      } else {
        nowStationInfo.value.sectionTo =
          [...stationList.value.stations]
            .reverse()
            .find(
              (v) =>
                v.shouldRecordTime && v.id < nowStationInfo.value.sectionFrom
            )?.id || 0;
      }
    };
    const __bumpNextStation = () => {
      if (nowStationInfo.value.forwards === "A") {
        nowStationInfo.value.nextStation++;
      } else {
        nowStationInfo.value.nextStation--;
      }
    };
    const onClickRunning = () => {
      isRunning.value = !isRunning.value;
      // 初回処理
      if (!isStarted.value) {
        isStarted.value = true;
        timer.value.start();
        temporaryStartTime = timer.value.now;
        __bumpNextStation();
      } else {
        if (isRunning.value) {
          // 走り始めたら
          if (__isRecordStation(nowStationInfo.value.nextStation)) {
            __bumpSection();
            temporaryStartTime = timer.value.now;
          }
          __bumpNextStation();
        } else {
          // 止まったら
          if (__isRecordStation(nowStationInfo.value.nextStation)) {
            __record();
            if (nowStationInfo.value.nextStation === 1) {
              allStop();
              nowStationInfo.value.finish = true;
            }
          }
        }
      }
    };
    const onClickPassing = () => {
      if (__isRecordStation(nowStationInfo.value.nextStation)) {
        __record();
        __bumpSection();
        temporaryStartTime = timer.value.now;
      }
      __bumpNextStation();
    };
    const allStop = () => {
      isRunning.value = false;
      timer.value.stop();
    };
    const reset = () => {
      allStop();
      isStarted.value = false;
      __initializeRecordedRap();
      timer.value.reset();
      nowStationInfo.value = clone(initialNowStationInfo);
    };
    const submit = () => {
      const newTrainType = clone(props.trainType);
      newTrainType.necessaryTimesA = clone(recordedRap.value.a);
      newTrainType.necessaryTimesB = clone(recordedRap.value.b);
      context.emit("update:trainType", newTrainType);
      localVisible.value = false;
    };
    return {
      localVisible,
      stationList,
      getStation,
      MULTIPLYERS,
      FAST_FORWARDS,
      selectedMultiplyer,
      selectedFastForward,
      recordedRap,
      timer,
      formattedTime,
      onClickRunning,
      onClickPassing,
      allStop,
      reset,
      MeasureNecessaryTimeRunningButton,
      isStarted,
      isRunning,
      nowStationInfo,
      submit,
    };
  },
});
</script>
<style scoped>
.dialog {
  width: 29rem;
}
</style>