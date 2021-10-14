<template>
  <Button @click="onClick" :class="buttonRunningClass" :disabled="disabled">
    <span :class="buttonRunningIcon" />{{ buttonRunningLabel }}
  </Button>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";

export default defineComponent({
  name: "MeasureNecessaryTimeRunningButton",
  props: {
    onClickRunning: Function,
    onClickPassing: Function,
    isRunning: Boolean,
    isPass: Boolean,
    class: String,
    disabled: { type: Boolean, default: false },
  },
  setup(props) {
    const status = computed<"通過" | "停車" | "発車">(() =>
      props.isRunning ? (props.isPass ? "通過" : "停車") : "発車"
    );
    const buttonRunningLabel = computed(() =>
      props.isRunning ? (props.isPass ? "通過" : "停車") : "発車"
    );
    const buttonRunningIcon = computed(() => {
      const fix = "mx-1 pi";
      switch (status.value) {
        case "通過":
          return fix + " pi-fast-forward";
        case "停車":
          return fix + " pi-pause";
        case "発車":
        default:
          return fix + " pi-play";
      }
    });
    const buttonRunningClass = computed(() => {
      const fix = props.class + " " + "flex justify-content-center ";
      switch (status.value) {
        case "通過":
          return fix + "p-button-secondary";
        case "停車":
          return fix + "p-button-success";
        case "発車":
        default:
          return fix;
      }
    });
    const onClick = computed(() => {
      switch (status.value) {
        case "通過":
          return props.onClickPassing;
        case "停車":
        case "発車":
        default:
          return props.onClickRunning;
      }
    });
    return {
      buttonRunningLabel,
      buttonRunningIcon,
      buttonRunningClass,
      onClick,
    };
  },
});
</script>

<style scoped></style>
