import { MyActions } from "./actions.type";
import rfdc from "rfdc";
import { generateInitialNecessaryTime } from "@/logics/diagram";
const clone = rfdc();

export const actions: MyActions = {
  addTrain(context, { trainTypeId }) {
    const nextTrainId = context.state.nextTrainId;
    context.commit("addTrain", { trainTypeId, trainId: nextTrainId });
    context.commit("incrementTrainId");
    context.commit("__logHistory");
  },
  addInitialTrainType(context) {
    context.commit("addInitialTrainType");
    const newTrainTypeId = Math.max(...context.state.trainTypes.keys());
    context.dispatch("addTrain", { trainTypeId: newTrainTypeId });
    // context.commit('__logHistory'); // addTrain側でやるので省略
  },
  updateTrainType(context, payload) {
    context.commit("updateTrainType", payload);
    context.commit("__updateLineColorAndTrainName", {
      trainTypeId: payload.id,
    });
    context.state.__chartRefresh();
    context.commit("__logHistory");
  },
  deleteTrainType(context, payload) {
    context.commit("deleteTrainType", payload);
    const nextShowingTrainId = context.state.diagramData.datasets[0]?.id;
    if (nextShowingTrainId) {
      context.commit("setShowingTrainId", { id: nextShowingTrainId });
    }
    context.commit("__logHistory");
  },
  updateTrainTypeNecessaryTimeTable(context, payload) {
    context.commit("updateTrainTypeNecessaryTimeTable", payload);
    context.commit("__logHistory");
  },
  updateDiagramData(context, payload) {
    context.commit("updateDiagramData", payload);
    context.commit("__logHistory");
  },
  updateStationList(context, payload) {
    context.commit("updateStationList", payload);
    context.state.trainTypes.forEach((trainType, id) => {
      const data = clone(trainType);
      const a = generateInitialNecessaryTime(context.state.stationList, "A");
      a.forEach((v, k) => {
        const time = trainType.necessaryTimesA.get(k)?.necessaryTime;
        if (!time) return;
        v.necessaryTime = time;
      });
      data.necessaryTimesA = a;
      const b = generateInitialNecessaryTime(context.state.stationList, "B");
      b.forEach((v, k) => {
        const time = trainType.necessaryTimesB.get(k)?.necessaryTime;
        if (!time) return;
        v.necessaryTime = time;
      });
      data.necessaryTimesB = b;
      data.stoppingStationList.push(
        context.state.stationList.stations[
          context.state.stationList.stations.length - 1
        ].id
      );
      context.commit("updateTrainType", { id, data });
    });
    context.commit("__logHistory");
  },
  loadData(context, payload) {
    context.commit("loadData", payload);
  },
  initialize(context) {
    context.commit("initialize");
    context.commit("__logHistory");
  },
};
