<template>
  <Panel class="panel">
    <template #header>
      <div class="flex align-content-center h-2rem">
        <Inplace
          :closable="true"
          class="flex align-items-stretch"
          @close="changeLineColorAndTypeName"
        >
          <template #display>
            <span :style="{ color: trainType?.lineColor }">■</span>
            <span class="font-bold">
              {{ trainType?.name || "種別名" }}
            </span>
          </template>
          <template #content>
            <Dropdown
              :options="LINE_COLORS"
              optionLabel="label"
              optionValue="value"
              placeholder="線の色"
              v-model="lineColor"
              class="w-4rem"
            >
              <template #value="slotProps">
                <template v-if="slotProps.value">
                  <span :style="{ color: slotProps.value }">■</span>
                </template>
                <template v-else>
                  {{ slotProps.placeholder }}
                </template>
              </template>
              <template #option="slotProps">
                <span :style="{ color: slotProps.option.value }">■</span>
                {{ slotProps.option.label }}
              </template>
            </Dropdown>
            <InputText v-model="typeName" placeholder="種別" class="w-5rem" />
          </template>
        </Inplace>
      </div>
    </template>
    <template #icons>
      <SplitButton
        label="編成+"
        class="p-button-sm p-button-secondary split-button"
        @click="addTrain"
        :model="splitButtonItems"
      />
      <DiagramTrainTypeManagerStopStationManager
        v-model:visible="isVisibleStopStationManagerModal"
        v-model:trainType="trainType"
      />
    </template>
    <div
      v-if="trainType"
      class="flex justify-content-center flex-wrap trainIdButton"
    >
      <Button
        class="m-1 p-button-sm"
        v-for="(id, idx) in trainType.trainIdList"
        :key="id"
        @click="changeTrainId(id)"
        :style="buttonColorStyle"
      >
        {{ idx + 1 }}
      </Button>
    </div>
    <DiagramTrainTypeNecessaryTimeTable
      :trainTypeId="trainTypeId"
      v-model="necessaryTimesA"
      boundFor="A"
    />
    <DiagramTrainTypeNecessaryTimeTable
      :trainTypeId="trainTypeId"
      v-model="necessaryTimesB"
      boundFor="B"
    />
  </Panel>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useStore } from "@/store";
import { LINE_COLORS } from "@/common/const";
import rfdc from "rfdc";
const clonedeep = rfdc();

import DiagramTrainTypeNecessaryTimeTable from "./DiagramTrainTypeNecessaryTimeTable.vue";
import DiagramTrainTypeManagerStopStationManager from "./DiagramTrainTypeManagerStopStationManager.vue";

export default defineComponent({
  props: {
    trainTypeId: Number,
  },
  components: {
    DiagramTrainTypeNecessaryTimeTable,
    DiagramTrainTypeManagerStopStationManager,
  },
  setup(props) {
    const store = useStore();

    const trainType = computed({
      get: () => store.getters.getTrainType(props.trainTypeId || 0),
      set: (value) => {
        console.log("here");
        store.dispatch("updateTrainType", {
          id: props.trainTypeId,
          data: value,
        });
      },
    });
    const necessaryTimesA = computed({
      get: () => trainType.value?.necessaryTimesA,
      set: (value) => {
        store.dispatch("updateTrainTypeNecessaryTimeTable", {
          trainTypeId: props.trainTypeId,
          boundFor: "A",
          newNecessaryTimeMap: value,
        });
      },
    });
    const necessaryTimesB = computed({
      get: () => trainType.value?.necessaryTimesB,
      set: (value) => {
        store.dispatch("updateTrainTypeNecessaryTimeTable", {
          trainTypeId: props.trainTypeId,
          boundFor: "B",
          newNecessaryTimeMap: value,
        });
      },
    });

    const changeTrainId = (id: number) => {
      store.commit("setShowingTrainId", id);
    };

    const lineColor = ref<string>(trainType.value?.lineColor || "");
    const typeName = ref<string>(trainType.value?.name || "");
    const changeLineColorAndTypeName = (e: {
      originalEvent: Event;
      value: string;
    }) => {
      if (!trainType.value) return;
      if (
        trainType.value.lineColor === e.value &&
        trainType.value.name === typeName.value
      )
        return;
      const newTrainType = clonedeep(trainType.value);
      newTrainType.lineColor = lineColor.value;
      newTrainType.name = typeName.value;

      store.dispatch("updateTrainType", {
        id: props.trainTypeId,
        data: newTrainType,
      });
    };

    const buttonColorStyle = computed(() => ({
      backgroundColor: lineColor.value,
      borderColor: lineColor.value,
    }));

    const isVisibleStopStationManagerModal = ref<boolean>(false);

    const addTrain = () => store.dispatch("addTrain", trainType.value?.id);
    const editStopStation = () => {
      isVisibleStopStationManagerModal.value = true;
    };
    const splitButtonItems = ref([
      { label: "停車駅編集", icon: "pi pi-list", command: editStopStation },
    ]);
    return {
      trainType,
      lineColor,
      typeName,
      changeTrainId,
      changeLineColorAndTypeName,
      addTrain,
      LINE_COLORS,
      buttonColorStyle,
      necessaryTimesA,
      necessaryTimesB,
      splitButtonItems,
      isVisibleStopStationManagerModal,
    };
  },
});
</script>

<style scoped>
.trainIdButton {
  max-width: fit-content;
  min-width: 100%;
}
.panel {
  min-width: 15rem;
}
::v-deep(.split-button) .p-button {
  font-size: 0.9em;
  padding: 0.5rem 0.3rem;
}
</style>