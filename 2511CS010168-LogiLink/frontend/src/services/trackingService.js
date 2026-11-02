import { apiFetch } from './apiClient.js';

export const trackingService = {
  list: () => apiFetch('/tracking'),
  getByShipment: (shipmentId) => apiFetch(`/tracking/${shipmentId}`),
  getByVehicle: (vehicleId) => apiFetch(`/tracking/vehicle/${vehicleId}`),
  events: () => apiFetch('/tracking/events'),
  getEvent: (id) => apiFetch(`/tracking/events/${id}`),
  createEvent: (payload) =>
    apiFetch('/tracking', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteEvent: (id) =>
    apiFetch(`/tracking/events/${id}`, {
      method: 'DELETE',
    }),
};
