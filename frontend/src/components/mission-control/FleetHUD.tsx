import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { ProbeState } from "@/types/probe";
import { Compass, Plus, Radio, RefreshCw } from "lucide-react";

interface FleetHUDProps {
  probes: ProbeState[];
  activeProbeId: string | null;
  onSelectProbe: (id: string) => void;
  onOpenLaunchDialog: () => void;
  onRefreshProbes: () => void;
  isLoading: boolean;
  className?: string;
}

export function FleetHUD({
  probes,
  activeProbeId,
  onSelectProbe,
  onOpenLaunchDialog,
  onRefreshProbes,
  isLoading,
  className,
}: FleetHUDProps) {
  return (
    <Card className={cn("w-full bg-rd-navy-card/90 border-rd-navy-border shadow-xl backdrop-blur-md flex flex-col", className)}>
      <CardHeader className="pb-3 border-b border-rd-navy-border/60 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-rd-orange" />
            Frota de Sondas em Marte
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="teal" size="sm">
              {probes.length} {probes.length === 1 ? "sonda" : "sondas"}
            </Badge>
            <button
              onClick={onRefreshProbes}
              disabled={isLoading}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-rd-navy-subtle transition-colors disabled:opacity-50"
              title="Sincronizar com API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
        <CardDescription className="text-[11px] text-slate-400">
          Selecione uma sonda para assumir o controle dos comandos.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-3.5 space-y-2.5 flex-1 min-h-0 flex flex-col justify-between">
        {probes.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-rd-navy-border rounded-xl">
            <p className="text-xs text-slate-400 mb-2.5">Nenhuma sonda ativa.</p>
            <Button variant="primary" size="sm" onClick={onOpenLaunchDialog}>
              <Plus className="w-3.5 h-3.5" />
              Lançar Sonda
            </Button>
          </div>
        ) : (
          <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto pr-1">
            {probes.map((probe) => {
              const isSelected = probe.id === activeProbeId;
              return (
                <button
                  key={probe.id}
                  onClick={() => onSelectProbe(probe.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-rd-blue/20 border-rd-blue text-white shadow-sketch-blue"
                      : "bg-rd-navy-dark border-rd-navy-border/70 text-slate-300 hover:border-slate-600 hover:bg-rd-navy-subtle"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? "bg-rd-blue animate-pulse" : "bg-slate-600"
                      }`}
                    />
                    <div>
                      <div className="font-mono font-bold text-xs text-white">
                        {probe.id}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({probe.x}, {probe.y})
                      </span>
                    </div>
                  </div>

                  <Badge variant={isSelected ? "blue" : "slate"} size="sm" className="text-[10px]">
                    <Compass className="w-3 h-3" />
                    {probe.direction}
                  </Badge>
                </button>
              );
            })}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenLaunchDialog}
          className="w-full h-8 text-xs font-semibold border-dashed text-slate-300 hover:text-white flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Lançar Nova Sonda
        </Button>
      </CardContent>
    </Card>
  );
}
