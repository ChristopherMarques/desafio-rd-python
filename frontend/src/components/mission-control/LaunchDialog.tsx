import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import type { Direction, LaunchPayload } from "@/types/probe";
import { Compass, Rocket } from "lucide-react";

interface LaunchDialogProps {
  open: boolean;
  onClose: () => void;
  onLaunch: (payload: LaunchPayload) => Promise<void>;
  isLoading: boolean;
}

export function LaunchDialog({
  open,
  onClose,
  onLaunch,
  isLoading,
}: LaunchDialogProps) {
  const [x, setX] = React.useState<number>(5);
  const [y, setY] = React.useState<number>(5);
  const [direction, setDirection] = React.useState<Direction>("NORTH");
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (x < 1 || y < 1) {
      setError("As dimensões da malha devem ser maiores ou iguais a 1.");
      return;
    }

    try {
      await onLaunch({ x, y, direction });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Falha ao lançar a sonda.");
      }
    }
  };

  const directions: Direction[] = ["NORTH", "EAST", "SOUTH", "WEST"];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Lançar Sonda e Configurar Planalto"
      description="Configure as dimensões da malha retangular e a orientação cardinal inicial."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
            {error}
          </div>
        )}

        {/* Dimensões da Malha (X, Y) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Limite Superior X
            </label>
            <Input
              type="number"
              min={1}
              max={20}
              value={x}
              onChange={(e) => setX(Math.max(1, parseInt(e.target.value) || 1))}
              required
              disabled={isLoading}
              className="font-mono text-base font-bold"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Coordenada horizontal máxima
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Limite Superior Y
            </label>
            <Input
              type="number"
              min={1}
              max={20}
              value={y}
              onChange={(e) => setY(Math.max(1, parseInt(e.target.value) || 1))}
              required
              disabled={isLoading}
              className="font-mono text-base font-bold"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Coordenada vertical máxima
            </span>
          </div>
        </div>

        {/* Orientação Inicial */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Orientação Inicial
          </label>
          <div className="grid grid-cols-4 gap-2">
            {directions.map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => setDirection(d)}
                disabled={isLoading}
                className={`p-2.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                  direction === d
                    ? "bg-rd-blue text-white border-rd-blue shadow-sketch-blue"
                    : "bg-rd-navy-subtle text-slate-300 border-rd-navy-border hover:border-slate-500"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-rd-teal" />
            A sonda pousará sempre na coordenada base (0, 0) virada para {direction}.
          </span>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-rd-navy-border">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="font-bold"
          >
            <Rocket className="w-4 h-4" />
            {isLoading ? "Lançando..." : "Lançar Sonda"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
