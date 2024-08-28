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
import {NodeEnum} from '../js/utils.js'


export default {
  data() {
    return {
      canvas: null,
      selectedColor: '#000000', // 默认颜色为黑色
      useCustomColor: false, // 是否使用自定义颜色
      boundHandleClick: '',
      selectionNodes:[], // 用来画出直线的
      drawingLineType: '',
      curveObject: '',
      customizeGraphicObject:'',
      fillColor:'#000000',
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
      this.addObjectSelectionListener()
      this.boundHandleClick = this.handleClick.bind(this)
    },
    /**
     * 对象被选中的监听器
     */
    addObjectSelectionListener() {
      // 监听 双击选中对象 事件
      this.canvas.on('mouse:dblclick', function(event) {
          // 获取被选中的对象
          const selectedObject = event.target;
          this.selectionNodes.push(selectedObject)
          // 更改被选中对象的颜色
          // selectedObject.set('fill', 'blue');
      }.bind(this));
    },
    addNodeListener() {
      this.boundHandleClick = this.handleClick.bind(this)
      // this.canvas.addEven
      this.canvas.on("mouse:down", this.boundHandleClick)
    },
    /**
     * 总调度函数
     * @param selection 
     * @param type 
     */
    addShape(selection, type) {
      if (this.boundHandleClick) {
        this.canvas.off("mouse:down", this.boundHandleClick)
        this.boundHandleClick = ''
      }
      let shape;
      // 如果使用默认颜色，则不指定颜色属性
      this.fillColor = this.useCustomColor ? this.selectedColor : 'black'; // 默认颜色设为黑色
      this.moveSetting()
      if (selection === 'Move') {
        return;
      } else if (selection === 'Add Node') {
        this.addNode()
        return;
      } else if (selection === 'Add Line') {
        this.addLine(type)
        return
      } else if (selection === 'Add Geometry') {
        shape = this.addGeometry(type)
      }
      if (shape) {
        this.canvas.add(shape);
        this.canvas.renderAll();
      }
    },
    /**
     * 点击Move按钮的设置
     */
    moveSetting() {
      // 如果处于画线段的状态，应该修改为不是画线段
      if (this.drawingLineType) {
        this.drawingLineType = '';
        this.customizeGraphicObject = ''
        this.curveObject = ''
        this.selectionNodes = []
      }
    },

    /**
     * 增加节点
     */
    addNode() {
      this.addNodeListener()
    },
    /**
     * 增加线段
     * @param type 
     */
    addLine(type) {
      this.selectionNodes = []
      let selectingNodeWaiting
      // 直线
      if (type === 'Straight Line') {
        selectingNodeWaiting = new Promise((resolve) => {
          let timer = setInterval(() => {
            if (this.selectionNodes.length === 2) {
              clearInterval(timer)
              resolve([this.drawStraightLine, this.selectionNodes])
            }
          }, 100)
        })
        
      } else if (type === 'Broken Line') {
        // 折线
        this.drawingLineType = type;
        this.addNodeListener()
        return
      } else if (type === 'Curve') {
        // 曲线
        this.drawingLineType = type;
        this.addNodeListener()
        return
      }
      selectingNodeWaiting.then(function([drawFaction, selectionNodes]) {
        drawFaction(selectionNodes)
      })
    },
    /**
     * 增加几何图形
     * @param type 
     */
     addGeometry(type) {
    if (type === 'Circle') {
        let circle; // 声明变量以便在不同事件中使用

        // 添加鼠标按下事件
        this.canvas.on('mouse:down', (event) => {
            const pointer = this.canvas.getPointer(event.e);
            circle = new fabric.Circle({
                radius: 0, // 初始半径为 0
                fill: 'transparent', // 默认填充颜色为白色
                stroke: 'black', // 边框颜色为黑色
                strokeWidth: 2, // 边框宽度
                left: pointer.x, // 设置圆心位置
                top: pointer.y,
                originX: 'center',
                originY: 'center'
            });

            this.canvas.add(circle);
        });

        // 添加鼠标移动事件
        this.canvas.on('mouse:move', (moveEvent) => {
            if (!circle) return; // 确保圆已创建

            const movePointer = this.canvas.getPointer(moveEvent.e);
            const dx = movePointer.x - circle.left;
            const dy = movePointer.y - circle.top;
            const newRadius = Math.sqrt(dx * dx + dy * dy);

            circle.set({ radius: newRadius });
            this.canvas.renderAll();
        });

        // 添加鼠标抬起事件
        this.canvas.on('mouse:up', () => {
            circle = null; // 重置圆
            this.canvas.off('mouse:move'); // 移除鼠标移动事件监听
            this.canvas.off('mouse:up'); // 移除鼠标抬起事件监听
        });
    } else if (type === 'Rectangle') {
        this.drawingLineType = 'Rectangle'; // 设置绘制类型为矩形
        this.selectionNodes = []; // 重置选择节点
        this.addNodeListener(); // 启动节点选择监听
        return;
      }else if (type === 'Customize Graphics') {
        this.drawingLineType = type;
        this.addNodeListener();
        return;
    }
},
    /**
     * 增加点的代码
     * @param event
     */
    handleClick(event) {
        const pointer = this.canvas.getPointer(event.e)
        const x = pointer.x
        const y = pointer.y
        const point = new fabric.Circle({
          left: x,
          top: y,
          radius: NodeEnum.SIZE,
          fill: NodeEnum.COLOR,
          selection: true 
      });
      this.canvas.add(point)
      
      if (this.drawingLineType === 'Rectangle') {
      this.selectionNodes.push({x, y, point}); // 保存点的坐标和对象
      if (this.selectionNodes.length === 2) {
        this.drawRectangle(this.selectionNodes); // 画出矩形
        this.selectionNodes.forEach(node => this.canvas.remove(node.point)); // 移除红点
        this.selectionNodes = []; // 重置选择点
      }
      // 如果正在画折线
      }else if(this.drawingLineType === 'Broken Line') {
        this.selectionNodes.push(point)
        this.drawBrokenLine(this.selectionNodes)
      } else if (this.drawingLineType === 'Curve') {
        // 绘画曲线
        this.selectionNodes.push(point)
        this.drawCurveLine(this.selectionNodes)
      } else if (this.drawingLineType === 'Customize Graphics') {
        // 绘画不规则图形
        this.selectionNodes.push(point)
        this.drawCustomizeGraphics(this.selectionNodes)
      }
    },

    drawRectangle(selectionNodes) {
  const [start, end] = selectionNodes;
  const rect = new fabric.Rect({
    left: Math.min(start.x, end.x),
    top: Math.min(start.y, end.y),
    width: Math.abs(start.x - end.x),
    height: Math.abs(start.y - end.y),
    fill: this.useCustomColor ? this.selectedColor : this.fillColor, // 修复颜色选择问题
  });
  this.canvas.add(rect);
  this.canvas.renderAll();
},
    /**
     *  画两点之间的直线的代码
     */
     drawStraightLine(selectionNodes) {
      let [node1, node2] = selectionNodes
      const line = new fabric.Line(
        [node1.left + NodeEnum.SIZE, node1.top + NodeEnum.SIZE, node2.left + NodeEnum.SIZE, node2.top + NodeEnum.SIZE],
        {
          stroke: this.useCustomColor ? this.fillColor : 'black',
          strokeWidth: 2,
        }
      )
      this.canvas.add(line);
      this.canvas.renderAll();
    },
    /**
     * 绘画折线
     */
    drawBrokenLine(selectionNodes) {
      let len = selectionNodes.length
      if ( len < 2) {
        return
      }
      this.drawStraightLine([selectionNodes[len - 2], selectionNodes[len - 1]])
    },
    drawCurveLine(selectionNodes) {
      let len = selectionNodes.length
      if ( len < 2) {
        return
      }
      if (this.curveObject) {
        this.canvas.remove(this.curveObject)
      }
      let nodeList = []
      for(let i = 0; i < len; i++) {
        nodeList.push({x: selectionNodes[i].left  + NodeEnum.SIZE, y: selectionNodes[i].top +  + NodeEnum.SIZE})
      }
      var splinePoints = this.catmullRomSpline(nodeList, 20)

      let path = this.getPathData(splinePoints)
      var curve = new fabric.Path(path, {
        fill: null,
        stroke:  this.useCustomColor ? this.fillColor : 'black',
        strokeWidth: 2
      });
      this.canvas.add(curve)
      this.curveObject = curve
      this.canvas.renderAll()
    },
    catmullRomSpline(points, segments) {
        var result = [];
        for (var i = 0; i < points.length - 1; i++) {
          var p0 = i > 0 ? points[i - 1] : points[i];
          var p1 = points[i];
          var p2 = points[i + 1];
          var p3 = i != points.length - 2 ? points[i + 2] : p2;

          for (var j = 0; j < segments; j++) {
            var t = j / segments;
            var tt = t * t;
            var ttt = tt * t;

            var q1 = -ttt + 2 * tt - t;
            var q2 = 3 * ttt - 5 * tt + 2;
            var q3 = -3 * ttt + 4 * tt + t;
            var q4 = ttt - tt;

            var x = 0.5 * (p0.x * q1 + p1.x * q2 + p2.x * q3 + p3.x * q4);
            var y = 0.5 * (p0.y * q1 + p1.y * q2 + p2.y * q3 + p3.y * q4);

            result.push({ x: x, y: y });
          }
        }
        result.push(points[points.length - 1]); // 确保最后一个点被包含
        return result;
      },
    getPathData(splinePoints) {
      var pathData = 'M ' + splinePoints[0].x + ' ' + splinePoints[0].y;
      for (var i = 1; i < splinePoints.length; i++) {
        pathData += ' L ' + splinePoints[i].x + ' ' + splinePoints[i].y;
      }
      return pathData
    },
    drawCustomizeGraphics(selectionNodes) {
      let len = selectionNodes.length
      if ( len < 2) {
        return
      }
      if (this.customizeGraphicObject) {
        this.canvas.remove(this.customizeGraphicObject)
      }
      let nodeList = []
      for (let i = 0; i < len; i++) {
        nodeList.push({x: selectionNodes[i].left  + NodeEnum.SIZE, y: selectionNodes[i].top +  + NodeEnum.SIZE})
      }
      // 收尾相连
      nodeList.push(nodeList[0])
      let graph = new fabric.Polyline(nodeList, {
        fill: this.useCustomColor ? this.fillColor : 'black',
        stroke: this.useCustomColor ? this.fillColor : 'black',
        strokeWidth: 1,
      })
      this.canvas.add(graph)
      this.customizeGraphicObject = graph
      this.canvas.renderAll()
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
