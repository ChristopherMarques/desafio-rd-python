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
      />
    );

    expect(screen.getByText(/Mars Probe/i)).toBeInTheDocument();
    expect(screen.getByText(/Mission Control/i)).toBeInTheDocument();
    expect(screen.getByText(/3 sondas ativas/i)).toBeInTheDocument();
    expect(screen.getByText(/API FastAPI Online \(8000\)/i)).toBeInTheDocument();
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
      />
    );

    expect(screen.getByText(/Simulador Local Ativo/i)).toBeInTheDocument();

    const soundBtn = screen.getByTitle(/Silenciar áudio/i);
    fireEvent.click(soundBtn);
    expect(onToggleSound).toHaveBeenCalledTimes(1);
  });
});
