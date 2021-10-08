<template>
  <Calendar :timeOnly="true" hourFormat="24" v-model="date" :inline="true" />
</template>

<script lang="ts">
import { DATE_FORMAT } from "@/common/const";
import dayjs from "dayjs";
import { computed, defineComponent } from "vue";

export default defineComponent({
  props: {
    modelValue: String,
  },
  emits: ["update:modelValue"],
  setup(props, context) {
    const date = computed<Date>({
      get: () => dayjs(props.modelValue, DATE_FORMAT).toDate(),
      set: (value) => {
        context.emit("update:modelValue", dayjs(value).format(DATE_FORMAT));
      },
    });
    return {
      date,
    };
  },
});
</script>
