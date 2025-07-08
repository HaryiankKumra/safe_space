
import { supabase } from "@/integrations/supabase/client";

interface InitializeOptions {
  force?: boolean;
  includeHealthRecords?: boolean;
}

export const initializeDatabaseWithSampleData = async (
  options: InitializeOptions = {},
) => {
  const {
    force = false,
    includeHealthRecords = true,
  } = options;

  try {
    console.log("🔄 Initializing database with sample data...");

    // Check if we have authenticated users via Supabase Auth
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("⚠️ No authenticated user found. Please sign up first.");
      return {
        success: false,
        error: "No authenticated user found. Please sign up first.",
      };
    }

    // Check if user profile already exists
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existingProfile && !force) {
      console.log("✅ User profile already exists, skipping re-initialization unless forced.");
      return {
        success: true,
        message: "User profile already exists, skipping initialization.",
      };
    }

    if (includeHealthRecords) {
      console.log("🏥 Creating basic health records for the user...");
      
      // Check if health records already exist
      const { data: existingRecords } = await supabase
        .from("health_records")
        .select("id")
        .eq("user_id", user.id);

      if (!existingRecords || existingRecords.length === 0 || force) {
        const { error: healthError } = await supabase
          .from("health_records")
          .insert([{
            user_id: user.id,
            condition: "General Health Checkup",
            diagnosis_date: new Date().toISOString().split('T')[0],
            severity: "low",
            status: "stable",
            symptoms: ["None"],
            medications: ["None"],
            notes: "Initial health record created during setup"
          }]);

        if (healthError) {
          console.error("❌ Failed to insert health records:", healthError.message);
          return {
            success: false,
            error: healthError.message,
          };
        } else {
          console.log("✅ Health records inserted successfully.");
        }
      }
    }

    console.log("🎉 Database initialization completed!");
    return {
      success: true,
      message: "Database initialized with sample data for current user.",
    };
  } catch (error) {
    console.error("💥 Database initialization failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const clearAllData = async () => {
  try {
    console.log("🗑️ Clearing user data...");
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: "No authenticated user found."
      };
    }

    // Clear user's health records
    await supabase.from("health_records").delete().eq("user_id", user.id);
    
    // Clear user's biometric data
    await supabase.from("biometric_data_enhanced").delete().eq("user_id", user.id);
    
    console.log("✅ User data cleared successfully.");
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to clear data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const checkDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from("user_profiles").select("id").limit(1);
    if (error) {
      return { connected: false, error: error.message };
    }
    return { connected: true, data };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown connection error",
    };
  }
};

export const getSampleCredentials = async () => {
  // Return sample credentials for demo purposes
  // In a real app, you'd never expose actual credentials like this
  return [
    {
      email: "demo@stressguard.ai",
      name: "Demo User",
      password: "demo123"
    },
    {
      email: "test@stressguard.ai", 
      name: "Test User",
      password: "test123"
    }
  ];
};

export const getSampleUsers = async () => {
  const credentials = await getSampleCredentials();
  return credentials.map((cred) => ({
    email: cred.email,
    name: cred.name,
  }));
};

export const getSampleUserIds = async () => {
  // Since we can't query auth.users directly, return empty array
  // This would be populated by actual authenticated users
  return [];
};

export default initializeDatabaseWithSampleData;
