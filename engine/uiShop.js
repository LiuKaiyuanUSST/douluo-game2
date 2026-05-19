import { app } from './gameState.js';
import { setMoveTip } from './utils.js';

export function drawShop() {
  const { ctx, canvas, player } = app;
  ctx.fillStyle = "#2c3e2f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "18px 'Segoe UI'";
  ctx.fillText("🏪 商店", 20, 40);
  ctx.font = "16px monospace";
  ctx.fillStyle = "#ddd";
  ctx.fillText(`金魂币: ${player.gold}`, 20, 70);
  ctx.fillStyle = "#ffd966";
  ctx.font = "24px 'Segoe UI'";
  ctx.fillText("杂货铺", 20, 130);
  const items = [
    { name: "九品紫芝", price: 10, effect: () => { app.inventory.jiupin = (app.inventory.jiupin || 0) + 1; } },
    { name: "忘魂草", price: 100, effect: () => { app.inventory.wanghun = (app.inventory.wanghun || 0) + 1; } },
    { name: "皇家试炼令", price: 100, effect: () => { app.inventory.royalTrialToken = (app.inventory.royalTrialToken || 0) + 1; } }
  ];

  const startX = 100, startY = 150, boxW = 120, boxH = 120, gap = 30;
  app.shopButtons = [];
  items.forEach((item, idx) => {
    const x = startX + idx * (boxW + gap);
    const y = startY;
    ctx.fillStyle = "#ab8e5c";
    ctx.fillRect(x, y, boxW, boxH);
    ctx.fillStyle = "black";
    ctx.font = "14px Arial";
    ctx.fillText(item.name, x + 10, y + 25);
    ctx.fillText(`${item.price}G`, x + 10, y + 50);
    app.shopButtons.push({ x, y, w: boxW, h: boxH, item });
  });
  ctx.fillStyle = "#666";
  ctx.fillRect(20, canvas.height-60, 100, 40);
  ctx.fillStyle = "white";
  ctx.fillText("返回主城", 30, canvas.height-30);
  app.shopBackBtn = { x: 20, y: canvas.height-60, w: 100, h: 40 };
} 