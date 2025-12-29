import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './assets/base.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.mount('#app');

// Initialize Lucide icons after Vue app mounts
declare const lucide: any;
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}
