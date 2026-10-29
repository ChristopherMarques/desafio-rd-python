import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DocsReader } from "@/components/docs/DocsReader";

describe("DocsReader Component (Mintlify Style)", () => {
  it("renders doc reader with initial article and navigation categories", () => {
    const onBackToMission = vi.fn();
    render(<DocsReader onBackToMission={onBackToMission} initialSlug="architecture" />);

    expect(screen.getAllByText(/Arquitetura e Decisões de Engenharia/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Mintlify Style/i)).toBeInTheDocument();
    expect(screen.getByText(/Voltar ao Mission Control/i)).toBeInTheDocument();
  });

  it("filters articles when typing in search input", () => {
    render(<DocsReader onBackToMission={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText(/Buscar nas docs/i);
    fireEvent.change(searchInput, { target: { value: "Coolify" } });

    expect(screen.getByText(/Deploy Contínuo no Coolify via GHCR/i)).toBeInTheDocument();
  });

  it("switches article when clicking on sidebar navigation", () => {
    render(<DocsReader onBackToMission={vi.fn()} />);

    const solidLink = screen.getByText(/Princípios SOLID na Prática/i);
    fireEvent.click(solidLink);

    expect(screen.getAllByText(/Princípios SOLID na Prática/i).length).toBeGreaterThanOrEqual(1);
  });

  it("triggers onBackToMission when clicking back button", () => {
    const onBackToMission = vi.fn();
    render(<DocsReader onBackToMission={onBackToMission} />);

    const backBtn = screen.getByText(/Voltar ao Mission Control/i);
    fireEvent.click(backBtn);
    expect(onBackToMission).toHaveBeenCalledTimes(1);
  });
});
