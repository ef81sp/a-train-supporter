<template>
  <Dialog
    header="別の列車からコピー"
    :modal="true"
    :dismissableMask="true"
    v-model:visible="localVisible"
    @hide="onHide"
    @show="initialize"
    class="dttmcfot-dialog"
  >
    <p class="text-sm">
      別列車から時刻表をコピーしてきます。時間をずらせます。パターンダイヤを組むのに便利です。
    </p>
    <p>
      コピー先:
      <span :style="{ color: diagramDataSet.borderColor }" class="font-bold"
        >■</span
      >
      <span class="font-bold">{{ diagramDataSet.label }}</span>
    </p>

    <div class="formgrid grid">
      <div class="field col-6">
        <label for="train-from">コピー元</label>
        <Dropdown
          id="train-from"
          class="inputfield w-full input"
          v-model="selectedTrainFromTrain"
          :options="
            diagramDataSets.filter(
              (v) => v.id !== diagramDataSet.id && v.data.length
            )
          "
          optionLabel="label"
          placeholder="コピー元を選ぶ"
          :filter="true"
        >
          <template #value="slotProps">
            <span v-if="slotProps.value">
              <span :style="{ color: slotProps.value.borderColor }">■</span>
              <span>{{ slotProps.value.label }}</span> /
              {{ slotProps.value.data[0].name }}
              {{ formatDdHhmmToHhmm(slotProps.value.data[0].time) }}発
            </span>
          </template>
          <template #option="slotProps">
            <span :style="{ color: slotProps.option.borderColor }">■</span>
            <span>{{ slotProps.option.label }}</span> /
            {{ slotProps.option.data[0].name }}
            {{ formatDdHhmmToHhmm(slotProps.option.data[0].time) }}発
          </template>
        </Dropdown>
      </div>

      <div class="field col">
        <label for="offset">オフセット(分)</label>
        <InputNumber
          id="offset"
          class="inputfield w-full input"
          v-model="offset"
        />
      </div>

      <div class="field col">
        <label for="offset-to">ずらす向き</label>
        <Dropdown
          id="offset-to"
          class="inputfield w-full input"
          v-model="selectedDirection"
          :options="directions"
          optionLabel="name"
        />
      </div>
    </div>

    <template #footer>
      <Button label="確定" @click="onClick" />
    </template>
  </Dialog>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";
import rfdc from "rfdc";
import { useStore } from "@/store";
import { chartJsDataSet, offsetDirectionCode } from "@/types/diagram";
import { formatDdHhmmToHhmm, offsetDiagramDatas } from "@/logics/diagram";
const clone = rfdc();

export default defineComponent({
  props: {
    diagramDataSet: {
      type: Object as PropType<chartJsDataSet>,
      required: true,
    },
    visible: { type: Boolean, required: true },
  },
  emits: ["update:visible"],
  setup(props, context) {
    const store = useStore();

    const diagramDataSets = computed(
      () => store.getters.getChatrJsData.datasets
    );
    const selectedTrainFromTrain = ref<chartJsDataSet>();

    const offset = ref(0);

    const directions: { name: string; code: offsetDirectionCode }[] = [
      { name: "後→", code: "forward" },
      { name: "←前", code: "back" },
    ];
    const selectedDirection = ref(directions[0]);

    const localVisible = computed({
      get: () => props.visible,
      set: (value) => {
        context.emit("update:visible", value);
      },
    });
    const onClick = () => {
      if (!selectedTrainFromTrain.value) return;
      const newDiagramData = offsetDiagramDatas(
        selectedTrainFromTrain.value.data,
        offset.value,
        selectedDirection.value.code
      );
      store.dispatch("updateDiagramData", {
        id: props.diagramDataSet.id,
        data: newDiagramData,
      });
      localVisible.value = false;
    };
    const onHide = () => {
      // stoppingStationList.value = clone(props.trainType.stoppingStationList);
    };
    const initialize = () => {
      // initialize
      offset.value = 0;
      selectedDirection.value = directions[0];
      selectedTrainFromTrain.value = undefined;
    };
    return {
      localVisible,
      onClick,
      onHide,
      initialize,
      diagramDataSets,
      selectedTrainFromTrain,
      offset,
      selectedDirection,
      directions,
      formatDdHhmmToHhmm,
    };
  },
});
</script>

<style>
/* scoped-cssだとDialogに書いたclassをコンパイルしてくれないみたい */
.dttmcfot-dialog {
  max-width: 50%;
  min-width: 33rem;
}
</style>
<style scoped>
.input {
  height: 2.5rem;
}
</style>