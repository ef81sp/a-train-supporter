<template>
  <div>
    <DiagramMenuDataSaveManager />
    <Button
      label="戻る"
      icon="pi pi-angle-left"
      class="mx-1"
      :disabled="!canUndo"
      @click="handleUndo"
    />

    <Button
      label="進む"
      icon="pi pi-angle-right"
      class="mx-1"
      :disabled="!canRedo"
      @click="handleRedo"
    />
    <SplitButton
      label="ヘルプ"
      icon="pi pi-question-circle"
      class="mx-1"
      :model="[
        {
          label: '状態の初期化',
          icon: 'pi pi-ban',
          command: handleInitialize,
        },
      ]"
    />
  </div>
</template>
<script lang="ts">
import DiagramMenuDataSaveManager from "./DiagramMenuDataSaveManager.vue";
import { computed, defineComponent } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  components: {
    DiagramMenuDataSaveManager,
  },
  setup() {
    const store = useStore();
    const canUndo = computed(
      () =>
        store.getters.getHistoryInfo.length > 0 &&
        store.getters.getHistoryInfo.nowIndex !== 0
    );
    const canRedo = computed(
      () =>
        store.getters.getHistoryInfo.length >
        store.getters.getHistoryInfo.nowIndex + 1
    );
    const handleUndo = () => {
      store.commit("undo");
    };
    const handleRedo = () => {
      store.commit("redo");
    };
    const handleInitialize = () => {
      store.commit("initialize");
    };

    return {
      canUndo,
      canRedo,
      handleUndo,
      handleRedo,
      handleInitialize,
    };
  },
});
</script>
