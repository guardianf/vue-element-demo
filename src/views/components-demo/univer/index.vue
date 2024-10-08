<template>
  <el-tabs>
    <el-tab-pane label="Sheet1">
      <div :style="{height}">
        <el-button @click="viewApi">查看</el-button>
        <el-button @click="handleExport">导出</el-button>
        <div @dragstart="dragStart($event, {text: '电压', id: 'voltage'})">电压</div>
        <Univer id="sheet" ref="univerRef" :data="data" :drag-data="dragTag" @dragEnd="dragEnd" />
      </div>
    </el-tab-pane>
    <el-tab-pane label="Sheet2">
      <div :style="{height}">
        <Univer id="sheet2" ref="univerRef2" :data="data" />
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import Univer from './components/Univer.vue'
import { exportSheetExcel } from '@/utils/excelutils'

export default {
  name: 'UniverDemo',
  components: { Univer },
  data() {
    return {
      data: {},
      height: '500px',
      dragTag: {}
    }
  },
  created() {
  },
  methods: {
    viewApi() {
      console.log(this.$refs.univerRef.getApi())
      console.log(this.$refs.univerRef.getWorkbook())
      console.log(this.$refs.univerRef.getData())
    },
    dragStart(evt, node) {
      evt.dataTransfer.dropEffect = 'move'
      evt.dataTransfer.effectAllowed = 'move'
      evt.dataTransfer.setData('item', node.id)
      this.dragTag = node
      console.log(node)
    },
    dragEnd(node) {
      this.dragTag = {}
    },
    async handleExport() {
      const { sheetOrder, sheets } = this.$refs.univerRef.getData()
      const luckySheets = sheetOrder.map(id => sheets[id])
      // this.$refs.univerRef.handleExport()
      // console.log(this.data)
      console.log(this.$refs.univerRef.getData())
      exportSheetExcel(luckySheets, 'test')
    }
  }
}
</script>

<style scoped>
</style>
