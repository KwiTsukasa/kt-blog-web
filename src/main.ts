import { createApp } from 'vue';
import { createPinia } from 'pinia';

import 'antdv-next/dist/reset.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import App from './App';
import router from './router';
import './styles/index.scss';

const app = createApp(App);

app.use(createPinia());
app.use(router);

const mountTarget = document.querySelector<HTMLElement>('.kt-blog__mount');

if (mountTarget) {
  app.mount(mountTarget);
}
