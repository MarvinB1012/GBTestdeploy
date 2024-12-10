import { apiClient } from './apiClient';
import { sensorApi } from './sensorApi';

const calculateStatus = (current, target, isHumidity = false) => {
    if (current == null || target == null) return 'unknown';
    const diff = Math.abs(current - target);
    const threshold = isHumidity ? 5 : 1;
    if (diff <= threshold) return 'optimal';
    if (diff <= threshold * 2) return 'warning';
    return 'critical';
};

const transformRoomData = (roomData) => ({
    number: roomData.room_id ? roomData.room_id.toString() : 'N/A',
    name: roomData.name || 'Room',
    sensor_id: roomData.sensor_id,
    temperature: roomData.current_temp || 'N/A',
    humidity: roomData.current_humidity || 'N/A',
    target_temperature: roomData.target_temp || 'N/A',
    target_humidity: roomData.target_humidity || 'N/A',
    image: roomData.imageURL || `/assets/images/room${roomData.room_id}.jpg`,
    status: roomData.status || { temp_status: 'unknown', humidity_status: 'unknown' },
});

class RoomApi {
    async getAllRooms() {
        try {
            const response = await apiClient.get('/room-data');
            console.log('API Response:', response);

            // Validate response data
            if (!response.data) {
                console.error('Invalid response: no data received');
                return [];
            }

            let roomsData;
            try {
                // Handle case where data might be a string
                roomsData = typeof response.data === 'string' 
                    ? JSON.parse(response.data) 
                    : response.data;

                // If data is wrapped in a 'data' property
                if (roomsData.data) {
                    roomsData = roomsData.data;
                }
            } catch (parseError) {
                console.error('Failed to parse response:', parseError);
                return [];
            }

            // Ensure we have an array
            const rooms = Array.isArray(roomsData) ? roomsData : [roomsData];
            
            return rooms.filter(room => room && room.room_id).map(transformRoomData);
        } catch (error) {
            console.error('Fehler beim Abrufen der Räume:', error);
            return [];
        }
    }

    async getAllRoomsWithSensorData() {
        try {
            const rooms = await this.getAllRooms();
            
            if (!rooms || !Array.isArray(rooms)) {
                console.warn('Keine gültigen Raumdaten gefunden');
                return [];
            }

            const sensorDataArray = await sensorApi.getAllLatestSensorData();
            if (!sensorDataArray || !Array.isArray(sensorDataArray)) {
                console.warn('Keine gültigen Sensordaten gefunden');
                return rooms; // Return rooms without sensor data
            }

            return rooms.map(room => {
                const sensorData = sensorDataArray.find(
                    sensor => sensor && sensor.sensorId === room.sensor_id
                );
                
                return {
                    ...room,
                    temperature: sensorData?.temperature ?? 'N/A',
                    humidity: sensorData?.humidity ?? 'N/A',
                    status: sensorData?.status ?? {
                        temp_status: 'unknown',
                        humidity_status: 'unknown'
                    },
                };
            });
        } catch (error) {
            console.error('Fehler beim Abrufen der Räume mit Sensordaten:', error);
            return [];
        }
    }
}

export const roomApi = new RoomApi();