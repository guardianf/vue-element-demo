<template>
  <el-dialog :visible.sync="dialogVisible" :before-close="handleClose" title="批量下载">
    <el-tree :data="tree" default-expand-all :props="treeProps">
      <template v-slot:default="{ node, data }">
        <span class="custom-tree-node">
          <span>{{ node.label }}</span>
          <span>
            <el-checkbox @change="val => handleCheckedChange(data, val)" />
          </span>
        </span>
      </template>
    </el-tree>
    <div slot="footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleDownload">确 定</el-button>"
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>

</style>

<script>
export default {
  name: 'Chooser',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    treeProps: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: false,
      tree: [],
      checkedData: []
    }
  },
  methods: {
    open() {
      this.dialogVisible = true
      this.tree = this.data
    },
    handleClose() {
      this.dialogVisible = false
    },
    handleDownload() {
      this.$emit('download', this.checkedData)
      this.dialogVisible = false
    },
    handleCheckedChange(data, checked) {
      if (checked) {
        this.checkedData.push(data.data.file)
      } else {
        this.checkedData = this.checkedData.filter(item => item !== data.data.file)
      }
    }
  }
}
</script>
