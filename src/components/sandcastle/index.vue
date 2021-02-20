<template>
  <div class="sandcastle">
    <template v-for="item in sandcastleData">
      <div :key="item.name">
        <div class="displayLabel" :id="'nav-' + item.name">
          {{ item.label }}
        </div>
        <div class="cardList">
          <div
            v-for="(example, index) in item.examples"
            :key="index"
            class="cardOuter"
          >
            <div class="card">
              <img
                :src="getImgPath(item.name, example)"
                @click="gotoExample(item.name, example)"
                :alt="example.name"
              />
              <div class="cardInfo">
                <span>{{ example.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 沙盒列表数据
      sandcastleData: [],
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.getSandcastleData();
    });
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
    // 获取展示卡片图片地址
    getImgPath(folder, example) {
      return `sandcastle/images/${folder}/${example.name}.${example.suffix ||
        "png"}`;
    },
    // 打开演示页面
    gotoExample(folder, example) {
      window.open();
    },
  },
};
</script>

<style lang="less" scoped>
.sandcastle {
  height: 100px;
}
.displayLabel {
  display: inline-block;
  margin: 3px;
  padding: 25px 20px 4px 0px;
  color: rgb(72, 86, 104);
  font: bold 20px / 28px UberMove, Helvetica, Arial, sans-serif;
  border-bottom: 1px solid rgb(202, 213, 224);
}
.cardList {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
  .cardOuter {
    .card {
      position: relative;
      cursor: pointer;
      text-decoration: none;
      padding: 12px;
      > img {
        max-width: 220px;
      }
      .cardInfo {
        display: flex;
        position: absolute;
        height: 78.3%;
        width: 79.1%;
        top: 10%;
        left: 10%;
        justify-content: center;
        flex-direction: column;
        text-align: center;
        color: #fff;
        border: 1px solid rgb(255, 255, 255);
        background-color: rgba(192, 196, 204, 0.6);
        opacity: 0;
        transition-property: opacity;
        transition-duration: 0.4s;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        font: 1.5em / 20px UberMove, Helvetica, Arial, sans-serif;
      }
      :hover {
        opacity: 1;
      }
    }
  }
  :focus {
    border: 1px solid #9325BC; 
    box-shadow: rgb(0 0 0 / 16%) 0px 4px 16px;
  }
}
</style>
