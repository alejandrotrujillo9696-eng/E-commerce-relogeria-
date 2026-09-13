const orderStatusLabels = {
  pending: 'Pendiente',
  verified: 'Verificado',
  processing: 'En proceso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const getOrderStatusLabel = (status) => {
  if (status && orderStatusLabels[status]) {
    return orderStatusLabels[status];
  }

  return status;
};

export { getOrderStatusLabel, orderStatusLabels };
