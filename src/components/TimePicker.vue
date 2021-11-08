<template>
  <Calendar :timeOnly="true" hourFormat="24" v-model="date" :inline="inline" />
</template>

<script lang="ts">
import { DATE_FORMAT } from "@/common/const";
import dayjs from "dayjs";
import { computed, defineComponent, watch } from "vue";

export default defineComponent({
  props: {
    modelValue: String,
    inline: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  setup(props, context) {
    const date = computed<Date>({
      get: () => dayjs(props.modelValue, DATE_FORMAT).toDate(),
      set: (value) => {
        context.emit("update:modelValue", dayjs(value).format(DATE_FORMAT));
      },
    });
    watch(date, (newDate, oldDate) => {
      const oldMinute = oldDate.getMinutes();
      if (oldMinute !== 59 && oldMinute !== 0) return;
      const newMinute = newDate.getMinutes();
      if (oldMinute === 59 && newMinute === 0) {
        newDate.setHours(newDate.getHours() + 1);
        date.value = newDate;
      }
      if (oldMinute === 0 && newMinute === 59) {
        newDate.setHours(newDate.getHours() - 1);
        date.value = newDate;
      }
    });
    return {
      date,
    };
  },
});
</script>
