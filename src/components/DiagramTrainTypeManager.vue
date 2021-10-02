<template>
  <Panel :header="trainType?.name">
    <template #icons>
      <Button class="p-button-sm m-0"> 1編成ふやす </Button>
    </template>
    <div v-if="trainType">
      <Button
        class="m-1 p-button-sm"
        v-for="(id, idx) in trainType.trainIdList"
        :key="id"
        @click="changeTrainId(id)"
      >
        {{ idx + 1 }}
      </Button>
    </div>
    <DiagramTrainTypeNecessaryTimeTable
      headerText="A線"
      :necessaryTime="trainType?.necessaryTimesA"
    />
    <DiagramTrainTypeNecessaryTimeTable
      headerText="B線"
      :necessaryTime="trainType?.necessaryTimesB"
    />
  </Panel>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "@/store";

import DiagramTrainTypeNecessaryTimeTable from "./DiagramTrainTypeNecessaryTimeTable.vue";

export default defineComponent({
  props: {
    trainTypeId: Number,
  },
  components: {
    DiagramTrainTypeNecessaryTimeTable,
  },
  setup(props) {
    const store = useStore();

    const trainType = computed(() =>
      store.getters.getTrainType(props.trainTypeId || 0)
    );

    const changeTrainId = (id: number) => {
      store.commit("setShowingTrainId", id);
    };
    return {
      trainType,
      changeTrainId,
    };
  },
});
</script>
