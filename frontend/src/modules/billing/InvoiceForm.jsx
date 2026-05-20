import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateInvoice } from './useBilling';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useClients } from '../clients/useClients';
import Select from 'react-select';

const schema = z.object({
  client_id: z.string().min(1, 'El cliente es requerido'),
  pet_id: z.string().optional(),
  notes: z.string().optional(),
});

export default function InvoiceForm({ onClose }) {
  const [selectedClient, setSelectedClient] = useState(null);
  const { data: clientsData } = useClients({ limit: 100 });
  const clients = clientsData?.clients || [];
  const createInvoice = useCreateInvoice();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const clientOptions = clients.map(c => ({ value: c.id, label: c.full_name, pets: c.pets }));

  const onSubmit = async (data) => {
    try {
      await createInvoice.mutateAsync(data);
      toast.success('Factura borrador creada');
      onClose();
    } catch (error) {
      toast.error('Error al crear factura');
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '100%', maxWidth: '500px', padding: '24px' }}>
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <h2 className="text-xl font-bold text-slate-800">Nueva Factura</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente *</label>
            <Select 
              options={clientOptions}
              onChange={(opt) => {
                setSelectedClient(opt);
                setValue('client_id', opt.value);
                setValue('pet_id', '');
              }}
              placeholder="Buscar cliente..."
            />
            {errors.client_id && <span className="text-red-500 text-sm">{errors.client_id.message}</span>}
          </div>

          {selectedClient && selectedClient.pets && selectedClient.pets.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mascota asociada (opcional)</label>
              <select {...register('pet_id')} className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Ninguna --</option>
                {selectedClient.pets.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
            <textarea {...register('notes')} rows={3} className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button type="submit" disabled={createInvoice.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {createInvoice.isPending ? 'Guardando...' : 'Crear Factura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
