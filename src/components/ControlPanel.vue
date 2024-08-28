<template>
  <div>
    <el-menu>
      <el-menu-item @click="emitShape('circle')">Add Circle</el-menu-item>
      <el-menu-item @click="emitShape('rectangle')">Add Rectangle</el-menu-item>
      <el-menu-item @click="emitShape('line')">Add Line</el-menu-item>
      <el-menu-item @click="emitPoint('UpdateChart')">Update Chart</el-menu-item>
      <el-menu-item @click="emitClear">Clear Canvas</el-menu-item>
    </el-menu>
  </div>
</template>

<script>
export default {
  methods: {
    emitShape(type) {
      this.$emit('addShape', type);
    },
    emitClear() {
      this.$emit('clearCanvas');
    },
    emitPoint(){
      this.$emit('updateChart');
    }
  },
};
</script>
