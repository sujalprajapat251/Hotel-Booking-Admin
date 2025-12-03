export const getDefaultBookingForm = (room = null) => ({
  fullName: '',
  email: '',
  phone: '',
  idNumber: '',
  address: '',
  checkInDate: '',
  checkOutDate: '',
  paymentStatus: 'Pending',
  totalAmount: room?.price?.base || '',
});
