import type {
  ApiErrorDetail,
  LaunchPayload,
  ProbeDetail,
  ProbeListResponse,
  ProbeState,
} from "@/types/probe";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export class ApiClientError extends Error {
  detail: ApiErrorDetail;
  status: number;

  constructor(status: number, detail: ApiErrorDetail) {
    super(detail.detail || "Erro na comunicação com a API");
    this.name = "ApiClientError";
    this.status = status;
    this.detail = detail;
  }
}

export const marsApi = {
  async checkHealth(): Promise<{ online: boolean; version?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { method: "GET" });
      if (!res.ok) return { online: false };
      const data = await res.json();
      return { online: true, version: data.version };
    } catch {
      return { online: false };
    }
  },

  async launchProbe(payload: LaunchPayload): Promise<ProbeState> {
    const res = await fetch(`${API_BASE_URL}/probes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errorData: ApiErrorDetail;
      try {
        const body = await res.json();
        errorData = body.detail || body;
      } catch {
        errorData = {
          detail: "Erro ao lançar sonda no planalto.",
          error_code: "API_COMMUNICATION_ERROR",
        };
      }
      throw new ApiClientError(res.status, errorData);
    }

    return res.json();
  },

  async moveProbe(probeId: string, commands: string): Promise<ProbeState> {
    const res = await fetch(`${API_BASE_URL}/probes/${probeId}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commands }),
    });

    if (!res.ok) {
      let errorData: ApiErrorDetail;
      try {
        const body = await res.json();
        errorData = body.detail || body;
      } catch {
        errorData = {
          detail: "Erro ao processar movimentação da sonda.",
          error_code: "API_COMMUNICATION_ERROR",
        };
      }
      throw new ApiClientError(res.status, errorData);
    }

    return res.json();
  },

  async listProbes(): Promise<ProbeState[]> {
    const res = await fetch(`${API_BASE_URL}/probes`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error("Falha ao recuperar a lista de sondas ativas.");
    }

    const data: ProbeListResponse = await res.json();
    return data.probes || [];
  },

  async getProbeDetail(probeId: string): Promise<ProbeDetail> {
    const res = await fetch(`${API_BASE_URL}/probes/${probeId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error(`Falha ao obter telemetria da sonda ${probeId}`);
    }

    return res.json();
  },
};
