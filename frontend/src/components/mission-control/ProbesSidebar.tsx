import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { ProbeState } from "@/types/probe";
import { Compass, Plus, RefreshCw } from "lucide-react";

interface ProbesSidebarProps {
  probes: ProbeState[];
  activeProbeId: string | null;
  onSelectProbe: (id: string) => void;
  onOpenLaunchDialog: () => void;
  onRefreshProbes: () => void;
  isLoading: boolean;
}

export function ProbesSidebar({
  probes,
  activeProbeId,
  onSelectProbe,
  onOpenLaunchDialog,
  onRefreshProbes,
  isLoading,
}: ProbesSidebarProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            <Compass className="w-5 h-5 text-rd-orange" />
            Frota de Sondas
          </CardTitle>
          <button
            onClick={onRefreshProbes}
            disabled={isLoading}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-rd-navy-subtle transition-colors disabled:opacity-50"
            title="Atualizar lista de sondas da API"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <CardDescription>
          Gerenciamento da esquadra de exploração em Marte.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {probes.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-rd-navy-border rounded-xl">
            <p className="text-xs text-slate-400 mb-3">
              Nenhuma sonda ativa no momento.
            </p>
            <Button variant="primary" size="sm" onClick={onOpenLaunchDialog}>
              <Plus className="w-3.5 h-3.5" />
              Lançar Primeira Sonda
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {probes.map((probe) => {
              const isSelected = probe.id === activeProbeId;
              return (
                <button
                  key={probe.id}
                  onClick={() => onSelectProbe(probe.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-150 flex items-center justify-between ${
                    isSelected
                      ? "bg-rd-blue/15 border-rd-blue text-white shadow-sketch-blue"
                      : "bg-rd-navy-dark border-rd-navy-border/70 text-slate-300 hover:border-slate-600 hover:bg-rd-navy-subtle"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-white">
                        {probe.id}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-rd-blue animate-ping" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Posição: ({probe.x}, {probe.y})
                    </p>
                  </div>

                  <Badge variant={isSelected ? "blue" : "slate"} size="sm">
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
          className="w-full mt-2 border-dashed"
        >
          <Plus className="w-3.5 h-3.5" />
          Lançar Nova Sonda
        </Button>
      </CardContent>
    </Card>
  );
}
