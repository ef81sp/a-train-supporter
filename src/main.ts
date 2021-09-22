import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';

import PrimeVue from 'primevue/config';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Card from 'primevue/card'

import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import '/node_modules/primeflex/primeflex.css';

createApp(App)
  .use(store)
  .use(router)
  .use(PrimeVue)
  .component('Dropdown', Dropdown)
  .component('Button', Button)
  .component('Card', Card)
  .mount('#app');
