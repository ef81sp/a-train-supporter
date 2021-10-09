<template>
  <InputNumber
    v-model="saveId"
    showButtons
    buttonLayout="horizontal"
    decrementButtonClass="p-button-danger"
    incrementButtonClass="p-button-success"
    incrementButtonIcon="pi pi-plus"
    decrementButtonIcon="pi pi-minus"
    mode="decimal"
    :min="1"
    :max="100"
    inputClass="w-4rem text-center"
  />
</template>

<script lang="ts">
import { useStore } from "@/store";
import { defineComponent, ref, watch } from "vue";

export default defineComponent({
  setup() {
    const saveId = ref(1);
    const store = useStore();
    watch(saveId, () => {
      store.commit("setSaveId", saveId.value);
      store.dispatch("loadData", saveId.value);
    });
    return {
      saveId,
    };
  },
});
</script>
