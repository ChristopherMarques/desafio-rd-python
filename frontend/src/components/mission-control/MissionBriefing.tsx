import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BookOpen, Compass, ShieldAlert, Sparkles, Terminal } from "lucide-react";

export function MissionBriefing() {
  return (
    <Card className="w-full border-rd-navy-border/80 bg-rd-navy-card/90 shadow-xl backdrop-blur-md">
      <CardHeader className="pb-3 border-b border-rd-navy-border/60">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-rd-blue" />
            Manual de Operações da Missão
          </CardTitle>
          <Badge variant="blue" size="sm">
            Guia Rápido
          </Badge>
        </div>
        <CardDescription className="text-[11px] text-slate-400">
          Entenda como comandar as sondas no planalto marciano e validar as regras do desafio.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-3 space-y-3.5 text-xs">
        {/* Passo 1: Comandos Básicos */}
        <div className="p-2.5 rounded-lg bg-rd-navy-dark border border-rd-navy-border/70 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-200 text-[11px] uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5 text-rd-orange" />
            1. Instruções de Navegação
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono">
            <div className="bg-rd-navy-subtle p-1.5 rounded border border-slate-700/60 text-center">
              <span className="font-bold text-white block text-xs">M</span>
              <span className="text-slate-400 text-[10px]">Avançar 1x</span>
              <span className="text-blue-400 text-[9px] block">[W ou ↑]</span>
            </div>
            <div className="bg-rd-navy-subtle p-1.5 rounded border border-slate-700/60 text-center">
              <span className="font-bold text-white block text-xs">L</span>
              <span className="text-slate-400 text-[10px]">Girar 90° Esq</span>
              <span className="text-blue-400 text-[9px] block">[A ou ←]</span>
            </div>
            <div className="bg-rd-navy-subtle p-1.5 rounded border border-slate-700/60 text-center">
              <span className="font-bold text-white block text-xs">R</span>
              <span className="text-slate-400 text-[10px]">Girar 90° Dir</span>
              <span className="text-blue-400 text-[9px] block">[D ou →]</span>
            </div>
          </div>
        </div>

        {/* Passo 2: A Regra de Ouro da RD Station */}
        <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/30 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-red-300 text-[11px] uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            2. Regra de Ouro: Sonda Nunca Cai
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Se uma sequência tentar ultrapassar as bordas do planalto ou contiver comando inválido,
            a sonda <strong>interrompe imediatamente</strong> no último ponto seguro. A API salva
            o estado alcançado e responde com status <strong>HTTP 422</strong>.
          </p>
        </div>

        {/* Passo 3: Cenário da Especificação */}
        <div className="p-2.5 rounded-lg bg-rd-blue/10 border border-rd-blue/30 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-blue-300 text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-rd-blue" />
            3. Teste Oficial da RD Station
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            A sonda parte de <strong>(0, 0, NORTH)</strong>. Clique no preset <strong>MRM</strong> no console
            abaixo e envie: o resultado esperado na especificação é <strong>(1, 1, EAST)</strong>.
          </p>
        </div>

        {/* Passo 4: Coordenadas Cartesianas */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-rd-navy-subtle border border-rd-navy-border/60 text-[11px] text-slate-300">
          <Compass className="w-4 h-4 text-rd-teal flex-shrink-0" />
          <span>
            Malha Cartesiana: canto inferior esquerdo é <strong>(0, 0)</strong> e canto superior direito é <strong>(max_x, max_y)</strong>.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
