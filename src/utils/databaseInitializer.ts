// Corrected `databaseInitializer.ts` fully aligned with your StressSense Guardian AI setup

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

    // Fetch users from Supabase instead of using mockUsers
    const { data: users, error: userFetchError } = await supabase
      .from("auth_users")
      .select("id, email, full_name, created_at");

    if (userFetchError) {
      console.error("❌ Failed to fetch users:", userFetchError.message);
      return {
        success: false,
        error: userFetchError.message,
      };
    }

    if (!users || users.length === 0) {
      console.log("⚠️ No users found in the database to initialize data for.");
      return {
        success: false,
        error: "No users found to initialize data for.",
      };
    }

    if (!force) {
      console.log("✅ Users already exist, skipping re-initialization unless forced.");
      return {
        success: true,
        message: "Users already exist, skipping initialization.",
      };
    }

    if (includeHealthRecords) {
      console.log("🏥 Creating basic health records for each user...");
      const healthRecords = users.map((user) => ({
        id: crypto.randomUUID(),
        user_id: user.id,
        condition: "Hypertension",
        diagnosis_date: new Date().toISOString(),
        medications: ["None"],
        symptoms: ["None"],
        status: "stable",
      }));

      const { error: healthError } = await supabase
        .from("health_records")
        .insert(healthRecords);

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

    console.log("🎉 Database initialization completed!");
    return {
      success: true,
      message: "Database initialized with sample data.",
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
    console.log("🗑️ Clearing all data (in order respecting FK constraints)...");
    await supabase.from("health_records").delete().neq("id", "");
    await supabase.from("user_profiles").delete().neq("user_id", "");
    await supabase.from("auth_users").delete().neq("id", "");
    console.log("✅ All data cleared successfully.");
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
    const { data, error } = await supabase.from("auth_users").select("id").limit(1);
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
  const { data: users, error } = await supabase.from("auth_users").select("email, full_name");
  if (error || !users) {
    console.error("❌ Failed to fetch users for credentials:", error?.message);
    return [];
  }
  return users.map((user) => ({
    email: user.email,
    name: user.full_name,
    password: "demo123", // for test UI display only; never expose real passwords
  }));
};

export const getSampleUsers = async () => {
  const { data: users, error } = await supabase.from("auth_users").select("email, full_name");
  if (error || !users) {
    console.error("❌ Failed to fetch users for credentials:", error?.message);
    return [];
  }
  return users.map((user) => ({
    email: user.email,
    name: user.full_name,
  }));
};

export const getSampleUserIds = async () => {
  const { data: users, error } = await supabase.from("auth_users").select("id");
  if (error || !users) {
    console.error("❌ Failed to fetch users for credentials:", error?.message);
    return [];
  }
  return users.map((user) => user.id);
};

export default initializeDatabaseWithSampleData;