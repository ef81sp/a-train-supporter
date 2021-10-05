<template>
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
  />
  <Button label="ヘルプ" icon="pi pi-question-circle" class="mx-1" />
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  setup() {
    const store = useStore();
    const canUndo = computed(() => false);
    const canRedo = computed(() => false);
    const handleUndo = () => {
      store.commit("undo");
    };

    return {
      canUndo,
      canRedo,
      handleUndo,
    };
  },
});
</script>
