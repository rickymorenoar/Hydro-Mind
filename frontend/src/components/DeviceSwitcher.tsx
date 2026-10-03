'use client';
import { useRouter } from 'next/navigation';
import type { Device } from '@/types/hydromind';

interface DeviceSwitcherProps {
  devices: Device[];
  currentDeviceId: number;
}

export default function DeviceSwitcher({ devices, currentDeviceId }: DeviceSwitcherProps) {
  const router = useRouter();

  return (
    <select
      value={currentDeviceId}
      onChange={(e) => router.push(`/devices/${e.target.value}`)}
      className="rounded-lg border border-tanah-basah/20 bg-white px-3 py-1.5 font-display text-sm font-medium text-hitam-tinta focus:border-hijau-lumut focus:outline-none focus:ring-1 focus:ring-hijau-lumut"
    >
      {devices.map((d) => (
        <option key={d.id} value={d.id}>
          {d.name}
        </option>
      ))}
    </select>
  );
}
