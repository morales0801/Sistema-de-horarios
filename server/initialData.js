// Initial demo data with realistic shifts, departments, collaborators, and attendance

const departments = [
  'Atención al Cliente',
  'Ventas y Caja',
  'Operaciones y Almacén',
  'Cocina y Barra',
  'Soporte y Sistemas'
];

const initialShifts = [
  {
    id: 'shift-morning',
    name: 'Turno Mañana',
    code: 'M',
    startTime: '08:00',
    endTime: '16:00',
    durationHours: 8,
    color: '#0284c7', // sky-600
    bgColor: '#e0f2fe',
    borderColor: '#7dd3fc',
    textColor: '#0369a1',
    isBreak: false,
    isLeave: false
  },
  {
    id: 'shift-afternoon',
    name: 'Turno Tarde',
    code: 'T',
    startTime: '14:00',
    endTime: '22:00',
    durationHours: 8,
    color: '#d97706', // amber-600
    bgColor: '#fef3c7',
    borderColor: '#fcd34d',
    textColor: '#b45309',
    isBreak: false,
    isLeave: false
  },
  {
    id: 'shift-night',
    name: 'Turno Noche',
    code: 'N',
    startTime: '22:00',
    endTime: '06:00',
    durationHours: 8,
    color: '#7c3aed', // purple-600
    bgColor: '#f3e8ff',
    borderColor: '#d8b4fe',
    textColor: '#6d28d9',
    isBreak: false,
    isLeave: false
  },
  {
    id: 'shift-split',
    name: 'Turno Partido',
    code: 'P',
    startTime: '09:00',
    endTime: '19:00', // with 2h break
    durationHours: 8,
    color: '#059669', // emerald-600
    bgColor: '#d1fae5',
    borderColor: '#6ee7b7',
    textColor: '#047857',
    isBreak: false,
    isLeave: false
  },
  {
    id: 'shift-half',
    name: 'Media Jornada',
    code: 'MJ',
    startTime: '09:00',
    endTime: '13:00',
    durationHours: 4,
    color: '#0891b2', // cyan-600
    bgColor: '#cffafe',
    borderColor: '#67e8f9',
    textColor: '#0e7490',
    isBreak: false,
    isLeave: false
  },
  {
    id: 'shift-off',
    name: 'Día Libre / Descanso',
    code: 'LIBRE',
    startTime: '00:00',
    endTime: '00:00',
    durationHours: 0,
    color: '#64748b', // slate-500
    bgColor: '#f1f5f9',
    borderColor: '#cbd5e1',
    textColor: '#475569',
    isBreak: true,
    isLeave: false
  },
  {
    id: 'shift-vacation',
    name: 'Vacaciones',
    code: 'VAC',
    startTime: '00:00',
    endTime: '00:00',
    durationHours: 0,
    color: '#ea580c', // orange-600
    bgColor: '#ffedd5',
    borderColor: '#fdba74',
    textColor: '#c2410c',
    isBreak: false,
    isLeave: true
  },
  {
    id: 'shift-leave',
    name: 'Permiso Médico / Baja',
    code: 'BAJA',
    startTime: '00:00',
    endTime: '00:00',
    durationHours: 0,
    color: '#e11d48', // rose-600
    bgColor: '#ffe4e6',
    borderColor: '#fda4af',
    textColor: '#be123c',
    isBreak: false,
    isLeave: true
  }
];

const initialCollaborators = [
  {
    id: 'col-1',
    code: '1001',
    pin: '1234',
    name: 'Ana María Morales',
    email: 'ana.morales@empresa.com',
    phone: '+34 612 111 222',
    department: 'Atención al Cliente',
    role: 'Coordinadora de Turno',
    avatarColor: '#2563eb',
    targetWeeklyHours: 40,
    active: true
  },
  {
    id: 'col-2',
    code: '1002',
    pin: '1234',
    name: 'Carlos Andrés Vega',
    email: 'carlos.vega@empresa.com',
    phone: '+34 612 222 333',
    department: 'Atención al Cliente',
    role: 'Especialista de Servicio',
    avatarColor: '#059669',
    targetWeeklyHours: 40,
    active: true
  },
  {
    id: 'col-3',
    code: '1003',
    pin: '1234',
    name: 'Sofía Valenzuela',
    email: 'sofia.v@empresa.com',
    phone: '+34 612 333 444',
    department: 'Ventas y Caja',
    role: 'Supervisora de Cajas',
    avatarColor: '#d97706',
    targetWeeklyHours: 40,
    active: true
  },
  {
    id: 'col-4',
    code: '1004',
    pin: '1234',
    name: 'Diego Fernando Rivas',
    email: 'diego.rivas@empresa.com',
    phone: '+34 612 444 555',
    department: 'Ventas y Caja',
    role: 'Cajero / Atención',
    avatarColor: '#7c3aed',
    targetWeeklyHours: 32,
    active: true
  },
  {
    id: 'col-5',
    code: '1005',
    pin: '1234',
    name: 'Laura Patricia Gómez',
    email: 'laura.gomez@empresa.com',
    phone: '+34 612 555 666',
    department: 'Operaciones y Almacén',
    role: 'Responsable de Logística',
    avatarColor: '#dc2626',
    targetWeeklyHours: 40,
    active: true
  },
  {
    id: 'col-6',
    code: '1006',
    pin: '1234',
    name: 'Mateo Alejandro Torres',
    email: 'mateo.t@empresa.com',
    phone: '+34 612 666 777',
    department: 'Operaciones y Almacén',
    role: 'Operador de Stock',
    avatarColor: '#0891b2',
    targetWeeklyHours: 40,
    active: true
  },
  {
    id: 'col-7',
    code: '1007',
    pin: '1234',
    name: 'Valentina Restrepo',
    email: 'valentina.r@empresa.com',
    phone: '+34 612 777 888',
    department: 'Cocina y Barra',
    role: 'Jefa de Cocina',
    avatarColor: '#ea580c',
    targetWeeklyHours: 40,
    active: true
  },
  {
    id: 'col-8',
    code: '1008',
    pin: '1234',
    name: 'Javier Enrique Soto',
    email: 'javier.soto@empresa.com',
    phone: '+34 612 888 999',
    department: 'Cocina y Barra',
    role: 'Barista / Ayudante',
    avatarColor: '#4f46e5',
    targetWeeklyHours: 30,
    active: true
  }
];

function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateSeedSchedules() {
  const schedules = [];
  const now = new Date();
  
  // Calculate current Monday
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const shiftRotation = [
    { colId: 'col-1', pattern: ['shift-morning', 'shift-morning', 'shift-morning', 'shift-morning', 'shift-morning', 'shift-off', 'shift-off'] },
    { colId: 'col-2', pattern: ['shift-off', 'shift-afternoon', 'shift-afternoon', 'shift-afternoon', 'shift-afternoon', 'shift-afternoon', 'shift-off'] },
    { colId: 'col-3', pattern: ['shift-split', 'shift-morning', 'shift-split', 'shift-morning', 'shift-split', 'shift-off', 'shift-off'] },
    { colId: 'col-4', pattern: ['shift-afternoon', 'shift-afternoon', 'shift-afternoon', 'shift-afternoon', 'shift-off', 'shift-off', 'shift-off'] },
    { colId: 'col-5', pattern: ['shift-night', 'shift-night', 'shift-night', 'shift-night', 'shift-night', 'shift-off', 'shift-off'] },
    { colId: 'col-6', pattern: ['shift-morning', 'shift-morning', 'shift-afternoon', 'shift-afternoon', 'shift-afternoon', 'shift-morning', 'shift-off'] },
    { colId: 'col-7', pattern: ['shift-vacation', 'shift-vacation', 'shift-vacation', 'shift-vacation', 'shift-vacation', 'shift-off', 'shift-off'] },
    { colId: 'col-8', pattern: ['shift-half', 'shift-half', 'shift-half', 'shift-half', 'shift-half', 'shift-half', 'shift-off'] }
  ];

  for (let w = -1; w <= 1; w++) {
    const weekMonday = new Date(monday);
    weekMonday.setDate(monday.getDate() + (w * 7));

    shiftRotation.forEach(rot => {
      rot.pattern.forEach((shiftId, dayIdx) => {
        const curDate = new Date(weekMonday);
        curDate.setDate(weekMonday.getDate() + dayIdx);
        const dateStr = formatDate(curDate);

        schedules.push({
          id: `sch-${rot.colId}-${dateStr}`,
          collaboratorId: rot.colId,
          date: dateStr,
          shiftId: shiftId,
          notes: shiftId === 'shift-vacation' ? 'Vacaciones anuales autorizadas' : ''
        });
      });
    });
  }

  return schedules;
}

function generateSeedAttendance() {
  const now = new Date();
  const todayStr = formatDate(now);

  return [
    // Ana Morales: Full morning shift completed
    {
      id: `att-col-1-1`,
      collaboratorId: 'col-1',
      date: todayStr,
      type: 'in',
      timestamp: `${todayStr}T07:58:20.000Z`,
      time: '07:58:20',
      device: 'PC-Recepción 01',
      notes: 'Llegada puntual'
    },
    {
      id: `att-col-1-2`,
      collaboratorId: 'col-1',
      date: todayStr,
      type: 'break_start',
      timestamp: `${todayStr}T12:30:15.000Z`,
      time: '12:30:15',
      device: 'PC-Recepción 01',
      notes: ''
    },
    {
      id: `att-col-1-3`,
      collaboratorId: 'col-1',
      date: todayStr,
      type: 'break_end',
      timestamp: `${todayStr}T13:15:20.000Z`,
      time: '13:15:20',
      device: 'PC-Recepción 01',
      notes: ''
    },
    {
      id: `att-col-1-4`,
      collaboratorId: 'col-1',
      date: todayStr,
      type: 'out',
      timestamp: `${todayStr}T16:02:10.000Z`,
      time: '16:02:10',
      device: 'PC-Recepción 01',
      notes: 'Fin de jornada'
    },

    // Mateo Torres: Morning shift with slight delay, currently working
    {
      id: `att-col-6-1`,
      collaboratorId: 'col-6',
      date: todayStr,
      type: 'in',
      timestamp: `${todayStr}T08:14:05.000Z`,
      time: '08:14:05',
      device: 'PC-Almacén',
      notes: 'Tráfico pesado en acceso'
    },
    {
      id: `att-col-6-2`,
      collaboratorId: 'col-6',
      date: todayStr,
      type: 'break_start',
      timestamp: `${todayStr}T13:00:00.000Z`,
      time: '13:00:00',
      device: 'PC-Almacén',
      notes: ''
    },
    {
      id: `att-col-6-3`,
      collaboratorId: 'col-6',
      date: todayStr,
      type: 'break_end',
      timestamp: `${todayStr}T13:45:00.000Z`,
      time: '13:45:00',
      device: 'PC-Almacén',
      notes: ''
    },

    // Carlos Vega: Afternoon shift, started at 13:55, currently working
    {
      id: `att-col-2-1`,
      collaboratorId: 'col-2',
      date: todayStr,
      type: 'in',
      timestamp: `${todayStr}T13:55:30.000Z`,
      time: '13:55:30',
      device: 'PC-Mostrador 02',
      notes: 'Apertura de turno de tarde'
    },

    // Diego Rivas: Afternoon shift, started at 14:02, currently working
    {
      id: `att-col-4-1`,
      collaboratorId: 'col-4',
      date: todayStr,
      type: 'in',
      timestamp: `${todayStr}T14:02:40.000Z`,
      time: '14:02:40',
      device: 'PC-Caja 01',
      notes: ''
    },

    // Sofia Valenzuela: Split shift, entered pause
    {
      id: `att-col-3-1`,
      collaboratorId: 'col-3',
      date: todayStr,
      type: 'in',
      timestamp: `${todayStr}T08:58:10.000Z`,
      time: '08:58:10',
      device: 'PC-Supervisión',
      notes: ''
    },
    {
      id: `att-col-3-2`,
      collaboratorId: 'col-3',
      date: todayStr,
      type: 'break_start',
      timestamp: `${todayStr}T13:30:00.000Z`,
      time: '13:30:00',
      device: 'PC-Supervisión',
      notes: 'Pausa intermedia de turno partido'
    }
  ];
}

module.exports = {
  departments,
  initialShifts,
  initialCollaborators,
  generateSeedSchedules,
  generateSeedAttendance
};
