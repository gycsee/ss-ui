import { createApp } from 'vue';
import 'ant-design-vue/dist/reset.css';
import Antd from 'ant-design-vue';

import App from './App.vue';
import './styles.css';

const app = createApp(App);

app.use(Antd);
app.mount('#app');
