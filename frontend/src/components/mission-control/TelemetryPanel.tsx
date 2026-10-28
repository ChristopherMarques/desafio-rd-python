import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { Direction, PathHistoryStep, ProbeState } from "@/types/probe";
import { Activity, Compass, Footprints, MapPin, Navigation } from "lucide-react";

interface TelemetryPanelProps {
  probe: ProbeState | null;
  maxX: number;
  maxY: number;
  pathHistory: PathHistoryStep[];
}

export function TelemetryPanel({
  probe,
  maxX,
  maxY,
  pathHistory,
}: TelemetryPanelProps) {
  if (!probe) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <Activity className="w-5 h-5 text-slate-400" />
            Telemetria da Missão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-400 text-center py-8">
            Nenhuma sonda selecionada. Lance uma nova sonda para iniciar a exploração.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Ângulo da agulha da bússola de acordo com a direção
  const compassAngles: Record<Direction, number> = {
    NORTH: 0,
    EAST: 90,
    SOUTH: 180,
    WEST: 270,
  };

  const currentAngle = compassAngles[probe.direction];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            <Activity className="w-5 h-5 text-rd-teal" />
            Telemetria em Tempo Real
          </CardTitle>
          <Badge variant="blue" size="sm">
            ID: {probe.id}
          </Badge>
        </div>
        <CardDescription>
          Dados orbitais e posicionamento geodésico no planalto de Marte.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Métricas Principais: Coordenadas e Bússola */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card Coordenadas */}
          <div className="bg-rd-navy-dark p-3.5 rounded-xl border border-rd-navy-border flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rd-orange" />
              Posição Cartesiana
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                ({probe.x}, {probe.y})
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / ({maxX}, {maxY})
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-rd-blue h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, ((probe.x + probe.y) / (maxX + maxY)) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Card Orientação e Bússola */}
          <div className="bg-rd-navy-dark p-3.5 rounded-xl border border-rd-navy-border flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-rd-teal" />
                Orientação
              </span>
              <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-2">
                {probe.direction}
              </div>
              <span className="text-[10px] text-slate-400">
                Heading: {currentAngle}°
              </span>
            </div>

            {/* Bússola Visual Dinâmica */}
            <div className="relative w-12 h-12 rounded-full border-2 border-rd-navy-border bg-rd-navy flex items-center justify-center flex-shrink-0">
              <span className="absolute top-0.5 text-[8px] font-bold text-rd-orange">N</span>
              <span className="absolute right-0.5 text-[8px] font-bold text-slate-400">E</span>
              <span className="absolute bottom-0.5 text-[8px] font-bold text-slate-400">S</span>
              <span className="absolute left-0.5 text-[8px] font-bold text-slate-400">W</span>
              <Navigation
                className="w-5 h-5 text-rd-orange transition-transform duration-300"
                style={{ transform: `rotate(${currentAngle}deg)` }}
              />
            </div>
          </div>
        </div>

        {/* Resumo de Passos */}
        <div className="flex items-center justify-between px-3 py-2 bg-rd-navy-subtle rounded-lg border border-rd-navy-border/70 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Footprints className="w-4 h-4 text-rd-blue" />
            <span>Passos Registrados no Diário de Bordo:</span>
          </div>
          <span className="font-mono font-bold text-white text-sm">
            {pathHistory.length}
          </span>
        </div>

        {/* Histórico Recente de Passos */}
        <div>
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            Diário de Bordo Recente
          </span>
          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
            {pathHistory.length === 0 ? (
              <p className="text-slate-500 text-[11px]">Nenhum passo registrado ainda.</p>
            ) : (
              [...pathHistory].reverse().slice(0, 5).map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded bg-rd-navy-dark border border-rd-navy-border/50 text-[11px]"
                >
                  <span className="font-semibold text-rd-blue">
                    #{pathHistory.length - idx}: {step.action}
                  </span>
                  <span className="text-slate-300">
                    Pos: ({step.x}, {step.y})
                  </span>
                  <Badge variant="slate" size="sm">
                    {step.direction}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
