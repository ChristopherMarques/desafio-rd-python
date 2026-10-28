import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  AlertTriangle,
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
  Gamepad2,
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

      {/* Grid Perfeitamente Simétrico: 50% Controle Manual | 50% Sequência em Lote */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-stretch">
        {/* Painel Esquerdo: Controle Manual Tátil (50%) */}
        <div className="bg-rd-navy-dark/90 p-3 rounded-xl border border-rd-navy-border flex flex-col justify-between space-y-2.5">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-rd-navy-border/60">
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5 text-rd-blue" />
              Navegação Manual Imediata
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Teclas: <strong className="text-blue-400">[W] [A] [D]</strong>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 flex-1">
            {/* L: Girar Esquerda */}
            <Button
              variant="secondary"
              size="md"
              disabled={disabled || isLoading || isSimulating}
              onClick={() => onExecuteCommand("L")}
              className="h-14 flex-col p-1 border-2 border-slate-700 hover:border-rd-blue transition-all"
              title="Girar 90° à Esquerda (L ou Tecla A)"
            >
              <CornerUpLeft className="w-5 h-5 text-rd-blue" />
              <span className="text-[10px] font-mono font-bold mt-0.5">L [A]</span>
              <span className="text-[8px] text-slate-400 uppercase font-sans">Girar Esq</span>
            </Button>

            {/* M: Avançar Frente */}
            <Button
              variant="primary"
              size="md"
              disabled={disabled || isLoading || isSimulating}
              onClick={() => onExecuteCommand("M")}
              className="h-14 flex-col p-1 border-2 border-blue-400 shadow-sketch-blue transition-all"
              title="Avançar 1 espaço à frente (M ou Tecla W/Seta Cima)"
            >
              <ArrowUp className="w-5 h-5 text-white" />
              <span className="text-[11px] font-mono font-extrabold mt-0.5">M [W/↑]</span>
              <span className="text-[8px] text-blue-100 uppercase font-sans font-bold">Avançar</span>
            </Button>

            {/* R: Girar Direita */}
            <Button
              variant="secondary"
              size="md"
              disabled={disabled || isLoading || isSimulating}
              onClick={() => onExecuteCommand("R")}
              className="h-14 flex-col p-1 border-2 border-slate-700 hover:border-rd-blue transition-all"
              title="Girar 90° à Direita (R ou Tecla D)"
            >
              <CornerUpRight className="w-5 h-5 text-rd-blue" />
              <span className="text-[10px] font-mono font-bold mt-0.5">R [D]</span>
              <span className="text-[8px] text-slate-400 uppercase font-sans">Girar Dir</span>
            </Button>
          </div>
        </div>

        {/* Painel Direito: Transmissão em Lote e Presets (50%) */}
        <div className="bg-rd-navy-dark/90 p-3 rounded-xl border border-rd-navy-border flex flex-col justify-between space-y-2.5">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-rd-navy-border/60">
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-rd-orange" />
              Sequência de Comandos
            </span>

            {/* Presets Rápidos */}
            <div className="flex items-center gap-1.5">
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
                Circuito
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

          <form onSubmit={handleSequenceSubmit} className="space-y-2 flex-1 flex flex-col justify-between">
            <Input
              value={sequenceInput}
              onChange={(e) => setSequenceInput(e.target.value.toUpperCase())}
              placeholder="Digite a sequência (ex: MRM)"
              fontMono
              disabled={disabled || isLoading || isSimulating}
              className="h-9 text-sm tracking-widest font-bold"
            />

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="submit"
                variant="orange"
                disabled={disabled || isLoading || isSimulating || !sequenceInput.trim()}
                className="h-9 font-bold text-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isLoading ? "Processando..." : "Enviar API"}
              </Button>

              <Button
                type="button"
                variant="teal"
                disabled={disabled || isLoading || isSimulating || !sequenceInput.trim()}
                onClick={handleStepByStepClick}
                className="h-9 font-bold text-xs"
                title="Executa passo a passo na tela com som e atraso visual"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isSimulating ? "Animando..." : "Simular Passo a Passo"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
