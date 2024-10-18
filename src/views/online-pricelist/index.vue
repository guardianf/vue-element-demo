<template>
  <div class="main">
    <div class="header">
      <h4>项目交付文件</h4>
      <span class="flex-1" />
      <label>项目名称</label>
      <el-select v-model="listQuery.project" size="mini" clearable>
        <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <a v-if="isCard" @click="handleSwitch('list')">列表查看</a>
      <a v-else @click="handleSwitch('card')">缩略图查看</a>
      <a @click="handleNew">上传文件</a>
    </div>
    <div class="body">
      <template v-if="!isCard">
        <el-table :data="dataList">
          <el-table-column label="项目名称" prop="name" />
          <el-table-column label="文件名称" prop="filename" />
          <el-table-column label="文件类型" prop="type" />
          <el-table-column label="编辑/审核/上传" prop="names">
            <template slot-scope="scope">
              {{ scope.row.editor }}/{{ scope.row.auditor }}/{{ scope.row.uploader }}
            </template>
          </el-table-column>
          <el-table-column label="文件审核/上传时间" prop="times">
            <template slot-scope="scope">
              {{ scope.row.audit_time }}/{{ scope.row.upload_time }}
            </template>
          </el-table-column>
          <el-table-column label="操作" prop="opr">
            <template slot-scope="scope">
              <el-button type="text">编辑</el-button>
              <el-button type="text">查看</el-button>
              <el-button type="text" @click="onDelete(scope.row)">删除</el-button>
              <el-button type="text">下载</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination :total="dataList.length" />
      </template>
      <template v-else>
        <div class="card-container">
          <div v-for="item in dataList" :key="item.id" class="card" @click="detail(item.id)">
            <el-image :src="getImageUrl(item.image)" />
            <div class="row">
              <span>{{ item.name }}</span><span>{{ item.date }}</span>
            </div>
            <div class="row">
              <el-progress :percentage="item.percentage | percentage" />
              <a @click="uploadImage(item)">缩略图上传</a></div>
          </div>
        </div>
      </template>
    </div>
    <el-tabs v-if="false" title="">
      <el-tab-pane label="docx">
        <vue-office-docx :src="src" style="height: 100vh;" @rendered="rendered" />
      </el-tab-pane>
    </el-tabs>
    <create-dialog ref="create" :projects="projects" />
  </div>
</template>

<style lang="scss" scoped>
 .main {
  font-size: 14px;
  padding: 8px;
 }
 .header  {
  display: flex;
  flex-flow: row;
  height: 42px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  .flex-1 {
    flex:1;
    display: block;
  }
  a {
    color: blue;
    text-decoration: underline;
  }
 }
 .body {
  height: 100vh;
  .card-container {
    display: flex;
    flex-flow: row;
    flex-wrap: wrap;
    gap: 5px;
  .card {
    cursor: pointer;
    display: flex;
    flex-flow: column;
    width: calc(33%);
    height: 200px;
    border-radius: 4px;
    .el-image {
      flex: 1;
    }
    .row {
      display: flex;
      flex-flow: row;
      align-items: center;
      justify-content: space-between;
      height: 32px;
      &>* {
        display: block;
        &.el-progress {
          flex: 1
        }
      }
    }
  }}
 }
</style>

<script>
import VueOfficeDocx from '@vue-office/docx'
import '@vue-office/docx/lib/index.css'
import { getProjects, uploadThumbnail, deleteProject } from '@/api/online'
import CreateDialog from './components/Create'
import { percentage } from '@/filters'

const STYLE = {
  CARD: Symbol('card'),
  LIST: Symbol('list')
}

export default {
  name: 'PriceList',
  components: {
    VueOfficeDocx, CreateDialog
  },
  filters: { percentage },
  data() {
    return {
      src: '/example.docx',
      style: STYLE.CARD,
      projects: [],
      listQuery: {
        project: ''
      },
      dataList: []
    }
  },
  computed: {
    isCard() {
      return this.style === STYLE.CARD
    }
  },
  created() {
    this.getProjects()
  },
  methods: {
    async getProjects() {
      const { data } = await getProjects()
      this.projects = data
      this.dataList = data
    },
    rendered() {
      console.log('渲染完成')
    },
    handleSwitch(type) {
      switch (type) {
        case 'card':
          this.style = STYLE.CARD
          break
        case 'list':
          this.style = STYLE.LIST
          break
      }
    },
    async onDelete(row) {
      console.log('delete:', row)
      await deleteProject(row.id)
      this.getProjects()
    },
    uploadImage(row) {
      const uploader = document.createElement('input')
      uploader.type = 'file'
      uploader.accept = '.png,.jpg'
      uploader.onchange = e => {
        console.log(e.target.files[0])
        uploadThumbnail({ id: row.id, file: e.target.files[0] })
        this.getProjects()
      }
      uploader.click()
    },
    getImageUrl(url) {
      return process.env.VUE_APP_BASE_API + '/api/' + url
    },
    handleNew() {
      this.$refs.create.open()
    },
    detail(id) {
      this.$router.push({ path: '/pricelist/detail', query: { id }})
    }
  }
}
</script>
