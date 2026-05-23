import { app } from './gameState.js';
import {
  CELL_W, CELL_H, SLANT, BASE_X, BASE_Y,
  getCellCorners, getCellCenter, getCellBottomCenter, getCellTopCenter,
  pointInParallelogram
} from './uiTownMap.js';
import { lightenColor, darkenColor } from './uiTownColors.js';
import { drawWoodenSign, drawForestIcon, drawForestTrees, drawBuildingFront } from './uiTownIcons.js';
import { drawRunningPerson } from './uiTownPerson.js';

function getExitLabel(type) {
  const townData = app.townMaps[app.currentTown];
  if (!townData || !townData.exits) return null;
  const exitInfo = townData.exits[type];
  if (!exitInfo) return null;
  const targetTownData = app.townMaps[exitInfo.targetTown];
  if (targetTownData) return targetTownData.name;
  return null;
}

/**
 * 绘制所有地图通用的顶部标题栏（主城、迷宫、战斗共用）
 * 使用主城的绘制方式和位置（统一风格）
 * @param {string} title - 标题文字，如"📍 史莱克学院"、"⚔️ 战斗"等
 */
export function drawCommonHeader(title) {
  const { ctx, player } = app;
  const hpText = app.activeTeam.filter(id => id != null).map(id => {
    const m = app.party.find(p => p.id === id);
    return m ? `${m.name}: ${m.hp}/${m.maxHp}${m.alive === false ? '(阵亡)' : ''}` : '';
  }).filter(s => s).join('  ');
  ctx.fillStyle = "white";
  ctx.font = "30px 'Segoe UI'";
  ctx.textAlign = "start";
  ctx.fillText(title, 20, 40);
  ctx.font = "24px 楷体, KaiTi, serif";
  ctx.fillText(`生命: ${hpText}    金魂币: ${player.gold}`, 20, 80);
}

export function drawTown() {
  const { ctx, canvas, townMaps, currentTown, townPlayerPos, player } = app;
  const townData = townMaps[currentTown];
  if (!townData) return;
  const map = townData.map;

  // 背景 - 渐变天空和地面

  const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  skyGrad.addColorStop(0, '#0e1a28');
  skyGrad.addColorStop(0.5, '#1a2a3a');
  skyGrad.addColorStop(1, '#1f3a2a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制草地地面（在网格下方）
  ctx.fillStyle = '#2d4a2a';
  ctx.fillRect(0, BASE_Y - 4 * CELL_H - 30, canvas.width, canvas.height - BASE_Y + 4 * CELL_H + 30);

  // ===== 第一遍：绘制所有平行四边形格子（背景和边框）=====
  for (let gy = 0; gy < 5; gy++) {
    for (let gx = 0; gx < 5; gx++) {
      const mapY = gy;
      const type = map[mapY][gx];
      const corners = getCellCorners(gx, gy);

      let color = "#3a5a6f";
      if (type === 1) color = "#265728";
      if (type === 2) color = "#733f11";
      if (type === 3 || type === 4) color = "#472256";
      if (type === 5) color = "#176638";
      if (type === 6 && app.qiGuaiMazeCompleted) color = "#80345a";

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(corners.bl.x, corners.bl.y);
      ctx.lineTo(corners.br.x, corners.br.y);
      ctx.lineTo(corners.tr.x, corners.tr.y);
      ctx.lineTo(corners.tl.x, corners.tl.y);
      ctx.closePath();

      const cellGrad = ctx.createLinearGradient(
        corners.bl.x, corners.bl.y,
        corners.tr.x, corners.tr.y
      );
      const lighter = lightenColor(color, 25);
      const darker = darkenColor(color, 25);
      cellGrad.addColorStop(0, lighter);
      cellGrad.addColorStop(0.5, color);
      cellGrad.addColorStop(1, darker);
      ctx.fillStyle = cellGrad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(corners.bl.x, corners.bl.y);
      ctx.lineTo(corners.br.x, corners.br.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(corners.bl.x, corners.bl.y);
      ctx.lineTo(corners.tl.x, corners.tl.y);
      ctx.stroke();

      ctx.restore();
    }
  }

  // ===== 第二遍：绘制森林的树木（在装饰物之下）=====
  for (let gy = 0; gy < 5; gy++) {
    for (let gx = 0; gx < 5; gx++) {
      const mapY = gy;
      const type = map[mapY][gx];
      if (type === 5) {
        const center = getCellCenter(gx, gy);
        drawForestTrees(ctx, center.x, center.y, '#2d8a4e');
      } else if (type === 6 && app.qiGuaiMazeCompleted) {
        const center = getCellCenter(gx, gy);
        drawForestTrees(ctx, center.x, center.y, '#8a2a5a');
      }
    }
  }

  // ===== 第三遍：绘制所有装饰物（木牌、建筑、石墩）在树林之上 =====
  for (let gy = 0; gy < 5; gy++) {
    for (let gx = 0; gx < 5; gx++) {
      const mapY = gy;
      const type = map[mapY][gx];
      const center = getCellCenter(gx, gy);
      ctx.save();

      if (type === 1) {
        // 建筑图标：贴近底边，透视居中
        const bc = getCellBottomCenter(gx, gy, 2);
        drawBuildingFront(ctx, bc.x, bc.y, '商店', '#c07830', 84, 60);
      } else if (type === 2) {
        // 建筑图标：贴近底边，透视居中
        const bc = getCellBottomCenter(gx, gy, 2);
        drawBuildingFront(ctx, bc.x, bc.y, '战斗塔', '#8b4513', 90, 66);
      } else if (type === 3) {
        const label = getExitLabel(3);
        drawWoodenSign(ctx, center.x, center.y - 5, label || '下一关', '#5a3d1f', 78, 54);
      } else if (type === 4) {
        const label = getExitLabel(4);
        drawWoodenSign(ctx, center.x, center.y - 5, label || '上一关', '#5a3d1f', 78, 54);
      } else if (type === 5) {
        // 森林石墩：贴近底边（透视居中），偏左
        const bc = getCellBottomCenter(gx, gy, 34);
        drawForestIcon(ctx, bc.x, bc.y, '圈养森林', '#2d8a4e', 78, 72);
      } else if (type === 6 && app.qiGuaiMazeCompleted) {
        // 高级森林石墩
        const bc = getCellBottomCenter(gx, gy, 36);
        drawForestIcon(ctx, bc.x, bc.y, '高级圈养森林', '#8a2a5a', 82, 76);
      }

      ctx.restore();
    }
  }

  // === 绘制跑步小人 ===
  // 玩家位置使用数据坐标，上下对调后数据y=0在屏幕底部，y=4在屏幕顶部
  let drawX, drawY;
  let currentFrame = 0;
  let direction = { dx: 1, dy: 0 };

  if (app.townMoving) {
    const from = app.townMoveFrom;
    const to = app.townMoveTo;
    const t = app.townMoveProgress;
    // 移动时，计算中间位置，y直接对应
    const interpX = from.x + (to.x - from.x) * t;
    const interpY = from.y + (to.y - from.y) * t;
    const center = getCellCenter(interpX, interpY);
    drawX = center.x;
    drawY = center.y;
    currentFrame = app.townMoveFrame;
    direction = app.townMoveDirection;
  } else {
    const center = getCellCenter(townPlayerPos.x, townPlayerPos.y);
    drawX = center.x;
    drawY = center.y;
    direction = app.townMoveDirection || { dx: 1, dy: 0 };
  }

  drawRunningPerson(ctx, drawX, drawY, currentFrame, direction.dx, direction.dy, app.townMoveProgress);

  // 使用统一通用头部
  drawCommonHeader(`📍 ${townData.name}`);
}

/**
 * 将鼠标屏幕坐标转换为网格坐标
 * @param {number} mx 鼠标X（canvas坐标）
 * @param {number} my 鼠标Y（canvas坐标）
 * @returns {{gx: number, gy: number, mapY: number} | null} 网格坐标（gx=列, gy=行, mapY=原始地图行）
 */
export function screenToGrid(mx, my) {
  // 逆变换：从屏幕坐标到网格坐标
  const gyFloat = (BASE_Y - my) / CELL_H;
  const gxFloat = (mx - BASE_X - gyFloat * SLANT) / CELL_W;

  const gx = Math.floor(gxFloat);
  const gy = Math.floor(gyFloat);

  // 检查是否在有效范围内
  if (gx >= 0 && gx < 5 && gy >= 0 && gy < 5) {
    // 额外验证：检查点是否真正在格子平行四边形内
    const corners = getCellCorners(gx, gy);
    if (pointInParallelogram(mx, my, corners)) {
      // 上下对调后：gy=0(底部) → map[0], gy=4(顶部) → map[4]
      const mapY = gy;
      return { gx, gy, mapY };
    }
  }
  return null;
}
