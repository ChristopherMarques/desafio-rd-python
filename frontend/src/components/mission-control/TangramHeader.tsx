import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Compass,
  Github,
  PlusCircle,
  Volume2,
  VolumeX,
} from "lucide-react";

interface TangramHeaderProps {
  apiOnline: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenLaunchDialog: () => void;
  activeProbeCount: number;
}

export function TangramHeader({
  apiOnline,
  soundEnabled,
  onToggleSound,
  onOpenLaunchDialog,
  activeProbeCount,
}: TangramHeaderProps) {
  return (
    <header className="border-b border-rd-navy-border bg-rd-navy/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo & Brand Tangram RD Station */}
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          {/* Ícone Tangram Geométrico */}
          <div className="relative w-10 h-10 flex-shrink-0 bg-rd-navy-dark rounded-xl p-1.5 border border-rd-blue/30 shadow-sketch-blue flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-full h-full">
              {/* Formas Tangram inspiradas no Design System da RD Station */}
              <polygon points="0,0 24,0 12,16" fill="#0073FF" />
              <polygon points="24,0 40,0 40,24" fill="#F25C05" />
              <polygon points="0,0 0,40 20,20" fill="#00B37E" />
              <polygon points="20,20 40,24 40,40 20,40" fill="#FFB800" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white uppercase flex items-center gap-1.5">
                Mars Probe <span className="text-rd-blue">Mission Control</span>
              </h1>
              <Badge variant="blue" size="sm">
                Tangram Sketch
              </Badge>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Desafio Técnico RD Station &bull; Python FastAPI + React + Rough.js
            </p>
          </div>
        </div>

        {/* Status Pills & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          {/* Status da API Backend */}
          <div className="flex items-center gap-2 bg-rd-navy-card px-3 py-1.5 rounded-lg border border-rd-navy-border text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                apiOnline
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"
                  : "bg-amber-400"
              }`}
            />
            <span className="font-mono text-slate-300">
              {apiOnline ? "API FastAPI Online (8000)" : "Simulador Local Ativo"}
            </span>
          </div>

          {/* Sondas Ativas Badge */}
          <Badge variant="teal" size="md">
            <Compass className="w-3.5 h-3.5" />
            {activeProbeCount} {activeProbeCount === 1 ? "sonda ativa" : "sondas ativas"}
          </Badge>

          {/* Som Toggle */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleSound}
            title={soundEnabled ? "Silenciar áudio" : "Ativar áudio sintetizado"}
            className="h-9 px-2.5 text-xs text-slate-300"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Som ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Mudo</span>
              </>
            )}
          </Button>

          {/* Link GitHub */}
          <a
            href="https://github.com/ChristopherMarques/desafio-rd-python"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-9 px-3 text-xs font-medium rounded-lg bg-rd-navy-card hover:bg-rd-navy-subtle text-slate-300 border border-rd-navy-border transition-colors gap-1.5"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Repo</span>
          </a>

          {/* Nova Sonda CTA */}
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenLaunchDialog}
            className="h-9 font-semibold text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Lançar Sonda
          </Button>
        </div>
      </div>
    </header>
  );
}
