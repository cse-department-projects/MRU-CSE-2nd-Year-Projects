import { useState, useCallback } from 'react';

export interface GeoLocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isLoading: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeoLocationState>({
    latitude: null,
    longitude: null,
    error: null,
    isLoading: false,
  });

  const getLocation = useCallback(
    (onSuccess?: (coords: { latitude: number; longitude: number }) => void) => {
      if (!navigator.geolocation) {
        const errMsg = 'Geolocation is not supported by your browser.';
        setState({ latitude: null, longitude: null, error: errMsg, isLoading: false });
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setState({
            latitude,
            longitude,
            error: null,
            isLoading: false,
          });
          if (onSuccess) {
            onSuccess({ latitude, longitude });
          }
        },
        (err) => {
          let errMsg = 'Failed to acquire location.';
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errMsg = 'Location permission was denied. Please allow location access in your browser.';
              break;
            case err.POSITION_UNAVAILABLE:
              errMsg = 'Location information is currently unavailable.';
              break;
            case err.TIMEOUT:
              errMsg = 'Location request timed out. Please try again.';
              break;
          }
          setState({
            latitude: null,
            longitude: null,
            error: errMsg,
            isLoading: false,
          });
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
      );
    },
    []
  );

  return {
    ...state,
    getLocation,
  };
};

export default useGeolocation;
