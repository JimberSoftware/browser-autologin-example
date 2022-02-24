import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import sodium from 'libsodium-wrappers';
(async () => {
  await sodium.ready;

  createApp(App).use(router).mount('#app');
})();
