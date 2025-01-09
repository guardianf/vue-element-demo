<template>
  <div class="main">
    <div>
      <span style="margin-right: 8px;margin-left: 20px">项目</span>
      <el-select v-model="listQuery.project">
        <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </div>
    <div class="tree-container">
      <el-tree ref="tree" default-expand-all :data="treeData" node-key="nodeId" :props="treeProps">
        <span slot-scope="{ node, data }" class="custom-tree-node" @contextmenu.prevent="e => handleRightClick(e, data)">
          <span class="node-label">
            <el-input v-if="data.isEdit" v-model="data.name" @change="$set(data, 'isEdit', false)" />
            <template v-else>{{ node.label }}</template>
          </span>
          <span v-if="data.level === 3" class="node-checkbox">
            <el-checkbox v-model="data.checked" />
          </span>
          <span v-if="data.level === 3" class="node-limit">
            <el-select
              v-model="data.type"
              size="mini"
              placeholder="选择该文件上传格式"
            >
              <el-option v-for="item in types" :key="item.key" :label="item.name" :value="item.key" />
            </el-select>
            <el-input
              v-model="data.size"
              size="mini"
              placeholder="输入限制文件大小(M)"
            />
          </span>
        </span>
      </el-tree>
    </div>
    <div class="footer">
      <el-button type="primary" @click="handleSave">保存</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
::v-deep .el-tree-node__content {
  height: 40px;
  .custom-tree-node {
    display: flex;
    flex-flow: row;
    align-items: center;
    gap: 8px;
    width: 800px;
    &>span  {
      display: block;
    }
    .node-label {
      flex: 1
    }
    .node-checkbox {
      width: 50px;
    }
    .node-limit {
      width: 500px;
      & > div {
        width: 240px;
        margin-right: 10px;
      }
    }
  }
}
.main {
  padding: 20px;
  height: calc(100vh - 124px);
  display: flex;
  flex-flow: column;
  .tree-container {
    flex: 1
  }
  .footer {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>

<script>
import { getProjects, getProjectFileConstruction, updateProjectFileConstruction, getMimetypes } from '@/api/online'

export default {
  data() {
    return {
      projects: [],
      listQuery: {
        project: ''
      },
      types: [],
      treeData: []
    }
  },
  computed: {
    treeProps() {
      return {
        label: 'name',
        children: 'children'
      }
    }
  },
  watch: {
    'listQuery.project'(val) {
      if (val) {
        this.fetchData(val)
      } else {
        this.treeData = []
      }
    }
  },
  created() {
    getProjects().then(res => {
      this.projects = res.data
    })
    getMimetypes().then(res => {
      this.types = res.data
    })
  },
  methods: {
    async fetchData(id) {
      const { data } = await getProjectFileConstruction(id)
      if (data) {
        this.treeData = [data]
      } else {
        const choosedProject = this.projects.find(itm => itm.id === id)
        this.treeData = [{ name: choosedProject.name, level: 1, id: choosedProject.id }]
      }
    },
    handleSave() {
      updateProjectFileConstruction(this.listQuery.project, this.treeData[0])
    },
    handleRightClick(e, data) {
      this.$contextmenu({
        items: [{
          label: '添加',
          children: [{
            label: '子页面',
            disabled: data.level > 2,
            onClick: () => {
              const oldChildren = data.children || []
              const children = [{ name: '空白', isEdit: true, level: data.level + 1, nodeId: Date.now() }, ...oldChildren]
              this.$set(data, 'children', children)
            }
          }, {
            label: '上方添加页面',
            onClick: () => {
              const node = this.$refs.tree.getNode(data)
              const oldChildren = node.parent.data.children
              const idx = oldChildren.findIndex(itm => itm.nodeId === data.nodeId)
              const children = [...oldChildren.slice(0, idx), { name: '空白', isEdit: true, nodeId: Date.now(), level: data.level }, ...oldChildren.slice(idx)]
              this.$set(node.parent.data, 'children', children)
            }
          }, {
            label: '下方添加页面',
            onClick: () => {
              const node = this.$refs.tree.getNode(data)
              const oldChildren = node.parent.data.children
              const idx = oldChildren.findIndex(itm => itm.nodeId === data.nodeId)
              const children = [...oldChildren.slice(0, idx + 1), { name: '空白', isEdit: true, nodeId: Date.now(), level: data.level }, ...oldChildren.slice(idx + 1)]
              this.$set(node.parent.data, 'children', children)
            }
          }]
        }, {
          label: '重命名',
          disabled: data.level === 1,
          onClick: () => {
            this.$set(data, 'isEdit', true)
          }
        }, {
          label: '删除',
          disabled: data.level === 1,
          onClick: () => {
            const node = this.$refs.tree.getNode(data)
            const children = node.parent.data.children.filter(itm => itm.nodeId !== data.nodeId)
            this.$set(node.parent.data, 'children', children)
          }
        }],
        e,
        x: e.clientX,
        y: e.clientY,
        customClass: 'custom-class',
        zIndex: 3,
        minWidth: 230
      })
      return false
    }
  }
}
</script>
