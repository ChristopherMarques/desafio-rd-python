import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TangramHeader } from "@/components/mission-control/TangramHeader";

describe("TangramHeader Component", () => {
  it("renders mission title and active probes counter", () => {
    render(
      <TangramHeader
        apiOnline={true}
        soundEnabled={true}
        onToggleSound={vi.fn()}
        onOpenLaunchDialog={vi.fn()}
        activeProbeCount={3}
        currentView="mission"
        onSwitchView={vi.fn()}
      />
    );

    expect(screen.getByText(/Mars Probe/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Mission Control/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/3 sondas/i)).toBeInTheDocument();
  });

  it("handles sound toggle click", () => {
    const onToggleSound = vi.fn();
    render(
      <TangramHeader
        apiOnline={false}
        soundEnabled={true}
        onToggleSound={onToggleSound}
        onOpenLaunchDialog={vi.fn()}
        activeProbeCount={1}
        currentView="mission"
        onSwitchView={vi.fn()}
      />
    );

    expect(screen.getByText(/Simulador Local/i)).toBeInTheDocument();

    const soundBtn = screen.getByTitle(/Silenciar áudio/i);
    fireEvent.click(soundBtn);
    expect(onToggleSound).toHaveBeenCalledTimes(1);
  });

  it("triggers onSwitchView when clicking Docs", () => {
    const onSwitchView = vi.fn();
    render(
      <TangramHeader
        apiOnline={true}
        soundEnabled={true}
        onToggleSound={vi.fn()}
        onOpenLaunchDialog={vi.fn()}
        activeProbeCount={1}
        currentView="mission"
        onSwitchView={onSwitchView}
      />
    );

    const docsBtn = screen.getByText(/Docs \(Mintlify\)/i);
    fireEvent.click(docsBtn);
    expect(onSwitchView).toHaveBeenCalledWith("docs");
  });
});
