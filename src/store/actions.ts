import { Station, TrainType } from '@/types';
import { DiagramData } from '@/types/diagram';
import { ActionTree } from 'vuex';
import { State } from '.';

export const actions: ActionTree<State, State> = {
  addTrain(context, trainTypeId) {
    const nextTrainId = context.state.nextTrainId;
    context.commit('addTrain', { trainTypeId, trainId: nextTrainId });
    context.commit('incrementTrainId');
    context.commit('__logHistory');
  },
  addInitialTrainType(context) {
    context.commit('addInitialTrainType');
    const newTrainTypeId = Math.max(...context.state.trainTypes.keys());
    context.dispatch('addTrain', newTrainTypeId);
    // context.commit('__logHistory'); // addTrain側でやるので省略
  },
  updateTrainType(context, payload: { id: number; data: TrainType }) {
    context.commit('updateTrainType', payload);
    context.commit('__updateLineColorAndTrainName', payload.id);
    context.state.__chartRefresh();
    context.commit('__logHistory');
  },
  updateTrainTypeNecessaryTimeTable(context, payload) {
    context.commit('updateTrainTypeNecessaryTimeTable', payload);
    context.commit('__logHistory');
  },
  updateDiagramData(context, payload: { id: number; data: DiagramData[] }) {
    context.commit('updateDiagramData', payload);
    context.commit('__logHistory');
  },
  updateStationList(context, stations: Station[]) {
    context.commit('updateStationList', stations);
    context.commit('__logHistory');
  },
  loadData(context, id) {
    context.commit('loadData', id);
  },
};
