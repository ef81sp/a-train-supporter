import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store, { key } from "./store";

//@ts-expect-error no d.ts file
import VuexUndoRedo from "vuex-undo-redo";

import PrimeVue from "primevue/config";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import SplitButton from "primevue/splitbutton";
import Card from "primevue/card";
import Chart from "primevue/chart";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ScrollPanel from "primevue/scrollpanel";
import Panel from "primevue/panel";
import Calendar from "primevue/calendar";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import RadioButton from "primevue/radiobutton";
import Timeline from "primevue/timeline";
import Checkbox from "primevue/checkbox";
import Inplace from "primevue/inplace";
import Dialog from "primevue/dialog";

import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import "/node_modules/primeflex/primeflex.css";

createApp(App)
  .use(store, key)
  .use(VuexUndoRedo, {
    ignoreMutations: [
      "setShowingTrainId",
      "setChartRefresh",
      "incrementTrainId",
    ],
  })
  .use(router)
  .use(PrimeVue)
  .component("Dropdown", Dropdown)
  .component("SplitButton", SplitButton)
  .component("Button", Button)
  .component("RadioButton", RadioButton)
  .component("Card", Card)
  .component("Chart", Chart)
  .component("DataTable", DataTable)
  .component("Column", Column)
  .component("ScrollPanel", ScrollPanel)
  .component("Panel", Panel)
  .component("Calendar", Calendar)
  .component("InputNumber", InputNumber)
  .component("InputText", InputText)
  .component("Timeline", Timeline)
  .component("Checkbox", Checkbox)
  .component("Inplace", Inplace)
  .component("Dialog", Dialog)

  .mount("#app");
