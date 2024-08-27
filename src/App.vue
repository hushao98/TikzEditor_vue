<template>
  <div id="app">
    <el-container style="height: 100vh;">
      <!-- Header -->
      <el-header>
        <h2>LaTeX TikZ Editor</h2>
      </el-header>

      <el-container>
        <!-- Control Panel -->
        <el-aside width="200px">
          <ControlPanel @addShape="addShape" @clearCanvas="clearCanvas" />
        </el-aside>

        <!-- Drawing Area and Code Display -->
        <el-container>
          <el-main>
            <el-row :gutter="20">
              <!-- Drawing Area -->
              <el-col :span="12">
                <DrawingCanvas ref="drawingCanvas" />
              </el-col>

              <!-- TikZ Code Display Area -->
              <el-col :span="12">
                <div id="tikz-code-area">
                  <h3>TikZ Code</h3>
                  <el-input
                      type="textarea"
                      :rows="15"
                      v-model="tikzCode"
                      readonly>
                  </el-input>
                </div>
                <el-button type="primary" @click="sendToBackend">Generate TikZ Code</el-button>
              </el-col>
            </el-row>
          </el-main>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import DrawingCanvas from './components/DrawingCanvas.vue';
import ControlPanel from './components/ControlPanel.vue';

export default {
  components: {
    DrawingCanvas,
    ControlPanel,
  },
  data() {
    return {
      tikzCode: '',
    };
  },
  methods: {
    addShape(type) {
      this.$refs.drawingCanvas.addShape(type);
    },
    clearCanvas() {
      this.$refs.drawingCanvas.clearCanvas();
    },
    sendToBackend() {
      const drawingData = this.$refs.drawingCanvas.getDrawingData();

      fetch('http://127.0.0.1:5000/api/generate-tikz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(drawingData),
      })
          .then(response => response.json())
          .then(data => {
            this.tikzCode = data.tikzCode; // 将返回的 TikZ 代码显示在前端
          })
          .catch(error => {
            console.error('Error:', error);
          });
    },
  },
};
</script>

<style>
#tikz-code-area {
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 4px;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>
