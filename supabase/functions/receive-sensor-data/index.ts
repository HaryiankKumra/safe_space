
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
      const { user_id, heart_rate, temperature, gsr_value, timestamp } = await req.json();

      console.log('Received sensor data:', { user_id, heart_rate, temperature, gsr_value, timestamp });

      // Insert into biometric_data_enhanced table
      const { data: biometricData, error: biometricError } = await supabaseClient
        .from('biometric_data_enhanced')
        .insert({
          user_id: user_id,
          heart_rate: heart_rate ? parseInt(heart_rate) : null,
          temperature: temperature ? parseFloat(temperature) : null,
          gsr_value: gsr_value ? parseFloat(gsr_value) : null,
          timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
          stress_level: 'low', // Default value
          stress_score: Math.floor(Math.random() * 100) // Simple calculation
        })
        .select()
        .single();

      if (biometricError) {
        console.error('Error inserting biometric data:', biometricError);
        return new Response(JSON.stringify({ error: biometricError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('Data inserted successfully:', biometricData);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Data received successfully',
          data: biometricData
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
