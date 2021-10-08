<template>
  <div class="p-inputgroup">
    <InputText
      placeholder="駅名"
      v-model="newStationName"
      @keydown.enter="onEnter($event.keyCode, addStation)"
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
          <div class="vertical-rl h-5rem">
            <Inplace
              :closable="true"
              @close="() => changeStationName(slotProps.index)"
              v-model:active="isOpenStationNameChange[slotProps.index]"
              class="block"
            >
              <template #display>
                {{ slotProps.item.name }}
              </template>
              <template #content>
                <InputText
                  :modelValue="slotProps.item.name"
                  class="w-6rem"
                  @input="onChangeStationName"
                  @keydown.enter="
                    onEnter($event.keyCode, () =>
                      changeStationName(slotProps.index)
                    )
                  "
                />
              </template>
            </Inplace>
          </div>
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
import { Station } from "@/types";
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

    const isOpenStationNameChange = ref<boolean[]>([]);
    const changingStationName = ref("");
    const onChangeStationName = (e: { target: HTMLInputElement }) => {
      changingStationName.value = e.target.value;
    };
    const changeStationName = (stationListIndex: number) => {
      const newList: Station[] = stationList.value.stations.map((v, idx) => {
        return {
          id: v.id,
          name:
            idx === stationListIndex
              ? changingStationName.value || v.name || String(idx)
              : v.name,
          shouldRecordTime: v.shouldRecordTime,
        };
      });
      store.dispatch("updateStationList", newList);
      isOpenStationNameChange.value[stationListIndex] = false;
    };

    const onEnter = (keyCode: number, cb: () => void) => {
      if (keyCode === 13) cb();
    };

    return {
      stationList,
      newStationName,
      addStation,
      onEnter,
      changeCheckbox,
      isOpenStationNameChange,
      changeStationName,
      onChangeStationName,
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
  height: fit-content;
}
</style>