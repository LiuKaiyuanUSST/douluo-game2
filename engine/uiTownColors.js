/**
 * 颜色工具函数（明暗度调整）
 */

export function lightenColor(hex, amt) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
  let r = parseInt(c.substring(0,2), 16);
  let g = parseInt(c.substring(2,4), 16);
  let b = parseInt(c.substring(4,6), 16);
  r = Math.min(255, r + amt);
  g = Math.min(255, g + amt);
  b = Math.min(255, b + amt);
  return `rgb(${r},${g},${b})`;
}

export function darkenColor(hex, amt) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
  let r = parseInt(c.substring(0,2), 16);
  let g = parseInt(c.substring(2,4), 16);
  let b = parseInt(c.substring(4,6), 16);
  r = Math.max(0, r - amt);
  g = Math.max(0, g - amt);
  b = Math.max(0, b - amt);
  return `rgb(${r},${g},${b})`;
}
