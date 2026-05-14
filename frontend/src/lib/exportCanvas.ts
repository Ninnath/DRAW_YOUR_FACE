export function exportAsPNG(drawCanvas: HTMLCanvasElement): void {
  const merged = document.createElement('canvas');
  merged.width = drawCanvas.width;
  merged.height = drawCanvas.height;

  const ctx = merged.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, merged.width, merged.height);
  ctx.drawImage(drawCanvas, 0, 0);

  const link = document.createElement('a');
  link.download = `draw-your-face-${Date.now()}.png`;
  link.href = merged.toDataURL('image/png');
  link.click();
}
