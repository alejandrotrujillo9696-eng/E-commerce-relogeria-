const formatPrice = (value) => {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return '0 COP';
  }

  const parts = number.toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decimalPart = parts[1];

  return `${integerPart},${decimalPart} COP`;
};

export default formatPrice;
