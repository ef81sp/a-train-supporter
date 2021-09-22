<template>
  <Button
    @click="onClick"
    :label="buttonRunningLabel"
    :class="buttonRunningClass"
  />
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";

export default defineComponent({
  name: "MeasureNecessaryTimeRunningButton",
  props: {
    onClick: Function,
    isRunning: Boolean,
  },
  setup(props) {
    const buttonRunningLabel = computed(() =>
      props.isRunning ? "とまった" : "はしった"
    );
    const buttonRunningClass = computed(() =>
      props.isRunning ? "p-button-secondary" : ""
    );
    return {
      buttonRunningLabel,
      buttonRunningClass,
    };
  },
});
</script>

<style scoped>
</style>
