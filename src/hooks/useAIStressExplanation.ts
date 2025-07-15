
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PatientHistory {
  age?: number;
  medical_conditions?: string[];
  activity_level?: string;
  medications?: string[];
}

interface Vitals {
  heart_rate?: number;
  temperature?: number;
  gsr_value?: number;
  stress_score?: number;
}

interface AIExplanationResult {
  explanation: string | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const useAIStressExplanation = () => {
  const [result, setResult] = useState<AIExplanationResult>({
    explanation: null,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const generateExplanation = useCallback(async (
    patientHistory: PatientHistory,
    vitals: Vitals,
    predictedStressLevel: string
  ) => {
    setResult(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('🔄 Generating AI stress explanation...');
      
      const { data, error } = await supabase.functions.invoke('ai-stress-explanation', {
        body: {
          patientHistory,
          vitals,
          predictedStressLevel
        }
      });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw error;
      }

      if (data?.explanation) {
        console.log('✅ AI explanation generated successfully');
        setResult({
          explanation: data.explanation,
          loading: false,
          error: null,
          lastUpdated: new Date(),
        });

        // Store the explanation in the database for logging
        try {
          await supabase.from('ai_explanations').insert({
            patient_history: patientHistory,
            vitals: vitals,
            predicted_stress_level: predictedStressLevel,
            explanation: data.explanation,
          });
        } catch (dbError) {
          console.warn('⚠️ Failed to store explanation in database:', dbError);
        }
      } else {
        throw new Error('No explanation received from AI service');
      }
    } catch (err) {
      console.error('❌ AI explanation error:', err);
      setResult({
        explanation: null,
        loading: false,
        error: err.message || 'Failed to generate explanation',
        lastUpdated: null,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setResult(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...result,
    generateExplanation,
    clearError,
  };
};
