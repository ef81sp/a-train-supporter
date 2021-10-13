import { MyActions } from './actions.type';

export const actions: MyActions = {
  addTrain(context, { trainTypeId }) {
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
  updateTrainType(context, payload) {
    context.commit('updateTrainType', payload);
    context.commit('__updateLineColorAndTrainName', {
      trainTypeId: payload.id,
    });
    context.state.__chartRefresh();
    context.commit('__logHistory');
  },
  updateTrainTypeNecessaryTimeTable(context, payload) {
    context.commit('updateTrainTypeNecessaryTimeTable', payload);
    context.commit('__logHistory');
  },
  updateDiagramData(context, payload) {
    context.commit('updateDiagramData', payload);
    context.commit('__logHistory');
  },
  updateStationList(context, payload) {
    context.commit('updateStationList', payload);
    context.commit('__logHistory');
  },
  loadData(context, payload) {
    context.commit('loadData', payload);
  },
};
