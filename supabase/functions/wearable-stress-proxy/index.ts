import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const WEARABLE_STRESS_API = "https://mrinal007-wesad.hf.space";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('⌚ Wearable stress analysis request received');
    
    const { sensorData } = await req.json();
    
    if (!sensorData || sensorData.length < 20) {
      throw new Error('Insufficient sensor data. Need at least 20 readings.');
    }

    console.log(`🔄 Calling Hugging Face API: ${WEARABLE_STRESS_API}`);
    console.log(`   Sensor readings: ${sensorData.length}`);
    
    // Format data for WESAD model
    const formattedData = {
      data: sensorData.slice(-20).map((reading: any) => [
        reading.raw_ecg_signal,
        reading.gsr_value,
        reading.temperature
      ])
    };
    
    // Try multiple endpoint patterns that Gradio uses
    const endpoints = [
      '/api/predict',
      '/run/predict',
      '/api',
      '/gradio_api/run/predict'
    ];
    
    let lastError;
    for (const endpoint of endpoints) {
      try {
        console.log(`  Trying endpoint: ${endpoint}`);
        
        const response = await fetch(`${WEARABLE_STRESS_API}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(formattedData),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Wearable stress analysis successful');
          
          // Normalize response format
          const prediction = data.prediction ?? data.label ?? 0;
          const isStressed = prediction === 1 || prediction === '1' || prediction === 'Stressed';
          
          const result = {
            prediction: isStressed ? 1 : 0,
            stress_level: isStressed ? 'Stressed' : 'Not Stressed',
            confidence: data.confidence || data.score || 0.85,
            timestamp: new Date().toISOString(),
          };
          
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        lastError = `HTTP ${response.status}: ${await response.text()}`;
      } catch (err) {
        lastError = err.message;
        continue;
      }
    }
    
    // If all endpoints failed, return fallback
    console.warn('⚠️ All Hugging Face endpoints failed, using fallback');
    console.error('Last error:', lastError);
    
    return new Response(JSON.stringify({
      prediction: 0,
      stress_level: 'Not Stressed',
      confidence: 0.5,
      timestamp: new Date().toISOString(),
      warning: 'Using fallback analysis. Hugging Face Space may be sleeping or unavailable.',
      error: lastError
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Still return 200 to prevent app crash
    });
    
  } catch (error) {
    console.error('❌ Wearable stress analysis error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      prediction: 0,
      stress_level: 'Not Stressed',
      confidence: 0.5,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return 200 with fallback to prevent app crash
    });
  }
});
