
import { useState, useCallback } from 'react';
import { getErrorMessage, logError } from '@/utils/errorHandling';

interface PredictionData {
  data: number[][][];
}

interface PredictionResponse {
  prediction: number;
}

interface BackendPredictionResult {
  prediction: number | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const BACKEND_API_URL = 'https://stressmanage.duckdns.org/predict';

export const useBackendPrediction = () => {
  const [result, setResult] = useState<BackendPredictionResult>({
    prediction: null,
    loading: false,
    error: null,
    lastUpdated: null
  });

  const sendPredictionRequest = useCallback(async (sensorData: Array<{
    raw_ecg_signal: number;
    gsr_value: number;
    temperature: number;
  }>) => {
    if (sensorData.length < 20) {
      console.log('Not enough sensor data for prediction (need 20 readings)');
      return;
    }

    setResult(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Take the last 20 readings and format for the API
      const last20Readings = sensorData.slice(-20);
      const formattedData: number[][] = last20Readings.map(reading => [
        reading.raw_ecg_signal || 0,
        reading.gsr_value || 0,
        reading.temperature || 0
      ]);

      const requestBody: PredictionData = {
        data: [formattedData]
      };

      console.log('Sending prediction request to backend:', {
        url: BACKEND_API_URL,
        dataPoints: formattedData.length,
        sampleData: formattedData.slice(0, 2)
      });

      const response = await fetch(BACKEND_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: PredictionResponse = await response.json();
      
      console.log('Received prediction from backend:', data);

      setResult({
        prediction: data.prediction,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });

    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError('Backend prediction request', error);
      
      setResult(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setResult(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...result,
    sendPredictionRequest,
    clearError
  };
};
