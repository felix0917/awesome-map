<template>
  <div id="container" class="box">
    <div id="cesiumContainer"></div>
  </div>
</template>
 
<script>
export default {
  name: 'Home',
  mounted(){
    this.init()
  },
  methods: {
    init() {
      let Cesium = this.cesium
      let viewer = new Cesium.Viewer('cesiumContainer');
      viewer._cesiumWidget._creditContainer.style.display = "none";// 隐藏版权
    }
  }
};
</script>
 
<style lang='less' scoped>
</style>