<template>
  <el-dialog :visible.sync="visible" size="mini" title="上传文件">
    <el-form ref="form" :model="form" label-width="100px" :rules="rules">
      <el-row>
        <el-col :span="12">
          <el-form-item label="项目名称" prop="project">
            <el-select v-model="form.project">
              <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="文件名称" prop="name">
            <el-input v-model="form.filename" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="文件类型" prop="group">
            <el-select v-model="form.group">
              <el-option v-for="item in groups" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="文件细类" prop="type">
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
              <el-option v-for="item in psnls" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="审核人员">
            <el-select v-model="form.auditor">
              <el-option v-for="item in psnls" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="上传人员">
            <el-select v-model="form.uploader">
              <el-option v-for="item in psnls" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="文件简介">
        <el-input v-model="form.info" type="textarea" :rows="4" />
      </el-form-item>
      <el-form-item no-style prop="file">
        <el-upload :file-list="fileList" class="upload-demo" drag action="" :auto-upload="false" :on-change="handleOnChange">
          <i class="el-icon-upload" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div slot="tip" class="el-upload__tip">只能上传{{ fileLimit.mimetype | mimetype(mimetypes) }}文件，且不超过{{ fileLimit.limit }}M</div>
        </el-upload>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button type="primary" @click="handleSubmit">确定</el-button>
      <el-button>取消</el-button>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.el-dialog {
  .el-form-item {
    width: 100%;
  }

  .el-select {
    width: 100%;
  }
}
  .upload-demo {
    ::v-deep .el-upload {
      width: 100%;
      .el-upload-dragger {
        width: 100%;
        display: block;
      }
    }
  }
</style>

<script>
import { getGroupByProjectId, getTypeByProjectAndGroup, getPsnls, getFileLimit, getMimetypes, uploadFile } from '@/api/online'

export default {
  name: 'CreateProject',
  filters: {
    mimetype(val, arr) {
      if (val && arr) {
        return arr.find(itm => itm.key === val).name || ''
      } else {
        return ''
      }
    }
  },
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
      types: [],
      fileList: [],
      fileLimit: {},
      mimetypes: [],
      rules: {
        file: [{ required: true, trigger: 'blur', message: '请上传文件' }],
        project: [{ required: true, trigger: 'blur', message: '请选择项目' }],
        group: [{ required: true, trigger: 'blur', message: '请选择文件类型' }],
        type: [{ required: true, trigger: 'blur', message: '请选择文件细类' }]
      }
    }
  },
  watch: {
    'form.project'(project) {
      this.getGroups(project)
    },
    'form.group'(group) {
      this.getTypes(group)
    },
    'form.type'(val) {
      if (val) {
        this.getLimitInfo(val)
      }
    }
  },
  created() {
    getPsnls().then(res => { this.psnls = res.data })
    getMimetypes().then(res => {
      this.mimetypes = res.data
    })
  },
  methods: {
    open() {
      this.visible = true
    },
    getLimitInfo(type) {
      const { project, group } = this.form
      getFileLimit(project, group, type).then(res => {
        this.fileLimit = res.data
      })
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
      if (id) {
        getTypeByProjectAndGroup(projectId, id).then(res => {
          this.types = res.data
        })
      } else {
        this.types = []
      }
    },
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid && this.checkLimit(this.form.file)) {
          uploadFile(this.form).then(res => {
            this.$message.success('上传成功')
            this.visible = false
          })
        } else console.error(valid)
      })
    },
    handleOnChange(file) {
      const checkRslt = this.checkLimit(file.raw)
      if (checkRslt) {
        this.form.file = file.raw
        this.fileList = [file]
        this.form.name = file.name
      } else {
        this.form.file = null
      }
    },
    checkLimit(file) {
      const fileLimit = this.mimetypes.find(item => item.key === this.fileLimit.mimetype)
      const isType = fileLimit.mimetypes.includes(file.type)
      const isLt2M = file.size / 1024 / 1024 < this.fileLimit.limit
      if (!isType) {
        this.$message.error(`上传文件只能是${fileLimit.name}格式`)
      }
      if (!isLt2M) {
        this.$message.error(`上传文件大小不能超过${this.fileLimit.limit}MB!`)
      }
      return isType && isLt2M
    }
  }
}
</script>
