<template>
  <div>
    <el-menu>
      <el-menu-item @click="emitShape('Move', 'Move')">Move</el-menu-item>
      <el-menu-item @click="emitShape('Add Node', 'Node')">Add Node</el-menu-item>
      <el-submenu index="1">
        <template slot="title">Add Line</template>
        <el-menu-item @click="emitShape('Add Line', 'Straight Line')">Add Straight Line(直线)</el-menu-item>
        <el-menu-item @click="emitShape('Add Line', 'Broken Line')">Add Broken Line(折线)</el-menu-item>
        <el-menu-item @click="emitShape('Add Line', 'Curve')">Add Curve(曲线)</el-menu-item>
      </el-submenu>
      <el-submenu index="2">
        <template slot="title">Add Geometry</template>
        <el-menu-item @click="emitShape('Add Geometry', 'Circle')">Add Circle(圆形)</el-menu-item>
        <el-menu-item @click="emitShape('Add Geometry', 'Rectangle')">Add Rectangle(矩形)</el-menu-item>
        <el-menu-item @click="emitShape('Add Geometry', 'Customize Graphics')">Add Customize Graphics(自定义图形)</el-menu-item>
      </el-submenu>
      <el-submenu index="3">
        <template slot="title">Draw Function Image</template>
        <el-menu-item @click="emitCharts('sin')">sin(x)</el-menu-item>
        <el-menu-item @click="emitCharts('cos')">cos(x)</el-menu-item>
        <el-menu-item @click="emitCharts('tan')">tan(x)</el-menu-item>
      </el-submenu>
<!--      <el-menu-item @click="emitCharts('UpdateChart')">Update Chart</el-menu-item>-->
      <el-menu-item @click="emitClear">Clear Canvas</el-menu-item>
    </el-menu>

  </div>
</template>

<script>
export default {
  methods: {
    emitShape(selection, type) {
      this.$emit('addShape', selection, type);
    },
    emitClear() {
      this.$emit('clearCanvas');
    },
    emitCharts(type){
      this.$emit('updateChart',type);
    },
  },
};
</script>