import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  AlertTriangle,
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
  Play,
  Sparkles,
  Terminal,
} from "lucide-react";

interface CockpitDockProps {
  onExecuteCommand: (command: "M" | "L" | "R") => void;
  onExecuteSequence: (sequence: string) => void;
  onStepByStepSequence: (sequence: string) => void;
  isLoading: boolean;
  isSimulating: boolean;
  disabled: boolean;
  lastError: string | null;
  onClearError: () => void;
}

export function CockpitDock({
  onExecuteCommand,
  onExecuteSequence,
  onStepByStepSequence,
  isLoading,
  isSimulating,
  disabled,
  lastError,
  onClearError,
}: CockpitDockProps) {
  const [sequenceInput, setSequenceInput] = React.useState("MRM");

  // Atalhos de Teclado (W, A, D ou Setas)
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (disabled || isLoading || isSimulating) return;

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
  }, [disabled, isLoading, isSimulating, onExecuteCommand]);

  const handleSequenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sequenceInput.trim() || disabled || isLoading || isSimulating) return;
    onExecuteSequence(sequenceInput.trim().toUpperCase());
  };

  const handleStepByStepClick = () => {
    if (!sequenceInput.trim() || disabled || isLoading || isSimulating) return;
    onStepByStepSequence(sequenceInput.trim().toUpperCase());
  };

  return (
    <div className="w-full bg-rd-navy-card/95 border-2 border-rd-navy-border rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-3.5">
      {/* Banner de Erro / Alerta com Animação */}
      {lastError && (
        <div className="rounded-xl bg-red-950/70 border border-red-500/60 p-3 flex items-center justify-between gap-3 text-red-200 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="font-mono">{lastError}</span>
          </div>
          <button
            onClick={onClearError}
            className="px-2 py-0.5 rounded bg-red-900/60 hover:bg-red-800 text-red-200 text-[11px] font-mono border border-red-500/40"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Grid Principal do Cockpit: D-Pad Tátil + Console de Sequência */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Lado Esquerdo: D-Pad Tátil Manual (4 colunas) */}
        <div className="lg:col-span-4 flex items-center gap-2 bg-rd-navy-dark p-2.5 rounded-xl border border-rd-navy-border">
          {/* L: Girar Esquerda */}
          <Button
            variant="secondary"
            size="md"
            disabled={disabled || isLoading || isSimulating}
            onClick={() => onExecuteCommand("L")}
            className="flex-1 h-14 flex-col p-1 border-2 border-slate-700 hover:border-rd-blue"
            title="Girar 90° à Esquerda (L ou Tecla A)"
          >
            <CornerUpLeft className="w-5 h-5 text-rd-blue" />
            <span className="text-[10px] font-mono font-bold mt-0.5">L [A]</span>
          </Button>

          {/* M: Avançar Frente */}
          <Button
            variant="primary"
            size="md"
            disabled={disabled || isLoading || isSimulating}
            onClick={() => onExecuteCommand("M")}
            className="flex-[1.3] h-14 flex-col p-1 border-2 border-blue-400 shadow-sketch-blue"
            title="Avançar 1 espaço à frente (M ou Tecla W/Seta Cima)"
          >
            <ArrowUp className="w-5 h-5 text-white" />
            <span className="text-[11px] font-mono font-extrabold mt-0.5">M [W/↑]</span>
          </Button>

          {/* R: Girar Direita */}
          <Button
            variant="secondary"
            size="md"
            disabled={disabled || isLoading || isSimulating}
            onClick={() => onExecuteCommand("R")}
            className="flex-1 h-14 flex-col p-1 border-2 border-slate-700 hover:border-rd-blue"
            title="Girar 90° à Direita (R ou Tecla D)"
          >
            <CornerUpRight className="w-5 h-5 text-rd-blue" />
            <span className="text-[10px] font-mono font-bold mt-0.5">R [D]</span>
          </Button>
        </div>

        {/* Lado Direito: Formulário de Sequência e Presets (8 colunas) */}
        <div className="lg:col-span-8 space-y-2">
          {/* Barra Superior de Presets */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-rd-orange" />
              Transmissão de Sequência em Lote
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 hidden sm:inline">Presets:</span>
              <button
                type="button"
                onClick={() => setSequenceInput("MRM")}
                className="px-2 py-0.5 text-[10px] font-mono bg-rd-blue/20 hover:bg-rd-blue/30 text-blue-300 rounded border border-rd-blue/40 font-bold transition-colors"
                title="Cenário do Enunciado RD Station: parte de (0,0,N) e finaliza em (1,1,E)"
              >
                MRM (Desafio RD)
              </button>
              <button
                type="button"
                onClick={() => setSequenceInput("LMLMLMLMM")}
                className="px-2 py-0.5 text-[10px] font-mono bg-rd-navy-subtle hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
              >
                Circuito Fechado
              </button>
              <button
                type="button"
                onClick={() => setSequenceInput("MMRMMRMRRM")}
                className="px-2 py-0.5 text-[10px] font-mono bg-rd-navy-subtle hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
              >
                Quadrado
              </button>
            </div>
          </div>

          {/* Input e Botões de Envio */}
          <form onSubmit={handleSequenceSubmit} className="flex flex-col sm:flex-row gap-2">
            <Input
              value={sequenceInput}
              onChange={(e) => setSequenceInput(e.target.value.toUpperCase())}
              placeholder="Ex: MRM, LMLMLMLMM"
              fontMono
              disabled={disabled || isLoading || isSimulating}
              className="h-11 text-base tracking-widest font-bold flex-1"
            />

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                variant="orange"
                disabled={disabled || isLoading || isSimulating || !sequenceInput.trim()}
                className="h-11 px-4 font-bold whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-current" />
                {isLoading ? "Processando..." : "Enviar API"}
              </Button>

              <Button
                type="button"
                variant="teal"
                disabled={disabled || isLoading || isSimulating || !sequenceInput.trim()}
                onClick={handleStepByStepClick}
                className="h-11 px-3.5 font-bold text-xs whitespace-nowrap"
                title="Executa passo a passo na tela com som e atraso visual"
              >
                <Sparkles className="w-4 h-4" />
                {isSimulating ? "Animando..." : "Simular Passo a Passo"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
