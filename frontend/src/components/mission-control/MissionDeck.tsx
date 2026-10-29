import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Direction, PathHistoryStep, ProbeState } from "@/types/probe";
import {
  AlertTriangle,
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
  Footprints,
  HelpCircle,
  Navigation,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface MissionDeckProps {
  probes: ProbeState[];
  activeProbe: ProbeState | null;
  onSelectProbe: (id: string) => void;
  onOpenLaunchDialog: () => void;
  onRefreshProbes: () => void;
  onExecuteCommand: (command: "M" | "L" | "R") => void;
  onExecuteSequence: (sequence: string) => void;
  onStepByStepSequence: (sequence: string) => void;
  maxX: number;
  maxY: number;
  pathHistory: PathHistoryStep[];
  isLoading: boolean;
  isSimulating: boolean;
  lastError: string | null;
  onClearError: () => void;
  viewMode?: "full" | "controls-only" | "telemetry-only";
}

export function MissionDeck({
  probes,
  activeProbe,
  onSelectProbe,
  onOpenLaunchDialog,
  onRefreshProbes,
  onExecuteCommand,
  onExecuteSequence,
  onStepByStepSequence,
  maxX,
  maxY,
  pathHistory,
  isLoading,
  isSimulating,
  lastError,
  onClearError,
  viewMode = "full",
}: MissionDeckProps) {
  const [sequenceInput, setSequenceInput] = React.useState("MRM");
  const [showHelpModal, setShowHelpModal] = React.useState(false);

  // Atalhos de teclado (W, A, D ou Setas)
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!activeProbe || isLoading || isSimulating) return;

      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      const key = e.key.toUpperCase();
      if (key === "M" || key === "ARROWUP" || key === "W") {
        e.preventDefault();
        onExecuteCommand("M");
      } else if (key === "L" || key === "ARROWLEFT" || key === "A") {
        e.preventDefault();
        onExecuteCommand("L");
      } else if (key === "R" || key === "ARROWRIGHT" || key === "D") {
        e.preventDefault();
        onExecuteCommand("R");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeProbe, isLoading, isSimulating, onExecuteCommand]);

  const handleSequenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sequenceInput.trim() || !activeProbe || isLoading || isSimulating) return;
    onExecuteSequence(sequenceInput.trim().toUpperCase());
  };

  const compassAngles: Record<Direction, number> = {
    NORTH: 0,
    EAST: 90,
    SOUTH: 180,
    WEST: 270,
  };

  const currentAngle = activeProbe ? compassAngles[activeProbe.direction] : 0;

  return (
    <div className="w-full h-full flex flex-col gap-3 min-h-0 text-slate-100">
      {/* 1. Barra de Controle da Sonda Ativa & Frota */}
      <div className="bg-tangram-neutral-dark-card border border-tangram-neutral-dark-border rounded-xl p-3 flex items-center justify-between gap-3 shadow-md flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-tangram-primary flex-shrink-0" />
          
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Sonda Ativa
            </span>
            <div className="flex items-center gap-1.5">
              <select
                value={activeProbe?.id || ""}
                onChange={(e) => onSelectProbe(e.target.value)}
                className="bg-tangram-neutral-dark-subtle border border-tangram-neutral-dark-border text-white text-xs font-mono font-bold rounded-lg px-2 py-1 focus:outline-none focus:border-tangram-primary cursor-pointer"
              >
                {probes.map((p) => (
                  <option key={p.id} value={p.id} className="bg-tangram-neutral-dark-card text-white">
                    {p.id} &bull; ({p.x}, {p.y}) {p.direction}
                  </option>
                ))}
              </select>

              <button
                onClick={onRefreshProbes}
                disabled={isLoading}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-tangram-neutral-dark-subtle transition-colors"
                title="Sincronizar com API"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHelpModal(true)}
            className="h-8 px-2.5 text-xs text-slate-300 border-tangram-neutral-dark-border hover:border-tangram-primary/50"
            title="Ver instruções do desafio"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Regras</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenLaunchDialog}
            className="h-8 px-2.5 text-xs font-bold bg-tangram-primary text-slate-950 hover:bg-tangram-primary-hover shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Sonda</span>
          </Button>
        </div>
      </div>

      {/* 2. Banner de Alerta / Erro (se houver) */}
      {lastError && (
        <div className="rounded-xl bg-tangram-danger-border/20 border border-tangram-danger/50 p-2.5 flex items-center justify-between gap-3 text-red-200 text-xs flex-shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-tangram-danger flex-shrink-0" />
            <span className="font-mono text-[11px] leading-tight">{lastError}</span>
          </div>
          <button
            onClick={onClearError}
            className="px-2 py-0.5 rounded bg-tangram-danger/30 hover:bg-tangram-danger/50 text-red-200 text-[10px] font-mono border border-tangram-danger/40 flex-shrink-0"
          >
            Fechar
          </button>
        </div>
      )}

      {/* 3. Bloco de Comando & Navegação (Ergonomia Máxima) */}
      {(viewMode === "full" || viewMode === "controls-only") && (
        <div className="bg-tangram-neutral-dark-card border border-tangram-neutral-dark-border rounded-xl p-3 sm:p-3.5 space-y-2.5 sm:space-y-3 shadow-md flex-shrink-0">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-tangram-neutral-dark-border">
            <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-tangram-primary" />
              Comandos de Navegação
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Teclas: <strong className="text-tangram-primary">[W] [A] [D]</strong>
            </span>
          </div>

          {/* D-Pad Horizontal Ergonômico */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="secondary"
              size="md"
              disabled={!activeProbe || isLoading || isSimulating}
              onClick={() => onExecuteCommand("L")}
              className="h-11 sm:h-12 flex-col p-1 bg-tangram-neutral-dark-subtle border border-tangram-neutral-dark-border hover:border-tangram-primary text-slate-200 hover:text-white transition-all"
              title="Girar 90° à Esquerda [A ou Seta Esquerda]"
            >
              <CornerUpLeft className="w-4 h-4 text-tangram-primary" />
              <span className="text-[10px] font-mono font-bold mt-0.5">L [Girar Esq]</span>
            </Button>

            <Button
              variant="primary"
              size="md"
              disabled={!activeProbe || isLoading || isSimulating}
              onClick={() => onExecuteCommand("M")}
              className="h-11 sm:h-12 flex-col p-1 bg-tangram-primary text-slate-950 hover:bg-tangram-primary-hover font-bold shadow-sm transition-all"
              title="Avançar 1 espaço à frente [W ou Seta Cima]"
            >
              <ArrowUp className="w-4 h-4 text-slate-950" />
              <span className="text-[10px] font-mono font-extrabold mt-0.5">M [Avançar]</span>
            </Button>

            <Button
              variant="secondary"
              size="md"
              disabled={!activeProbe || isLoading || isSimulating}
              onClick={() => onExecuteCommand("R")}
              className="h-11 sm:h-12 flex-col p-1 bg-tangram-neutral-dark-subtle border border-tangram-neutral-dark-border hover:border-tangram-primary text-slate-200 hover:text-white transition-all"
              title="Girar 90° à Direita [D ou Seta Direita]"
            >
              <CornerUpRight className="w-4 h-4 text-tangram-primary" />
              <span className="text-[10px] font-mono font-bold mt-0.5">R [Girar Dir]</span>
            </Button>
          </div>

          {/* Transmissão em Lote com Presets Limpos */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Sequência em Lote:
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSequenceInput("MRM")}
                  className="px-2 py-0.5 text-[10px] font-mono bg-tangram-primary/10 hover:bg-tangram-primary/20 text-tangram-primary rounded border border-tangram-primary/30 font-bold transition-colors"
                  title="Cenário do Enunciado RD Station: parte de (0,0,N) e finaliza em (1,1,E)"
                >
                  MRM (Desafio RD)
                </button>
                <button
                  type="button"
                  onClick={() => setSequenceInput("LMLMLMLMM")}
                  className="px-2 py-0.5 text-[10px] font-mono bg-tangram-neutral-dark-subtle hover:bg-slate-700 text-slate-300 rounded border border-tangram-neutral-dark-border transition-colors"
                >
                  Circuito
                </button>
              </div>
            </div>

            <form onSubmit={handleSequenceSubmit} className="space-y-2">
              <Input
                value={sequenceInput}
                onChange={(e) => setSequenceInput(e.target.value.toUpperCase())}
                placeholder="Ex: MRM"
                fontMono
                disabled={!activeProbe || isLoading || isSimulating}
                className="h-9 text-xs tracking-widest font-bold bg-tangram-neutral-dark-subtle border-tangram-neutral-dark-border focus:border-tangram-primary text-white"
              />

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="submit"
                  variant="orange"
                  disabled={!activeProbe || isLoading || isSimulating || !sequenceInput.trim()}
                  className="h-9 font-bold text-xs bg-tangram-support-orange hover:bg-tangram-support-orange/90 text-white shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isLoading ? "Processando..." : "Enviar API"}</span>
                </Button>

                <Button
                  type="button"
                  variant="teal"
                  disabled={!activeProbe || isLoading || isSimulating || !sequenceInput.trim()}
                  onClick={() => onStepByStepSequence(sequenceInput.trim().toUpperCase())}
                  className="h-9 font-bold text-xs bg-tangram-success hover:bg-tangram-success/90 text-slate-950 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSimulating ? "Animando..." : "Simular Passo"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Telemetria Consolidada & Diário de Bordo (Preenche o restante) */}
      {(viewMode === "full" || viewMode === "telemetry-only") && (
        <div className="bg-tangram-neutral-dark-card border border-tangram-neutral-dark-border rounded-xl p-3 flex-1 min-h-0 flex flex-col justify-between shadow-md">
        {/* Métricas Compactas: Posição e Bússola */}
        <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-tangram-neutral-dark-border flex-shrink-0">
          {/* Posição */}
          <div className="p-2 rounded-lg bg-tangram-neutral-dark-subtle border border-tangram-neutral-dark-border flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
                Posição
              </span>
              <span className="text-lg font-bold font-mono text-white">
                ({activeProbe?.x ?? 0}, {activeProbe?.y ?? 0})
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              / ({maxX}, {maxY})
            </span>
          </div>

          {/* Rumo / Bússola */}
          <div className="p-2 rounded-lg bg-tangram-neutral-dark-subtle border border-tangram-neutral-dark-border flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
                Orientação
              </span>
              <span className="text-lg font-bold font-mono text-tangram-primary">
                {activeProbe?.direction ?? "NORTH"}
              </span>
            </div>
            <div className="w-7 h-7 rounded-full bg-tangram-neutral-dark-bg border border-tangram-neutral-dark-border flex items-center justify-center flex-shrink-0">
              <Navigation
                className="w-3.5 h-3.5 text-tangram-support-orange transition-transform duration-300"
                style={{ transform: `rotate(${currentAngle}deg)` }}
              />
            </div>
          </div>
        </div>

        {/* Diário de Eventos Rolável */}
        <div className="flex-1 min-h-0 flex flex-col pt-2">
          <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 font-mono">
              <Footprints className="w-3 h-3 text-tangram-primary" />
              Diário de Passos ({pathHistory.length})
            </span>
            <span className="text-[9px] text-slate-500 font-mono">Eventos recentes</span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
            {pathHistory.length === 0 ? (
              <p className="text-slate-500 text-[10px] py-4 text-center">Nenhum evento registrado.</p>
            ) : (
              [...pathHistory].reverse().map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-1.5 rounded bg-tangram-neutral-dark-subtle border border-tangram-neutral-dark-border text-[10px]"
                >
                  <span className="font-semibold text-tangram-primary">
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
      </div>
      )}

      {/* Modal Limpo de Regras do Desafio (Acessível sob demanda) */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-tangram-neutral-dark-card border border-tangram-neutral-dark-border p-5 shadow-2xl text-xs space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-tangram-neutral-dark-border">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-tangram-primary" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Regras do Desafio RD Station
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-tangram-neutral-dark-subtle"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2.5 text-slate-300 leading-relaxed">
              <p>
                <strong>1. Comandos Básicos:</strong>
                <br />
                &bull; <code className="text-tangram-primary">M</code>: Avança 1 espaço na direção atual.
                <br />
                &bull; <code className="text-tangram-primary">L</code>: Gira 90° à esquerda sem sair do quadrante.
                <br />
                &bull; <code className="text-tangram-primary">R</code>: Gira 90° à direita sem sair do quadrante.
              </p>

              <p>
                <strong>2. Posição Inicial:</strong> A sonda sempre pousa em <code>(0, 0)</code> virada para a direção especificada.
              </p>

              <p>
                <strong>3. Regra de Ouro (Fail-Safe):</strong> A sonda <strong>nunca sai dos limites</strong>. Se uma sequência tentar ultrapassar o planalto ou contiver comando inválido, a execução é interrompida com segurança preventiva no passo anterior e retorna status <strong>HTTP 422</strong>.
              </p>

              <p>
                <strong>4. Cenário de Validação:</strong> Inicie em <code>(0, 0, NORTH)</code> e envie <code>MRM</code>. O estado final esperado é <code>(1, 1, EAST)</code>.
              </p>
            </div>

            <div className="pt-2 border-t border-tangram-neutral-dark-border flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowHelpModal(false)}
                className="h-8 px-4 text-xs font-bold bg-tangram-primary text-slate-950"
              >
                Entendi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
