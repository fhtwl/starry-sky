import { createApp } from 'vue';
import App from './App.vue';
import setupAtnd from '@/lib/ant-design-vue';
import router from '@/router';
import { createPinia } from 'pinia';
import axios from '@/utils/http';
import CIcon from '@/components/CIcon/index.vue';

const app = createApp(App);
app.use(router);
app.component('CIcon', CIcon);
app.use(createPinia());

import './permission';
// import setupSocketIO from './lib/socket.io';
setupAtnd(app);
// setupSocketIO(app);

app.config.globalProperties.$axios = axios;
app.mount('#app');
