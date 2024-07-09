<template>
  <div>
    <div id="monaco" />
    <el-button @click="runPython">RUN</el-button>
    <div ref="outputRef" class="content">output:</div>
    <canvas id="canvas" />
  </div>
</template>

<script>
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution'

export default {
  data() {
    return {
      monacoInstance: null,
      worker: null,
      id: 0,
      lastRunId: 0
    }
  },
  mounted() {
    const monacoInstance = monaco.editor.create(document.getElementById('monaco'), {
      value: `import matplotlib.pyplot as plt
# 数据
频率 = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
周期 = [10, 5, 3.36, 2.48, 2, 1.68, 1.44, 1.28, 1.12, 1]
# 创建图表
plt.figure(figsize=(8, 6))
plt.rcParams['font.sans-serif'] = 'STHupo'
plt.plot(频率, 周期, marker='o', linestyle='-')
plt.title('周期随着频率变化')
plt.xlabel('Feq(Hz)')
plt.ylabel('Dr(ms)')
plt.grid(True)

# 显示图表
plt.show()`,
      language: 'python'
    })
    this.monacoInstance = monacoInstance

    const worker = new Worker('./lib/worker-service.js')
    worker.onmessage = (event) => {
      const { id, canvas, ...data } = event.data
      if (canvas) {
        const image = new Image()
        image.onload = () => {
          const htmlCanvas = document.getElementById('canvas')
          const ctx = htmlCanvas.getContext('2d')
          htmlCanvas.width = image.width
          htmlCanvas.height = image.height
          ctx.drawImage(image, 0, 0)
        }
        image.src = data.results
      }
      const onSuccess = (res) => {
        if (this.lastRunId === id) this.$refs.outputRef.value += res.results
        else this.$refs.outputRef.value = res.results
        this.lastRunId = id
      }
      const onFailure = (res) => {
        console.error(res)
        this.$refs.outputRef.value += res.error
      }
      if (data.error) {
        onFailure(data)
      } else {
        onSuccess(data)
      }
    }
    this.worker = worker
  },
  methods: {
    runPython() {
      const scripts = this.monacoInstance.getValue()
      try {
        // const locals = {
        //   temp1: temp1.value,
        //   temp2: temp2.value,
        // };
        this.id = (this.id + 1) % Number.MAX_SAFE_INTEGER
        this.worker.postMessage({
          // ...locals,
          python: scripts,
          id: this.id
        })
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style scoped>
#monaco {
  min-height: 400px;
}
</style>
