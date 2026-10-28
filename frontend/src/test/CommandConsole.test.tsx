import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CommandConsole } from "@/components/mission-control/CommandConsole";

describe("CommandConsole Component", () => {
  const defaultProps = {
    onExecuteCommand: vi.fn(),
    onExecuteSequence: vi.fn(),
    onStepByStepSequence: vi.fn(),
    isLoading: false,
    isSimulating: false,
    disabled: false,
    lastError: null,
    onClearError: vi.fn(),
  };

  it("renders manual command buttons (M, L, R)", () => {
    render(<CommandConsole {...defaultProps} />);

    expect(screen.getByText(/M \(Avançar\)/i)).toBeInTheDocument();
    expect(screen.getByText(/L \(Girar Esq\)/i)).toBeInTheDocument();
    expect(screen.getByText(/R \(Girar Dir\)/i)).toBeInTheDocument();
  });

  it("calls onExecuteCommand when clicking manual buttons", () => {
    const onExecuteCommand = vi.fn();
    render(<CommandConsole {...defaultProps} onExecuteCommand={onExecuteCommand} />);

    fireEvent.click(screen.getByText(/M \(Avançar\)/i));
    expect(onExecuteCommand).toHaveBeenCalledWith("M");

    fireEvent.click(screen.getByText(/L \(Girar Esq\)/i));
    expect(onExecuteCommand).toHaveBeenCalledWith("L");

    fireEvent.click(screen.getByText(/R \(Girar Dir\)/i));
    expect(onExecuteCommand).toHaveBeenCalledWith("R");
  });

  it("submits sequence when clicking Enviar API button", () => {
    const onExecuteSequence = vi.fn();
    render(<CommandConsole {...defaultProps} onExecuteSequence={onExecuteSequence} />);

    const input = screen.getByPlaceholderText(/Ex: MRM/i);
    fireEvent.change(input, { target: { value: "LMLMLMLMM" } });

    const submitBtn = screen.getByText(/Enviar API/i);
    fireEvent.click(submitBtn);

    expect(onExecuteSequence).toHaveBeenCalledWith("LMLMLMLMM");
  });

  it("sets preset when clicking MRM preset button", () => {
    render(<CommandConsole {...defaultProps} />);

    const presetBtn = screen.getByText(/MRM \(Desafio RD\)/i);
    fireEvent.click(presetBtn);

    const input = screen.getByPlaceholderText(/Ex: MRM/i) as HTMLInputElement;
    expect(input.value).toBe("MRM");
  });

  it("renders and dismisses error banner when lastError is present", () => {
    const onClearError = vi.fn();
    render(
      <CommandConsole
        {...defaultProps}
        lastError="A sonda colidiu com a fronteira do planalto"
        onClearError={onClearError}
      />
    );

    expect(
      screen.getByText(/A sonda colidiu com a fronteira do planalto/i)
    ).toBeInTheDocument();

    const closeBtn = screen.getByText(/Fechar/i);
    fireEvent.click(closeBtn);
    expect(onClearError).toHaveBeenCalledTimes(1);
  });
});
