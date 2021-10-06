<template>
  <Panel class="min-w-max">
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
              class="w-5rem"
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
      <Button
        class="p-button-sm m-0"
        @click="addTrain"
        :style="buttonColorStyle"
      >
        編成+
      </Button>
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
import { computed, defineComponent, ref } from "vue";
import { useStore } from "@/store";
import { LINE_COLORS } from "@/common/const";
import clonedeep from "lodash.clonedeep";

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

    const addTrain = () => store.dispatch("addTrain", trainType.value?.id);
    return {
      trainType,
      lineColor,
      typeName,
      changeTrainId,
      changeLineColorAndTypeName,
      addTrain,
      LINE_COLORS,
      buttonColorStyle,
    };
  },
});
</script>

<style scoped>
.trainIdButton {
  max-width: fit-content;
  min-width: 100%;
}
</style>