import { useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProviderLiveLocationBridge() {
  const { user, bookings, patchBooking } = useAuth();
  const lastSent = useRef(0);

  const activeJobId = useMemo(() => {
    if (!user || user.role !== 'provider') return null;
    const job = bookings.find(
      (b) =>
        (b.serviceProviderId === user.id || (!b.serviceProviderId && b.providerName === user.name)) &&
        ['Accepted', 'On the way', 'On_the_Way', 'Destination', 'Reached', 'Reached Confirmed', 'Reached_Confirmed', 'In Progress'].includes(b.status)
    );
    return job?.id || null;
  }, [bookings, user]);

  useEffect(() => {
    if (!activeJobId || !navigator.geolocation) return undefined;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastSent.current < 4000) return;
        lastSent.current = now;
        patchBooking(activeJobId, {
          providerLatitude: pos.coords.latitude,
          providerLongitude: pos.coords.longitude,
          providerLocationUpdatedAt: new Date().toISOString(),
        });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 25000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [activeJobId, patchBooking]);

  return null;
}
