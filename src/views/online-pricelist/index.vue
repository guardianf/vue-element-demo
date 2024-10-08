<template>
  <div class="main">
    <span>报价单</span>
    <el-tabs title="">
      <el-tab-pane label="docx">
        <vue-office-docx :src="src" style="height: 100vh;" @rendered="rendered" />
      </el-tab-pane>
    </el-tabs>
  </div>

</template>

<style lang="scss" scoped>
 .main {
  font-size: 14px;
 }
</style>

<script>
import VueOfficeDocx from '@vue-office/docx'
import '@vue-office/docx/lib/index.css'

export default {
  name: 'PriceList',
  components: {
    VueOfficeDocx
  },
  data() {
    return {
      src: '/file/example.docx'
    }
  },
  methods: {
    rendered() {
      console.log('渲染完成')
    }
  }
}
</script>
