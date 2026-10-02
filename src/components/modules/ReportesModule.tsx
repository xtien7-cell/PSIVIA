import React from 'react';
import * as XLSX from 'xlsx';
import { Patient, ClinicalRecord, AppliedTest, SessionItem } from '../../types';
import { calculateAge, calcAgeParts } from '../../utils/storage';
import { BarChart3, FileSpreadsheet, Download, Activity, Users, Award, Calendar } from 'lucide-react';

interface ReportesModuleProps {
  patients: Patient[];
  records: ClinicalRecord[];
  tests: AppliedTest[];
  sessions: SessionItem[];
  onNotify: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const ReportesModule: React.FC<ReportesModuleProps> = ({
  patients,
  records,
  tests,
  sessions,
  onNotify,
}) => {
  const getGrupoEtario = (edad: number | string) => {
    const num = Number(edad);
    if (isNaN(num)) return 'No especificado';
    if (num < 1) return 'Menor de 1 año';
    if (num < 5) return '1-4 años (primera infancia)';
    if (num < 12) return '5-11 años (niñez)';
    if (num < 18) return '12-17 años (adolescencia)';
    if (num < 30) return '18-29 años (adulto joven)';
    if (num < 45) return '30-44 años (adulto)';
    if (num < 60) return '45-59 años (adulto medio)';
    if (num < 75) return '60-74 años (adulto mayor)';
    return '75+ años (anciano)';
  };

  const topDx = React.useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach((r) => {
      if (r.dx_principal) {
        const key = r.dx_principal.split(' - ')[0].trim();
        counts[key] = (counts[key] || 0) + 1;
      }
      if (r.diagnosticos) {
        r.diagnosticos.forEach((d) => {
          if (d.cie11) {
            const k = d.cie11.split(' - ')[0].trim();
            counts[k] = (counts[k] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [records]);

  const handleExportExcel = (periodo: 'semana' | 'mes' | 'anio' | 'todo') => {
    const now = new Date();
    let from: Date, to: Date;

    if (periodo === 'semana') {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay());
      from = d;
      to = new Date(d);
      to.setDate(to.getDate() + 7);
    } else if (periodo === 'mes') {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    } else if (periodo === 'anio') {
      from = new Date(now.getFullYear(), 0, 1);
      to = new Date(now.getFullYear() + 1, 0, 1);
    } else {
      from = new Date(0);
      to = new Date(2100, 0, 1);
    }

    const filteredRecords = records.filter((r) => {
      const d = new Date(r.created_at);
      return d >= from && d < to;
    });

    if (filteredRecords.length === 0) {
      onNotify('No se encontraron atenciones registradas en el período seleccionado.', 'warning');
      return;
    }

    const patientsMap: Record<string, Patient> = {};
    patients.forEach((p) => {
      patientsMap[p.id] = p;
    });

    // 1. Hoja Atenciones
    const sheetAtenciones = filteredRecords.map((r) => {
      const pat = patientsMap[r.patient_id];
      const age = pat ? calculateAge(pat.birth_date) : '';
      return {
        ID_Atencion: r.id,
        Fecha: r.created_at ? new Date(r.created_at).toLocaleString('es-EC') : '',
        Cedula: pat?.cedula || '',
        Paciente: pat?.names || '',
        Edad: age,
        Grupo_Etario: getGrupoEtario(age),
        Sexo: pat?.sex || '',
        Motivo_Paciente: r.motivo_paciente || '',
        Motivo_Terapeuta: r.motivo_terapeuta || '',
        Dx_Principal: r.dx_principal || '',
        Dx_DSM5: r.dx_dsm5 || '',
        Enfoque_Terapeutico: r.plan_enfoque || '',
        Frecuencia: r.plan_frecuencia || '',
        Profesional: r.created_by || '',
      };
    });

    // 2. Hoja Pacientes
    const sheetPacientes = patients.map((p) => ({
      Cedula: p.cedula,
      Nombres_Completos: p.names,
      Fecha_Nacimiento: p.birth_date,
      Edad: calculateAge(p.birth_date),
      Sexo: p.sex,
      Estado_Civil: p.estado_civil,
      Celular: p.celular,
      Provincia: p.province,
      Canton: p.canton,
      Etnia: p.etnia,
      Educacion: p.education,
      Discapacidad: p.discapacidad,
      Total_Atenciones: records.filter((r) => r.patient_id === p.id).length,
    }));

    // 3. Hoja Diagnósticos
    const sheetDx: any[] = [];
    filteredRecords.forEach((r) => {
      const pat = patientsMap[r.patient_id];
      const diags = r.diagnosticos || [];
      diags.forEach((d) => {
        sheetDx.push({
          ID_Atencion: r.id,
          Paciente: pat?.names || '',
          Cedula: pat?.cedula || '',
          Tipo: d.tipo,
          Clase: d.tipoDx,
          CIE11: d.cie11,
          DSM5: d.dsm5,
          Especificador: d.especificador || '',
        });
      });
    });

    // 4. Hoja Pruebas
    const sheetPruebas = tests.map((t) => ({
      ID_Prueba: t.id,
      Prueba: t.test_name,
      Codigo: t.test_code,
      Puntaje: t.score,
      Puntaje_Maximo: t.max_score || '',
      Interpretacion: t.interpretation,
      Fecha_Aplicacion: t.applied_date,
      Paciente: patientsMap[t.patient_id || '']?.names || '',
    }));

    // 5. Hoja Sesiones
    const sheetSesiones = sessions.map((s) => ({
      ID_Sesion: s.id,
      Fecha: s.date,
      Proxima_Cita: s.next_date || '',
      Temas_Trabajados: s.topics || '',
      Tecnicas_Tareas: s.notes || '',
      Paciente: patientsMap[s.patient_id || '']?.names || '',
    }));

    // 6. Hoja Estadísticas Epidemiológicas
    const stats: any[] = [
      { Metrica: 'Total de Pacientes Registrados', Valor: patients.length },
      { Metrica: 'Total de Atenciones Realizadas', Valor: records.length },
      { Metrica: 'Total de Pruebas Psicométricas Aplicadas', Valor: tests.length },
      { Metrica: 'Total de Sesiones Terapéuticas', Valor: sessions.length },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheetAtenciones), 'Atenciones');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheetPacientes), 'Pacientes');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheetDx.length ? sheetDx : [{ Vacio: '' }]), 'Diagnosticos');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheetPruebas.length ? sheetPruebas : [{ Vacio: '' }]), 'Pruebas');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheetSesiones.length ? sheetSesiones : [{ Vacio: '' }]), 'Sesiones');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(stats), 'Estadisticas');

    const filename = `PSIVIA_Exportacion_Investigacion_${periodo}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);

    onNotify('Archivo Excel de 6 hojas exportado con éxito.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] p-6 shadow-xs">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[var(--color-border)]">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[var(--color-text-primary)]">
              Módulo de Reportes Estadísticos y Exportación Masiva a Excel
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Descarga automatizada en formato multi-hoja (.xlsx) optimizada para investigación clínica y auditoría de salud.
            </p>
          </div>
        </div>

        {/* Tarjetas de Exportación Rápida */}
        <div className="p-4 bg-[var(--color-bg-light)] rounded-2xl border border-[var(--color-border)] mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <h2 className="text-xs font-bold text-[var(--color-primary-dark)] uppercase tracking-wider">
              Descargar Base Completa en Excel (6 Hojas Integradas)
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => handleExportExcel('semana')}
              className="p-3 bg-white border border-[var(--color-border)] hover:border-emerald-600 rounded-xl text-xs font-semibold text-gray-800 flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Esta Semana</span>
            </button>
            <button
              onClick={() => handleExportExcel('mes')}
              className="p-3 bg-white border border-[var(--color-border)] hover:border-emerald-600 rounded-xl text-xs font-semibold text-gray-800 flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Este Mes</span>
            </button>
            <button
              onClick={() => handleExportExcel('anio')}
              className="p-3 bg-white border border-[var(--color-border)] hover:border-emerald-600 rounded-xl text-xs font-semibold text-gray-800 flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Este Año</span>
            </button>
            <button
              onClick={() => handleExportExcel('todo')}
              className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Todo el Histórico</span>
            </button>
          </div>
        </div>

        {/* Resumen Epidemiológico */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-white rounded-xl border border-[var(--color-border)] shadow-2xs">
            <h3 className="font-bold text-xs text-[var(--color-primary-dark)] uppercase tracking-wider mb-3">
              Diagnósticos Más Frecuentes
            </h3>

            {topDx.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">
                Sin diagnósticos registrados aún.
              </div>
            ) : (
              <div className="space-y-2">
                {topDx.map(([code, count]) => (
                  <div
                    key={code}
                    className="p-2.5 rounded-lg bg-[var(--color-bg-light)] flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-gray-800">{code}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-white font-bold text-[10px]">
                      {count} caso(s)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-white rounded-xl border border-[var(--color-border)] shadow-2xs">
            <h3 className="font-bold text-xs text-[var(--color-primary-dark)] uppercase tracking-wider mb-3">
              Distribución por Sexo de Pacientes
            </h3>

            <div className="space-y-3 text-xs">
              {['Mujer', 'Hombre', 'Intersexual'].map((sexo) => {
                const count = patients.filter((p) => p.sex === sexo).length;
                const pct = patients.length > 0 ? ((count / patients.length) * 100).toFixed(1) : '0';
                return (
                  <div key={sexo}>
                    <div className="flex justify-between text-gray-700 font-medium mb-1">
                      <span>{sexo}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[var(--color-primary)] h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
