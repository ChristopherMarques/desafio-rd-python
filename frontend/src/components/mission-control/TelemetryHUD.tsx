import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { Direction, PathHistoryStep, ProbeState } from "@/types/probe";
import { Activity, AlertOctagon, Compass, Footprints, MapPin, Navigation, ShieldCheck } from "lucide-react";

interface TelemetryHUDProps {
  probe: ProbeState | null;
  maxX: number;
  maxY: number;
  pathHistory: PathHistoryStep[];
}

export function TelemetryHUD({
  probe,
  maxX,
  maxY,
  pathHistory,
}: TelemetryHUDProps) {
  if (!probe) {
    return (
      <Card className="w-full bg-rd-navy-card/90 border-rd-navy-border shadow-xl backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            Telemetria da Missão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-400 text-center py-6">
            Nenhuma sonda selecionada. Lance uma nova sonda para iniciar a exploração.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Ângulo da agulha da bússola
  const compassAngles: Record<Direction, number> = {
    NORTH: 0,
    EAST: 90,
    SOUTH: 180,
    WEST: 270,
  };

  const currentAngle = compassAngles[probe.direction];

  // Distância das fronteiras do planalto
  const distNorth = maxY - probe.y;
  const distSouth = probe.y;
  const distEast = maxX - probe.x;
  const distWest = probe.x;

  const isAtEdge = distNorth === 0 || distSouth === 0 || distEast === 0 || distWest === 0;

  return (
    <Card className="w-full bg-rd-navy-card/90 border-rd-navy-border shadow-xl backdrop-blur-md">
      <CardHeader className="pb-3 border-b border-rd-navy-border/60">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-rd-teal" />
            Sensores e Telemetria
          </CardTitle>
          <Badge variant="blue" size="sm">
            {probe.id}
          </Badge>
        </div>
        <CardDescription className="text-[11px] text-slate-400">
          Posicionamento orbital e radar de proximidade de borda.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-3.5 space-y-3.5 text-xs">
        {/* Painel Central: Coordenadas e Bússola */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Bloco Coordenadas */}
          <div className="bg-rd-navy-dark p-2.5 rounded-xl border border-rd-navy-border flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rd-orange" />
              Coordenadas
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold font-mono text-white">
                ({probe.x}, {probe.y})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                / ({maxX}, {maxY})
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-800 rounded-full h-1 overflow-hidden">
              <div
                className="bg-rd-blue h-1 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, ((probe.x + probe.y) / (maxX + maxY)) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Bloco Bússola */}
          <div className="bg-rd-navy-dark p-2.5 rounded-xl border border-rd-navy-border flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Compass className="w-3 h-3 text-rd-teal" />
                Rumo
              </span>
              <div className="text-xl font-extrabold font-mono text-emerald-400 mt-1">
                {probe.direction}
              </div>
              <span className="text-[9px] text-slate-400 font-mono">
                Heading: {currentAngle}°
              </span>
            </div>

            <div className="relative w-10 h-10 rounded-full border border-rd-navy-border bg-rd-navy flex items-center justify-center flex-shrink-0">
              <span className="absolute top-0 text-[7px] font-bold text-rd-orange">N</span>
              <span className="absolute right-0.5 text-[7px] font-bold text-slate-400">E</span>
              <span className="absolute bottom-0 text-[7px] font-bold text-slate-400">S</span>
              <span className="absolute left-0.5 text-[7px] font-bold text-slate-400">W</span>
              <Navigation
                className="w-4 h-4 text-rd-orange transition-transform duration-300"
                style={{ transform: `rotate(${currentAngle}deg)` }}
              />
            </div>
          </div>
        </div>

        {/* Radar de Borda / Proximidade da Fronteira */}
        <div className={`p-2.5 rounded-xl border transition-all ${
          isAtEdge
            ? "bg-red-950/40 border-red-500/50"
            : "bg-rd-navy-dark border-rd-navy-border"
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 text-slate-300">
              {isAtEdge ? (
                <AlertOctagon className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              )}
              {isAtEdge ? "Atenção: Na Borda da Malha" : "Radar de Fronteira Seguro"}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Passos: {pathHistory.length}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono">
            <div className={`p-1 rounded ${distNorth === 0 ? "bg-red-500/20 text-red-300 font-bold border border-red-500/40" : "bg-rd-navy-subtle text-slate-400"}`}>
              <span className="block text-[8px] text-slate-500">NORTE</span>
              {distNorth} px
            </div>
            <div className={`p-1 rounded ${distEast === 0 ? "bg-red-500/20 text-red-300 font-bold border border-red-500/40" : "bg-rd-navy-subtle text-slate-400"}`}>
              <span className="block text-[8px] text-slate-500">LESTE</span>
              {distEast} px
            </div>
            <div className={`p-1 rounded ${distSouth === 0 ? "bg-red-500/20 text-red-300 font-bold border border-red-500/40" : "bg-rd-navy-subtle text-slate-400"}`}>
              <span className="block text-[8px] text-slate-500">SUL</span>
              {distSouth} px
            </div>
            <div className={`p-1 rounded ${distWest === 0 ? "bg-red-500/20 text-red-300 font-bold border border-red-500/40" : "bg-rd-navy-subtle text-slate-400"}`}>
              <span className="block text-[8px] text-slate-500">OESTE</span>
              {distWest} px
            </div>
          </div>
        </div>

        {/* Diário de Bordo Recente */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Footprints className="w-3 h-3 text-rd-blue" />
              Diário de Telemetria
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Últimos eventos</span>
          </div>

          <div className="max-h-32 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
            {pathHistory.length === 0 ? (
              <p className="text-slate-500 text-[10px]">Aguardando pouso inicial...</p>
            ) : (
              [...pathHistory].reverse().slice(0, 4).map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-1.5 rounded bg-rd-navy-dark border border-rd-navy-border/50 text-[10px]"
                >
                  <span className="font-semibold text-rd-blue">
                    #{pathHistory.length - idx} {step.action}
                  </span>
                  <span className="text-slate-300">
                    ({step.x}, {step.y})
                  </span>
                  <Badge variant="slate" size="sm" className="text-[9px] py-0 px-1.5">
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
