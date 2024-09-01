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
    updateChart(type) {
      const chart = echarts.init(this.$refs.chart);
      const symbolSize = 1; // 设置拐点的大小
      const data = [ // 初始的数据点数组
      ];
      let Xmin = -6;
      let Xmax = 6;
      let Ymin = -2;
      let Ymax = 2;
      const option = {
        title: { // 标题配置
          text: 'Function Image'
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
          min: Xmin,
          max: Xmax,
          type: 'value',
          axisLine: {onZero: false}
        },
        yAxis: { // Y轴配置
          min: Ymin,
          max: Ymax,
          type: 'value',
          axisLine: {onZero: false}
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

      for (let x = Xmin; x <= Xmax; x += 0.1) {
        var pointParm;
        if (type === 'sin') {
          pointParm = [x, Math.sin(x)]
        } else if (type === 'cos') {
          pointParm = [x, Math.cos(x)]
        } else if (type === 'tan') {
          pointParm = [x, Math.tan(x)]
        }
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
    },
  }
};

</script>