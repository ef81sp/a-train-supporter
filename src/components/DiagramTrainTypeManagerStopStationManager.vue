<template>
  <Dialog
    header="停車駅設定"
    :modal="true"
    :dismissableMask="true"
    v-model:visible="localVisible"
    @hide="onHide"
  >
    <p class="text-sm">
      採時駅が停車駅の場合、自動的に1分追加した所要時間で計算します
    </p>
    <div class="flex justify-content-center">
      <div class="inline-flex flex-column">
        <div
          v-for="(station, idx) in stationList"
          :key="station.id"
          class="inline-block mb-1"
        >
          <Checkbox
            :id="`station${station.id}`"
            :value="station.id"
            :key="station.id"
            v-model="stoppingStationList"
            class="mx-2"
            :disabled="idx === 0 || idx === stationList.length - 1"
          />
          <label :for="`station${station.id}`">{{ station.name }}</label>
        </div>
      </div>
    </div>
    <template #footer>
      <Button label="確定" @click="onClick" />
    </template>
  </Dialog>
</template>
<script lang="ts">
import { TrainType } from "@/types";
import { computed, defineComponent, PropType, ref } from "vue";
import rfdc from "rfdc";
import { useStore } from "@/store";
const clonedeep = rfdc();

export default defineComponent({
  props: {
    trainType: { type: Object as PropType<TrainType>, required: true },
    visible: { type: Boolean, required: true },
  },
  emits: ["update:trainType", "update:visible"],
  setup(props, context) {
    const store = useStore();
    const stationList = computed(() => store.state.stationList.stations);
    const stoppingStationList = ref<number[]>(
      clonedeep(props.trainType.stoppingStationList || [])
    );
    const localVisible = computed({
      get: () => props.visible,
      set: (value) => {
        context.emit("update:visible", value);
      },
    });
    const onClick = () => {
      const newTrainType = clonedeep(props.trainType);
      newTrainType.stoppingStationList = stoppingStationList.value;
      context.emit("update:trainType", newTrainType);
      localVisible.value = false;
    };
    const onHide = () => {
      stoppingStationList.value = clonedeep(
        props.trainType.stoppingStationList
      );
    };
    return {
      localVisible,
      stationList,
      stoppingStationList,
      onClick,
      onHide,
    };
  },
});
</script>
