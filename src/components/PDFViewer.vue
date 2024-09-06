
<template>
  <div>
    <iframe ref="pdfIframe" src="" style="width:100%; height:100vh;" frameborder="0"></iframe>
  </div>
</template>




<script>
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = '../../node_modules/pdfjs-dist/build/pdf.worker.js'


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
        const response = await axios.post('http://39.99.245.72:8090/api/generate-graphic', drawingData, {
          responseType: 'blob'  // 确保响应被处理为Blob对象
        });
        const arrayBuffer = await response.data.arrayBuffer();
        let pdfUrl = URL.createObjectURL(response.data);
        this.$refs.pdfIframe.src = pdfUrl;
        console.log(response.data)
        const loadingTask = pdfjsLib.getDocument({data: await arrayBuffer});


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