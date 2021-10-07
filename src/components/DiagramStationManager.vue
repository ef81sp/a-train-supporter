<template>
  <div class="p-inputgroup">
    <InputText
      placeholder="駅名"
      v-model="newStationName"
      @keydown.enter="onEnter($event.keyCode)"
    />
    <Button icon="pi pi-plus" @click="addStation" label="駅追加" />
  </div>
  <p>チェックをつける: 採時駅</p>
  <div class="station-chart">
    <template v-if="stationList.stations.length">
      <Timeline :value="stationList.stations" layout="horizontal">
        <template #marker="slotProps">
          <Checkbox
            :modelValue="slotProps.item.shouldRecordTime"
            :binary="true"
            @change="() => changeCheckbox(slotProps.index)"
          />
        </template>
        <template #content="slotProps">
          <p class="vertical-rl">
            {{ slotProps.item.name }}
          </p>
        </template>
      </Timeline>
    </template>
    <template v-else>
      <Timeline :value="[1, 2, 3]" layout="horizontal">
        <template #content>
          <p class="vertical-rl">さんぷる</p>
        </template>
      </Timeline>
    </template>
  </div>
</template>

<script lang="ts">
import { useStore } from "@/store";
import { Station, StationList } from "@/types";
import { computed, defineComponent, ref } from "vue";

export default defineComponent({
  setup() {
    const store = useStore();
    const stationList = computed(() => store.state.stationList);
    const newStationName = ref("");
    const addStation = () => {
      store.dispatch(
        "updateStationList",
        stationList.value.stations.concat({
          id: Math.max(...stationList.value.stations.map((v) => v.id)) + 1, //FIXME
          name:
            newStationName.value || String(stationList.value.stations.length),
          shouldRecordTime: false,
        })
      );
      newStationName.value = "";
    };
    const changeCheckbox = (stationListIndex: number) => {
      const newList: Station[] = stationList.value.stations.map((v, idx) => {
        return {
          id: v.id,
          name: v.name,
          shouldRecordTime:
            idx === stationListIndex ? !v.shouldRecordTime : v.shouldRecordTime,
        };
      });
      store.dispatch("updateStationList", newList);
    };

    const onEnter = (keyCode: number) => {
      if (keyCode === 13) addStation();
    };

    return {
      stationList,
      newStationName,
      addStation,
      onEnter,
      changeCheckbox,
    };
  },
});
</script>

<style scoped>
.vertical-rl {
  writing-mode: vertical-rl;
  text-orientation: upright;

  height: 5rem;
  margin-left: -0.3rem;
}
.station-chart {
  padding: 0 1rem;
  overflow-x: scroll;
}
</style>