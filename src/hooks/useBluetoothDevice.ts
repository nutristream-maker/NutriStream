import { useState, useEffect, useCallback, useRef } from 'react';
import { bluetoothService } from '../services/BluetoothService';

export type BluetoothConnectionState = 'DISCONNECTED' | 'SCANNING' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

interface UseBluetoothDeviceProps {
    deviceNameFilter?: string;
    serviceUuid: string;
    characteristicUuid: string;
    parseData: (value: DataView) => any;
    autoConnect?: boolean;
}

export function useBluetoothDevice<T>({
    deviceNameFilter,
    serviceUuid,
    characteristicUuid,
    parseData
}: UseBluetoothDeviceProps) {
    const [connectionState, setConnectionState] = useState<BluetoothConnectionState>('DISCONNECTED');
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [device, setDevice] = useState<BluetoothDevice | null>(null);

    const connect = useCallback(async () => {
        setConnectionState('SCANNING');
        setError(null);

        try {
            const filters = deviceNameFilter ? [{ namePrefix: deviceNameFilter }] : [];
            // We request the specific service we are interested in
            const device = await bluetoothService.requestDevice(filters, [serviceUuid]);
            setDevice(device);

            setConnectionState('CONNECTING');
            await bluetoothService.connect();

            await bluetoothService.startNotifications(
                serviceUuid,
                characteristicUuid,
                (event: Event) => {
                    const target = event.target as BluetoothRemoteGATTCharacteristic;
                    if (target.value) {
                        const parsed = parseData(target.value);
                        setData(parsed);
                    }
                }
            );

            setConnectionState('CONNECTED');
        } catch (err: any) {
            console.error('Bluetooth connection failed:', err);
            setError(err.message || 'Connection failed');
            setConnectionState('ERROR');
        }
    }, [deviceNameFilter, serviceUuid, characteristicUuid, parseData]);

    const disconnect = useCallback(async () => {
        try {
            if (device) {
                await bluetoothService.stopNotifications(
                    serviceUuid,
                    characteristicUuid,
                    () => { } // We can't easily remove the specific anonymous callback, but disconnect clears listeners usually
                );
                bluetoothService.disconnect();
                setConnectionState('DISCONNECTED');
                setDevice(null);
            }
        } catch (err: any) {
            console.error('Disconnect error:', err);
            // Even if it fails, we mark as disconnected locally
            setConnectionState('DISCONNECTED');
        }
    }, [device, serviceUuid, characteristicUuid]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (connectionState === 'CONNECTED' || connectionState === 'CONNECTING') {
                bluetoothService.disconnect();
            }
        };
    }, []);

    return {
        connectionState,
        data,
        error,
        connect,
        disconnect,
        device
    };
}
