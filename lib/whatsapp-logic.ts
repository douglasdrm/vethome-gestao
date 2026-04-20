import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReminderData {
  tutorName: string;
  petName: string;
  dateTime: Date;
  phoneNumber: string;
}

export function generateWhatsAppReminder({ tutorName, petName, dateTime, phoneNumber }: ReminderData): string {
  const dateStr = format(dateTime, "dd 'de' MMMM", { locale: ptBR });
  const timeStr = format(dateTime, 'HH:mm');
  
  const message = `Olá ${tutorName}! 🐾 Aqui é a Dra. Renata Silva. Estou passando para confirmar o atendimento do(a) ${petName} para o dia ${dateStr} às ${timeStr}. Estarei aí no horário combinado! Até logo!`;
  
  const encodedMessage = encodeURIComponent(message);
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function generateArrivalMessage({ tutorName, petName, phoneNumber }: Omit<ReminderData, 'dateTime'>): string {
  const message = `Oi ${tutorName}! Já estou a caminho para atender o(a) ${petName}. Chego em aproximadamente 15 minutos! 🚗🏠`;
  const encodedMessage = encodeURIComponent(message);
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
