
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    console.log('📨 Received message:', message);

    if (!openAIApiKey) {
      console.log('⚠️ No OpenAI API key found');
      return new Response(JSON.stringify({ 
        response: "I'm here to help with stress management, but I need an API key to provide AI responses. For now, here are some immediate stress relief techniques:\n\n🌬️ **Deep Breathing**: Inhale for 4 counts, hold for 4, exhale for 6\n💆 **Progressive Relaxation**: Tense and release each muscle group\n🧘 **Mindfulness**: Focus on the present moment\n\nWhat specific stress management topic would you like to explore?" 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🤖 Calling OpenAI API...');
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
            content: `You are a compassionate AI assistant specialized in stress management and mental wellness. Your role is to:

1. Provide supportive, empathetic responses about stress relief and mental health
2. Suggest practical techniques like breathing exercises, mindfulness, relaxation methods
3. Offer evidence-based stress management strategies
4. Be encouraging and non-judgmental
5. If asked about non-stress management topics, politely redirect to stress/wellness topics

Keep responses helpful, concise (under 200 words), and actionable. Always maintain a supportive tone and focus on stress management, mental wellness, relaxation techniques, or related mental health topics.`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('❌ OpenAI API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI response received');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI');
    }

    const aiResponse = data.choices[0].message.content;
    console.log('📤 Sending response back to client');

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error in stress-chatbot function:', error);
    return new Response(JSON.stringify({ 
      response: "I'm experiencing some technical difficulties right now. In the meantime, here are some immediate stress relief techniques:\n\n🌬️ **4-7-8 Breathing**: Inhale for 4, hold for 7, exhale for 8\n🧘 **5-Minute Meditation**: Focus on your breath or try a body scan\n🚶 **Movement**: Take a short walk or do gentle stretches\n💭 **Grounding**: Name 5 things you see, 4 you hear, 3 you feel\n\nRemember, it's okay to feel stressed sometimes. You're taking a positive step by seeking support. What specific situation is causing you stress today?" 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
