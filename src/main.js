import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'

// 导入字体图标Font Awesome
import './assets/font-awesome-4.7.0/css/font-awesome.min.css'

// 导入全局样式表
import './assets/css/global.css'

// // 引入cesium相关文件
// var cesium = require('cesium/Cesium');
// var widgets = require('cesium/Widgets/widgets.css');
// Vue.prototype.cesium = cesium
// Vue.prototype.widgets = widgets

// 导入axios
import axios from 'axios'
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')