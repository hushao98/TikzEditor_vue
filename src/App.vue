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
          <ControlPanel @addShape="addShape" @clearCanvas="clearCanvas" @updateChart="updateChart"/>
<!--          <ControlPanel @addPoint="addPoint" @removePoint="removePoint" />-->
<!--          <ControlPanel @updatePoint="updatePoint"/>-->
        </el-aside>

        <!-- Drawing Area and Code Display -->
        <el-container>
          <el-main>
            <el-row :gutter="20">
              <!-- Drawing Area -->
              <el-col :span="12">
                <DrawingCanvas ref="drawingCanvas" />
                <LineChart ref="lineChart"/>
                <PDFViewer ref="pdfViewer"/>
              </el-col>

              <!-- TikZ Code Display Area -->
              <el-col :span="12">
                <div id="tikz-code-area">
                  <h3>TikZ Code</h3>
                  <el-input
                      type="textarea"
                      :rows="15"
                      v-model="tikzCode"
                      >
                  </el-input>
                </div>
                <el-button type="primary" @click="sendToBackend">Generate TikZ Code</el-button>
              </el-col>
              <el-col :span="12">
                <div id="tikz-code-area">
                  <h3>TikZ Code</h3>
                  <el-input
                      type="textarea"
                      :rows="15"
                      v-model="tikzCode"
                      >
                  </el-input>
                </div>
                <el-button type="primary" @click="fetchPDF">PDF Show</el-button>
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
import LineChart from './components/LineChart.vue'
import PDFViewer from "./components/PDFViewer.vue";

export default {
  computed: {
    PDFViewer() {
      return PDFViewer
    }
  },
  components: {
    DrawingCanvas,
    ControlPanel,
    LineChart,
    PDFViewer
  },
  data() {
    return {
      tikzCode: '\\documentclass{standalone}'+'\n'+
                '\\usepackage{tikz}'+'\n'+
                '\\begin{document}'+'\n'+
                '\\begin{tikzpicture}'+'\n' +
          '    \\draw (0,0) rectangle (2,2);' + '\n' +
          '    \\node at (1,1) {Square};' + '\n' +
          '    \\draw (4,1) circle (1);' + '\n' +
          '    \\node at (4,1) {Circle};' + '\n' +
          '\\end{tikzpicture}'+ '\n' +
          '\\end{document}',
      // tikzCode: '\\\\begin{tikzpicture}\\n'+
      //     '    \\\\draw (0,0) rectangle (2,2);\\n' +
      //     '    \\\\node at (1,1) {Square};\\n' +
      //     '    \\\\draw (4,1) circle (1);\\n' +
      //     '    \\\\node at (4,1) {Circle};\\n' +
      //     '\\\\end{tikzpicture}',
    };
  },
  methods: {
    addShape(selection, type) {
      this.$refs.drawingCanvas.addShape(selection, type);
    },
    updateChart(type){
      this.$refs.lineChart.updateChart(type)
    },
    clearCanvas() {
      this.$refs.drawingCanvas.clearCanvas();
    },
    fetchPDF() {
      // this.tikzCode = '{"tikz_code":"'+this.tikzCode+'"}';
      this.$refs.pdfViewer.fetchPDF(this.tikzCode);
    },
    sendToBackend() {
      this.$refs.drawingCanvas.commitToServe();
      const drawingData = this.$refs.drawingCanvas.getDrawingData();

      console.log(drawingData)

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
