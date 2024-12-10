import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { msalSingleton } from './authConfig';

const app = createApp(App);

msalSingleton.initialize().then(() => {
    app.use(router);
    app.mount('#app');
  }).catch(error => {
    console.error('Failed to initialize MSAL:', error);
  });