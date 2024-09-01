<!--<template>-->
<!--  <div>-->
<!--    <button @click="fetchPDF">Fetch PDF</button>-->
<!--    <div v-if="pdfData" ref="pdfViewer" class="pdf-viewer"></div>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import * as pdfjsLib from 'pdfjs-dist';-->
<!--import 'pdfjs-dist/web/pdf_viewer.css';-->

<!--export default {-->
<!--  data() {-->
<!--    return {-->
<!--      tikz_code:'\\begin{tikzpicture}\n' +-->
<!--          '    % 绘制一个正方形\n' +-->
<!--          '    \\draw (0,0) rectangle (2,2);\n' +-->
<!--          '    % 在正方形中心添加标签\n' +-->
<!--          '    \\node at (1,1) {Square};\n' +-->
<!--          '    \n' +-->
<!--          '    % 绘制一个圆形\n' +-->
<!--          '    \\draw (4,1) circle (1);\n' +-->
<!--          '    % 在圆形中心添加标签\n' +-->
<!--          '    \\node at (4,1) {Circle};\n' +-->
<!--          '\\end{tikzpicture}',-->
<!--      pdfData: null,-->
<!--    };-->
<!--  },-->
<!--  methods: {-->
<!--    async fetchPDF() {-->
<!--      const drawingData = this.$refs.pdfViewer.getTikzCode();-->
<!--      console.log(drawingData)-->
<!--      fetch('http://127.0.0.1:5000/api/generate-graphic', {-->
<!--        method: 'POST',-->
<!--        headers: {-->
<!--          'Content-Type': 'application/json',-->
<!--        },-->
<!--        body: JSON.stringify(drawingData),-->
<!--      })-->
<!--          .then(response => response.json())-->
<!--          .then(data => {-->
<!--            this.pdfData = data.pdfData;-->
<!--          })-->
<!--          .catch(error => {-->
<!--            console.error('Error:', error);-->
<!--          });-->
<!--      await this.$refs.pdfViewer.renderPDF();-->
<!--    },-->
<!--    async renderPDF() {-->
<!--      const pdfViewer = this.$refs.pdfViewer;-->
<!--      if (!this.pdfData || !pdfViewer) return;-->

<!--      const loadingTask = pdfjsLib.getDocument({ data: this.pdfData });-->
<!--      const pdfDocument = await loadingTask.promise;-->

<!--      const pdfPage = await pdfDocument.getPage(1); // 渲染第一页-->

<!--      const viewport = pdfPage.getViewport({ scale: 1.5 });-->

<!--      const canvas = document.createElement('canvas');-->
<!--      const context = canvas.getContext('2d');-->
<!--      canvas.height = viewport.height;-->
<!--      canvas.width = viewport.width;-->
<!--      pdfViewer.appendChild(canvas);-->

<!--      const renderContext = {-->
<!--        canvasContext: context,-->
<!--        viewport: viewport-->
<!--      };-->
<!--      await pdfPage.render(renderContext).promise;-->
<!--    },-->
<!--    getTikzCode(){-->
<!--      return{-->
<!--        tikz_code:this.tikz_code,-->
<!--      };-->
<!--    }-->
<!--  }-->
<!--};-->
<!--</script>-->

<!--<style scoped>-->
<!--.pdf-viewer {-->
<!--  border: 1px solid #ccc;-->
<!--  padding: 10px;-->
<!--  margin-top: 20px;-->
<!--}-->
<!--</style>-->
<template>
  <div>
    <iframe ref="pdfIframe" src="" style="width:100%; height:100vh;" frameborder="0"></iframe>
  </div>
</template>




<script>
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';
// import pdfjsLib from 'pdfjs-dist';
// import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs';

// import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.js';
//
// pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// 设置 pdf.worker.js 路径

pdfjsLib.GlobalWorkerOptions.workerSrc = '../../node_modules/pdfjs-dist/build/pdf.worker.js'
// pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('../../node_modules/pdfjs-dist/build/pdf.worker.js', window.location.href).href;



export default {
  data() {
    return {
      pdfData: null,
    };
  },
  methods: {
    async fetchPDF(tikzCode) {
      console.log("in fetch");
      this.tikzCode = tikzCode;
      const drawingData = {
        tikz_code: tikzCode,
      }
      console.log(drawingData);
      try{
        const response = await axios.post('http://127.0.0.1:5000/api/generate-graphic', drawingData, {
          responseType: 'blob'  // 确保响应被处理为Blob对象
        });
        const arrayBuffer = await response.data.arrayBuffer();
        let pdfUrl = URL.createObjectURL(response.data);
        this.$refs.pdfIframe.src = pdfUrl;
        console.log(response.data)
        const loadingTask = pdfjsLib.getDocument({data: await arrayBuffer});

        console.log("load success");

        this.pdfDoc = await loadingTask.promise;

        const page = await this.pdfDoc.getPage(1);
        const scale = 1.5;
        const viewport = page.getViewport({scale: scale});

        const canvas = this.$refs.pdfCanvas;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        const renderTask = page.render(renderContext);
        await renderTask.promise;
      }
      catch (error) {
        console.error('Error fetching or rendering PDF:', error);
      }
    },
      // fetch('http://127.0.0.1:5000/api/generate-graphic', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body:  JSON.stringify(drawingData),
      // })
      //     .then(response => {
      //       if (response.ok) {
      //         return response.blob();
      //       }
      //       throw new Error('Network response was not ok.');
      //     })
      //     .then(blob => {
      //       // 创建一个可读的文件流
      //       const fileReader = new FileReader();
      //       fileReader.onload = function(event) {
      //         // 创建一个PDF.js的文档对象
      //         pdfjsLib.getDocument(event.target.result).promise.then(pdfDoc => {
      //           // 选择要渲染的页面，这里我们渲染第一页
      //           pdfDoc.getPage(1).then(page => {
      //             const scale = 1.5; // 缩放比例
      //             const viewport = page.getViewport({ scale: scale });
      //
      //             // 创建一个canvas元素用于绘制PDF页面
      //             const canvas = document.createElement('canvas');
      //             const context = canvas.getContext('2d');
      //             canvas.height = viewport.height;
      //             canvas.width = viewport.width;
      //
      //             // 将PDF页面渲染到canvas上
      //             const renderContext = {
      //               canvasContext: context,
      //               viewport: viewport
      //             };
      //             const renderTask = page.render(renderContext);
      //             renderTask.promise.then(() => {
      //               // 将canvas添加到页面上
      //               document.body.appendChild(canvas);
      //             });
      //           });
      //         });
      //       };
      //       // 读取Blob数据
      //       fileReader.readAsArrayBuffer(blob);
      //     })
      //     .catch(error => console.error('Error fetching the file:', error));
      // this.renderPDF();
    },
    async renderPDF() {
      const pdfViewer = this.$refs.pdfViewer;
      console.log(this.pdfData);
      if (!this.pdfData || !pdfViewer) return;


      const loadingTask = pdfjsLib.getDocument({ data: this.pdfData });
      const pdfDocument = await loadingTask.promise;


      const pdfPage = await pdfDocument.getPage(1); // 渲染第一页

      const viewport = pdfPage.getViewport({ scale: 1.5 });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      pdfViewer.appendChild(canvas);

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      await pdfPage.render(renderContext).promise;
    },
}
</script>

<style scoped>
.pdf-viewer {
  border: 1px solid #ccc;
  padding: 10px;
  margin-top: 20px;
}
</style>