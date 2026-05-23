// engine/uiMaze.js
import { app } from './gameState.js';
import { drawCommonHeader } from './uiTown.js';
import { drawBuildingFront, drawForestTrees, drawForestIcon } from './uiTownIcons.js';
import { lightenColor, darkenColor } from './uiTownColors.js';
import { drawRunningPerson } from './uiTownPerson.js';


/**
 * 根据迷宫大小计算动态几何参数
 */
function getMazeGeometry(mazeSize) {
  let cellW, cellH, slant, baseX, baseY;
  if (mazeSize <= 5) {
    cellW = 100; cellH = 70; slant = 40;
    baseX = 50; baseY = 520;
  } else if (mazeSize <= 6) {
    cellW = 85; cellH = 58; slant = 32;
    baseX = 35; baseY = 510;
  } else {
    cellW = 68; cellH = 42; slant = 22;
    baseX = 25; baseY = 490;
  }
  return { cellW, cellH, slant, baseX, baseY };
}

/** 获取迷宫格子在屏幕上的平行四边形四个角 */
function getMazeCellCorners(gx, gy, geo) {
  const { cellW, cellH, slant, baseX, baseY } = geo;
  const blx = baseX + gx * cellW + gy * slant;
  const bly = baseY - gy * cellH;
  return {
    bl: { x: blx, y: bly },
    br: { x: blx + cellW, y: bly },
    tr: { x: blx + cellW + slant, y: bly - cellH },
    tl: { x: blx + slant, y: bly - cellH }
  };
}

/** 获取迷宫格子中心 */
function getMazeCellCenter(gx, gy, geo) {
  const { cellW, cellH, slant, baseX, baseY } = geo;
  return {
    x: baseX + gx * cellW + cellW / 2 + gy * slant + slant / 2,
    y: baseY - gy * cellH - cellH / 2
  };
}

/** 获取格子底部居中位置（用于建筑定位） */
function getMazeCellBottomCenter(gx, gy, geo) {
  const { cellW, cellH, slant, baseX, baseY } = geo;
  const bly = baseY - gy * cellH;
  const bottomMidX = baseX + gx * cellW + gy * slant + cellW / 2;
  return { x: bottomMidX, y: bly };
}

/**
 * 等轴测3D视图使用恒等映射：
 * 数据y=0 → 屏幕底 → 左下起点
 * 数据y=size-1 → 屏幕顶 → 右上Boss
 */
function gy(dataY) { return dataY; }

// ============ 半高透明矮墙 ============

function drawLowWall(ctx, corners, wallHeight, color, edgeType) {
  ctx.save();
  ctx.globalAlpha = 0.5;

  const wallColor = color || '#8a7a6a';
  const lighter = lightenColor(wallColor, 25);
  const darker = darkenColor(wallColor, 35);

  let p1, p2;
  switch (edgeType) {
    case 'right':  p1 = corners.br; p2 = corners.tr; break;
    case 'left':   p1 = corners.bl; p2 = corners.tl; break;
    case 'top':    p1 = corners.tl; p2 = corners.tr; break;
    case 'bottom': p1 = corners.bl; p2 = corners.br; break;
    default:       p1 = corners.br; p2 = corners.tr;
  }

  // 墙面：从边向上延伸
  const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
  grad.addColorStop(0, lighter);
  grad.addColorStop(0.5, wallColor);
  grad.addColorStop(1, darker);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p2.x, p2.y - wallHeight);
  ctx.lineTo(p1.x, p1.y - wallHeight);
  ctx.closePath();
  ctx.fill();

  // 顶边高光线
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y - wallHeight);
  ctx.lineTo(p2.x, p2.y - wallHeight);
  ctx.stroke();
  ctx.restore();
}

// ============ 屏幕坐标→网格坐标 ============

export function mazeScreenToGrid(mx, my) {
  const maze = app.maze;
  if (!maze) return null;

  const geo = getMazeGeometry(maze.size);
  const { cellW, cellH, slant, baseX, baseY } = geo;

  // 逆变换
  const gyFloat = (baseY - my) / cellH;
  const gxFloat = (mx - baseX - gyFloat * slant) / cellW;
  const screenGx = Math.round(gxFloat);
  const screenGy = Math.round(gyFloat);

  if (screenGx >= 0 && screenGx < maze.size && screenGy >= 0 && screenGy < maze.size) {
    const corners = getMazeCellCorners(screenGx, screenGy, geo);
    if (pointInParallelogram(mx, my, corners)) {
      return { gx: screenGx, gy: screenGy, dataY: screenGy };
    }
    // 检查相邻格子
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = screenGx + dx, ny = screenGy + dy;
        if (nx >= 0 && nx < maze.size && ny >= 0 && ny < maze.size) {
          const nc = getMazeCellCorners(nx, ny, geo);
          if (pointInParallelogram(mx, my, nc)) {
            return { gx: nx, gy: ny, dataY: ny };
          }
        }
      }
    }
  }
  return null;
}

function pointInParallelogram(mx, my, c) {
  function cross(ax, ay, bx, by) { return ax * by - ay * bx; }
  const edges = [
    { sx: c.bl.x, sy: c.bl.y, ex: c.br.x, ey: c.br.y },
    { sx: c.br.x, sy: c.br.y, ex: c.tr.x, ey: c.tr.y },
    { sx: c.tr.x, sy: c.tr.y, ex: c.tl.x, ey: c.tl.y },
    { sx: c.tl.x, sy: c.tl.y, ex: c.bl.x, ey: c.bl.y }
  ];
  for (const e of edges) {
    const ex = e.ex - e.sx, ey = e.ey - e.sy;
    const dx = mx - e.sx, dy = my - e.sy;
    if (cross(ex, ey, dx, dy) < 0) return false;
  }
  return true;
}

// ============ 等轴测渲染 ============

/** 绘制一个格子的地面（平行四边形） */
function drawCellFloor(ctx, corners, color, explored, isBlocked) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(corners.bl.x, corners.bl.y);
  ctx.lineTo(corners.br.x, corners.br.y);
  ctx.lineTo(corners.tr.x, corners.tr.y);
  ctx.lineTo(corners.tl.x, corners.tl.y);
  ctx.closePath();

  if (explored && !isBlocked) {
    const grad = ctx.createLinearGradient(corners.bl.x, corners.bl.y, corners.tr.x, corners.tr.y);
    grad.addColorStop(0, lightenColor(color, 25));
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, darkenColor(color, 25));
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = color;
  }
  ctx.fill();

  if (!isBlocked) {
    ctx.strokeStyle = explored ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // 底边亮线
    ctx.strokeStyle = explored ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(corners.bl.x, corners.bl.y); ctx.lineTo(corners.br.x, corners.br.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(corners.bl.x, corners.bl.y); ctx.lineTo(corners.tl.x, corners.tl.y); ctx.stroke();
  }
  ctx.restore();
}

/** 获取格子的颜色 */
function getCellColor(x, y, maze) {
  if (maze.blockedCells && maze.blockedCells.has(`${x},${y}`)) return '#2a3a2a';
  if (!maze.explored[y][x]) return '#1a2a2a';
  if (maze.isHuntingForest) {
    const boss = maze.bossPositions.find(b => b.x === x && b.y === y);
    if (boss) return boss.defeated ? '#2a4a2a' : '#3a5a3a';
    return '#2d4a2d';
  }
  // 非森林：Boss格用特殊色
  const isBossEnd = maze._isCustomMaze ? (x === maze.endX && y === maze.endY) : (x === maze.size - 1 && y === maze.size - 1);
  if (isBossEnd) return '#5a2030';
  return '#2a4a3a';
}

/** 判断某格是否为Boss格 */
function isBossCell(x, y, maze) {
  if (maze.isHuntingForest) return maze.bossCells.has(`${x},${y}`);
  if (maze._isCustomMaze) return x === maze.endX && y === maze.endY;
  return x === maze.size - 1 && y === maze.size - 1;
}

/** 获取Boss建筑的显示名称 */
function getBossBuildingName(maze) {
  if (maze._isCustomMaze) return maze._customMazeName;
  const stage = app.config.stages.levels[app.currentLevel];
  return stage ? stage.name : 'Boss';
}

// ============ 主渲染函数 ============

export function drawMaze() {
  const { ctx, maze } = app;
  if (!maze) return;

  // 魂环吸收迷宫用3D等轴测渲染
  if (maze._isSoulRingMaze) {
    drawSoulRingMaze3D(ctx, maze);
    return;
  }

  const geo = getMazeGeometry(maze.size);
  const wallH = Math.max(12, Math.floor(geo.cellH * 0.25));
  const size = maze.size;

  // 关卡名
  const stageName = maze.isAdvancedHuntingForest ? "🌲 高级圈养森林" :
    (maze.isHuntingForest ? "🌲 圈养森林" :
    (maze._isCustomMaze ? maze._customMazeName :
    (app.config.stages.levels[app.currentLevel]?.name || "未知关卡")));

  // ========== 背景 ==========
  const skyGrad = ctx.createLinearGradient(0, 0, 0, app.canvas.height);
  skyGrad.addColorStop(0, '#0e1a28');
  skyGrad.addColorStop(0.5, '#1a2a3a');
  skyGrad.addColorStop(1, '#1f3a2a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, app.canvas.width, app.canvas.height);

  const groundY = geo.baseY - (size - 1) * geo.cellH - 30;
  ctx.fillStyle = '#2d4a2a';
  ctx.fillRect(0, Math.max(0, groundY), app.canvas.width, app.canvas.height - groundY);

  // ========== 全局分层绘制（等轴测从后往前：gy从大到小） ==========

  // ---------- Pass 1: 所有格子地面 ----------
  for (let gyIdx = size - 1; gyIdx >= 0; gyIdx--) {
    for (let gxIdx = size - 1; gxIdx >= 0; gxIdx--) {
      const dataX = gxIdx, dataY = gyIdx;
      const screenGy = gy(dataY), screenGx = dataX;
      const corners = getMazeCellCorners(screenGx, screenGy, geo);
      const explored = maze.explored[dataY][dataX];
      const blocked = maze.blockedCells && maze.blockedCells.has(`${dataX},${dataY}`);
      const color = getCellColor(dataX, dataY, maze);
      drawCellFloor(ctx, corners, color, explored, blocked);
    }
  }

  // ---------- Pass 2: 所有围墙（在全部地面之上） ----------
  for (let gyIdx = size - 1; gyIdx >= 0; gyIdx--) {
    for (let gxIdx = size - 1; gxIdx >= 0; gxIdx--) {
      const dataX = gxIdx, dataY = gyIdx;
      if (!maze.explored[dataY][dataX]) continue;
      const blocked = maze.blockedCells && maze.blockedCells.has(`${dataX},${dataY}`);
      if (blocked) continue;

      const screenGy = gy(dataY), screenGx = dataX;
      const corners = getMazeCellCorners(screenGx, screenGy, geo);

      // 每个格子4边墙，只要当前格子已探索就全部显示
      if (dataX < size - 1 && maze.wallRight[dataY][dataX])       // 右墙
        drawLowWall(ctx, corners, wallH, '#9a8a7a', 'right');
      if (dataX > 0 && maze.wallRight[dataY][dataX - 1])           // 左墙
        drawLowWall(ctx, corners, wallH, '#9a8a7a', 'left');
      if (dataY < size - 1 && maze.wallDown[dataY][dataX])         // 上墙
        drawLowWall(ctx, corners, wallH, '#9a8a7a', 'top');
      if (dataY > 0 && maze.wallDown[dataY - 1][dataX])            // 下墙
        drawLowWall(ctx, corners, wallH, '#9a8a7a', 'bottom');
    }
  }

  // ---------- Pass 3: 树木+建筑物/Boss标志（在墙壁之上，玩家之下） ----------
  for (let gyIdx = size - 1; gyIdx >= 0; gyIdx--) {
    for (let gxIdx = size - 1; gxIdx >= 0; gxIdx--) {
      const dataX = gxIdx, dataY = gyIdx;
      const screenGy = gy(dataY), screenGx = dataX;
      const bc = getMazeCellBottomCenter(screenGx, screenGy, geo);
      const blocked = maze.blockedCells && maze.blockedCells.has(`${dataX},${dataY}`);
      const explored = maze.explored[dataY][dataX];

      // 猎魂森林树木
      if (!blocked && maze.isHuntingForest && explored) {
        const boss = maze.bossPositions.find(b => b.x === dataX && b.y === dataY);
        if (boss) {
          const center = getMazeCellCenter(screenGx, screenGy, geo);
          if (boss.defeated) drawForestTrees(ctx, center.x, center.y, '#4a6a4a');
          else drawForestTrees(ctx, center.x, center.y, boss.color || '#2d8a4e');
        }
      }

      // 建筑物
      if (blocked) continue;

      if (maze.isHuntingForest) {
        if (!explored) continue;
        const boss = maze.bossPositions.find(b => b.x === dataX && b.y === dataY);
        if (boss && !boss.defeated) {
          const bw = Math.min(80, geo.cellW);
          const bh = Math.min(60, geo.cellH);
          drawBuildingFront(ctx, bc.x, bc.y, boss.name, boss.color || '#8b4513', bw, bh);
        }
      } else if (isBossCell(dataX, dataY, maze)) {
        const bw = Math.min(110, geo.cellW + 20);
        const bh = Math.min(80, geo.cellH + 15);
        const name = explored ? getBossBuildingName(maze) : '???';
        const buildingColor = explored ? '#8b4513' : '#4a4a4a';
        drawBuildingFront(ctx, bc.x, bc.y, name, buildingColor, bw, bh);
        if (explored) {
          ctx.fillStyle = "#e74c3c"; ctx.globalAlpha = 0.8;
          ctx.beginPath(); ctx.moveTo(bc.x, bc.y - bh - 12);
          ctx.lineTo(bc.x - 10, bc.y - bh + 5);
          ctx.lineTo(bc.x + 10, bc.y - bh + 5);
          ctx.fill(); ctx.globalAlpha = 1;
        }
      }
    }
  }

  // ---------- Pass 4: 玩家（最顶层）- 使用和主城一样的小人动画 ----------
  const playerGy = gy(maze.py);
  
  // 计算实际绘制位置（如果正在动画中，使用插值位置）
  let drawX, drawY;
  if (app.mazeMoving) {
    const fromCenter = getMazeCellCenter(app.mazeMoveFrom.x, gy(app.mazeMoveFrom.y), geo);
    const toCenter = getMazeCellCenter(app.mazeMoveTo.x, gy(app.mazeMoveTo.y), geo);
    drawX = fromCenter.x + (toCenter.x - fromCenter.x) * app.mazeMoveProgress;
    drawY = fromCenter.y + (toCenter.y - fromCenter.y) * app.mazeMoveProgress;
  } else {
    const playerCenter = getMazeCellCenter(maze.px, playerGy, geo);
    drawX = playerCenter.x;
    drawY = playerCenter.y;
  }
  
  // 使用和主城一样的小人动画绘制
  const frame = app.mazeMoving ? app.mazeMoveFrame : 0;
  const dx = app.mazeMoving ? app.mazeMoveDirection.dx : 0;
  const dy = app.mazeMoving ? app.mazeMoveDirection.dy : 0;
  const progress = app.mazeMoving ? app.mazeMoveProgress : 0;
  drawRunningPerson(ctx, drawX, drawY, frame, dx, dy, progress);


  // ========== 头部 ==========
  drawCommonHeader(`📍 ${stageName}`);

  // ========== 猎魂森林额外信息 ==========
  if (maze.isHuntingForest) {
    const alive = maze.bossPositions.filter(b => !b.defeated).length;
    const total = maze.bossPositions.length;
    ctx.fillStyle = "#f39c12";
    ctx.font = "14px 'Segoe UI'";
    ctx.textAlign = "right";
    ctx.fillText(`魂兽剩余: ${alive}/${total}`, app.canvas.width - 20, 40);
    ctx.textAlign = "start";
  }
}

// ========== 魂环吸收迷宫（3D等轴测版） ==========
function drawSoulRingMaze3D(ctx, maze) {
  const size = maze.size;
  const geo = getMazeGeometry(size);
  const wallH = Math.max(12, Math.floor(geo.cellH * 0.25));
  const center = Math.floor(size / 2);

  // 背景 - 深邃星空
  const bgGrad = ctx.createRadialGradient(app.canvas.width/2, app.canvas.height/2, 50, app.canvas.width/2, app.canvas.height/2, 500);
  bgGrad.addColorStop(0, '#1a1a3a');
  bgGrad.addColorStop(0.5, '#0d0d1a');
  bgGrad.addColorStop(1, '#000008');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, app.canvas.width, app.canvas.height);

  // 地面底色
  const groundY = geo.baseY - (size - 1) * geo.cellH - 30;
  ctx.fillStyle = '#0a0a18';
  ctx.fillRect(0, Math.max(0, groundY), app.canvas.width, app.canvas.height - groundY);

  // ---------- Pass 1: 所有格子地面 ----------
  for (let gyIdx = size - 1; gyIdx >= 0; gyIdx--) {
    for (let gxIdx = size - 1; gxIdx >= 0; gxIdx--) {
      const dataX = gxIdx, dataY = gyIdx;
      const screenGy = gy(dataY), screenGx = dataX;
      const corners = getMazeCellCorners(screenGx, screenGy, geo);
      const explored = maze.explored[dataY][dataX];
      const isCenter = (dataX === center && dataY === center);

      // 颜色：中心格金色，已探索紫色，未探索深色
      let color;
      if (isCenter) {
        color = '#3a2a0a';
      } else if (explored) {
        color = '#1a1a3a';
      } else {
        color = '#0a0a18';
      }

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(corners.bl.x, corners.bl.y);
      ctx.lineTo(corners.br.x, corners.br.y);
      ctx.lineTo(corners.tr.x, corners.tr.y);
      ctx.lineTo(corners.tl.x, corners.tl.y);
      ctx.closePath();

      if (explored && !isCenter) {
        const grad = ctx.createLinearGradient(corners.bl.x, corners.bl.y, corners.tr.x, corners.tr.y);
        grad.addColorStop(0, '#2a2a4a');
        grad.addColorStop(0.5, '#1a1a3a');
        grad.addColorStop(1, '#12122a');
        ctx.fillStyle = grad;
      } else if (isCenter) {
        // 中心金色光晕
        const grad = ctx.createLinearGradient(corners.bl.x, corners.bl.y, corners.tr.x, corners.tr.y);
        grad.addColorStop(0, '#5a3a0a');
        grad.addColorStop(0.5, '#3a2a0a');
        grad.addColorStop(1, '#2a1a0a');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = color;
      }
      ctx.fill();

      if (!explored) {
        // 未探索覆盖半透明黑色
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fill();
      }

      ctx.strokeStyle = isCenter ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
  }

  // ---------- Pass 2: 围墙（仅已探索格子） ----------
  for (let gyIdx = size - 1; gyIdx >= 0; gyIdx--) {
    for (let gxIdx = size - 1; gxIdx >= 0; gxIdx--) {
      const dataX = gxIdx, dataY = gyIdx;
      const explored = maze.explored[dataY][dataX];
      if (!explored) continue;

      const screenGy = gy(dataY), screenGx = dataX;
      const corners = getMazeCellCorners(screenGx, screenGy, geo);

      if (dataX < size - 1 && maze.wallRight[dataY][dataX])
        drawLowWall(ctx, corners, wallH, '#3a3a5a', 'right');
      if (dataX > 0 && maze.wallRight[dataY][dataX - 1])
        drawLowWall(ctx, corners, wallH, '#3a3a5a', 'left');
      if (dataY < size - 1 && maze.wallDown[dataY][dataX])
        drawLowWall(ctx, corners, wallH, '#3a3a5a', 'top');
      if (dataY > 0 && maze.wallDown[dataY - 1][dataX])
        drawLowWall(ctx, corners, wallH, '#3a3a5a', 'bottom');
    }
  }

  // ---------- Pass 3: 中心魂核（大3D球体）和Orb ----------
  for (let gyIdx = size - 1; gyIdx >= 0; gyIdx--) {
    for (let gxIdx = size - 1; gxIdx >= 0; gxIdx--) {
      const dataX = gxIdx, dataY = gyIdx;
      const screenGy = gy(dataY), screenGx = dataX;
      const corners = getMazeCellCorners(screenGx, screenGy, geo);
      const centerPt = getMazeCellCenter(screenGx, screenGy, geo);
      const isCenter = (dataX === center && dataY === center);

      // 中心魂核 - 大立体球
      if (isCenter) {
        const sphereR = Math.min(geo.cellW, geo.cellH) * 0.48;

        // 发光光晕
        ctx.save();
        const glowGrad = ctx.createRadialGradient(centerPt.x, centerPt.y, sphereR * 0.2, centerPt.x, centerPt.y, sphereR * 2.5);
        glowGrad.addColorStop(0, 'rgba(255,215,0,0.25)');
        glowGrad.addColorStop(0.5, 'rgba(255,215,0,0.08)');
        glowGrad.addColorStop(1, 'rgba(255,215,0,0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(centerPt.x, centerPt.y, sphereR * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 球体阴影
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(centerPt.x + 3, centerPt.y + sphereR * 0.6, sphereR * 0.8, sphereR * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 球体本身
        ctx.save();
        const sGrad = ctx.createRadialGradient(
          centerPt.x - sphereR * 0.3, centerPt.y - sphereR * 0.3, sphereR * 0.1,
          centerPt.x, centerPt.y, sphereR
        );
        sGrad.addColorStop(0, '#ffe566');
        sGrad.addColorStop(0.3, '#ffd700');
        sGrad.addColorStop(0.7, '#cc9900');
        sGrad.addColorStop(1, '#664400');
        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.arc(centerPt.x, centerPt.y, sphereR, 0, Math.PI * 2);
        ctx.fill();

        // 高光
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.arc(centerPt.x - sphereR * 0.25, centerPt.y - sphereR * 0.3, sphereR * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // 球体边框发光
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(centerPt.x, centerPt.y, sphereR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();

        // "魂核"文字
        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${Math.max(12, Math.floor(sphereR * 0.64))}px 'Segoe UI', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 6;
        ctx.fillText("魂核", centerPt.x, centerPt.y);
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // 未收集的Orb（发光小球）
      if (!isCenter && maze._orbX === dataX && maze._orbY === dataY && !maze._soulRingCollectedAll) {
        const orbColor = maze._currentOrbColor || '#4a90e2';
        const orbR = Math.min(geo.cellW, geo.cellH) * 0.3;

        ctx.save();
        // 发光
        ctx.shadowColor = orbColor;
        ctx.shadowBlur = 20;
        const oGrad = ctx.createRadialGradient(
          centerPt.x - orbR * 0.2, centerPt.y - orbR * 0.2, orbR * 0.1,
          centerPt.x, centerPt.y, orbR
        );
        oGrad.addColorStop(0, lightenColor(orbColor, 50));
        oGrad.addColorStop(0.5, orbColor);
        oGrad.addColorStop(1, darkenColor(orbColor, 30));
        ctx.fillStyle = oGrad;
        ctx.beginPath();
        ctx.arc(centerPt.x, centerPt.y, orbR, 0, Math.PI * 2);
        ctx.fill();

        // 高光
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.arc(centerPt.x - orbR * 0.2, centerPt.y - orbR * 0.3, orbR * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      }
    }
  }

  // ---------- Pass 4: 玩家（最上层） ----------
  const playerGy = gy(maze.py);
  const playerCenter = getMazeCellCenter(maze.px, playerGy, geo);

  ctx.save();
  // 阴影
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(playerCenter.x, playerCenter.y + 12, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // 玩家球体带主题色
  const pcolor = maze._currentOrbColor || '#4a90e2';
  ctx.shadowColor = pcolor;
  ctx.shadowBlur = 10;
  const pg = ctx.createRadialGradient(playerCenter.x - 3, playerCenter.y - 8, 2, playerCenter.x, playerCenter.y, 13);
  pg.addColorStop(0, lightenColor(pcolor, 40));
  pg.addColorStop(0.5, pcolor);
  pg.addColorStop(1, darkenColor(pcolor, 30));
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.arc(playerCenter.x, playerCenter.y, 13, 0, Math.PI * 2);
  ctx.fill();

  // 高光
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.arc(playerCenter.x - 3, playerCenter.y - 5, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // 边框
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(playerCenter.x, playerCenter.y, 13, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // ========== 头部 ==========
  drawCommonHeader(`💫 ${maze._soulRingCharName || '角色'}的魂环吸收`);

  // ========== 底部提示 ==========
  const collected = maze._soulRingCollected || 0;
  const total = maze._soulRingTotal || 3;
  let tipText = "请引导魂环能量进入中心魂核。";
  if (collected > 0 && collected < total) tipText = `您已经完成${collected}/${total}的魂环能量收集！`;
  else if (collected >= total) tipText = "您已经完成所有魂环能量收集！";

  ctx.fillStyle = "#f39c12";
  ctx.font = "15px 'Segoe UI'";
  ctx.textAlign = "center";
  ctx.fillText(tipText, app.canvas.width / 2, app.canvas.height - 30);
}
