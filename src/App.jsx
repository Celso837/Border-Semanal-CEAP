\
import React, { useMemo, useState } from "react";
import { addWeeks, format, isWithinInterval, startOfWeek, endOfWeek, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FileDown, Printer, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";

export type Metodo = "PIX" | "TED" | "Boleto" | "Dinheiro";
export type Status = "Pendente" | "Aprovado" | "Agendado" | "Pago";

export type ItemBordero = {
  id: string;
  fornecedor: string;
  descricao: string;
  centroCusto: string;
  banco: string;
  conta: string;
  metodo: Metodo;
  vencimento: string;
  valor: number;
  moeda: string;
  prioridade: 1 | 2 | 3;
  status: Status;
  incluir: boolean;
};

const exemplo: ItemBordero[] = [
  { id: "1", fornecedor: "Fornecedor A", descricao: "Serviços de limpeza", centroCusto: "Manutenção", banco: "Itaú", conta: "Operacional", metodo: "PIX", vencimento: new Date().toISOString(), valor: 3200, moeda: "BRL", prioridade: 1, status: "Aprovado", incluir: true },
  { id: "2", fornecedor: "Fornecedor B", descricao: "Material didático", centroCusto: "Educação", banco: "Bradesco", conta: "Projetos", metodo: "TED", vencimento: new Date().toISOString(), valor: 8200, moeda: "BRL", prioridade: 2, status: "Pendente", incluir: true },
  { id: "3", fornecedor: "Concessionária X", descricao: "Energia elétrica", centroCusto: "Utilidades", banco: "Itaú", conta: "Operacional", metodo: "Boleto", vencimento: new Date(Date.now()+2*86400000).toISOString(), valor: 5400, moeda: "BRL", prioridade: 1, status: "Aprovado", incluir: true },
  { id: "4", fornecedor: "Prestador Y", descricao: "Suporte de TI", centroCusto: "TI", banco: "Santander", conta: "Captação", metodo: "TED", vencimento: new Date(Date.now()+5*86400000).toISOString(), valor: 1500, moeda: "BRL", prioridade: 3, status: "Agendado", incluir: false },
];

const contas = [
  { banco: "Itaú", conta: "Operacional", saldoInicial: 25000 },
  { banco: "Bradesco", conta: "Projetos", saldoInicial: 18000 },
  { banco: "Santander", conta: "Captação", saldoInicial: 12000 },
];

const formatBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

function StatusBadge({ s }: { s: Status }) {
  const map: Record<Status, string> = {
    Pendente: "bg-yellow-100 text-yellow-800",
    Aprovado: "bg-green-100 text-green-800",
    Agendado: "bg-blue-100 text-blue-800",
    Pago: "bg-gray-200 text-gray-800",
  };
  return <Badge className={`rounded-2xl ${map[s]}`}>{s}</Badge>;
}

export default function App() {
  const [ref, setRef] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [dados, setDados] = useState<ItemBordero[]>(exemplo);
  const [filtroConta, setFiltroConta] = useState<string>("Todas");
  const [filtroStatus, setFiltroStatus] = useState<string>("Todos");
  const [busca, setBusca] = useState("");

  const periodo = {
    inicio: startOfWeek(ref, { weekStartsOn: 1 }),
    fim: endOfWeek(ref, { weekStartsOn: 1 }),
  };

  const semanaItens = useMemo(() =>
    dados.filter(i => isWithinInterval(parseISO(i.vencimento), { start: periodo.inicio, end: periodo.fim })),
  [dados, periodo.inicio, periodo.fim]);

  const filtrados = useMemo(() => semanaItens.filter(i => {
    const porConta = filtroConta === "Todas" ? true : `${i.banco} — ${i.conta}` === filtroConta;
    const porStatus = filtroStatus === "Todos" ? true : i.status === (filtroStatus as Status);
    const porBusca = [i.fornecedor, i.descricao, i.centroCusto].join(" ").toLowerCase().includes(busca.toLowerCase());
    return porConta && porStatus && porBusca;
  }), [semanaItens, filtroConta, filtroStatus, busca]);

  const incluidos = filtrados.filter(i => i.incluir);

  const totalSemana = incluidos.reduce((a, i) => a + i.valor, 0);
  const porBanco = React.useMemo(() => {
    const map = {};
    for (const i of incluidos) {
      const k = `${i.banco} — ${i.conta}`;
      map[k] = (map[k] || 0) + i.valor;
    }
    return Object.entries(map).map(([k, v]) => ({ conta: k, valor: v }));
  }, [incluidos]);

  const porMetodo = React.useMemo(() => {
    const map = {};
    for (const i of incluidos) map[i.metodo] = (map[i.metodo] || 0) + i.valor;
    return Object.entries(map).map(([m, v]) => ({ metodo: m, valor: v }));
  }, [incluidos]);

  const porCentro = React.useMemo(() => {
    const map = {};
    for (const i of incluidos) map[i.centroCusto] = (map[i.centroCusto] || 0) + i.valor;
    return Object.entries(map).map(([c, v]) => ({ centro: c, valor: v }));
  }, [incluidos]);

  const saldoProjetado = React.useMemo(() => {
    const byConta = {};
    for (const c of contas) {
      const k = `${c.banco} — ${c.conta}`;
      byConta[k] = { saldoInicial: c.saldoInicial, saidas: 0, saldoFinal: c.saldoInicial };
    }
    for (const i of incluidos) {
      const k = `${i.banco} — ${i.conta}`;
      if (!byConta[k]) byConta[k] = { saldoInicial: 0, saidas: 0, saldoFinal: 0 };
      byConta[k].saidas += i.valor;
      byConta[k].saldoFinal = byConta[k].saldoInicial - byConta[k].saidas;
    }
    return byConta;
  }, [incluidos]);

  const mover = (id, dir) => {
    setDados(prev => {
      const idx = prev.findIndex(i => i.id === id);
      if (idx === -1) return prev;
      const novo = [...prev];
      const alvo = dir === "up" ? Math.max(0, idx - 1) : Math.min(prev.length - 1, idx + 1);
      const tmp = novo[idx];
      novo[idx] = novo[alvo];
      novo[alvo] = tmp;
      return novo;
    });
  };

  const exportarCSV = () => {
    const header = ["fornecedor","descricao","centroCusto","banco","conta","metodo","vencimento","valor","status"]; 
    const linhas = incluidos.map(i => [i.fornecedor, i.descricao.replaceAll("\\n"," "), i.centroCusto, i.banco, i.conta, i.metodo, i.vencimento, String(i.valor).replace(".",","), i.status]);
    const csv = [header, ...linhas].map(r => r.map(v => `"${String(v).replaceAll('"','\\"')}"`).join(",")).join("\\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `bordero-semanal-${format(periodo.inicio, 'yyyy-MM-dd')}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const periodoLabel = `${format(periodo.inicio, "dd/MM", { locale: ptBR })} — ${format(periodo.fim, "dd/MM/yyyy", { locale: ptBR })}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[var(--brand)] text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-3">
          <div className="leading-tight">
            <div className="font-semibold">CEAP — Financeiro</div>
            <div className="text-xs opacity-90">Borderô semanal</div>
          </div>
          <div className="text-xs md:text-sm opacity-90">Apresentação</div>
        </div>
      </div>

      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold">Apresentação do Borderô — Semana</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setRef(addWeeks(ref, -1))}><ChevronLeft className="w-4 h-4 mr-1"/>Semana anterior</Button>
              <div className="px-3 py-2 rounded-md bg-white border text-sm">{periodoLabel}</div>
              <Button variant="outline" onClick={() => setRef(addWeeks(ref, 1))}>Próxima semana<ChevronRight className="w-4 h-4 ml-1"/></Button>
            </div>
          </header>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <Label>Buscar</Label>
                <Input placeholder="Fornecedor, descrição, centro de custo" value={busca} onChange={(e)=>setBusca(e.target.value)} />
              </div>
              <div>
                <Label>Conta</Label>
                <div className="space-y-1">
                  <div className="border rounded-md bg-white px-3 py-2">{filtroConta}</div>
                  <div className="flex gap-2 flex-wrap">
                    {["Todas", ...contas.map(c => `${c.banco} — ${c.conta}`)].map(v => (
                      <button key={v} onClick={()=>setFiltroConta(v)} className={`text-xs px-2 py-1 rounded border ${filtroConta===v?'bg-blue-600 text-white':'bg-white'}`}>{v}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <div className="flex gap-2 flex-wrap">
                  {['Todos','Pendente','Aprovado','Agendado','Pago'].map(s => (
                    <button key={s} onClick={()=>setFiltroStatus(s)} className={`text-xs px-2 py-1 rounded border ${filtroStatus===s?'bg-blue-600 text-white':'bg-white'}`}>{s}</button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Resumo da Semana</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Itens incluídos</span><b>{incluidos.length}</b></div>
                <div className="flex justify-between"><span>Valor total</span><b>{formatBRL(totalSemana)}</b></div>
                <div className="text-xs text-slate-500">Período: {periodoLabel}</div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={exportarCSV}><FileDown className="w-4 h-4 mr-2"/>Exportar CSV</Button>
                  <Button size="sm" onClick={() => window.print()}><Printer className="w-4 h-4 mr-2"/>Modo de apresentação</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Por Banco/Conta</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                {Object.entries(incluidos.reduce((acc, i) => { const k = `${i.banco} — ${i.conta}`; acc[k]=(acc[k]||0)+i.valor; return acc; }, {})).map(([k,v]) => (
                  <div key={k} className="flex justify-between"><span>{k}</span><b>{formatBRL(v)}</b></div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Saldo Projetado por Conta</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                {Object.entries(saldoProjetado).map(([k, v]) => (
                  <div key={k} className="flex justify-between"><span>{k}</span><span>{formatBRL(v.saldoInicial)} → <b>{formatBRL(v.saldoFinal)}</b></span></div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-lg">Itens do Borderô</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="min-w-full text-sm print:text-xs">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-2">Incluir</th>
                      <th className="py-2 pr-2">Prioridade</th>
                      <th className="py-2 pr-2">Fornecedor</th>
                      <th className="py-2 pr-2">Descrição</th>
                      <th className="py-2 pr-2">Centro</th>
                      <th className="py-2 pr-2">Conta</th>
                      <th className="py-2 pr-2">Método</th>
                      <th className="py-2 pr-2">Venc.</th>
                      <th className="py-2 pr-2">Valor</th>
                      <th className="py-2 pr-2">Status</th>
                      <th className="py-2 pr-2">Ord.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map(i => (
                      <tr key={i.id} className={`border-b ${!i.incluir ? 'opacity-50' : ''}`}>
                        <td className="py-2 pr-2"><Checkbox checked={i.incluir} onCheckedChange={(v)=> setDados(prev => prev.map(x => x.id===i.id?{...x, incluir: !!v}:x))} /></td>
                        <td className="py-2 pr-2">P{i.prioridade}</td>
                        <td className="py-2 pr-2 font-medium">{i.fornecedor}</td>
                        <td className="py-2 pr-2 max-w-[360px] truncate" title={i.descricao}>{i.descricao}</td>
                        <td className="py-2 pr-2">{i.centroCusto}</td>
                        <td className="py-2 pr-2">{i.banco} — {i.conta}</td>
                        <td className="py-2 pr-2">{i.metodo}</td>
                        <td className="py-2 pr-2">{format(parseISO(i.vencimento), "dd/MM", { locale: ptBR })}</td>
                        <td className="py-2 pr-2">{formatBRL(i.valor)}</td>
                        <td className="py-2 pr-2"><Badge className="bg-slate-200">{i.status}</Badge></td>
                        <td className="py-2 pr-2">
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={()=>mover(i.id,'up')}><ArrowUp className="w-4 h-4"/></Button>
                            <Button size="icon" variant="ghost" onClick={()=>mover(i.id,'down')}><ArrowDown className="w-4 h-4"/></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtrados.length===0 && (
                      <tr><td className="py-6 text-center text-slate-500" colSpan={11}>Nenhum item na semana.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm print:hidden">
            <CardHeader className="pb-2"><CardTitle className="text-lg">Relatórios rápidos</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <ResumoBox titulo="Por método" linhas={porMetodo.map(r => [r.metodo, formatBRL(r.valor)])} />
              <ResumoBox titulo="Por centro de custo" linhas={porCentro.map(r => [r.centro, formatBRL(r.valor)])} />
              <ResumoBox titulo="Por banco/conta" linhas={porBanco.map(r => [r.conta, formatBRL(r.valor)])} />
            </CardContent>
          </Card>

          <AtaAssinaturas total={formatBRL(totalSemana)} periodo={periodoLabel} />
          <style>{`@media print{ .print\\\\:hidden{ display:none } body{ background:#fff } }`}</style>
        </div>
      </div>
    </div>
  );
}

function ResumoBox({ titulo, linhas }){
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">{titulo}</CardTitle></CardHeader>
      <CardContent className="space-y-1">
        {linhas.length===0 && <div className="text-slate-500 text-sm">Sem dados.</div>}
        {linhas.map(([a,b]) => <div key={a} className="flex justify-between"><span>{a}</span><b>{b}</b></div>)}
      </CardContent>
    </Card>
  );
}

function AtaAssinaturas({ total, periodo }){
  return (
    <Card className="print:hidden">
      <CardHeader className="pb-2"><CardTitle className="text-base">Ata de Apresentação</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>Período: <b>{periodo}</b></div>
        <div>Valor total apresentado: <b>{total}</b></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <Assinatura linha="Preparado por:"/>
          <Assinatura linha="Conferido por:"/>
          <Assinatura linha="Aprovado por:"/>
          <Assinatura linha="Direção:"/>
        </div>
      </CardContent>
    </Card>
  );
}

function Assinatura({ linha }){
  return (
    <div className="h-24 border rounded-xl p-3 flex flex-col justify-end">
      <div className="border-t mt-auto" />
      <div className="text-xs text-slate-500 pt-1">{linha}</div>
    </div>
  );
}
