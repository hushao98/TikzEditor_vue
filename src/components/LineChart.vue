<!--<template>-->
<!--  <div>-->
<!--    <line-chart :chart-data="datacollection"></line-chart>-->
<!--    <div class="controls">-->
<!--      <button @click="addPoint">Add Point</button>-->
<!--      <button @click="removePoint">Remove Point</button>-->
<!--      <button @click="updatePoint">Update Point</button>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import { Line } from 'vue-chartjs'-->

<!--export default {-->
<!--  components: {-->
<!--    LineChart: {-->
<!--      extends: Line,-->
<!--      props: ['chartData'],-->
<!--      mounted() {-->
<!--        this.renderChart(this.chartData, {responsive: true, maintainAspectRatio: false})-->
<!--      },-->
<!--      watch: {-->
<!--        chartData(newVal) {-->
<!--          this.renderChart(newVal, {responsive: true, maintainAspectRatio: false})-->
<!--        }-->
<!--      }-->
<!--    }-->
<!--  },-->
<!--  data() {-->
<!--    return {-->
<!--      datacollection: {-->
<!--        labels: ['Point 1', 'Point 2', 'Point 3', 'Point 4', 'Point 5'],-->
<!--        datasets: [-->
<!--          {-->
<!--            label: 'Data Points',-->
<!--            backgroundColor: '#f87979',-->
<!--            data: [40, 20, 12, 39, 10]-->
<!--          }-->
<!--        ]-->
<!--      },-->
<!--      nextPointIndex: 6-->
<!--    }-->
<!--  },-->
<!--  methods: {-->
<!--    addPoint() {-->
<!--      this.datacollection.labels.push(`Point ${this.nextPointIndex}`);-->
<!--      this.datacollection.datasets[0].data.push(Math.floor(Math.random() * 50));-->
<!--      this.nextPointIndex++;-->
<!--    },-->
<!--    removePoint() {-->
<!--      if (this.datacollection.labels.length > 0) {-->
<!--        this.datacollection.labels.pop();-->
<!--        this.datacollection.datasets[0].data.pop();-->
<!--        this.nextPointIndex&#45;&#45;;-->
<!--      }-->
<!--    },-->
<!--    updatePoint() {-->
<!--      const index = Math.floor(Math.random() * this.datacollection.datasets[0].data.length);-->
<!--      this.datacollection.datasets[0].data[index] = Math.floor(Math.random() * 50);-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</script>-->

<!--<style scoped>-->
<!--.line-chart {-->
<!--  position: relative;-->
<!--  width: 80%;-->
<!--  height: 400px;-->
<!--  margin: auto;-->
<!--}-->

<!--.controls {-->
<!--  margin-top: 20px;-->
<!--  display: flex;-->
<!--  justify-content: center;-->
<!--  gap: 10px;-->
<!--}-->

<!--button {-->
<!--  padding: 10px 20px;-->
<!--  font-size: 16px;-->
<!--  cursor: pointer;-->
<!--}-->
<!--</style>-->




<template>
  <div ref="chart" style="width: 600px; height: 400px;"></div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'LineChart',
  mounted() {
    this.updateChart();
  },
  methods: {
    updateChart() {
      const chart = echarts.init(this.$refs.chart);
      const symbolSize = 1; // 设置拐点的大小
      const data = [ // 初始的数据点数组
      ];
      const option = {
        title: { // 标题配置
          text: 'Click to Add Points'
        },
        tooltip: { // 提示框配置
          formatter: function (params) {
            var data = params.data || [0, 0];
            return data[0].toFixed(2) + ', ' + data[1].toFixed(2);
          }
        },
        grid: { // 直角坐标系内绘图网格配置
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: { // X轴配置
          min: 0,
          max: 3,
          type: 'value',
          axisLine: { onZero: false }
        },
        yAxis: { // Y轴配置
          min: 0,
          max: 1,
          type: 'value',
          axisLine: { onZero: false }
        },
        series: [{ // 系列列表配置
          id: 'a',
          type: 'line',
          smooth: true, // 开启平滑曲线
          symbolSize: symbolSize, // 拐点大小设置
          data: data // 数据源
        }]
      };
      chart.setOption(option);



      //sinx
      // this.datacollection.labels = [];
      // this.datacollection.datasets[0].data = [];

      // 定义函数
      // const func = x => Math.sin(x); // 你可以在这里定义任何你想绘制的函数

      // 生成数据点
      for (let x = 0; x <= 3; x += 0.1) {
        var pointParm = [x,Math.cos(x)]
        // this.datacollection.labels.push(x.toFixed(1));
        // this.datacollection.datasets[0].data.push(func(x).toFixed(2));
        data.push(pointParm);
      }
      chart.setOption({ // 刷新ECharts实例，显示新的拐点
        series: [
          {
            id: 'a',
            data: data
          }
        ]
      });





      // var zr = chart.getZr(); // 获取ECharts实例的渲染器
      //
      // zr.on('click', function (params) { // 监听画布的点击事件
      //   var pointInPixel = [params.offsetX, params.offsetY]; // 获取点击位置的像素坐标
      //   var pointInGrid = chart.convertFromPixel('grid', pointInPixel); // 像素坐标转换为图表数据坐标
      //
      //   // 判断点击位置是否在直角坐标系(grid)内
      //   if (chart.containPixel('grid', pointInPixel)) {
      //     data.push(pointInGrid); // 将新拐点的数据添加到数据集中
      //     chart.setOption({ // 刷新ECharts实例，显示新的拐点
      //       series: [
      //         {
      //           id: 'a',
      //           data: data
      //         }
      //       ]
      //     });
      //   }
      // });
    },
    // addPoints(x,y){
    //   this.datasets.labels.push(`Point ${this.nextPointIndex}`);
    //   this.datasets[0].data.push(Math.floor(Math.random() * 50));
    //   this.nextPointIndex++;
    // }
  }
};
</script>