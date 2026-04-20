/**
 * Utilitários de formatação para o VetHome
 */

/**
 * Formata um valor de string (apenas dígitos) para o padrão de moeda BRL (ex: 8890 -> 88,90)
 */
export const formatCurrencyInput = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  
  const amount = parseFloat(digits) / 100;
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Converte uma string formatada em BRL para o tipo number (ex: "88,90" -> 88.9)
 */
export const parseCurrencyString = (value: string): number => {
  if (!value) return 0;
  // Remove pontos de milhar e troca vírgula por ponto
  return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
};
