
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'POST') {
      const { heart_rate, temperature, gsr_value, timestamp } = await req.json();

      // Insert sensor data
      const { data: sensorData, error: sensorError } = await supabaseClient
        .from('sensor_data')
        .insert({
          heart_rate: parseInt(heart_rate),
          temperature: parseFloat(temperature),
          gsr_value: gsr_value ? parseFloat(gsr_value) : null,
          timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString()
        })
        .select()
        .single();

      if (sensorError) {
        console.error('Error inserting sensor data:', sensorError);
        return new Response(JSON.stringify({ error: sensorError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Simple ML prediction logic (replace with your actual model)
      let stressLevel = 'low';
      let confidence = 0.85;

      // Basic stress prediction based on heart rate and temperature
      if (heart_rate > 100 || temperature > 37.5) {
        stressLevel = 'high';
        confidence = 0.92;
      } else if (heart_rate > 80 || temperature > 37.0) {
        stressLevel = 'medium';
        confidence = 0.88;
      }

      // Insert stress prediction
      const { error: predictionError } = await supabaseClient
        .from('stress_predictions')
        .insert({
          sensor_data_id: sensorData.id,
          stress_level: stressLevel,
          confidence: confidence
        });

      if (predictionError) {
        console.error('Error inserting prediction:', predictionError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: sensorData,
          prediction: { stress_level: stressLevel, confidence }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
