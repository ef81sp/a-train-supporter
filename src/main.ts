import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store, { key } from './store';

import PrimeVue from 'primevue/config';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Chart from 'primevue/chart';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ScrollPanel from 'primevue/scrollpanel';
import Panel from 'primevue/panel';
import Calendar from 'primevue/calendar';
import InputNumber from 'primevue/inputnumber';
import RadioButton from 'primevue/radiobutton';

import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import '/node_modules/primeflex/primeflex.css';

createApp(App)
  .use(store, key)
  .use(router)
  .use(PrimeVue)
  .component('Dropdown', Dropdown)
  .component('Button', Button)
  .component('Card', Card)
  .component('Chart', Chart)
  .component('DataTable', DataTable)
  .component('Column', Column)
  .component('ScrollPanel', ScrollPanel)
  .component('Panel', Panel)
  .component('Calendar', Calendar)
  .component('InputNumber', InputNumber)
  .component('RadioButton', RadioButton)
  .mount('#app');
