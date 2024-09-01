import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
//样式文件需要单独引入
import 'element-ui/lib/theme-chalk/index.css';

// const cors = require('cors');

Vue.config.productionTip = false
Vue.use(ElementUI)
// Vue.use(cors)

new Vue({
  render: h => h(App),
}).$mount('#app')
