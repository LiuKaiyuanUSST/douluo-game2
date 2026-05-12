import { app } from './gameState.js';

export function drawMaze() {
  const { ctx, maze, player } = app;
  const cellSize = 80, offset = 100;
  const stageName = app.config.stages.levels[app.currentLevel]?.name || "未知关卡";
  for (let y = 0; y < maze.size; y++) {
    for (let x = 0; x < maze.size; x++) {
      ctx.strokeStyle = "#333";
      ctx.strokeRect(offset + x * cellSize, offset + y * cellSize, cellSize, cellSize);
      if (maze.explored[y][x]) {
        ctx.fillStyle = "#222";
        ctx.fillRect(offset + x * cellSize + 2, offset + y * cellSize + 2, cellSize - 4, cellSize - 4);
      }
    }
  }
  const bossX = offset + (maze.size-1)*cellSize + cellSize/2;
  const bossY = offset + (maze.size-1)*cellSize + cellSize/2;
  ctx.fillStyle = "#e74c3c";
  ctx.beginPath();
  ctx.moveTo(bossX, bossY-15);
  ctx.lineTo(bossX-12, bossY+8);
  ctx.lineTo(bossX+12, bossY+8);
  ctx.fill();
  ctx.fillStyle = "white";
  ctx.font = "bold 14px Arial";
  ctx.fillText("BOSS", bossX-18, bossY+20);
  ctx.save();
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 6;
  for (let y = 0; y < maze.size; y++) {
    for (let x = 0; x < maze.size; x++) {
      const cellX = offset + x * cellSize;
      const cellY = offset + y * cellSize;
      if (x < maze.size-1 && maze.wallRight[y][x]) {
        const leftExplored = maze.explored[y][x];
        const rightExplored = maze.explored[y][x+1];
        if (leftExplored || rightExplored) {
          ctx.beginPath();
          ctx.moveTo(cellX + cellSize, cellY);
          ctx.lineTo(cellX + cellSize, cellY + cellSize);
          ctx.stroke();
        }
      }
      if (y < maze.size-1 && maze.wallDown[y][x]) {
        const topExplored = maze.explored[y][x];
        const bottomExplored = maze.explored[y+1][x];
        if (topExplored || bottomExplored) {
          ctx.beginPath();
          ctx.moveTo(cellX, cellY + cellSize);
          ctx.lineTo(cellX + cellSize, cellY + cellSize);
          ctx.stroke();
        }
      }
    }
  }
  ctx.restore();
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(offset + maze.px * cellSize + cellSize/2, offset + maze.py * cellSize + cellSize/2, 20, 0, 2*Math.PI);
  ctx.fill();

  const hpText = app.party.map(m => `${m.name}: ${m.hp}/${m.maxHp}${m.alive === false ? '(阵亡)' : ''}`).join('  ');
  ctx.fillStyle = "white";
  ctx.font = "bold 14px 'Segoe UI'";
  ctx.fillText(`🗺️ ${stageName}`, 20, 40);
  ctx.font = "14px 'Segoe UI'";
  ctx.fillText(`生命: ${hpText}`, 20, 70);
  ctx.fillText(`金魂币: ${player.gold}`, 20, 95);
}