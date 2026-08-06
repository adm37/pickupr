export type Country = 'Netherlands' | 'Belgium' | 'France' | 'Germany';

export interface BookingDetails {
  serviceType: 'transfer' | 'hourly' | 'multicity';
  direction?: 'from_nl' | 'to_nl';
  pickupLocation: string;
  dropoffLocation: string;
  date: string;
  time: string;
  passengers: number;
  durationHours?: number; // for hourly
  stops?: string[]; // for multicity
  name: string;
  email: string;
  phone: string;
  notes: string;
}
