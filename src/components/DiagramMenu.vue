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
      icon="pi pi-external-link"
      class="mx-1"
      @click="help"
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
      store.dispatch("initialize");
    };
    const help = () => {
      window.open(
        "https://pentagonal-potential-7b1.notion.site/DiaGen-280bbb46814c45f8b8ae7037b300d25f",
        "",
        "noreferrer"
      );
    };

    return {
      canUndo,
      canRedo,
      handleUndo,
      handleRedo,
      handleInitialize,
      help,
    };
  },
});
</script>
