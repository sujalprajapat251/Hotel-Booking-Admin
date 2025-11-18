export const generateBookingReference = () => {
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK${Date.now().toString(36).toUpperCase()}${randomPart}`;
};

export const getDefaultBookingForm = (room = null) => ({
  fullName: '',
  email: '',
  phone: '',
  idNumber: '',
  address: '',
  checkInDate: '',
  checkOutDate: '',
  bookingSource: 'Direct',
  paymentStatus: 'Pending',
  totalAmount: room?.price?.base || '',
  bookingReference: generateBookingReference()
});

