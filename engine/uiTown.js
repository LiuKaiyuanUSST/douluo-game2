import { app } from './gameState.js';

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
      if (type === 1) color = "#4caf50";
      if (type === 2) color = "#e67e22";
      if (type === 3 || type === 4) color = "#8e44ad";
      if (type === 5) color = "#2ecc71";
      ctx.fillStyle = color;
      ctx.fillRect(offsetX + x*cellW, offsetY + y*cellH, cellW-2, cellH-2);
      ctx.strokeStyle = "#222";
      ctx.strokeRect(offsetX + x*cellW, offsetY + y*cellH, cellW, cellH);
      ctx.fillStyle = "white";
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const cx = offsetX + x * cellW + cellW / 2;
      const cy = offsetY + y * cellH + cellH / 2;
      if (type === 1) ctx.fillText("商店", cx, cy);
      if (type === 2) ctx.fillText("战斗塔", cx, cy);
      if (type === 3) ctx.fillText("下一关", cx, cy);
      if (type === 4) ctx.fillText("上一关", cx, cy);
      if (type === 5) ctx.fillText("圈养森林", cx, cy);
    }
  }
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(offsetX + townPlayerPos.x*cellW + cellW/2, offsetY + townPlayerPos.y*cellH + cellH/2, 20, 0, 2*Math.PI);
  ctx.fill();

  const hpText = app.party.map(m => `${m.name}: ${m.hp}/${m.maxHp}${m.alive === false ? '(阵亡)' : ''}`).join('  ');
  ctx.fillStyle = "white";
  ctx.font = "bold 14px 'Segoe UI'";
  ctx.fillText(`📍 ${townData.name}`, 20, 40);
  ctx.font = "14px 'Segoe UI'";
  ctx.fillText(`生命: ${hpText}`, 20, 70);
  ctx.fillText(`金魂币: ${player.gold}`, 20, 95);
}