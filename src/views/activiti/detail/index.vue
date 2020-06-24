<template>
  <div v-loading="loading" :style="'height:'+ height">
    <iframe :src="src" frameborder="no" style="width: 100%;height: 100%" scrolling="auto" />
  </div>
</template>
<script>
export default {
  name: "Druid",
  data() {
    return {
      src: '',
      height: document.documentElement.clientHeight - 94.5 + "px;",
      loading: true
    };
  },
  created() {
    const modelId = this.$route.params && this.$route.params.modelId;
    this.src = process.env.VUE_APP_BASE_API + "/modeler.html?modelId=" + modelId;
  },
  mounted: function() {
    setTimeout(() => {
      this.loading = false;
    }, 230);
    const that = this;
    window.onresize = function temp() {
      that.height = document.documentElement.clientHeight - 94.5 + "px;";
    };
  }
};
</script>
