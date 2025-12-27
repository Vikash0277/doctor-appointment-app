import { createContext, useState } from "react";

export const AppointmentRefreshContext = createContext();

export function AppointmentRefreshProvider({ children }) {
  const [appointmentsRefreshKey, setAppointmentsRefreshKey] = useState(0);

  const refreshAppointments = () => {
    setAppointmentsRefreshKey((prev) => prev + 1);
  };

  return (
    <AppointmentRefreshContext.Provider value={{ appointmentsRefreshKey, refreshAppointments }}>
      {children}
    </AppointmentRefreshContext.Provider>
  );
}
