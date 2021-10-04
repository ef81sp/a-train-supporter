<template>
  <div class="p-inputgroup">
    <InputText placeholder="駅名" v-model="newStationName" />
    <Button icon="pi pi-plus" @click="addStation" />
  </div>
  {{ stationList.stations }}
</template>

<script lang="ts">
import { useStore } from "@/store";
import { computed, defineComponent, ref } from "vue";

export default defineComponent({
  setup() {
    const store = useStore();
    const stationList = computed(() => store.state.stationList);
    const newStationName = ref("");
    const addStation = () => {
      store.commit(
        "updateStationList",
        stationList.value.stations.concat({
          name: newStationName.value,
          shouldRecordTime: true,
        })
      );
      newStationName.value = "";
    };

    return {
      stationList,
      newStationName,
      addStation,
    };
  },
});
</script>
