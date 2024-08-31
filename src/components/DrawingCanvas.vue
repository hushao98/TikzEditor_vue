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
import {NodeEnum, DrawTypeEnum, DrawShapeTypeEnum, LineEnum, GemoetryEnum, FabricTypeEnum} from '../js/utils.js'

export default {
  data() {
    return {
      canvas: null,
      selectedColor: '#000000', // 默认颜色为黑色
      useCustomColor: false, // 是否使用自定义颜色
      boundHandleClick: '',
      selectionNodes:[], // 用来画出直线的
      drawingType: '',
      nowObj: '',
      isMoving: false,
      fillColor:'#000000',
      objectCountMap:{},
      objectRelationMap:{},
      // 定义表格属性
      tableOptions : {
        rows: 100,
        cols: 100,
        cellWidth: 5,
        cellHeight: 4,
        borderColor: 'black',
        borderWidth: 0.05,
      }
    };
  },
  mounted() {
    this.initCanvas();
  },
  methods: {
    initCanvas() {
      this.canvas = new fabric.Canvas('drawingCanvas', {
        backgroundColor: '#fff',
        originX: 'center',
        originY: 'center',
        selection: true
      });

      // this.drawTable(this.canvas, this.tableOptions)
      
      window.addEventListener('resize', this.resizeCanvas)
      this.resizeCanvas(this.canvas)
      this.canvas.renderAll()
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
        if (null == selectedObject) return;
        // console.log(selectedObject)
        this.selectionNodes.push(selectedObject)
      }.bind(this));
      this.canvas.on('object:moving', (event) => {
        // 获取到移动的点，只有点可以移动，需要重新渲染，图形
        const selectedObject = event.target;
        if (!this.isMoving) {
          this.preAddSetting()
          // this.removeOldObject(this.nowObj)
          this.isMoving = true
        }
        this.updateGrophicsWhenMoving(selectedObject)
      });
    },
    addNodeListener() {
      this.boundHandleClick = this.handleClick.bind(this)
      this.canvas.on("mouse:down", this.boundHandleClick)
    },
    removeNodeListener() {
      if (this.boundHandleClick) {
        this.canvas.off("mouse:down", this.boundHandleClick)
        this.boundHandleClick = ''
      }
    },
    // 绘制表格
    drawTable(canvas, options) {
      for (let row = 0; row < options.rows; row++) {
        for (let col = 0; col < options.cols; col++) {
          // 计算每个单元格的起始坐标
          const x = col * options.cellWidth;
          const y = row * options.cellHeight;

          // 创建矩形对象代表单元格
          const rect = new fabric.Rect({
            left: x,
            top: y,
            width: options.cellWidth,
            height: options.cellHeight,
            fill: '',
            stroke: options.borderColor,
            strokeWidth: options.borderWidth,
            label:FabricTypeEnum.TABLE,
            selectable: false
          });

          // 添加矩形到 canvas
          canvas.add(rect);
        }
      }
    },
    resizeCanvas(canvas) {
      const scaleX = window.innerWidth / canvas.width;
      const scaleY = window.innerHeight / canvas.height;
      const scale = Math.min(scaleX, scaleY);
      // 设置视口变换矩阵
      canvas.viewportTransform = [scale, 0, 0, scale, 0, 0];
    },
    /**
     * 总调度函数
     * @param selection
     * @param type
     */
    addShape(selection, type) {
      this.removeNodeListener()
      let shape;
      // 如果使用默认颜色，则不指定颜色属性
      this.fillColor = this.useCustomColor ? this.selectedColor : 'black'; // 默认颜色设为黑色
      this.preAddSetting(type)
      this.isMoving = false
      if (selection === DrawShapeTypeEnum.MOVE) {
        return;
      } else if (selection === DrawShapeTypeEnum.ADD_NODE) {
        this.addNode()
        return;
      } else if (selection === DrawShapeTypeEnum.ADD_LINE) {
        this.addLine(type)
        return
      } else if (selection === DrawShapeTypeEnum.ADD_GEOMETRY) {
        shape = this.addGeometry(type)
      }
      if (shape) {
        this.canvas.add(shape);
        this.canvas.renderAll();
      }
    },

    preAddSetting(type) {
      // 第一次点击，初始化
      if (null == this.drawingType) {
        this.drawingType = type
        return 
      }
      if (this.drawingType!==DrawTypeEnum.NODE && this.drawingType!==DrawTypeEnum.MOVE) {
        this.updateRelationMap()
      }
      this.drawingType = type
      this.nowObj = ''
      this.selectionNodes = []
    },

    /**
     * 更新 relationMap
     */
    updateRelationMap () {
      if (null == this.objectCountMap[this.drawingType]) {
          this.objectCountMap[this.drawingType] = 1
      } else {
          this.objectCountMap[this.drawingType] += 1
      }
      let relationName = this.drawingType + '_' + this.objectCountMap[this.drawingType]
      this.objectRelationMap[relationName] = {
        type: this.drawingType,
        selectionNodes: this.selectionNodes,
        nowObj: this.nowObj,
      }
      for (let i = 0; i < this.selectionNodes.length; i++) {
        // 添加relationship属性
        let node = this.selectionNodes[i]
        node.relationship.push(relationName)
      }
    },

    updateNodeRelationMap(type) {
      if (null == this.objectCountMap[type]) {
          this.objectCountMap[type] = 1
      } else {
          this.objectCountMap[type] += 1
      }
      this.objectRelationMap[type + '_' + this.objectCountMap[type]] = {
        type: type,
        selectionNodes: [],
        nowObj: '',
      }
    },

    /**
     * 增加节点
     */
    addNode() {
      this.addNodeListener()
    },

    /**
     * 绘制节点
     */
    drawNode(position) {
      let [x, y] = position
      return new fabric.Circle({
        left: x,
        top: y,
        radius: NodeEnum.SIZE,
        fill: NodeEnum.COLOR,
        selection: true,
        originX: 'center',
        originY: 'center',
        label: FabricTypeEnum.NODE,
        relationship: []
      });
    },

    /**
     * 增加线段
     * @param type 
     */
    addLine(type) {
      this.selectionNodes = []
      let selectingNodeWaiting
      // 直线
      if (type === DrawTypeEnum.STRAIGHT_LINE) {
        selectingNodeWaiting = new Promise((resolve) => {
          let timer = setInterval(() => {
            if (this.selectionNodes.length === 2) {
              clearInterval(timer)
              resolve([this.drawStraightLine, this.selectionNodes])
            }
          }, 100)
        })
      } else if (type === DrawTypeEnum.BROKEN_LINE) {
        // 折线
        this.addNodeListener()
        return
      } else if (type === DrawTypeEnum.CURVE) {
        // 曲线
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
      if (type === DrawTypeEnum.CIRCLE) {
        this.addCircle()
      } else if (type === DrawTypeEnum.RECTANGLE) {
        this.addNodeListener(); // 启动节点选择监听
        return;
      } else if (type === DrawTypeEnum.CUSTOMIZE_GRAPHICS) {
        this.addNodeListener();
        return;
      }
    },

    addCircle() {
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
            originY: 'center',
            label: FabricTypeEnum.CIRCLE
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
    },
    
    /**
     * 增加点的代码
     * @param event
     */
    handleClick(event) {
      const pointer = this.canvas.getPointer(event.e)
      let point = this.drawNode([pointer.x, pointer.y])
      if (this.drawingType === DrawTypeEnum.NODE) {
        this.updateNodeRelationMap(DrawTypeEnum.NODE)
      }
      this.canvas.add(point)
      // 如果正在画折线
      if (this.drawingType === DrawTypeEnum.BROKEN_LINE) {
        this.selectionNodes.push(point)
        this.drawBrokenLine(this.selectionNodes)
      } else if (this.drawingType === DrawTypeEnum.CURVE) {
        // 绘画曲线
        this.selectionNodes.push(point)
        this.drawCurveLine(this.selectionNodes)
      } else if (this.drawingType === DrawTypeEnum.CUSTOMIZE_GRAPHICS) {
        // 绘画不规则图形
        this.selectionNodes.push(point)
        this.drawCustomizeGraphics(this.selectionNodes)
      } else if (this.drawingType === DrawTypeEnum.RECTANGLE) {
        this.selectionNodes.push(point); // 保存点的坐标和对象
        if (this.selectionNodes.length === 2) {
          this.drawRectangle(this.selectionNodes); // 画出矩形
          // this.selectionNodes.forEach(node => this.canvas.remove(node.point)); // 移除红点
        }
      }
    },

    /**
     *  画两点之间的直线的代码
     */
    drawStraightLine(selectionNodes) {
      let [node1, node2] = selectionNodes
      const line = new fabric.Line(
        [node1.left, node1.top, node2.left, node2.top],
        {
          stroke: this.useCustomColor ? this.fillColor : 'black',
          strokeWidth: LineEnum.SIZE,
          originX: 'center',
          originY: 'center',
          label: FabricTypeEnum.STRAIGHT_LINE,
          selectable: LineEnum.SELECTION,
        }
      )
      this.canvas.add(line);
      this.canvas.renderAll();
      if (this.isMoving) {
        return line
      } else {
        this.nowObj = line
      }
    },

    /**
     * 绘画折线
     */
    drawBrokenLine(selectionNodes) {
      let len = selectionNodes.length
      if ( len < 2) {
        return
      }
      this.removeOldObject(this.nowObj)
      let nodeList = []
      for(let i = 0; i < len; i++) {
        nodeList.push({x: selectionNodes[i].left, y: selectionNodes[i].top})
      }
      // 创建折线对象
      const brokenLine = new fabric.Polyline(nodeList, {
          fill: 'transparent',   // 填充颜色，折线不需要填充所以设置为透明
          stroke: this.useCustomColor ? this.fillColor : 'black',        // 线条颜色
          strokeWidth: LineEnum.SIZE,
          originX: 'center',
          originY: 'center',
          label: FabricTypeEnum.BROKEN_LINE,
          // globalCompositeOperation: 'destination-over',
          selectable: LineEnum.SELECTION,
      });
      this.canvas.add(brokenLine)
      this.canvas.renderAll()
      // brokenLine.sendToBack()
      if (this.isMoving) {
        return brokenLine
      } else {
        this.nowObj = brokenLine
      }
    },

    /**
     * 绘画曲线
     * @param selectionNodes 
     */
    drawCurveLine(selectionNodes) {
      let len = selectionNodes.length
      if ( len < 2) {
        return
      }
      this.removeOldObject(this.nowObj)
      let nodeList = []
      for(let i = 0; i < len; i++) {
        nodeList.push({x: selectionNodes[i].left, y: selectionNodes[i].top})
      }
      var splinePoints = this.catmullRomSpline(nodeList, 20)

      let path = this.getPathData(splinePoints)
      var curve = new fabric.Path(path, {
        fill: null,
        stroke:  this.useCustomColor ? this.fillColor : 'black',
        strokeWidth: LineEnum.SIZE,
        originX: 'center',
        originY: 'center',
        label: FabricTypeEnum.CURVE,
        selectable: LineEnum.SELECTION
      });

      this.canvas.add(curve)
      this.canvas.renderAll()
      if (this.isMoving) {
        return curve
      } else {
        this.nowObj = curve
      }
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

    /**
     * 自绘画多边形
     * @param selectionNodes 
     */
    drawCustomizeGraphics(selectionNodes) {
      let len = selectionNodes.length
      if ( len < 2) {
        return
      }
      this.removeOldObject(this.nowObj)
      let nodeList = []
      for (let i = 0; i < len; i++) {
        nodeList.push({x: selectionNodes[i].left, y: selectionNodes[i].top})
      }
      // 收尾相连
      nodeList.push(nodeList[0])
      let graph = new fabric.Polyline(nodeList, {
        fill: this.useCustomColor ? this.fillColor : 'black',
        stroke: this.useCustomColor ? this.fillColor : 'black',
        strokeWidth: 1,
        originX: 'center',
        originY: 'center',
        label: FabricTypeEnum.CUSTOMIZE_GRAPHICS,
        selectable:GemoetryEnum.SELECTION,
      })
      this.canvas.add(graph)
      this.canvas.renderAll()
      if (this.isMoving) {
        return graph
      } else {
        this.nowObj = graph
      }
    },

    /**
     * 绘画矩形
     */
    drawRectangle(selectionNodes) {
      const [start, end] = selectionNodes;
      const rect = new fabric.Rect({
        left: Math.min(start.left, end.left),
        top: Math.min(start.top, end.top),
        width: Math.abs(start.left - end.left),
        height: Math.abs(start.top - end.top),
        fill: this.useCustomColor ? this.selectedColor : this.fillColor, // 修复颜色选择问题
        label: FabricTypeEnum.RECTANGLE,
        selectable:GemoetryEnum.SELECTION
      });
      this.canvas.add(rect);
      this.canvas.renderAll();
      if (this.isMoving) {
        return rect
      } else {
        this.nowObj = rect
      }
    },

    updateGrophicsWhenMoving(selectedObject) {
      // 找到这个Node对象有哪些关系，也就是属于哪些组别
      let relationArray = selectedObject.relationship
      for (let i = 0; i < relationArray.length; i++) {
        let relationName = selectedObject.relationship[i]
        let relationObject = this.objectRelationMap[relationName]
        this.removeOldObject(relationObject.nowObj)
        let type = relationObject.type
        let selectionNodes = relationObject.selectionNodes
        // 重新绘画图形
        let shape = this.updateGropics(type, selectionNodes)
        this.updateRelationMapWhenMoving(relationName, selectionNodes, shape)
      }
    },

    removeOldObject(nowObj) {
      if (nowObj) {
        this.canvas.remove(nowObj)
      }
    },

    updateGropics(type, nodeList) {
      if (type === DrawTypeEnum.STRAIGHT_LINE) {
        return this.drawStraightLine(nodeList)
      } else if (type === DrawTypeEnum.BROKEN_LINE) {
        return this.drawBrokenLine(nodeList)
      } else if (type === DrawTypeEnum.CURVE) {
        return this.drawCurveLine(nodeList)
      } else if (type === DrawTypeEnum.RECTANGLE) {
        return this.drawRectangle(nodeList)
      } else if (type === DrawTypeEnum.CUSTOMIZE_GRAPHICS) {
        return this.drawCustomizeGraphics(nodeList)
      }
    },

    updateRelationMapWhenMoving(relationName, selectionNodes, shape) {
      let obj = this.objectRelationMap[relationName]
      obj.nowObj = shape
      obj.selectionNodes = selectionNodes
    },

    /**
     * 清理画布
     */
    clearCanvas() {
      this.canvas.clear();
      this.canvas.backgroundColor = '#fff',
      this.canvas.renderAll();
    },

    commitToServe() {
      this.preAddSetting(this.drawingType)
    },

    /**
     * 获取画布数据
     */
    getDrawingData() {
      return {
        useCustomColor: this.useCustomColor,
        objectRelationMap: this.objectRelationMap,
        originY: 'bottom',
        objects: this.canvas.toJSON().objects,
        width: this.canvas.width,
        height: this.canvas.height,
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
