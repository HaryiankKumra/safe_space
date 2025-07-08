
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('GPT_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!openAIApiKey) {
      return new Response(JSON.stringify({ 
        response: "I'm here to help with stress management. What's on your mind today?" 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Add the required prompt prefix
    const promptWithPrefix = `Please answer stress management related questions as this is only a stress management app. If user asks any other thing, say "I don't know" and stick to stress management topics only! User message: ${message}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful AI assistant specialized in stress management and mental wellness. Only answer questions related to stress relief, relaxation techniques, breathing exercises, mental health support, and wellness strategies. If asked about anything else, politely redirect the conversation back to stress management topics. Keep responses supportive, empathetic, and practical.' 
          },
          { role: 'user', content: promptWithPrefix }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in stress-chatbot function:', error);
    return new Response(JSON.stringify({ 
      response: "I'm experiencing some technical difficulties. In the meantime, try taking a few deep breaths - inhale for 4 counts, hold for 4, and exhale for 6. This can help reduce stress immediately." 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
