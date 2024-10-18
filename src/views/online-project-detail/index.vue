<template>
  <div class="layout">
    <div class="sidebar">
      <el-tree :data="tree" />
    </div>
    <div class="content">
      <component :is="currComponent" :src="src" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.layout {
  display: flex;
  flex-flow: row;
  height: 100%;
}

.sidebar {
  width: 500px
}

.content {
  flex: 1;
}
</style>

<script>
import VueOfficeDocx from '@vue-office/docx'
import VueOfficeExcel from '@vue-office/excel'
import VueOfficePdf from '@vue-office/pdf'
import { getProject } from '@/api/online'

export default {
  name: 'OnlineProjectDetail',
  components: {
    VueOfficeDocx, VueOfficeExcel, VueOfficePdf
  },
  data() {
    return {
      type: 'docx',
      src: '/api/example.docx',
      tree: []
    }
  },
  computed: {
    currComponent() {
      return `vue-office-${this.type}`
    }
  },
  created() {
    const id = this.$route.query.id
    if (id) { getProject(id).then(res => { this.tree = res.data }) }
  },
  activated() {
    const id = this.$route.query.id
    if (id) { getProject(id).then(res => { this.tree = res.data }) }
  }

}
</script>
