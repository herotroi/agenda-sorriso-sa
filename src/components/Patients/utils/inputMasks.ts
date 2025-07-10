
// Função para aplicar máscara de CPF
export const applyCpfMask = (value: string) => {
  const numericValue = value.replace(/\D/g, '');
  return numericValue
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

// Função para aplicar máscara de telefone
export const applyPhoneMask = (value: string) => {
  const numericValue = value.replace(/\D/g, '');
  if (numericValue.length <= 10) {
    return numericValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  } else {
    return numericValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  }
};
