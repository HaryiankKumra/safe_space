// pages/api/contact.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { fullName, email, subject, message } = req.body as {
    fullName: string;
    email: string;
    subject: string;
    message: string;
  };

  if (!fullName || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const { data, error } = await supabase
      .from("contact_messages")
      .insert([
        {
          full_name: fullName,
          email,
          subject,
          message,
          status: "new",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to save your message." });
    }

    return res.status(200).json({ success: true, message: "Message saved.", data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
