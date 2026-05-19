import { app } from './gameState.js';
import { setMoveTip } from './utils.js';

export function drawShop() {
  const { ctx, canvas, player } = app;
  ctx.fillStyle = "#2c3e2f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 标题
  ctx.fillStyle = "white";
  ctx.font = "30px 'Segoe UI'";
  ctx.textAlign = "start";
  ctx.fillText("🏪 商店", 20, 40);

  // 金魂币
  ctx.font = "24px 楷体, KaiTi, serif";
  ctx.fillStyle = "#ffd700";
  ctx.fillText(`金魂币: ${player.gold}`, 20, 80);

  // 分隔线
  ctx.strokeStyle = "#5a7a5f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, 100);
  ctx.lineTo(canvas.width - 20, 100);
  ctx.stroke();

  // 杂货铺标题
  ctx.fillStyle = "#ffd966";
  ctx.font = "26px 'Segoe UI'";
  ctx.fillText("杂货铺", 20, 140);

  const items = [
    { name: "九品紫芝", price: 10, effect: () => { app.inventory.jiupin = (app.inventory.jiupin || 0) + 1; } },
    { name: "忘魂草", price: 100, effect: () => { app.inventory.wanghun = (app.inventory.wanghun || 0) + 1; } },
    { name: "皇家试炼令", price: 100, effect: () => { app.inventory.royalTrialToken = (app.inventory.royalTrialToken || 0) + 1; } }
  ];

  // 每个商品用不同形状和颜色
  const itemStyles = [
    { shape: 'circle', color: '#8e44ad', borderColor: '#a569bd' },    // 九品紫芝 - 紫色圆形
    { shape: 'diamond', color: '#27ae60', borderColor: '#52be80' },   // 忘魂草 - 绿色菱形
    { shape: 'hexagon', color: '#e67e22', borderColor: '#f0b27a' }    // 皇家试炼令 - 橙色六边形
  ];

  const startX = 60, startY = 170, boxSize = 140, gap = 40;
  app.shopButtons = [];

  items.forEach((item, idx) => {
    const cx = startX + idx * (boxSize + gap) + boxSize / 2;
    const cy = startY + boxSize / 2;
    const style = itemStyles[idx];
    const r = boxSize / 2 - 10;

    ctx.save();
    ctx.translate(cx, cy);

    // 绘制不同形状
    ctx.fillStyle = style.color;
    ctx.strokeStyle = style.borderColor;
    ctx.lineWidth = 3;

    if (style.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    } else if (style.shape === 'diamond') {
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (style.shape === 'hexagon') {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const hx = r * Math.cos(angle);
        const hy = r * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 商品名称
    ctx.fillStyle = "white";
    ctx.font = "23px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(item.name, 0, -8);

    // 价格
    ctx.fillStyle = "#ffd700";
    ctx.font = "20px Arial";
    ctx.fillText(`${item.price}G`, 0, 28);

    ctx.restore();

    // 按钮区域（用矩形包围盒）
    const bx = cx - boxSize / 2;
    const by = cy - boxSize / 2;
    app.shopButtons.push({ x: bx, y: by, w: boxSize, h: boxSize, item });
  });

  // 返回按钮
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#666";
  ctx.fillRect(20, canvas.height - 60, 120, 40);
  ctx.fillStyle = "white";
  ctx.font = "23px Arial";
  ctx.textAlign = "center";
  ctx.fillText("返回主城", 80, canvas.height - 30);
  app.shopBackBtn = { x: 20, y: canvas.height - 60, w: 120, h: 40 };
  ctx.textAlign = "start";
}
