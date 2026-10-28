import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TelemetryPanel } from "@/components/mission-control/TelemetryPanel";
import type { ProbeState, PathHistoryStep } from "@/types/probe";

describe("TelemetryPanel Component", () => {
  const mockProbe: ProbeState = {
    id: "prb-xyz",
    x: 2,
    y: 3,
    direction: "EAST",
  };

  const mockHistory: PathHistoryStep[] = [
    { x: 0, y: 0, direction: "NORTH", action: "LANDING" },
    { x: 0, y: 1, direction: "NORTH", action: "MOVE" },
    { x: 1, y: 1, direction: "EAST", action: "MOVE" },
  ];

  it("renders empty state when probe is null", () => {
    render(
      <TelemetryPanel
        probe={null}
        maxX={5}
        maxY={5}
        pathHistory={[]}
      />
    );

    expect(screen.getByText(/Nenhuma sonda selecionada/i)).toBeInTheDocument();
  });

  it("renders probe coordinates and direction", () => {
    render(
      <TelemetryPanel
        probe={mockProbe}
        maxX={5}
        maxY={5}
        pathHistory={mockHistory}
      />
    );

    expect(screen.getByText("(2, 3)")).toBeInTheDocument();
    expect(screen.getByText("/ (5, 5)")).toBeInTheDocument();
    expect(screen.getAllByText("EAST").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Heading: 90°/i)).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument(); // total steps
  });
});
