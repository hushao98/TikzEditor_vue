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
          min: 0,
          max: 3,
          type: 'value',
          axisLine: {onZero: false}
        },
        yAxis: { // Y轴配置
          min: 0,
          max: 1,
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

      for (let x = 0; x <= 3; x += 0.1) {
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