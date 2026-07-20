import React from 'react';
import {
  Headphones,
  AlertTriangle,
  Wrench,
  Clock,
  RefreshCw,
} from 'lucide-react';

const cards = [
  {
    icon: AlertTriangle,
    badge: 'Jira ↗',
    label: 'Gestión de incidentes',
    title: 'Reportar un problema en el sistema',
    description:
      'Informa errores de acceso, registro de clientes, consultas, citas, farmacia, estética u otros módulos del sistema Vet Pets David.',
    href: 'https://amycastillodavila.atlassian.net/servicedesk/customer/portal/1/group/7/create/8',
  },
  {
    icon: Wrench,
    badge: 'Jira ↗',
    label: 'Solicitud de cambios',
    title: 'Solicitar un cambio en el sistema',
    description:
      'Solicita mejoras, nuevas funcionalidades o modificaciones en los módulos existentes.',
    href: 'https://amycastillodavila.atlassian.net/servicedesk/customer/portal/1/group/4/create/11',
  },
  {
    icon: Clock,
    badge: 'Jira ↗',
    label: 'Disponibilidad',
    title: 'Gestión de disponibilidad del servicio',
    description:
      'Registra caídas, lentitud, errores de conexión o afectaciones que impidan el uso normal del sistema.',
    href: 'https://amycastillodavila.atlassian.net/servicedesk/customer/portal/1/group/5/create/13',
  },
  {
    icon: RefreshCw,
    badge: 'Jira ↗',
    label: 'Continuidad',
    title: 'Continuidad del servicio',
    description:
      'Reporta eventos que afecten la continuidad operativa del sistema o requieran plan de recuperación.',
    href: 'https://amycastillodavila.atlassian.net/servicedesk/customer/portal/1/group/6/create/12',
  },
];

function Card({ icon, badge, label, title, description, href }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex flex-col relative hover:shadow-md transition">
      <span className="absolute top-3 right-3 bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded">
        {badge}
      </span>
      <div className="mb-3">
        {React.createElement(icon, { className: 'w-6 h-6 text-slate-800' })}
      </div>
      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
        {label}
      </span>
      <h3 className="text-slate-800 font-semibold mb-2">{title}</h3>
      <p className="text-slate-500 text-sm mb-5 flex-1">{description}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm font-medium text-sm"
      >
        Abrir formulario ↗
      </a>
    </div>
  );
}

export default function SupportPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Soporte</h1>
        <p className="text-slate-500 mt-1">
          Reporta incidentes, solicita cambios o registra eventos relacionados con la continuidad y disponibilidad del sistema.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex items-start gap-4 max-w-2xl">
        <div className="bg-slate-100 rounded-lg p-2.5 shrink-0">
          <Headphones className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <p className="text-slate-700 font-semibold text-sm">
            Atención mediante Jira Service Management
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Al abrir el formulario, Jira puede solicitar iniciar sesión con un correo personal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Card key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}
