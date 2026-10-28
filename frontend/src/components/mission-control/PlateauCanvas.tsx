import * as React from "react";
import rough from "roughjs";
import type { Direction, PathHistoryStep, ProbeState } from "@/types/probe";

interface PlateauCanvasProps {
  maxX: number;
  maxY: number;
  activeProbe: ProbeState | null;
  pathHistory: PathHistoryStep[];
  allProbes?: ProbeState[];
  isMoving?: boolean;
}

export function PlateauCanvas({
  maxX,
  maxY,
  activeProbe,
  pathHistory,
  allProbes = [],
  isMoving = false,
}: PlateauCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Renderiza o mapa com Rough.js quando o estado muda
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resolução nítida para telas Retina / High DPI
    const width = 640;
    const height = 640;
    canvas.width = width;
    canvas.height = height;

    // Limpa o canvas
    ctx.clearRect(0, 0, width, height);

    const rc = rough.canvas(canvas);

    // Margens para réguas de coordenadas
    const padding = 54;
    const plotWidth = width - padding * 2;
    const plotHeight = height - padding * 2;

    const cellWidth = plotWidth / (maxX + 1);
    const cellHeight = plotHeight / (maxY + 1);

    // Função de projeção cartesiana: (0,0) canto inferior esquerdo
    function toCanvasCoords(gridX: number, gridY: number): [number, number] {
      const px = padding + gridX * cellWidth + cellWidth / 2;
      const py = height - padding - gridY * cellHeight - cellHeight / 2;
      return [px, py];
    }

    // 1. Fundo do Terreno Marciano com textura esboçada
    rc.rectangle(padding - 10, padding - 10, plotWidth + 20, plotHeight + 20, {
      fill: "#1f1412",
      fillStyle: "solid",
      stroke: "#5c2a1e",
      strokeWidth: 2,
      roughness: 1.2,
    });

    // Hachura sutil marciana (dunas)
    rc.rectangle(padding, padding, plotWidth, plotHeight, {
      fill: "rgba(193, 68, 14, 0.08)",
      fillStyle: "cross-hatch",
      hachureAngle: 60,
      hachureGap: 14,
      stroke: "transparent",
      roughness: 2.0,
    });

    // 2. Crateras Marcianas Procedurais
    const craters = [
      { gx: Math.max(1, Math.floor(maxX * 0.75)), gy: Math.max(1, Math.floor(maxY * 0.8)), r: 28 },
      { gx: Math.max(1, Math.floor(maxX * 0.25)), gy: Math.max(1, Math.floor(maxY * 0.65)), r: 20 },
      { gx: Math.max(1, Math.floor(maxX * 0.6)), gy: Math.max(1, Math.floor(maxY * 0.25)), r: 24 },
    ];

    craters.forEach(({ gx, gy, r }) => {
      if (gx <= maxX && gy <= maxY) {
        const [cx, cy] = toCanvasCoords(gx, gy);
        rc.circle(cx + 8, cy - 6, r * 2, {
          fill: "#170c0a",
          fillStyle: "solid",
          stroke: "#3d1b14",
          strokeWidth: 1.5,
          roughness: 1.6,
        });
        rc.circle(cx + 8, cy - 6, r * 1.5, {
          fill: "rgba(231, 125, 88, 0.06)",
          fillStyle: "hachure",
          hachureAngle: -30,
          hachureGap: 6,
          stroke: "none",
        });
      }
    });

    // 3. Grade Cartesiana Rough.js
    for (let x = 0; x <= maxX + 1; x++) {
      const px = padding + x * cellWidth;
      rc.line(px, padding, px, height - padding, {
        stroke: x === 0 || x === maxX + 1 ? "#F25C05" : "#372420",
        strokeWidth: x === 0 || x === maxX + 1 ? 2 : 1,
        roughness: 0.8,
      });
    }

    for (let y = 0; y <= maxY + 1; y++) {
      const py = height - padding - y * cellHeight;
      rc.line(padding, py, width - padding, py, {
        stroke: y === 0 || y === maxY + 1 ? "#F25C05" : "#372420",
        strokeWidth: y === 0 || y === maxY + 1 ? 2 : 1,
        roughness: 0.8,
      });
    }

    // 4. Rótulos e Réguas Numéricas dos Eixos X e Y
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let x = 0; x <= maxX; x++) {
      const [px] = toCanvasCoords(x, 0);
      ctx.fillText(String(x), px, height - padding + 20);
    }
    ctx.fillStyle = "#F25C05";
    ctx.fillText("EIXO X →", width / 2, height - padding + 38);

    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "right";
    for (let y = 0; y <= maxY; y++) {
      const [, py] = toCanvasCoords(0, y);
      ctx.fillText(String(y), padding - 16, py);
    }
    ctx.save();
    ctx.translate(padding - 34, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "#F25C05";
    ctx.textAlign = "center";
    ctx.fillText("EIXO Y →", 0, 0);
    ctx.restore();

    // 5. Base de Pouso Inicial em (0, 0)
    const [lpadX, lpadY] = toCanvasCoords(0, 0);
    rc.circle(lpadX, lpadY, cellWidth * 0.75, {
      stroke: "#00B37E",
      strokeWidth: 2,
      strokeLineDash: [4, 4],
      roughness: 1.2,
    });
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#34d399";
    ctx.textAlign = "center";
    ctx.fillText("LANDING PAD (0,0)", lpadX, lpadY + cellHeight * 0.42);

    // 6. Rastro Histórico da Sonda (Dashed Path)
    if (pathHistory.length > 1) {
      for (let i = 0; i < pathHistory.length - 1; i++) {
        const p1 = pathHistory[i];
        const p2 = pathHistory[i + 1];
        const [x1, y1] = toCanvasCoords(p1.x, p1.y);
        const [x2, y2] = toCanvasCoords(p2.x, p2.y);

        rc.line(x1, y1, x2, y2, {
          stroke: "#0073FF",
          strokeWidth: 2.5,
          roughness: 1.1,
          strokeLineDash: [6, 4],
        });

        // Marcador de ponto intermediário
        rc.circle(x1, y1, 6, {
          fill: "#0073FF",
          fillStyle: "solid",
          stroke: "#ffffff",
          strokeWidth: 1,
        });
      }
    }

    // 7. Renderiza Outras Sondas Inativas em tom cinza
    allProbes.forEach((probe) => {
      if (activeProbe && probe.id === activeProbe.id) return;
      if (probe.x > maxX || probe.y > maxY) return;

      const [px, py] = toCanvasCoords(probe.x, probe.y);
      drawRoverSprite(rc, ctx, px, py, probe.direction, false, probe.id);
    });

    // 8. Renderiza a Sonda Ativa em destaque
    if (activeProbe && activeProbe.x <= maxX && activeProbe.y <= maxY) {
      const [ax, ay] = toCanvasCoords(activeProbe.x, activeProbe.y);

      // Efeito de halo pulsante na sonda ativa
      rc.circle(ax, ay, cellWidth * 0.85, {
        stroke: isMoving ? "#F25C05" : "#0073FF",
        strokeWidth: 1.8,
        strokeLineDash: [5, 5],
        roughness: 1.4,
      });

      drawRoverSprite(rc, ctx, ax, ay, activeProbe.direction, true, activeProbe.id);
    }
  }, [maxX, maxY, activeProbe, pathHistory, allProbes, isMoving]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square max-w-[560px] mx-auto bg-rd-navy-dark rounded-2xl border-2 border-rd-navy-border p-2 sm:p-3 shadow-2xl flex items-center justify-center overflow-hidden"
    >
      {/* Sci-fi HUD Corner Brackets */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-rd-blue/60 pointer-events-none" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-rd-blue/60 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-rd-blue/60 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-rd-blue/60 pointer-events-none" />

      {/* Floating HUD Badges inside Canvas */}
      <div className="absolute top-3 left-4 flex items-center gap-2 pointer-events-none z-10">
        <span className="text-[10px] font-mono font-bold bg-rd-navy-dark/90 text-slate-300 px-2 py-0.5 rounded border border-rd-navy-border backdrop-blur-sm">
          MALHA: 0..{maxX} &times; 0..{maxY}
        </span>
      </div>

      {activeProbe && (
        <div className="absolute top-3 right-4 flex items-center gap-1.5 pointer-events-none z-10">
          <span className="text-[10px] font-mono font-bold bg-rd-blue/20 text-blue-300 px-2 py-0.5 rounded border border-rd-blue/40 backdrop-blur-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rd-blue animate-pulse" />
            {activeProbe.id}: ({activeProbe.x}, {activeProbe.y}, {activeProbe.direction})
          </span>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain select-none"
        style={{ imageRendering: "crisp-edges" }}
      />
    </div>
  );
}

/**
 * Função utilitária que desenha proceduralmente a sonda marciana com Rough.js.
 */
function drawRoverSprite(
  rc: ReturnType<typeof rough.canvas>,
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  direction: Direction,
  isActive: boolean,
  id: string
) {
  ctx.save();
  ctx.translate(cx, cy);

  // Rotação de acordo com a direção cardinal
  const rotationAngles: Record<Direction, number> = {
    NORTH: 0,
    EAST: Math.PI / 2,
    SOUTH: Math.PI,
    WEST: -Math.PI / 2,
  };
  ctx.rotate(rotationAngles[direction]);

  const primaryColor = isActive ? "#0073FF" : "#64748b";
  const accentColor = isActive ? "#F25C05" : "#475569";

  // 1. 6 Rodas Rocker-Bogie (3 de cada lado)
  const wheelW = 5;
  const wheelH = 10;
  const wheels = [
    { x: -16, y: -12 },
    { x: -16, y: 0 },
    { x: -16, y: 12 },
    { x: 16, y: -12 },
    { x: 16, y: 0 },
    { x: 16, y: 12 },
  ];

  wheels.forEach((w) => {
    rc.rectangle(w.x - wheelW / 2, w.y - wheelH / 2, wheelW, wheelH, {
      fill: "#0f172a",
      fillStyle: "solid",
      stroke: "#94a3b8",
      strokeWidth: 1.2,
      roughness: 0.8,
    });
  });

  // 2. Chassi Central da Sonda
  rc.rectangle(-12, -14, 24, 28, {
    fill: primaryColor,
    fillStyle: "hachure",
    hachureAngle: 45,
    hachureGap: 4,
    stroke: "#ffffff",
    strokeWidth: 1.5,
    roughness: 1.0,
  });

  // 3. Painéis Solares Dourados
  rc.rectangle(-10, -6, 20, 12, {
    fill: "#FFB800",
    fillStyle: "cross-hatch",
    hachureAngle: 0,
    hachureGap: 3,
    stroke: "#d97706",
    strokeWidth: 1,
    roughness: 0.6,
  });

  // 4. Mastro Frontal com Câmera PanCam
  rc.line(0, -14, 0, -22, {
    stroke: "#ffffff",
    strokeWidth: 2,
    roughness: 0.5,
  });

  // Câmera / Olho frontal
  rc.circle(0, -22, 6, {
    fill: accentColor,
    fillStyle: "solid",
    stroke: "#ffffff",
    strokeWidth: 1.5,
    roughness: 0.8,
  });

  // 5. Antena de Alto Ganho Traseira
  rc.circle(5, 8, 7, {
    fill: "rgba(255,255,255,0.2)",
    fillStyle: "hachure",
    stroke: "#cbd5e1",
    strokeWidth: 1,
  });

  // 6. Indicador de Projeção Frontal (Faróis de Exploração)
  if (isActive) {
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(-14, -42);
    ctx.lineTo(14, -42);
    ctx.closePath();
    ctx.fillStyle = "rgba(0, 115, 255, 0.12)";
    ctx.fill();
  }

  ctx.restore();

  // Rótulo com o ID da sonda abaixo do sprite
  ctx.font = "bold 9px 'JetBrains Mono', monospace";
  ctx.fillStyle = isActive ? "#60a5fa" : "#94a3b8";
  ctx.textAlign = "center";
  ctx.fillText(id, cx, cy + 28);
}
