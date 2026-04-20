import { addMonths, addYears, format } from 'date-fns';

export type VaccineType = 'V5' | 'V8' | 'V10' | 'V12' | 'Antirrábica' | 'Giárdia' | 'Gripe' | 'Tríplice Felina' | 'Quádrupla Felina' | 'Quíntupla Felina';

export interface VaccineProtocol {
  name: string;
  intervalMonths: number;
  description: string;
}

export const VACCINE_PROTOCOLS: Record<VaccineType, VaccineProtocol> = {
  'V8': { name: 'V8 (Octovalente)', intervalMonths: 12, description: 'Reforço anual' },
  'V10': { name: 'V10 (Decavalente)', intervalMonths: 12, description: 'Reforço anual' },
  'V12': { name: 'V12 (Dodecavalente)', intervalMonths: 12, description: 'Reforço anual' },
  'Antirrábica': { name: 'Antirrábica', intervalMonths: 12, description: 'Reforço anual obrigatório' },
  'Giárdia': { name: 'Giárdia', intervalMonths: 12, description: 'Reforço anual' },
  'Gripe': { name: 'Gripe (Tosse dos Canis)', intervalMonths: 12, description: 'Reforço anual' },
  'V5': { name: 'V5 (Quíntupla Felina)', intervalMonths: 12, description: 'Reforço anual para gatos' },
  'Tríplice Felina': { name: 'Tríplice Felina (V3)', intervalMonths: 12, description: 'Reforço anual' },
  'Quádrupla Felina': { name: 'Quádrupla Felina (V4)', intervalMonths: 12, description: 'Reforço anual' },
  'Quíntupla Felina': { name: 'Quíntupla Felina (V5)', intervalMonths: 12, description: 'Reforço anual' },
};

/**
 * Calcula a data sugerida para a próxima dose
 */
export function calculateNextDoseDate(vaccineType: string, lastDoseDate: Date = new Date()): Date {
  const protocol = VACCINE_PROTOCOLS[vaccineType as VaccineType];
  if (!protocol) {
    // Se não reconhecer a vacina, sugere 1 ano por padrão
    return addYears(lastDoseDate, 1);
  }
  return addMonths(lastDoseDate, protocol.intervalMonths);
}

/**
 * Formata a data para o input date do HTML (YYYY-MM-DD)
 */
export function formatToInputDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
