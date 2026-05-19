import { app } from './gameState.js';

function getExitLabel(type) {
  const townData = app.townMaps[app.currentTown];
  if (!townData || !townData.exits) return null;
  const exitInfo = townData.exits[type];
  if (!exitInfo) return null;
  const targetTownData = app.townMaps[exitInfo.targetTown];
  if (targetTownData) return targetTownData.name;
  return null;
}

// 按名词边界拆分文字为两行
function splitLabel(label) {
  // 预定义拆分规则：前部分 / 后部分
  const splitMap = {
    '诺丁学院': ['诺丁', '学院'],
    '史莱克学院': ['史莱克', '学院'],
    '索托玫瑰酒店': ['索托', '玫瑰酒店'],
    '高级圈养森林': ['高级', '圈养森林'],
  };
  if (splitMap[label]) return splitMap[label];
  // 默认：前半部分和后半部分均分
  const mid = Math.ceil(label.length / 2);
  return [label.substring(0, mid), label.substring(mid)];
}

function drawExitLabel(ctx, label, cx, cy, cellW, cellH) {
  // 3个字换行显示
  if (label.length === 3) {
    ctx.fillText(label[0], cx, cy - 16);
    ctx.fillText(label.substring(1), cx, cy + 16);
  } else if (label.length >= 4) {
    const parts = splitLabel(label);
    if (parts.length === 1) {
      ctx.fillText(parts[0], cx, cy);
    } else {
      ctx.fillText(parts[0], cx, cy - 16);
      ctx.fillText(parts[1], cx, cy + 16);
    }
  } else {
    ctx.fillText(label, cx, cy);
  }
}

export function drawTown() {
  const { ctx, canvas, townMaps, currentTown, townPlayerPos, player } = app;
  const townData = townMaps[currentTown];
  if (!townData) return;
  const map = townData.map;
  const cellW = 100, cellH = 100, offsetX = 100, offsetY = 100;
  ctx.fillStyle = "#1a2a32";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      const type = map[y][x];
      let color = "#3a5a6f";
      if (type === 1) color = "#265728";
      if (type === 2) color = "#733f11";
      if (type === 3 || type === 4) color = "#472256";
      if (type === 5) color = "#176638";
      if (type === 6 && app.qiGuaiMazeCompleted) color = "#80345a";
      ctx.fillStyle = color;
      ctx.fillRect(offsetX + x*cellW, offsetY + y*cellH, cellW-2, cellH-2);
      ctx.strokeStyle = "#222";
      ctx.strokeRect(offsetX + x*cellW, offsetY + y*cellH, cellW, cellH);
      ctx.fillStyle = "white";
      ctx.font = "23px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const cx = offsetX + x * cellW + cellW / 2;
      const cy = offsetY + y * cellH + cellH / 2;
      if (type === 1) ctx.fillText("商店", cx, cy);
      if (type === 2) ctx.fillText("战斗塔", cx, cy);
      if (type === 3) {
        const label = getExitLabel(3);
        drawExitLabel(ctx, label || "下一关", cx, cy, cellW, cellH);
      }
      if (type === 4) {
        const label = getExitLabel(4);
        drawExitLabel(ctx, label || "上一关", cx, cy, cellW, cellH);
      }
      if (type === 5) ctx.fillText("圈养森林", cx, cy);
      if (type === 6 && app.qiGuaiMazeCompleted) {
        ctx.fillText("高级", cx, cy - 16);
        ctx.fillText("圈养森林", cx, cy + 16);
      }
    }
  }
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(offsetX + townPlayerPos.x*cellW + cellW/2, offsetY + townPlayerPos.y*cellH + cellH/2, 20, 0, 2*Math.PI);
  ctx.fill();

  const hpText = app.activeTeam.filter(id => id != null).map(id => {
    const m = app.party.find(p => p.id === id);
    return m ? `${m.name}: ${m.hp}/${m.maxHp}${m.alive === false ? '(阵亡)' : ''}` : '';
  }).filter(s => s).join('  ');
  ctx.fillStyle = "white";
  ctx.font = "30px 'Segoe UI'";
  ctx.fillText(`📍 ${townData.name}`, 20, 40);
  ctx.font = "24px 楷体, KaiTi, serif";
  ctx.fillText(`生命: ${hpText}    金魂币: ${player.gold}`, 20, 80);
} 