// engine/uiBattle3D.js
// 3D等轴测战斗场地渲染器
// 使用Canvas 2D绘制具有立体感的战斗场景，取代原本的圆形标记和中线

import { app } from './gameState.js';
import { lightenColor, darkenColor } from './uiTownColors.js';

// ============ 战斗场地几何参数 ============
const FIELD_LEFT = 210;
const FIELD_RIGHT = 590;
const FIELD_TOP = 125;
const FIELD_BOTTOM = 485;
const CENTER_X = 400;
const FIELD_W = FIELD_RIGHT - FIELD_LEFT;
const FIELD_H = FIELD_BOTTOM - FIELD_TOP;

/**
 * 主入口：绘制3D战斗场地
 */
export function drawBattleField3D() {
  const { ctx, battle } = app;
  if (!battle) return;

  ctx.save();

  // ===== 1. 绘制3D地面（带透视网格） =====
  draw3DGround();

  // ===== 2. 绘制3D河流（窄河+动画水流） =====
  draw3DRiverWithBanks();

  // ===== 3. 绘制双方角色（3D立体人物） =====
  drawAllCharacters3D();

  // ===== 4. 绘制当前行动者高亮 =====
  drawCurrentActorHighlight3D();

  ctx.restore();
}

// ============================================================
//  1. 3D地面
// ============================================================
function draw3DGround() {
  const { ctx } = app;

  // ---- 主地面（带渐变的大平面） ----
  const grad = ctx.createLinearGradient(FIELD_LEFT, FIELD_TOP, FIELD_LEFT, FIELD_BOTTOM);
  grad.addColorStop(0, '#2a4a3a');
  grad.addColorStop(0.3, '#2d5a3a');
  grad.addColorStop(0.5, '#3a6a4a');
  grad.addColorStop(0.7, '#2d5a3a');
  grad.addColorStop(1, '#2a4a3a');
  ctx.fillStyle = grad;

  // 绘制带有等轴测透视的地面
  ctx.beginPath();
  ctx.moveTo(FIELD_LEFT, FIELD_TOP + 20);
  ctx.lineTo(CENTER_X - 20, FIELD_TOP);
  ctx.lineTo(FIELD_RIGHT, FIELD_TOP + 20);
  ctx.lineTo(FIELD_RIGHT, FIELD_BOTTOM - 20);
  ctx.lineTo(CENTER_X + 20, FIELD_BOTTOM);
  ctx.lineTo(FIELD_LEFT, FIELD_BOTTOM - 20);
  ctx.closePath();
  ctx.fill();

  // 地面外边框
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // ---- 透视辅助线（地砖纹理） ----
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 0.5;

  // 横向网格线（等距水平线）
  for (let i = 1; i < 6; i++) {
    const t = i / 6;
    const y = FIELD_TOP + t * (FIELD_BOTTOM - FIELD_TOP);
    const leftShift = (FIELD_LEFT - CENTER_X) * t * 0.3;
    const rightShift = (FIELD_RIGHT - CENTER_X) * t * 0.3;
    ctx.beginPath();
    ctx.moveTo(CENTER_X + leftShift - 30, y);
    ctx.lineTo(CENTER_X + rightShift + 30, y);
    ctx.stroke();
  }

  // 纵向透视网格线（汇聚到中心点）
  for (let i = 0; i <= 4; i++) {
    const t = i / 4;
    const x = FIELD_LEFT + t * FIELD_W;
    const topX = CENTER_X + (x - CENTER_X) * 0.4;
    const bottomX = x;
    ctx.beginPath();
    ctx.moveTo(topX, FIELD_TOP + 10);
    ctx.lineTo(bottomX, FIELD_BOTTOM - 10);
    ctx.stroke();
  }

  // ---- 地面边缘草地装饰 ----
  drawGrassEdge(FIELD_LEFT + 10, FIELD_BOTTOM - 5, 0, '#2d6a3a');
  drawGrassEdge(FIELD_RIGHT - 10, FIELD_BOTTOM - 5, 1, '#2d6a3a');
}

// 草地边缘装饰（小草丛）
function drawGrassEdge(x, y, dir, color) {
  const { ctx } = app;
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 5; i++) {
    const gx = x + (dir === 0 ? -1 : 1) * (12 + i * 10);
    const gy = y - 4 + Math.sin(i * 1.2) * 4;
    ctx.beginPath();
    ctx.moveTo(gx, gy + 6);
    ctx.lineTo(gx - 3, gy - 4);
    ctx.lineTo(gx + 3, gy - 2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// ============================================================
//  2. 3D河流（窄河道+动画水流）
// ============================================================
function draw3DRiverWithBanks() {
  const { ctx } = app;
  const time = Date.now() / 1000; // 用于水流动画

  // ---- 河床阴影（凹陷效果） ----
  ctx.save();

  // 窄河道：左右各15px → 总宽30px
  const riverLeft = CENTER_X - 15;
  const riverRight = CENTER_X + 15;

  // 河床阴影
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.moveTo(riverLeft - 6, FIELD_TOP + 15);
  ctx.lineTo(riverRight + 6, FIELD_TOP + 15);
  ctx.lineTo(riverRight + 8, FIELD_BOTTOM - 15);
  ctx.lineTo(riverLeft - 8, FIELD_BOTTOM - 15);
  ctx.closePath();
  ctx.fill();

  // ---- 河岸（3D土坡） ----
  // 左河岸（窄坡）
  const bankGradL = ctx.createLinearGradient(riverLeft - 12, 0, riverLeft + 3, 0);
  bankGradL.addColorStop(0, '#3a5a3a');
  bankGradL.addColorStop(0.5, '#3d6a3d');
  bankGradL.addColorStop(1, '#2a4a2a');
  ctx.fillStyle = bankGradL;
  ctx.beginPath();
  ctx.moveTo(riverLeft - 10, FIELD_TOP + 20);
  ctx.lineTo(riverLeft - 3, FIELD_TOP + 15);
  ctx.lineTo(riverLeft - 3, FIELD_BOTTOM - 15);
  ctx.lineTo(riverLeft - 10, FIELD_BOTTOM - 20);
  ctx.closePath();
  ctx.fill();

  // 右河岸（窄坡）
  const bankGradR = ctx.createLinearGradient(riverRight - 3, 0, riverRight + 12, 0);
  bankGradR.addColorStop(0, '#2a4a2a');
  bankGradR.addColorStop(0.5, '#3d6a3d');
  bankGradR.addColorStop(1, '#3a5a3a');
  ctx.fillStyle = bankGradR;
  ctx.beginPath();
  ctx.moveTo(riverRight + 3, FIELD_TOP + 15);
  ctx.lineTo(riverRight + 10, FIELD_TOP + 20);
  ctx.lineTo(riverRight + 10, FIELD_BOTTOM - 20);
  ctx.lineTo(riverRight + 3, FIELD_BOTTOM - 15);
  ctx.closePath();
  ctx.fill();

  // ---- 河水（带动画波光） ----
  const waterGrad = ctx.createLinearGradient(riverLeft, FIELD_TOP, riverRight, FIELD_BOTTOM);
  waterGrad.addColorStop(0, '#1a3a5a');
  waterGrad.addColorStop(0.3, '#2a5a8a');
  waterGrad.addColorStop(0.5, '#3a7aaa');
  waterGrad.addColorStop(0.7, '#2a5a8a');
  waterGrad.addColorStop(1, '#1a3a5a');
  ctx.fillStyle = waterGrad;

  ctx.beginPath();
  // 顶部边
  ctx.moveTo(riverLeft, FIELD_TOP + 15);
  ctx.lineTo(riverRight, FIELD_TOP + 15);
  // 右侧波浪（从顶到底）
  for (let y = FIELD_TOP + 15 + 5; y < FIELD_BOTTOM - 15; y += 6) {
    const waveX = Math.sin(y * 0.1 + time * 2.5) * 3;
    ctx.lineTo(riverRight + waveX, y);
  }
  ctx.lineTo(riverRight, FIELD_BOTTOM - 15);
  // 底部边
  ctx.lineTo(riverLeft, FIELD_BOTTOM - 15);
  // 左侧波浪（从底到顶）
  for (let y = FIELD_BOTTOM - 15 - 5; y > FIELD_TOP + 15; y -= 6) {
    const waveX = Math.sin(y * 0.1 + time * 2.5 + 0.5) * 3;
    ctx.lineTo(riverLeft + waveX, y);
  }
  ctx.closePath();
  ctx.fill();

  // ---- 水面高光波光 ----
  ctx.globalAlpha = 0.25 + Math.sin(time * 0.5) * 0.1;
  for (let i = 0; i < 4; i++) {
    const y = FIELD_TOP + 40 + i * 80 + Math.sin(time + i * 2) * 8;
    const x = CENTER_X + Math.sin(y * 0.15 + time * 1.8) * 8;
    ctx.fillStyle = 'rgba(200,230,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y, 6 + Math.sin(time + i) * 2, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // ---- 河流边缘泡沫 ----
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  for (let i = 0; i < 6; i++) {
    const y = FIELD_TOP + 30 + i * 60;
    const offset = Math.sin(time * 2 + i) * 2;
    ctx.beginPath();
    ctx.arc(riverLeft + 2 + offset, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(riverRight - 2 + offset, y + 8, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ============================================================
//  3. 3D角色绘制（敌人先绘、玩家后绘）
// ============================================================
function drawAllCharacters3D() {
  const { ctx, battle } = app;
  if (!battle) return;

  const playerPositions = calculatePositions(battle.playerTeam, 'player');
  const enemyPositions = calculatePositions(battle.enemyTeam, 'enemy');

  app.battlePlayerSlots = [];
  app.battleEnemySlots = [];

  // 先绘敌人后绘玩家（玩家在上层）
  for (let i = 0; i < battle.enemyTeam.length; i++) {
    const u = battle.enemyTeam[i];
    if (u && u.alive) {
      const pos = enemyPositions[i];
      if (pos) {
        app.battleEnemySlots[i] = { x: pos.x, y: pos.y, unit: u, index: i, side: 'enemy' };
        drawCharacter3D(u, pos.x, pos.y, 'enemy', i, false);
      }
    }
  }

  for (let i = 0; i < battle.playerTeam.length; i++) {
    const u = battle.playerTeam[i];
    if (u && u.alive) {
      const pos = playerPositions[i];
      if (pos) {
        app.battlePlayerSlots[i] = { x: pos.x, y: pos.y, unit: u, index: i, side: 'player' };
        drawCharacter3D(u, pos.x, pos.y, 'player', i, false);
      }
    }
  }

  // 补充处理阵亡角色位置记录
  for (let i = 0; i < battle.enemyTeam.length; i++) {
    const u = battle.enemyTeam[i];
    if (u && !u.alive && !app.battleEnemySlots[i]) {
      const pos = enemyPositions[i];
      if (pos) app.battleEnemySlots[i] = { x: pos.x, y: pos.y, unit: u, index: i, side: 'enemy' };
    }
  }
  for (let i = 0; i < battle.playerTeam.length; i++) {
    const u = battle.playerTeam[i];
    if (u && !u.alive && !app.battlePlayerSlots[i]) {
      const pos = playerPositions[i];
      if (pos) app.battlePlayerSlots[i] = { x: pos.x, y: pos.y, unit: u, index: i, side: 'player' };
    }
  }
}

/**
 * 计算3D角色位置
 * 
 * 阵型说明（来自 battleInit.js assignFormation）：
 *   gridCol = 1 → 'front'（前排，更靠近敌方/河流）
 *   gridCol = 0 → 'back'（后排，远离河流）
 * 
 * 玩家在左，敌人在右：
 *   玩家前排(col=1) → 靠右（接近河流）
 *   玩家后排(col=0) → 靠左（远离河流）
 *   敌方前排(col=1) → 靠左（接近河流）
 *   敌方后排(col=0) → 靠右（远离河流）
 */
function calculatePositions(team, side) {
  const positions = [];
  const count = team.length;
  const isPlayer = side === 'player';

  // 基础位置（相对河流左右两侧）
  const baseX = isPlayer ? CENTER_X - 110 : CENTER_X + 110;

  // 三行等距Y坐标
  const rowYs = [FIELD_TOP + 65, FIELD_TOP + FIELD_H / 2, FIELD_BOTTOM - 65];

  for (let i = 0; i < count && i < 3; i++) {
    const u = team[i];
    if (!u) continue;

    const row = u.gridRow !== undefined ? u.gridRow : i;
    const col = u.gridCol !== undefined ? u.gridCol : 0;

    let xOffset = 0;
    if (isPlayer) {
      // 玩家：后排(col=0)更左，前排(col=1)更右(接近河流)
      if (col === 0) xOffset = -40;   // 后排远离河流
      else xOffset = 10;              // 前排接近河流
    } else {
      // 敌人：前排(col=1)更左(接近河流)，后排(col=0)更右
      if (col === 0) xOffset = 40;    // 后排远离河流
      else xOffset = -10;             // 前排接近河流
    }

    const x = baseX + xOffset;
    const y = rowYs[row >= 0 && row < 3 ? row : i];

    positions.push({ x, y, row: row >= 0 && row < 3 ? row : i });
  }

  return positions;
}

/**
 * 绘制单个3D角色
 */
function drawCharacter3D(unit, x, y, side, index, isGhost) {
  const { ctx } = app;
  const isPlayer = side === 'player';
  const mainColor = unit.color || (isPlayer ? '#4a90e2' : '#e74c3c');
  const isDead = !unit.alive;

  ctx.save();

  // ---- 地面阴影 ----
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x, y + 18, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isDead) {
    ctx.globalAlpha = 0.4;
  }

  // ---- 3D角色底座（圆形平台） ----
  const platformGrad = ctx.createRadialGradient(x, y + 16, 2, x, y + 16, 18);
  platformGrad.addColorStop(0, '#5a4a3a');
  platformGrad.addColorStop(0.5, '#4a3a2a');
  platformGrad.addColorStop(1, '#2a1a0a');
  ctx.fillStyle = platformGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + 16, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = isPlayer ? 'rgba(74,144,226,0.3)' : 'rgba(231,76,60,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(x, y + 16, 18, 6, 0, 0, Math.PI * 2);
  ctx.stroke();

  // ---- 3D身体（渐变柱体） ----
  const bodyTop = y - 18;
  const bodyBottom = y + 8;
  const bodyWidth = 14;

  const bodyGrad = ctx.createLinearGradient(x - bodyWidth, bodyTop, x + bodyWidth, bodyBottom);
  if (isDead) {
    bodyGrad.addColorStop(0, '#666');
    bodyGrad.addColorStop(0.3, '#888');
    bodyGrad.addColorStop(0.7, '#666');
    bodyGrad.addColorStop(1, '#444');
  } else {
    bodyGrad.addColorStop(0, lightenColor(mainColor, 30));
    bodyGrad.addColorStop(0.3, mainColor);
    bodyGrad.addColorStop(0.7, darkenColor(mainColor, 20));
    bodyGrad.addColorStop(1, darkenColor(mainColor, 40));
  }
  ctx.fillStyle = bodyGrad;

  ctx.beginPath();
  ctx.moveTo(x - bodyWidth * 0.7, bodyTop);
  ctx.quadraticCurveTo(x, bodyTop - 3, x + bodyWidth * 0.7, bodyTop);
  ctx.lineTo(x + bodyWidth, bodyBottom);
  ctx.lineTo(x - bodyWidth, bodyBottom);
  ctx.closePath();
  ctx.fill();

  // 身体高光线
  ctx.fillStyle = isDead ? 'rgba(200,200,200,0.15)' : 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.moveTo(x - bodyWidth * 0.3, bodyTop + 2);
  ctx.quadraticCurveTo(x, bodyTop - 1, x + bodyWidth * 0.3, bodyTop + 2);
  ctx.lineTo(x + bodyWidth * 0.4, bodyBottom - 2);
  ctx.lineTo(x - bodyWidth * 0.1, bodyBottom - 2);
  ctx.closePath();
  ctx.fill();

  // ---- 头部（渐变球体） ----
  const headR = 8;
  const headY = bodyTop - headR + 2;

  if (!isDead) {
    ctx.save();
    const glowGrad = ctx.createRadialGradient(x, headY - 2, 1, x, headY, headR * 2.5);
    glowGrad.addColorStop(0, isPlayer ? 'rgba(74,144,226,0.08)' : 'rgba(231,76,60,0.08)');
    glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(x, headY, headR * 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const headGrad = ctx.createRadialGradient(x - 2, headY - 3, 1, x, headY, headR);
  if (isDead) {
    headGrad.addColorStop(0, '#999');
    headGrad.addColorStop(0.5, '#777');
    headGrad.addColorStop(1, '#555');
  } else {
    headGrad.addColorStop(0, lightenColor(mainColor, 50));
    headGrad.addColorStop(0.3, lightenColor(mainColor, 20));
    headGrad.addColorStop(0.7, mainColor);
    headGrad.addColorStop(1, darkenColor(mainColor, 30));
  }
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(x, headY, headR, 0, Math.PI * 2);
  ctx.fill();

  if (!isDead) {
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(x - 2, headY - 3, headR * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.arc(x - 1, headY - 4, headR * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = isDead ? '#666' : darkenColor(mainColor, 40);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, headY, headR, 0, Math.PI * 2);
  ctx.stroke();

  // ---- 手臂 ----
  if (!isDead) {
    ctx.save();
    ctx.strokeStyle = darkenColor(mainColor, 10);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    const armSwing = Math.sin(Date.now() / 500 + index) * 2;
    ctx.beginPath();
    ctx.moveTo(x - bodyWidth * 0.6, bodyTop + 5);
    ctx.lineTo(x - bodyWidth - 8 + armSwing, bodyTop + 20 + Math.abs(armSwing));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + bodyWidth * 0.6, bodyTop + 5);
    ctx.lineTo(x + bodyWidth + 8 - armSwing, bodyTop + 20 - Math.abs(armSwing));
    ctx.stroke();
    ctx.restore();
  }

  // ---- 武魂名称标签 ----
  ctx.globalAlpha = isDead ? 0.4 : 1;
  ctx.fillStyle = isDead ? '#666' : (isPlayer ? '#8ab4f8' : '#f28b82');
  ctx.font = '13px "楷体", "KaiTi", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  const labelName = unit.wuhun || unit.name;
  ctx.fillText(labelName, x, bodyBottom + 8);

  // ---- 血条 ----
  const hpBarW = 36;
  const hpBarH = 4;
  const hpBarX = x - hpBarW / 2;
  const hpBarY = bodyBottom + 12;

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);

  if (!isDead) {
    const hpPercent = Math.max(0, unit.hp / unit.maxHp);
    const hpColor = hpPercent > 0.5 ? '#4caf50' : (hpPercent > 0.2 ? '#ff9800' : '#e74c3c');
    ctx.fillStyle = hpColor;
    ctx.fillRect(hpBarX, hpBarY, hpBarW * hpPercent, hpBarH);
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(hpBarX, hpBarY, hpBarW, hpBarH);

  // ---- 魂力条 ----
  const spBarY = hpBarY + hpBarH + 2;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(hpBarX, spBarY, hpBarW, 3);
  if (!isDead) {
    const spPercent = Math.max(0, unit.spirit / unit.maxSpirit);
    ctx.fillStyle = '#3498db';
    ctx.fillRect(hpBarX, spBarY, hpBarW * spPercent, 3);
  }

  // ---- 角色名称 ----
  ctx.fillStyle = isDead ? '#666' : '#fff';
  ctx.font = '11px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(unit.name, x, spBarY + 5);

  // ---- 状态标记 ----
  if (unit.marks && unit.marks.length > 0 && !isDead) {
    const markNames = {
      poison: '毒', burn: '燃', bind: '缠', lock: '锁',
      reborn: '生', beast_king: '王', shield: '盾',
      power_up: '力', speed_up: '速', smoke: '烟',
      delay: '迟', excite: '激'
    };
    const positive = ['reborn', 'beast_king', 'shield', 'power_up', 'speed_up'];
    const markY = spBarY + 20;
    let markX = x - (unit.marks.length * 10) / 2;
    unit.marks.forEach(m => {
      ctx.fillStyle = positive.includes(m.type) ? '#44ff44' : '#ff4444';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`[${markNames[m.type] || m.type}]`, markX, markY);
      markX += 20;
    });
  }

  ctx.restore();
}

// ============================================================
//  4. 当前行动者高亮（脉动光环）
// ============================================================
function drawCurrentActorHighlight3D() {
  const { ctx, battle } = app;
  if (!battle) return;

  const currentActor = battle.getCurrentActor();
  if (!currentActor || !currentActor.alive) return;

  let cx, cy;
  if (currentActor.side === 'player') {
    const slots = app.battlePlayerSlots || [];
    const idx = battle.playerTeam.indexOf(currentActor);
    if (idx >= 0 && slots[idx]) {
      cx = slots[idx].x;
      cy = slots[idx].y;
    }
  } else {
    const slots = app.battleEnemySlots || [];
    const idx = battle.enemyTeam.indexOf(currentActor);
    if (idx >= 0 && slots[idx]) {
      cx = slots[idx].x;
      cy = slots[idx].y;
    }
  }

  if (cx === undefined) return;

  ctx.save();

  const pulse = Math.sin(Date.now() / 300) * 2 + 20;

  ctx.strokeStyle = currentActor.side === 'player' ? 'rgba(255,215,0,0.7)' : 'rgba(255,100,100,0.7)';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = currentActor.side === 'player' ? '#ffd700' : '#ff4444';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(cx, cy - 5, 26 + pulse * 0.1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(cx, cy - 5, 32, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();
}

// ============================================================
//  5. 目标候选高亮
// ============================================================
export function drawBattleTargetingHighlights() {
  const { ctx } = app;
  const candidateSlots = app.battleCandidateSlots;
  if (!candidateSlots) return;

  ctx.save();
  candidateSlots.forEach(slot => {
    ctx.shadowColor = 'lime';
    ctx.shadowBlur = 18;
    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(slot.x, slot.y - 5, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(slot.x, slot.y - 5, 26, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.restore();
}
