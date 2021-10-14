<template>
  <Card class="card">
    <template #content>
      <p class="caption">
        ゲーム内の時間拡張倍率・早回し倍率を選んで、列車の走行に合わせてボタンを押すと、<br />ゲーム内時間でのだいたいの所要時間が測れます。
      </p>
      <div class="formgrid grid">
        <div class="field col">
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
        <div class="field col">
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
      <p class="timer">{{ formattedTime }}</p>
      <div>
        <MeasureNecessaryTimeRunningButton
          @click="onClickRunning"
          :isRunning="isRunning"
        />
        <Button
          label="通過"
          class="p-button-info"
          @click="onClickPassing"
          :disabled="!isRunning"
        />
      </div>
      <div>
        <Button
          label="タイマー止"
          class="p-button-warning"
          @click="allStop"
          :disabled="!isStarted"
        />
        <Button
          label="リセット"
          class="p-button-danger"
          @click="reset"
          :disabled="!isStarted"
        />
      </div>
      <p>ゲーム内所要時間(分): {{ recordedRap }}</p>
    </template>
  </Card>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import MeasureNecessaryTimeRunningButton from "./MeasureNecessaryTimeRunningButton.vue";
import { MULTIPLYERS, FAST_FORWARDS } from "@/common/const";
import Timer from "@/logics/Timer";
import dayjs, { Dayjs } from "dayjs";

export default defineComponent({
  name: "MeasureNeccesaryTime",
  components: {
    MeasureNecessaryTimeRunningButton,
  },
  setup() {
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

    let temporaryStartTime: Dayjs;
    const recordedRap = ref<number[]>([]);
    const onClickRunning = () => {
      isRunning.value = !isRunning.value;
      if (!isStarted.value) {
        isStarted.value = true;
        timer.value.start();
      }
      if (isRunning.value) {
        // 走り始めたら
        temporaryStartTime = timer.value.now;
      } else {
        // 止まったら
        recordedRap.value = [
          ...recordedRap.value,
          dayjs(timer.value.now).diff(temporaryStartTime, "minute"),
        ];
      }
    };
    const onClickPassing = () => {
      recordedRap.value = [
        ...recordedRap.value,
        dayjs(timer.value.now).diff(temporaryStartTime, "minute"),
      ];
      temporaryStartTime = timer.value.now;
    };
    const allStop = () => {
      isRunning.value = false;
      timer.value.stop();
    };
    const reset = () => {
      allStop();
      isStarted.value = false;
      recordedRap.value = [];
      timer.value.reset();
    };

    return {
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
    };
  },
});
</script>

<style scoped>
.caption {
  font-size: 0.8rem;
  margin: 2rem 0;
}
.timer {
  font-size: 2.5rem;
}
</style>
