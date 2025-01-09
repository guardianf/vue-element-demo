<template>
  <div class="layout">
    <div class="sidebar">
      <el-tree :data="tree" :props="treeProps" default-expand-all @node-click="handleNodeClick" />
    </div>
    <div class="content">
      <div>
        <el-button type="link" @click="handleBatchDownload">批量下载</el-button>
      </div>
      <div v-if="!isEmpty(curNode)" class="tool-tips"><el-button type="primary" @click="handleDownload">下载</el-button></div>
      <component :is="currComponent" v-bind="option" />
    </div>
    <Chooser ref="chooser" :data="tree" :tree-props="treeProps" @download="onBatchDownload" />
  </div>
</template>

<style lang="scss" scoped>
.layout {
  display: flex;
  flex-flow: row;
  height: calc(100vh - 84px);
}

.sidebar {
  width: 500px
}

.content {
  flex: 1;
}
.tool-tips {
  position: fixed;
  right: 40px;
  top: 100px;
  z-index: 999;
}
</style>

<script>
// 引入VueOfficeDocx组件
import VueOfficeDocx from '@vue-office/docx'
import VueOfficeExcel from '@vue-office/excel'
import VueOfficePdf from '@vue-office/pdf'
import { getProject } from '@/api/online'
// 引入相关样式
import '@vue-office/docx/lib/index.css'
import '@vue-office/excel/lib/index.css'

import { isEmpty } from 'lodash'
import Chooser from './components/Chooser'
import { getBatchDownload } from '@/api/online'

export default {
  name: 'OnlineProjectDetail',
  components: {
    VueOfficeDocx, VueOfficeExcel, VueOfficePdf, Chooser
  },
  data() {
    return {
      type: 'pdf',
      option: {
      },
      tree: [],
      info: {},
      curNode: {},
      treeProps: {
        label: 'name',
        value: 'id',
        children: 'children'
      }
    }
  },
  computed: {
    currComponent() {
      return `vue-office-${this.type}`
    }
  },
  created() {
    const id = this.$route.query.id
    if (id) {
      getProject(id).then(res => {
        this.tree = [res.data.construct]
        this.info = res.data.info
      })
    }
  },
  activated() {
    const id = this.$route.query.id
    if (id) {
      getProject(id).then(res => {
        this.tree = [res.data.construct]

        this.info = res.data.info
      })
    }
  },
  methods: {
    isEmpty,
    handleNodeClick(data) {
      if (data.level === 3) {
        if (data?.data?.file) {
          // 根据文件名称获取文件扩展名
          const ext = data.data.file.split('.').pop()
          switch (ext) {
            case 'docx':
              this.type = 'docx'
              break
            case 'xlsx':
              this.type = 'excel'
              break
            case 'pdf':
              this.type = 'pdf'
              break
            default:
              this.type = 'pdf'
              break
          }
          if (data.data.file) {
            this.option = {
              src: `${data.data.file_url}` }
          }
          this.curNode = data
        } else {
          this.option = {}
          this.curNode = {}
        }
      } else {
        this.option = {}
        this.curNode = {}
      }
    },
    handleDownload() {
      window.open(this.curNode.data.file_url)
    },
    handleBatchDownload() {
      this.$refs.chooser.open()
    },
    onBatchDownload(files) {
      getBatchDownload(files)
    }
  }
}
</script>
