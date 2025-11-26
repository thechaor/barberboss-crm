export interface Client {
  id: string;
  name: string;
  phone: string;
  lastVisit: Date | null;
  visitCount: number;
  birthday: Date | null;
  isVip: boolean;
  notes: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  date: Date;
  time: string;
  service: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}
