<template>
  <el-dialog :visible.sync="visible" size="mini" label-width="80px">
    <el-form v-model="form" inline>
      <el-row>
        <el-form-item label="项目名称">
          <el-select v-model="form.project">
            <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="文件名称">
          <el-input v-model="form.filename" />
        </el-form-item>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="文件类型">
            <el-select v-model="form.group">
              <el-option v-for="item in groups" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="文件细类">
            <el-select v-model="form.type">
              <el-option v-for="item in types" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="编制人员">
            <el-select v-model="form.editor">
              <el-option v-for="item in psnls" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="审核人员">
            <el-select v-model="form.auditor">
              <el-option v-for="item in psnls" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="上传人员">
            <el-select v-model="form.uploader">
              <el-option v-for="item in psnls" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="文件简介">
        <el-input v-model="form.info" type="textarea" />
      </el-form-item>
    </el-form>
    <el-upload class="upload-demo" drag action="" :before-upload="beforeUpload" multiple>
      <i class="el-icon-upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
    </el-upload>
    <div slot="footer">
      <el-button type="primary">确定</el-button>
      <el-button>取消</el-button>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.el-dialog {
  .el-form-item {
    width: 100%;
  }
}
</style>

<script>
import { getGroupByProjectId, getTypeByProjectAndGroup } from '@/api/online'

export default {
  name: 'CreateProject',
  props: {
    projects: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      form: {},
      visible: false,
      psnls: [],
      groups: [],
      types: []
    }
  },
  watch: {
    'form.project'(project) {
      this.getGroups(project)
    },
    'form.group'(group) {
      this.getTypes(group)
    }
  },
  methods: {
    open() {
      this.visible = true
    },
    beforeUpload() {
      console.log('')
    },
    getGroups(id) {
      if (id) {
        getGroupByProjectId(id).then(res => {
          this.groups = res.data
        })
      } else {
        this.groups = []
      }
    },
    getTypes(id) {
      const projectId = this.form.project
      if(id) {
        getTypeByProjectAndGroup(projectId, id).then(res => {
          this.types = res.data
        })
      } else {
        this.types = []
      }
    }
  }
}
</script>
