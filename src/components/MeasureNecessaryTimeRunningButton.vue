<template>
  <Button @click="onClick" :class="buttonRunningClass">
    <span :class="buttonRunningIcon" />{{ buttonRunningLabel }}
  </Button>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";

export default defineComponent({
  name: "MeasureNecessaryTimeRunningButton",
  props: {
    onClick: Function,
    isRunning: Boolean,
    class: String,
  },
  setup(props) {
    const buttonRunningLabel = computed(() =>
      props.isRunning ? "停車" : "発車"
    );
    const buttonRunningIcon = computed(
      () => `mx-1 pi ${props.isRunning ? "pi-pause" : "pi-play"}`
    );
    const buttonRunningClass = computed(
      () =>
        props.class +
        " flex justify-content-center " +
        (props.isRunning ? "p-button-secondary" : "")
    );
    return {
      buttonRunningLabel,
      buttonRunningIcon,
      buttonRunningClass,
    };
  },
});
</script>

<style scoped>
</style>
