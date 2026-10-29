import { Badge } from "@/components/ui/Badge";
import {
  BookOpen,
  FileCode2,
  Github,
  Radio,
  Volume2,
  VolumeX,
} from "lucide-react";

interface TangramHeaderProps {
  apiOnline: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentView: "mission" | "docs";
  onSwitchView: (view: "mission" | "docs") => void;
}

export function TangramHeader({
  apiOnline,
  soundEnabled,
  onToggleSound,
  currentView,
  onSwitchView,
}: TangramHeaderProps) {
  return (
    <header className="border-b border-tangram-neutral-dark-border bg-tangram-neutral-inverse/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 lg:px-8 py-2.5 transition-all">
      <div className="max-w-[1750px] mx-auto flex items-center justify-between gap-3">
        {/* Lado Esquerdo: Logo Tangram + Título + Seletor de Modo */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo Geométrico Tangram RD Station */}
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 bg-tangram-neutral-dark-bg rounded-xl p-1.5 border border-tangram-primary/40 shadow-tangram-cyan flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-full h-full">
              <polygon points="0,0 24,0 12,16" fill="#00DBFF" />
              <polygon points="24,0 40,0 40,24" fill="#FF8900" />
              <polygon points="0,0 0,40 20,20" fill="#0ED869" />
              <polygon points="20,20 40,24 40,40 20,40" fill="#FFBD28" />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm md:text-base font-extrabold tracking-tight text-white uppercase truncate flex items-center gap-1.5">
                Mars Probe <span className="text-tangram-primary hidden xs:inline">Mission</span>
              </h1>
              <Badge variant="blue" size="sm" className="hidden sm:inline-flex text-[10px]">
                Tangram
              </Badge>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden md:block truncate">
              RD Station Tech Challenge &bull; Clean Architecture &bull; Rough.js
            </p>
          </div>

          {/* View Switcher: Mission Control vs Documentação Mintlify */}
          <div className="flex items-center p-1 rounded-xl bg-tangram-neutral-dark-bg border border-tangram-neutral-dark-border ml-2 sm:ml-4">
            <button
              onClick={() => onSwitchView("mission")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentView === "mission"
                  ? "bg-tangram-primary text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mission Control</span>
              <span className="sm:hidden">Missão</span>
            </button>

            <button
              onClick={() => onSwitchView("docs")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentView === "docs"
                  ? "bg-tangram-primary text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Docs (Mintlify)</span>
              <span className="sm:hidden">Docs</span>
            </button>
          </div>
        </div>

        {/* Lado Direito: Status, Áudio, Swagger e GitHub */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {/* Status da API Backend */}
          <div className="flex items-center gap-2 bg-tangram-neutral-dark-bg px-2.5 py-1 rounded-lg border border-tangram-neutral-dark-border text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                apiOnline ? "bg-tangram-success" : "bg-tangram-warning"
              }`}
            />
            <span className="font-mono text-[11px] text-slate-300">
              {apiOnline ? "API Online" : "Simulador Local"}
            </span>
          </div>

          {/* Som Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? "Silenciar áudio" : "Ativar áudio sintetizado"}
            className="p-1.5 sm:px-2 sm:py-1 rounded-lg bg-tangram-neutral-dark-bg hover:bg-tangram-neutral-dark-subtle text-slate-300 border border-tangram-neutral-dark-border transition-colors flex items-center gap-1 text-xs"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-tangram-success" />
                <span className="hidden md:inline text-[11px]">Som ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline text-[11px]">Mudo</span>
              </>
            )}
          </button>

          {/* Link Swagger API */}
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir Swagger API Interativo"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-tangram-neutral-dark-bg hover:bg-tangram-neutral-dark-subtle text-tangram-primary hover:text-white border border-tangram-primary/30 text-xs font-mono transition-colors"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Swagger</span>
          </a>

          {/* Link GitHub */}
          <a
            href="https://github.com/ChristopherMarques/desafio-rd-python"
            target="_blank"
            rel="noopener noreferrer"
            title="Ver código-fonte no GitHub"
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-tangram-neutral-dark-bg hover:bg-tangram-neutral-dark-subtle text-slate-300 border border-tangram-neutral-dark-border transition-colors flex items-center gap-1 text-xs"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Repo</span>
          </a>
        </div>
      </div>
    </header>
  );
}
