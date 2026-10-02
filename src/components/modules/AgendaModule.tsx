import React, { useState } from 'react';
import { Patient, Appointment, UnitConfig } from '../../types';
import { DB, uid, checkOverlapAppointments, fechaCorta, timeToMinutes, minutesToTime } from '../../utils/storage';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Share2,
  Trash2,
  Edit,
  X,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';

interface AgendaModuleProps {
  appointments: Appointment[];
  patients: Patient[];
  config: UnitConfig;
  onRefresh: () => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const AgendaModule: React.FC<AgendaModuleProps> = ({
  appointments,
  patients,
  config,
  onRefresh,
  onNotify,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [filterType, setFilterType] = useState<'proximas' | 'todas' | 'pasadas'>('proximas');
  const [selectedDayString, setSelectedDayString] = useState<string | null>(null);

  // Modal appointment
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);
  const [patientMode, setPatientMode] = useState<'registered' | 'free'>('registered');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [freeName, setFreeName] = useState('');
  const [aptDate, setAptDate] = useState('');
  const [aptTime, setAptTime] = useState('09:00');
  const [aptDuration, setAptDuration] = useState(60);
  const [aptModality, setAptModality] = useState<'Presencial' | 'Virtual' | 'Telefónica'>('Presencial');
  const [aptNotes, setAptNotes] = useState('');

  // Reminder modal
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderText, setReminderText] = useState('');
  const [copied, setCopied] = useState(false);

  const patientsMap = React.useMemo(() => {
    const map: Record<string, Patient> = {};
    patients.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [patients]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const meses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay(); // 0 is Domingo
  const daysInMonth = lastDay.getDate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const apptsByDay: Record<string, Appointment[]> = {};
  appointments.forEach((a) => {
    const key = String(a.date || '').slice(0, 10);
    if (!key) return;
    if (!apptsByDay[key]) apptsByDay[key] = [];
    apptsByDay[key].push(a);
  });

  const changeMonth = (delta: number) => {
    const n = new Date(currentDate);
    n.setMonth(n.getMonth() + delta);
    setCurrentDate(n);
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  const openNewAptModal = (defaultDate?: string) => {
    setEditingApt(null);
    setPatientMode('registered');
    setSelectedPatientId(patients[0]?.id || '');
    setFreeName('');
    setAptDate(defaultDate || new Date().toISOString().slice(0, 10));
    setAptTime('09:00');
    setAptDuration(60);
    setAptModality('Presencial');
    setAptNotes('');
    setModalOpen(true);
  };

  const openEditAptModal = (apt: Appointment) => {
    setEditingApt(apt);
    setPatientMode(apt.free_name ? 'free' : 'registered');
    setSelectedPatientId(apt.patient_id || '');
    setFreeName(apt.free_name || '');
    setAptDate(apt.date);
    setAptTime(apt.time);
    setAptDuration(apt.duration || 60);
    setAptModality(apt.modality);
    setAptNotes(apt.notes || '');
    setModalOpen(true);
  };

  // Conflictos en vivo
  const liveConflicts = checkOverlapAppointments(
    appointments,
    aptDate,
    aptTime,
    aptDuration,
    editingApt?.id,
    patientsMap
  );

  const handleSaveAppointment = () => {
    if (!aptDate || !aptTime) {
      onNotify('Fecha y hora son obligatorias.', 'warning');
      return;
    }

    if (patientMode === 'free' && !freeName.trim()) {
      onNotify('Ingrese el nombre del paciente.', 'warning');
      return;
    }
    if (patientMode === 'registered' && !selectedPatientId) {
      onNotify('Seleccione un paciente de la lista.', 'warning');
      return;
    }

    if (liveConflicts.length > 0) {
      const list = liveConflicts.map((c) => `• ${c.hora} - ${c.horaFin}: ${c.paciente}`).join('\n');
      if (!window.confirm(`⚠️ CHOQUE DE HORARIOS:\nYa existe(n) cita(s) en ese rango:\n${list}\n\n¿Desea agendarla de todas maneras?`)) {
        return;
      }
    }

    const data: Appointment = {
      id: editingApt ? editingApt.id : uid(),
      patient_id: patientMode === 'registered' ? selectedPatientId : undefined,
      free_name: patientMode === 'free' ? freeName.trim() : undefined,
      date: aptDate,
      time: aptTime,
      duration: Number(aptDuration) || 60,
      modality: aptModality,
      notes: aptNotes.trim(),
      created_at: editingApt ? editingApt.created_at : new Date().toISOString(),
      modified_at: new Date().toISOString(),
    };

    const currentApts = DB.getAppointments();
    if (editingApt) {
      const idx = currentApts.findIndex((x) => x.id === editingApt.id);
      if (idx >= 0) currentApts[idx] = data;
    } else {
      currentApts.push(data);
    }

    DB.saveAppointments(currentApts);
    onRefresh();
    setModalOpen(false);
    onNotify('Cita agendada correctamente.', 'success');
  };

  const handleDeleteApt = (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar esta cita de la agenda?')) return;
    const currentApts = DB.getAppointments().filter((x) => x.id !== id);
    DB.saveAppointments(currentApts);
    onRefresh();
    onNotify('Cita eliminada.', 'info');
  };

  const handleOpenReminder = (apt: Appointment) => {
    const pat = apt.patient_id ? patientsMap[apt.patient_id] : null;
    const nombre = pat ? pat.prim_nombre || pat.names : apt.free_name || 'Paciente';
    const cleanDate = fechaCorta(apt.date);

    const text = `Hola ${nombre}, le recordamos su próxima consulta psicológica:\n\n📅 Fecha: ${cleanDate}\n⏰ Hora: ${apt.time} (${apt.duration || 60} minutos)\n📍 Modalidad: ${apt.modality}\n👤 Profesional: ${config.prof_names || 'Psicólogo Clínico'}\n🏥 Unidad: ${config.unit_name || 'Consulta Externa'}\n\nPor favor confirme su asistencia. ¡Le esperamos!`;

    setReminderText(text);
    setCopied(false);
    setReminderModalOpen(true);
  };

  const handleCopyReminder = () => {
    navigator.clipboard.writeText(reminderText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onNotify('Mensaje copiado al portapapeles.', 'success');
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(reminderText)}`, '_blank');
  };

  // Filtrado de citas
  const now = new Date();
  let listAppointments = [...appointments].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  if (filterType === 'proximas') {
    listAppointments = listAppointments.filter((a) => new Date(`${a.date}T${a.time || '00:00'}`) >= now);
  } else if (filterType === 'pasadas') {
    listAppointments = listAppointments.filter((a) => new Date(`${a.date}T${a.time || '00:00'}`) < now);
  }

  return (
    <div className="space-y-5">
      {/* Contenedor Calendario */}
      <div className="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-light)] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h1 className="text-base font-bold text-[var(--color-text-primary)] capitalize">
              {meses[month]} {year}
            </h1>
            <button
              onClick={() => changeMonth(1)}
              className="p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-light)] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={goToday}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[var(--color-bg-light)] border border-[var(--color-border)] hover:bg-[var(--color-primary)] hover:text-white cursor-pointer transition-all"
            >
              Hoy
            </button>
          </div>

          <button
            onClick={() => openNewAptModal()}
            className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Cita</span>
          </button>
        </div>

        {/* Grilla Mensual */}
        <div className="border border-[var(--color-border)] rounded-xl overflow-hidden bg-white">
          <div className="grid grid-cols-7 bg-[var(--color-bg-light)] text-[var(--color-text-secondary)] font-bold text-[11px] text-center py-2 border-b border-[var(--color-border)]">
            <span>DOM</span>
            <span>LUN</span>
            <span>MAR</span>
            <span>MIÉ</span>
            <span>JUE</span>
            <span>VIE</span>
            <span>SÁB</span>
          </div>

          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[var(--color-border)]">
            {Array.from({ length: 42 }).map((_, idx) => {
              const dayNum = idx - startDow + 1;
              if (dayNum < 1 || dayNum > daysInMonth) {
                return <div key={idx} className="h-24 bg-gray-50/50" />;
              }

              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;
              const dayAppts = apptsByDay[dateStr] || [];
              const hasAppts = dayAppts.length > 0;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDayString(dateStr)}
                  className={`h-24 p-1.5 transition-all cursor-pointer relative flex flex-col justify-between ${
                    isToday ? 'bg-amber-50/60 font-bold' : hasAppts ? 'bg-emerald-50/30' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-[var(--color-primary)] text-white' : 'text-gray-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {hasAppts && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[var(--color-primary)] text-white">
                        {dayAppts.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5 overflow-hidden">
                    {dayAppts.slice(0, 2).map((a) => {
                      const pat = a.patient_id ? patientsMap[a.patient_id] : null;
                      const nombre = pat ? pat.names.split(' ')[0] : a.free_name || 'Paciente';
                      return (
                        <div
                          key={a.id}
                          className="text-[9px] truncate px-1 py-0.2 rounded bg-[var(--color-primary-light)]/25 text-[var(--color-primary-dark)] font-medium"
                          title={`${a.time} - ${nombre}`}
                        >
                          {a.time} {nombre}
                        </div>
                      );
                    })}
                    {dayAppts.length > 2 && (
                      <div className="text-[8.5px] text-[var(--color-primary)] font-bold pl-1">
                        +{dayAppts.length - 2} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista inferior con filtros */}
        <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('proximas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  filterType === 'proximas'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Próximas Citas ({appointments.filter((a) => new Date(`${a.date}T${a.time}`) >= now).length})
              </button>
              <button
                onClick={() => setFilterType('todas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  filterType === 'todas'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas ({appointments.length})
              </button>
              <button
                onClick={() => setFilterType('pasadas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  filterType === 'pasadas'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pasadas ({appointments.filter((a) => new Date(`${a.date}T${a.time}`) < now).length})
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {listAppointments.length === 0 ? (
              <div className="text-center py-6 text-xs text-[var(--color-text-secondary)]">
                No hay citas en esta categoría.
              </div>
            ) : (
              listAppointments.map((apt) => {
                const pat = apt.patient_id ? patientsMap[apt.patient_id] : null;
                const nombre = pat ? pat.names : apt.free_name || 'Paciente sin HC';
                const dt = new Date(`${apt.date}T${apt.time || '00:00'}`);
                const isPast = dt < now;

                return (
                  <div
                    key={apt.id}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                      isPast ? 'bg-gray-50 border-gray-200 opacity-70' : 'bg-white border-[var(--color-border)] shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                        <span>{nombre}</span>
                        {apt.auto_generated && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-semibold">
                            Auto
                          </span>
                        )}
                        {!apt.patient_id && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 font-semibold">
                            Sin HC
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 flex flex-wrap gap-x-3">
                        <span>📅 {fechaCorta(apt.date)}</span>
                        <span>⏰ {apt.time} ({apt.duration} min)</span>
                        <span>📍 {apt.modality}</span>
                        {pat && <span>CI: {pat.cedula}</span>}
                      </div>
                      {apt.notes && <div className="text-[11px] text-gray-500 italic mt-0.5">{apt.notes}</div>}
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleOpenReminder(apt)}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg flex items-center gap-1 cursor-pointer"
                        title="Generar recordatorio"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Recordatorio</span>
                      </button>
                      <button
                        onClick={() => openEditAptModal(apt)}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteApt(apt.id)}
                        className="p-1.5 bg-gray-100 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal Inspector del Día */}
      {selectedDayString && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border shadow-2xl p-5 text-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-sm font-bold text-[var(--color-primary-dark)]">
                Citas del día: {fechaCorta(selectedDayString)}
              </h2>
              <button onClick={() => setSelectedDayString(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {(apptsByDay[selectedDayString] || []).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay citas agendadas para esta fecha.
                </div>
              ) : (
                (apptsByDay[selectedDayString] || []).map((a) => {
                  const pat = a.patient_id ? patientsMap[a.patient_id] : null;
                  const nombre = pat ? pat.names : a.free_name || 'Paciente';
                  return (
                    <div key={a.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                      <div>
                        <strong>{a.time} - {nombre}</strong>
                        <div className="text-[11px] text-gray-500">
                          {a.modality} · {a.duration} min
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setSelectedDayString(null);
                            handleOpenReminder(a);
                          }}
                          className="p-1.5 bg-white border rounded text-blue-600"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDayString(null);
                            openEditAptModal(a);
                          }}
                          className="p-1.5 bg-white border rounded text-gray-700"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-between border-t pt-3">
              <button
                type="button"
                onClick={() => setSelectedDayString(null)}
                className="px-3 py-1.5 bg-gray-100 rounded-lg text-gray-700 font-medium"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  const day = selectedDayString;
                  setSelectedDayString(null);
                  openNewAptModal(day);
                }}
                className="px-4 py-1.5 bg-[var(--color-primary)] text-white rounded-lg font-bold"
              >
                + Agendar en este día
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear / Editar Cita */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border shadow-2xl p-5 text-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-sm font-bold text-[var(--color-primary-dark)]">
                {editingApt ? 'Editar Cita' : 'Agendar Nueva Cita'}
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div>
              <label className="block font-semibold mb-1">Tipo de Paciente</label>
              <select
                value={patientMode}
                onChange={(e) => setPatientMode(e.target.value as any)}
                className="w-full px-3 py-1.5 border rounded-lg"
              >
                <option value="registered">👤 Paciente Registrado en Admisión</option>
                <option value="free">➕ Paciente no Registrado (Escribir Nombre)</option>
              </select>
            </div>

            {patientMode === 'registered' ? (
              <div>
                <label className="block font-semibold mb-1">Seleccionar Paciente *</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg"
                >
                  <option value="">-- Seleccione --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.names} (CI: {p.cedula})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block font-semibold mb-1">Nombre Completo del Paciente *</label>
                <input
                  type="text"
                  value={freeName}
                  onChange={(e) => setFreeName(e.target.value)}
                  placeholder="Ej: Sofía Valentina Andrade"
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Fecha *</label>
                <input
                  type="date"
                  value={aptDate}
                  onChange={(e) => setAptDate(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Hora *</label>
                <input
                  type="time"
                  value={aptTime}
                  onChange={(e) => setAptTime(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Duración (min)</label>
                <input
                  type="number"
                  value={aptDuration}
                  onChange={(e) => setAptDuration(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Modalidad</label>
                <select
                  value={aptModality}
                  onChange={(e) => setAptModality(e.target.value as any)}
                  className="w-full px-3 py-1.5 border rounded-lg"
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Virtual">Virtual</option>
                  <option value="Telefónica">Telefónica</option>
                </select>
              </div>
            </div>

            {liveConflicts.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Conflicto de Horario Detectado:</span>
                </div>
                {liveConflicts.map((c) => (
                  <div key={c.id}>
                    • {c.hora} a {c.horaFin}: <strong>{c.paciente}</strong>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block font-semibold mb-1">Notas / Motivo de la Cita</label>
              <textarea
                rows={2}
                value={aptNotes}
                onChange={(e) => setAptNotes(e.target.value)}
                placeholder="Observaciones previas a la sesión..."
                className="w-full px-3 py-1.5 border rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-3 py-1.5 bg-gray-100 rounded-lg text-gray-700 font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveAppointment}
                className="px-5 py-1.5 bg-[var(--color-primary)] text-white rounded-lg font-bold cursor-pointer shadow-xs"
              >
                Guardar Cita
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Recordatorio */}
      {reminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border shadow-2xl p-5 text-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-sm font-bold text-[var(--color-primary-dark)]">
                Recordatorio de Cita para el Paciente
              </h2>
              <button onClick={() => setReminderModalOpen(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="p-3 bg-gray-50 border rounded-xl font-mono text-[11px] whitespace-pre-wrap leading-relaxed text-gray-800">
              {reminderText}
            </div>

            <div className="flex justify-between items-center border-t pt-3">
              <button
                type="button"
                onClick={handleCopyReminder}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Enviar por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
