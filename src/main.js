import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false
import 'view-design/dist/styles/iview.css';
new Vue({
  render: h => h(App),
}).$mount('#app')
