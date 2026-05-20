import { useState } from 'react';
import { useIncomeReport } from './useBilling';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, FileText, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('este_mes');

  let dateFrom, dateTo;
  const today = new Date();

  if (dateRange === 'este_mes') {
    dateFrom = format(startOfMonth(today), 'yyyy-MM-dd');
    dateTo = format(endOfMonth(today), 'yyyy-MM-dd');
  } else if (dateRange === 'mes_anterior') {
    const lastMonth = subMonths(today, 1);
    dateFrom = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
    dateTo = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
  } else {
    dateFrom = format(subDays(today, 30), 'yyyy-MM-dd');
    dateTo = format(today, 'yyyy-MM-dd');
  }

  const { data: report, isLoading } = useIncomeReport(dateFrom, dateTo, 'dia');

  if (isLoading) return <div className="p-8 text-center text-slate-500">Cargando reporte...</div>;

  const totalIngresos = report?.timeline?.reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0) || 0;
  const totalFacturas = report?.timeline?.length || 0;
  const ticketPromedio = totalFacturas > 0 ? totalIngresos / totalFacturas : 0;

  const chartData = report?.timeline?.map(item => ({
    name: format(new Date(item.date), 'dd/MM'),
    Ingresos: parseFloat(item.total_amount)
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="font-bold text-slate-700">Reporte de Ingresos</h2>
        <select 
          value={dateRange} 
          onChange={e => setDateRange(e.target.value)}
          className="border rounded px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="este_mes">Este mes</option>
          <option value="mes_anterior">Mes anterior</option>
          <option value="ultimos_30">Últimos 30 días</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4">
          <div className="p-4 bg-emerald-100 rounded-full text-emerald-600"><DollarSign className="w-8 h-8"/></div>
          <div>
            <p className="text-slate-500 text-sm font-semibold">Total Ingresos</p>
            <p className="text-2xl font-bold text-slate-800">${totalIngresos.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4">
          <div className="p-4 bg-blue-100 rounded-full text-blue-600"><FileText className="w-8 h-8"/></div>
          <div>
            <p className="text-slate-500 text-sm font-semibold">Días con cobros</p>
            <p className="text-2xl font-bold text-slate-800">{totalFacturas}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4">
          <div className="p-4 bg-amber-100 rounded-full text-amber-600"><TrendingUp className="w-8 h-8"/></div>
          <div>
            <p className="text-slate-500 text-sm font-semibold">Ticket Diario Promedio</p>
            <p className="text-2xl font-bold text-slate-800">${ticketPromedio.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white p-6 rounded-lg shadow-sm border">
           <h3 className="font-bold text-slate-700 mb-6">Tendencia de Ingresos</h3>
           <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `$${value}`} />
                 <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                 <Bar dataKey="Ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
           <h3 className="font-bold text-slate-700 mb-4">Desglose por Servicio</h3>
           <div className="space-y-4">
             {report?.breakdown?.length === 0 ? (
                <p className="text-center text-slate-400 py-4">No hay datos</p>
             ) : (
               report?.breakdown?.map(item => (
                 <div key={item.item_type} className="flex justify-between items-center border-b pb-2 last:border-0">
                   <span className="capitalize font-medium text-slate-600">{item.item_type.replace('_', ' ')}</span>
                   <span className="font-bold text-slate-800">${parseFloat(item.total_amount).toFixed(2)}</span>
                 </div>
               ))
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
