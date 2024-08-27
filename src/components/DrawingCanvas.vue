<template>
  <div id="drawing-area">
    <h3>Drawing Area</h3>
    <!-- 颜色选择器 -->
    <el-radio-group v-model="useCustomColor">
      <el-radio :label="false">Use Default Colors</el-radio>
      <el-radio :label="true">Use Custom Colors</el-radio>
    </el-radio-group>
    <el-color-picker v-model="selectedColor" v-if="useCustomColor" />
    <canvas id="drawingCanvas" width="500" height="400" style="border: 1px solid #dcdcdc;"></canvas>
  </div>
</template>

<script>
import { fabric } from 'fabric';

export default {
  data() {
    return {
      canvas: null,
      selectedColor: '#000000', // 默认颜色为黑色
      useCustomColor: false, // 是否使用自定义颜色
    };
  },
  mounted() {
    this.initCanvas();
  },
  methods: {
    initCanvas() {
      this.canvas = new fabric.Canvas('drawingCanvas', {
        backgroundColor: '#fff',
        selection: true,
      });
      this.canvas.renderAll();
    },
    addShape(type) {
      let shape;
      // 如果使用默认颜色，则不指定颜色属性
      const fillColor = this.useCustomColor ? this.selectedColor : 'black'; // 默认颜色设为黑色

      if (type === 'circle') {
        shape = new fabric.Circle({
          radius: 50,
          fill: this.useCustomColor ? fillColor : null, // 不使用自定义颜色时，不设置填充颜色
          left: 100,
          top: 100,
        });
      } else if (type === 'rectangle') {
        shape = new fabric.Rect({
          width: 100,
          height: 50,
          fill: this.useCustomColor ? fillColor : null,
          left: 150,
          top: 150,
        });
      } else if (type === 'line') {
        shape = new fabric.Line([50, 50, 200, 200], {
          stroke: this.useCustomColor ? fillColor : 'black', // 默认颜色设为黑色
          strokeWidth: 2,
        });
      }
      if (shape) {
        this.canvas.add(shape);
        this.canvas.renderAll();
      }
    },
    clearCanvas() {
      this.canvas.clear();
      this.canvas.renderAll();
    },
    getDrawingData() {
      return {
        useCustomColor: this.useCustomColor,
        objects: this.canvas.toJSON().objects,
      };
    },
  },
};
</script>

<style>
#drawing-area {
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
}
</style>
