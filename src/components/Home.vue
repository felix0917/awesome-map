<template>
  <el-container class="home-container">
    <!-- 头部区 -->
    <el-header>
      <a href="./#/index">awesome map</a>
      <div>
        <a href="./#/sandcastle">Sandcastle</a>
        <a href="./#/documentation">Documentation</a>
        <a href="./#/blog">Blog</a>
        <a href="https://github.com/undefinedGIS/joey"
          >GitHub
          <svg
            fill="currentColor"
            preserveAspectRatio="xMidYMid meet"
            height="1em"
            width="1em"
            viewBox="0 0 40 40"
            style="vertical-align: middle; margin-left: 0.3rem; display: inline;margin-bottom:0.2rem;"
          >
            <g>
              <path
                d="m20 0c-11 0-20 9-20 20 0 8.8 5.7 16.3 13.7 19 1 0.2 1.3-0.5 1.3-1 0-0.5 0-2 0-3.7-5.5 1.2-6.7-2.4-6.7-2.4-0.9-2.3-2.2-2.9-2.2-2.9-1.9-1.2 0.1-1.2 0.1-1.2 2 0.1 3.1 2.1 3.1 2.1 1.7 3 4.6 2.1 5.8 1.6 0.2-1.3 0.7-2.2 1.3-2.7-4.5-0.5-9.2-2.2-9.2-9.8 0-2.2 0.8-4 2.1-5.4-0.2-0.5-0.9-2.6 0.2-5.3 0 0 1.7-0.5 5.5 2 1.6-0.4 3.3-0.6 5-0.6 1.7 0 3.4 0.2 5 0.7 3.8-2.6 5.5-2.1 5.5-2.1 1.1 2.8 0.4 4.8 0.2 5.3 1.3 1.4 2.1 3.2 2.1 5.4 0 7.6-4.7 9.3-9.2 9.8 0.7 0.6 1.4 1.9 1.4 3.7 0 2.7 0 4.9 0 5.5 0 0.6 0.3 1.2 1.3 1 8-2.7 13.7-10.2 13.7-19 0-11-9-20-20-20z"
              ></path>
            </g></svg
        ></a>
      </div>
    </el-header>

    <!-- 页面主体区 -->
    <el-container>
      <!-- 左侧菜单栏 -->
      <el-aside v-if="showLeftMenu">
        <el-menu
          active-text-color="#00ADE6"
          unique-opened
          @select="selectMenuHandler"
          @open="selectMenuHandler"
        >
          <template v-for="menu in sandcastleData">
            <el-submenu :index="menu.name" :key="menu.name">
              <template slot="title">
                <span class="title1">
                  {{ menu.label }}
                </span>
              </template>
              <el-menu-item
                v-for="example in menu.examples"
                :index="example.name"
                :key="example.name"
                >{{ example.label }}</el-menu-item
              >
            </el-submenu>
          </template>
        </el-menu>
      </el-aside>
      <!-- 右侧展示区 -->
      <el-main id="sandcastle-container">
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 是否显示左侧菜单栏
      showLeftMenu: false,
      // 沙盒列表数据
      sandcastleData: [],
    };
  },
  created() {
    // 页面刷新后更新左侧菜单栏显隐状态
    let hash = window.location.hash;
    let i = hash.indexOf("#");
    this.showLeftMenu = hash.slice(i + 1) === "/sandcastle";
  },
  mounted() {
    // 取消页面鼠标右击菜单和选择事件
    document.oncontextmenu = new Function("event.returnValue=false");
    document.onselectstart = new Function("event.returnValue=false");

    // 获取沙盒列表数据
    this.$nextTick(() => {
      this.getSandcastleData();
    });
  },
  watch: {
    $route(to, from) {
      // 监听路由变化改变左侧菜单栏显隐状态
      this.showLeftMenu = to.path === "/sandcastle";
    },
  },
  methods: {
    // 获取沙盒列表数据
    getSandcastleData() {
      this.$http
        .get("config/sandcastle.json")
        .then((res) => {
          this.sandcastleData = res.data || [];
        })
        .catch(() => {
          return this.$message.error("获取沙盒列表数据失败");
        });
    },
    // 左侧菜单选中处理：右侧页面滚动至对应位置
    selectMenuHandler(value) {
      if (value) {
        let el = document.getElementById("nav-" + value);
        if (el) {
          document.getElementById("sandcastle-container").scrollTop =
            el.offsetTop-65;
        }
      }
    },
  },
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: rgb(25, 32, 44);
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  > a {
    display: flex;
    align-items: center;
    margin-left: 25px;
    font: bold 16px / 24px UberMove, Helvetica, Arial, sans-serif;
    text-decoration: none;
    color: #fff;
  }
  > div {
    display: flex;
    align-items: center;
    padding: 0 42px;
    > a {
      font: 14px / 20px UberMove, Helvetica, Arial, sans-serif;
      padding-left: 20px;
      text-decoration: none;
      color: #fff;
    }
  }
}
.el-aside {
  width: 260px !important;
  border-right: 1px solid rgb(202, 213, 224);
  .el-menu {
    height: 100%;
    .el-submenu {
      font: bold 14px / 20px UberMove, Helvetica, Arial, sans-serif;
      color: rgb(25, 32, 44);
      border-top: 1px solid rgb(225, 232, 240);
      .el-menu-item {
        color: rgb(72, 86, 104);
        margin-left: 10px;
      }
    }
  }
}
.el-main {
  padding: 0px 0px 0px 15px;
  overflow-x: hidden;
}
.title1 {
  margin-left: 10px;
}
</style>
