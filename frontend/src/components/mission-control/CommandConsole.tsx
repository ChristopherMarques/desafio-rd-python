import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
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

interface CommandConsoleProps {
  onExecuteCommand: (command: "M" | "L" | "R") => void;
  onExecuteSequence: (sequence: string) => void;
  onStepByStepSequence: (sequence: string) => void;
  isLoading: boolean;
  isSimulating: boolean;
  disabled: boolean;
  lastError: string | null;
  onClearError: () => void;
}

export function CommandConsole({
  onExecuteCommand,
  onExecuteSequence,
  onStepByStepSequence,
  isLoading,
  isSimulating,
  disabled,
  lastError,
  onClearError,
}: CommandConsoleProps) {
  const [sequenceInput, setSequenceInput] = React.useState("MRM");

  // Ativação por teclado (W/A/D ou Setas)
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (disabled || isLoading || isSimulating) return;

      // Ignora se estiver digitando em input
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <Terminal className="w-5 h-5 text-rd-blue" />
          Console de Navegação e Comandos
        </CardTitle>
        <CardDescription>
          Controle a sonda por comandos imediatos via teclado/botões ou transmita sequências em lote.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Banner de Erro com Alerta Visual */}
        {lastError && (
          <div className="rounded-lg bg-red-950/60 border border-red-500/50 p-3.5 flex items-start justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-2.5 text-red-200 text-xs leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{lastError}</span>
            </div>
            <button
              onClick={onClearError}
              className="text-red-400 hover:text-red-200 text-xs font-mono underline ml-2 flex-shrink-0"
            >
              Fechar
            </button>
          </div>
        )}

        {/* D-PAD / Gamepad Tátil estilo Tangram */}
        <div>
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>Controle Manual Imediato</span>
            <span className="text-[11px] text-slate-500 font-mono">
              Teclas: W/↑ (Mover), A/← (Esq), D/→ (Dir)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-sm mx-auto p-3 bg-rd-navy-dark rounded-xl border border-rd-navy-border">
            {/* L: Virar à Esquerda */}
            <Button
              variant="secondary"
              size="lg"
              disabled={disabled || isLoading || isSimulating}
              onClick={() => onExecuteCommand("L")}
              className="flex flex-col items-center justify-center h-16 p-1 border-2 border-slate-700 hover:border-rd-blue hover:text-rd-blue"
              title="Girar 90° à Esquerda (L ou Tecla A)"
            >
              <CornerUpLeft className="w-6 h-6 text-rd-blue" />
              <span className="text-[10px] font-mono mt-0.5 font-bold">L (Girar Esq)</span>
            </Button>

            {/* M: Mover 1 Quadrante à Frente */}
            <Button
              variant="primary"
              size="lg"
              disabled={disabled || isLoading || isSimulating}
              onClick={() => onExecuteCommand("M")}
              className="flex flex-col items-center justify-center h-16 p-1 border-2 border-blue-400"
              title="Avançar 1 espaço à frente (M ou Tecla W/Seta Cima)"
            >
              <ArrowUp className="w-6 h-6 text-white" />
              <span className="text-[10px] font-mono mt-0.5 font-bold">M (Avançar)</span>
            </Button>

            {/* R: Virar à Direita */}
            <Button
              variant="secondary"
              size="lg"
              disabled={disabled || isLoading || isSimulating}
              onClick={() => onExecuteCommand("R")}
              className="flex flex-col items-center justify-center h-16 p-1 border-2 border-slate-700 hover:border-rd-blue hover:text-rd-blue"
              title="Girar 90° à Direita (R ou Tecla D)"
            >
              <CornerUpRight className="w-6 h-6 text-rd-blue" />
              <span className="text-[10px] font-mono mt-0.5 font-bold">R (Girar Dir)</span>
            </Button>
          </div>
        </div>

        {/* Transmissão de Sequência em Lote */}
        <form onSubmit={handleSequenceSubmit} className="space-y-3 pt-2 border-t border-rd-navy-border/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Sequência de Comandos (String)
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Presets:</span>
              <button
                type="button"
                onClick={() => setSequenceInput("MRM")}
                className="px-1.5 py-0.5 text-[10px] font-mono bg-rd-navy-subtle hover:bg-rd-blue/20 text-blue-300 rounded border border-rd-blue/30"
              >
                MRM (Desafio RD)
              </button>
              <button
                type="button"
                onClick={() => setSequenceInput("LMLMLMLMM")}
                className="px-1.5 py-0.5 text-[10px] font-mono bg-rd-navy-subtle hover:bg-rd-blue/20 text-blue-300 rounded border border-rd-blue/30"
              >
                Circuito Completo
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={sequenceInput}
              onChange={(e) => setSequenceInput(e.target.value.toUpperCase())}
              placeholder="Ex: MRM, LMLMLMLMM"
              fontMono
              disabled={disabled || isLoading || isSimulating}
              className="h-11 text-base tracking-widest font-bold"
            />

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                variant="orange"
                disabled={disabled || isLoading || isSimulating || !sequenceInput.trim()}
                className="h-11 px-4 whitespace-nowrap font-bold"
              >
                <Play className="w-4 h-4 fill-current" />
                {isLoading ? "Enviando..." : "Enviar API"}
              </Button>

              <Button
                type="button"
                variant="teal"
                disabled={disabled || isLoading || isSimulating || !sequenceInput.trim()}
                onClick={handleStepByStepClick}
                className="h-11 px-3 whitespace-nowrap font-bold text-xs"
                title="Executa passo a passo animado na malha com som"
              >
                <Sparkles className="w-4 h-4" />
                {isSimulating ? "Animando..." : "Simular"}
              </Button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-normal">
            A API processa os comandos na ordem informada. Se algum movimento violar a fronteira
            da malha, o sistema interrompe a sequência no último ponto seguro sem risco de queda.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
