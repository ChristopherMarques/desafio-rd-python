import * as React from "react";
import { CockpitDock } from "@/components/mission-control/CockpitDock";
import { DocsReader } from "@/components/docs/DocsReader";
import { FleetHUD } from "@/components/mission-control/FleetHUD";
import { LaunchDialog } from "@/components/mission-control/LaunchDialog";
import { MissionBriefing } from "@/components/mission-control/MissionBriefing";
import { PlateauCanvas } from "@/components/mission-control/PlateauCanvas";
import { TangramHeader } from "@/components/mission-control/TangramHeader";
import { TelemetryHUD } from "@/components/mission-control/TelemetryHUD";
import { ApiClientError, marsApi } from "@/lib/api";
import { soundEffects } from "@/lib/sound";
import type { Direction, LaunchPayload, PathHistoryStep, ProbeState } from "@/types/probe";
import { Activity, BookOpen, Compass, Radio } from "lucide-react";

export function App() {
  const [currentView, setCurrentView] = React.useState<"mission" | "docs">("mission");
  const [mobileTab, setMobileTab] = React.useState<"plateau" | "telemetry" | "fleet" | "briefing">("plateau");

  const [probes, setProbes] = React.useState<ProbeState[]>([]);
  const [activeProbeId, setActiveProbeId] = React.useState<string | null>(null);
  const [plateauMaxX, setPlateauMaxX] = React.useState<number>(5);
  const [plateauMaxY, setPlateauMaxY] = React.useState<number>(5);
  const [pathHistory, setPathHistory] = React.useState<PathHistoryStep[]>([]);

  const [apiOnline, setApiOnline] = React.useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = React.useState<boolean>(true);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isSimulating, setIsSimulating] = React.useState<boolean>(false);
  const [lastError, setLastError] = React.useState<string | null>(null);
  const [isLaunchDialogOpen, setIsLaunchDialogOpen] = React.useState<boolean>(false);

  // Sonda ativa atualmente selecionada
  const activeProbe = React.useMemo(() => {
    return probes.find((p) => p.id === activeProbeId) || null;
  }, [probes, activeProbeId]);

  // Checagem de conectividade com a API na montagem
  const checkApiAndLoadProbes = React.useCallback(async () => {
    const health = await marsApi.checkHealth();
    setApiOnline(health.online);

    if (health.online) {
      try {
        const remoteProbes = await marsApi.listProbes();
        setProbes(remoteProbes);
        if (remoteProbes.length > 0 && !activeProbeId) {
          const first = remoteProbes[0];
          setActiveProbeId(first.id);
          try {
            const detail = await marsApi.getProbeDetail(first.id);
            setPlateauMaxX(detail.plateau_max_x);
            setPlateauMaxY(detail.plateau_max_y);
            setPathHistory(detail.path_history);
          } catch {
            setPathHistory([
              { x: first.x, y: first.y, direction: first.direction, action: "LANDING" },
            ]);
          }
        }
      } catch {
        // Ignora erro
      }
    } else {
      // Modo offline/demo inicial se nenhuma sonda existir
      if (probes.length === 0) {
        const demoProbe: ProbeState = {
          id: "prb-rd-demo",
          x: 0,
          y: 0,
          direction: "NORTH",
        };
        setProbes([demoProbe]);
        setActiveProbeId(demoProbe.id);
        setPlateauMaxX(5);
        setPlateauMaxY(5);
        setPathHistory([
          { x: 0, y: 0, direction: "NORTH", action: "LANDING" },
        ]);
      }
    }
  }, [activeProbeId, probes.length]);

  React.useEffect(() => {
    checkApiAndLoadProbes();
  }, [checkApiAndLoadProbes]);

  // Seleção de outra sonda
  const handleSelectProbe = async (id: string) => {
    setActiveProbeId(id);
    setLastError(null);

    const found = probes.find((p) => p.id === id);
    if (!found) return;

    if (apiOnline) {
      try {
        const detail = await marsApi.getProbeDetail(id);
        setPlateauMaxX(detail.plateau_max_x);
        setPlateauMaxY(detail.plateau_max_y);
        setPathHistory(detail.path_history);
      } catch {
        setPathHistory([
          { x: found.x, y: found.y, direction: found.direction, action: "LANDING" },
        ]);
      }
    } else {
      setPathHistory([
        { x: found.x, y: found.y, direction: found.direction, action: "LANDING" },
      ]);
    }
  };

  // Lançar nova sonda
  const handleLaunchProbe = async (payload: LaunchPayload) => {
    setIsLoading(true);
    setLastError(null);

    try {
      let newProbe: ProbeState;
      if (apiOnline) {
        newProbe = await marsApi.launchProbe(payload);
      } else {
        // Fallback simulação local
        const randomId = `prb-${Math.random().toString(16).substring(2, 8)}`;
        newProbe = {
          id: randomId,
          x: 0,
          y: 0,
          direction: payload.direction,
        };
      }

      setProbes((prev) => [newProbe, ...prev]);
      setActiveProbeId(newProbe.id);
      setPlateauMaxX(payload.x);
      setPlateauMaxY(payload.y);
      setPathHistory([
        { x: 0, y: 0, direction: payload.direction, action: "LANDING" },
      ]);

      if (soundEnabled) soundEffects.playLaunch();
    } finally {
      setIsLoading(false);
    }
  };

  // Executar comando único manual (M, L, R)
  const handleExecuteCommand = async (cmd: "M" | "L" | "R") => {
    if (!activeProbe) return;
    setIsLoading(true);
    setLastError(null);

    try {
      if (apiOnline) {
        const updated = await marsApi.moveProbe(activeProbe.id, cmd);
        setProbes((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

        const actionName = cmd === "M" ? "MOVE" : cmd === "L" ? "TURN_LEFT" : "TURN_RIGHT";
        setPathHistory((prev) => [
          ...prev,
          { x: updated.x, y: updated.y, direction: updated.direction, action: actionName },
        ]);

        if (soundEnabled) {
          if (cmd === "M") soundEffects.playMove();
          else soundEffects.playTurn();
        }
      } else {
        // Simulação local offline
        simulateLocalCommand(cmd);
      }
    } catch (err: unknown) {
      if (soundEnabled) soundEffects.playWarning();
      if (err instanceof ApiClientError) {
        setLastError(err.detail.detail);
        if (err.detail.last_safe_state) {
          const safe = err.detail.last_safe_state;
          setProbes((prev) => prev.map((p) => (p.id === safe.id ? safe : p)));
        }
      } else if (err instanceof Error) {
        setLastError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Simulação local caso a API esteja desconectada
  const simulateLocalCommand = (cmd: "M" | "L" | "R") => {
    if (!activeProbe) return;

    let { x, y, direction } = activeProbe;
    const rotations: Record<Direction, { L: Direction; R: Direction }> = {
      NORTH: { L: "WEST", R: "EAST" },
      EAST: { L: "NORTH", R: "SOUTH" },
      SOUTH: { L: "EAST", R: "WEST" },
      WEST: { L: "SOUTH", R: "NORTH" },
    };

    if (cmd === "L") {
      direction = rotations[direction].L;
      if (soundEnabled) soundEffects.playTurn();
    } else if (cmd === "R") {
      direction = rotations[direction].R;
      if (soundEnabled) soundEffects.playTurn();
    } else if (cmd === "M") {
      let nextX = x;
      let nextY = y;
      if (direction === "NORTH") nextY += 1;
      else if (direction === "EAST") nextX += 1;
      else if (direction === "SOUTH") nextY -= 1;
      else if (direction === "WEST") nextX -= 1;

      if (nextX < 0 || nextX > plateauMaxX || nextY < 0 || nextY > plateauMaxY) {
        if (soundEnabled) soundEffects.playWarning();
        setLastError(
          `Movimento impedido: comando 'M' levaria a sonda para (${nextX}, ${nextY}), ultrapassando os limites da malha (0..${plateauMaxX}, 0..${plateauMaxY}).`
        );
        return;
      }
      x = nextX;
      y = nextY;
      if (soundEnabled) soundEffects.playMove();
    }

    const updated: ProbeState = { id: activeProbe.id, x, y, direction };
    setProbes((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setPathHistory((prev) => [
      ...prev,
      {
        x,
        y,
        direction,
        action: cmd === "M" ? "MOVE" : cmd === "L" ? "TURN_LEFT" : "TURN_RIGHT",
      },
    ]);
  };

  // Executar sequência inteira via API
  const handleExecuteSequence = async (sequence: string) => {
    if (!activeProbe) return;
    setIsLoading(true);
    setLastError(null);

    try {
      if (apiOnline) {
        const updated = await marsApi.moveProbe(activeProbe.id, sequence);
        setProbes((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

        // Recarrega telemetria completa
        try {
          const detail = await marsApi.getProbeDetail(updated.id);
          setPathHistory(detail.path_history);
        } catch {
          setPathHistory((prev) => [
            ...prev,
            { x: updated.x, y: updated.y, direction: updated.direction, action: "MOVE" },
          ]);
        }

        if (soundEnabled) soundEffects.playSuccess();
      } else {
        // Simulação local sequencial
        for (const char of sequence) {
          if (char === "M" || char === "L" || char === "R") {
            simulateLocalCommand(char);
          }
        }
        if (soundEnabled) soundEffects.playSuccess();
      }
    } catch (err: unknown) {
      if (soundEnabled) soundEffects.playWarning();
      if (err instanceof ApiClientError) {
        setLastError(err.detail.detail);
        if (err.detail.last_safe_state) {
          const safe = err.detail.last_safe_state;
          setProbes((prev) => prev.map((p) => (p.id === safe.id ? safe : p)));
        }
      } else if (err instanceof Error) {
        setLastError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Simulação passo a passo animada
  const handleStepByStepSequence = async (sequence: string) => {
    if (!activeProbe || isSimulating) return;
    setIsSimulating(true);
    setLastError(null);

    const commands = sequence.split("");
    for (let i = 0; i < commands.length; i++) {
      const char = commands[i];
      if (char === "M" || char === "L" || char === "R") {
        await handleExecuteCommand(char);
        await new Promise((resolve) => setTimeout(resolve, 380));
      }
    }

    setIsSimulating(false);
  };

  // Renderização da Documentação estilo Mintlify
  if (currentView === "docs") {
    return <DocsReader onBackToMission={() => setCurrentView("mission")} />;
  }

  return (
    <div className="h-screen max-h-screen flex flex-col bg-tangram-neutral-dark-bg text-slate-100 font-sans overflow-hidden">
      {/* Cabeçalho Tangram RD Station */}
      <TangramHeader
        apiOnline={apiOnline}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onOpenLaunchDialog={() => setIsLaunchDialogOpen(true)}
        activeProbeCount={probes.length}
        currentView={currentView}
        onSwitchView={setCurrentView}
      />

      {/* Conteúdo Principal do Mission Control em Layout HUD Flexível e Responsivo */}
      <main className="flex-1 min-h-0 w-full max-w-[1750px] mx-auto p-2 sm:p-3 lg:p-4 flex flex-col overflow-y-auto lg:overflow-hidden">
        {/* Barra de Abas Mobile / Tablet (< lg) */}
        <div className="lg:hidden flex items-center justify-between p-1 bg-tangram-neutral-dark-subtle/90 rounded-xl border border-tangram-neutral-dark-border mb-2.5 flex-shrink-0 text-xs">
          <button
            onClick={() => setMobileTab("plateau")}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === "plateau"
                ? "bg-tangram-primary text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Planalto</span>
          </button>

          <button
            onClick={() => setMobileTab("telemetry")}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === "telemetry"
                ? "bg-tangram-primary text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Telemetria</span>
          </button>

          <button
            onClick={() => setMobileTab("fleet")}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === "fleet"
                ? "bg-tangram-primary text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Frota ({probes.length})</span>
          </button>

          <button
            onClick={() => setMobileTab("briefing")}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === "briefing"
                ? "bg-tangram-primary text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Manual</span>
          </button>
        </div>

        {/* Grid Principal: HUD Esquerdo | Centro Herói com Cockpit | HUD Direito */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-stretch">
          {/* HUD Esquerdo (3 colunas): Frota e Manual de Instruções */}
          <aside
            className={`lg:col-span-3 flex-col h-full min-h-0 gap-3 order-2 lg:order-1 ${
              mobileTab === "fleet" || mobileTab === "briefing" ? "flex" : "hidden lg:flex"
            }`}
          >
            {(mobileTab === "fleet" || window.innerWidth >= 1024) && (
              <FleetHUD
                probes={probes}
                activeProbeId={activeProbeId}
                onSelectProbe={handleSelectProbe}
                onOpenLaunchDialog={() => setIsLaunchDialogOpen(true)}
                onRefreshProbes={checkApiAndLoadProbes}
                isLoading={isLoading}
                className="flex-shrink-0 lg:max-h-[40%]"
              />
            )}

            {(mobileTab === "briefing" || window.innerWidth >= 1024) && (
              <MissionBriefing className="flex-1 min-h-0" />
            )}
          </aside>

          {/* Centro Herói (6 colunas): Planalto Marciano + Cockpit Dock */}
          <section
            className={`lg:col-span-6 flex-col h-full min-h-0 gap-2 items-center justify-between order-1 lg:order-2 ${
              mobileTab === "plateau" ? "flex" : "hidden lg:flex"
            }`}
          >
            {/* Barra Superior do Planalto */}
            <div className="w-full flex items-center justify-between px-1 flex-shrink-0">
              <div>
                <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-tangram-support-orange animate-ping" />
                  Planalto Marciano &bull; Malha Cartesiana
                </h2>
                <p className="text-[10px] text-slate-400 font-mono">
                  Renderização geométrica com Rough.js &bull; Origem (0, 0) canto inferior esquerdo
                </p>
              </div>

              {activeProbe && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-tangram-primary bg-tangram-primary/15 px-2.5 py-0.5 rounded-lg border border-tangram-primary/40 shadow-tangram-cyan">
                    {activeProbe.id}: ({activeProbe.x}, {activeProbe.y}, {activeProbe.direction})
                  </span>
                </div>
              )}
            </div>

            {/* O Canvas Central do Planalto — Ocupa o Espaço Central sem Deformar */}
            <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden py-0.5">
              <PlateauCanvas
                maxX={plateauMaxX}
                maxY={plateauMaxY}
                activeProbe={activeProbe}
                pathHistory={pathHistory}
                allProbes={probes}
                isMoving={isLoading || isSimulating}
                className="h-full w-auto aspect-square max-h-full"
              />
            </div>

            {/* Cockpit de Movimentação em Torno da Tela Central */}
            <div className="w-full flex-shrink-0">
              <CockpitDock
                onExecuteCommand={handleExecuteCommand}
                onExecuteSequence={handleExecuteSequence}
                onStepByStepSequence={handleStepByStepSequence}
                isLoading={isLoading}
                isSimulating={isSimulating}
                disabled={!activeProbe}
                lastError={lastError}
                onClearError={() => setLastError(null)}
              />
            </div>
          </section>

          {/* HUD Direito (3 colunas): Sensores, Bússola e Radar de Borda */}
          <aside
            className={`lg:col-span-3 flex-col h-full min-h-0 gap-3 order-3 ${
              mobileTab === "telemetry" ? "flex" : "hidden lg:flex"
            }`}
          >
            <TelemetryHUD
              probe={activeProbe}
              maxX={plateauMaxX}
              maxY={plateauMaxY}
              pathHistory={pathHistory}
              className="flex-1 h-full min-h-0"
            />
          </aside>
        </div>
      </main>

      {/* Modal para Lançar Nova Sonda */}
      <LaunchDialog
        open={isLaunchDialogOpen}
        onClose={() => setIsLaunchDialogOpen(false)}
        onLaunch={handleLaunchProbe}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;
