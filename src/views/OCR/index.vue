<template>
  <div class="ocr-demo-container">
    <el-tabs title="OCR Demo">
      <el-tab-pane title="paddle">
        <div class="ocr-demo-content">
          <div class="ocr-demo-content-title">PaddleOCR</div>
          <div class="ocr-demo-content-desc">PaddleOCR 是百度开源的文字识别模型，支持中英文、数字、英文符号、中文符号等。</div>
          <div class="ocr-demo-content-btn">
            <el-button type="primary" size="small" :disabled="!paddleReady" @click="handlePaddleOcr">识别</el-button>
          </div>
          <el-image :src="paddleSrc" />
          <canvas id="canvas" />
          <div class="ocr-demo-content-result">{{ paddleResult }}</div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>

</style>

<script>
import * as ocr from '@paddlejs-models/ocr'

export default {
  name: '',
  data() {
    return {
      paddleSrc: '',
      paddleRunner: null,
      paddleReady: false,
      paddleResult: ''
    }
  },
  created() {
    this.initPaddle()
  },
  methods: {
    async initPaddle() {
      this.paddleRunner = ocr
      await this.paddleRunner.init()
      this.paddleReady = true
    },
    handlePaddleOcr() {
      const self = this
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = e => {
        const file = e.target.files[0]
        const reader = new FileReader()
        reader.onload = function(e) {
          const img = document.createElement('img')
          img.onload = () => {
            self.paddleRunner.recognize(img, {
              canvas: document.getElementById('canvas')
            }).then(res => {
              console.log(res)
              self.paddleResult = res.text
            })
          }
          img.src = e.target.result
          self.paddleSrc = e.target.result
        }
        reader.readAsDataURL(file)
      }
      input.click()
    }
  }
}
</script>
