# 七怪跑步 迷宫实现计划

## 迷宫布局（0-indexed）
- 8x8 网格
- 起点: (0, 0) 左上角
- 终点: (0, 4) 第一行第五格
- 挖空(blocked)单元格: (0,2), (1,2), (2,2) [第3列1-3行] + (3,3), (3,4), (4,3), (4,4) [中间2x2]

## 修改文件
1. engine/maze.js - 添加 setupQiGuaiRunning() 方法
2. config/stages.json - 添加关卡5
3. engine/gameTown.js - 添加关卡5处理
4. engine/uiMaze.js - 添加新迷宫渲染
