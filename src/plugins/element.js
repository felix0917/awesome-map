import Vue from "vue"
import {
  Container,
  Header,
  Aside,
  Main,
  Row,
  Col,
  Menu,
  MenuItem,
  MenuItemGroup,
  Submenu,
  Divider,
  Card,
  Button,
  Tabs,
  TabPane,
  Message,
  MessageBox,
} from "element-ui"

Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Row)
Vue.use(Col)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(MenuItemGroup)
Vue.use(Submenu)
Vue.use(Divider)
Vue.use(Card)
Vue.use(Button)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm