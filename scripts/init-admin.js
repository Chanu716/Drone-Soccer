const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Read .env.local
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k && v) env[k.trim()] = v.join("=").trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function initAdmin() {
  const adminEmails = (env.ADMIN_EMAILS || "karrichanikya@gmail.com,saisankar778@gmail.com,admin@srmap.edu.in")
    .split(",")
    .map((e) => e.trim().toLowerCase());

  console.log("Configuring admin accounts in Supabase Auth:", adminEmails);

  for (const email of adminEmails) {
    try {
      const { data: userList } = await supabase.auth.admin.listUsers();
      const existing = userList?.users?.find((u) => u.email?.toLowerCase() === email);

      if (existing) {
        console.log(`Admin user ${email} already exists (ID: ${existing.id}). Updating password to Admin@123456...`);
        await supabase.auth.admin.updateUserById(existing.id, {
          password: "Admin@123456",
          email_confirm: true,
        });
      } else {
        console.log(`Creating new admin user ${email} with password Admin@123456...`);
        const { data: newUser, error } = await supabase.auth.admin.createUser({
          email,
          password: "Admin@123456",
          email_confirm: true,
          user_metadata: { full_name: "Drone Soccer Admin", role: "admin" },
        });
        if (error) console.error(`Error creating ${email}:`, error.message);
        else console.log(`Created admin ${email} (ID: ${newUser.user.id})`);
      }

      // Also ensure profile exists
      const { data: userListUpdated } = await supabase.auth.admin.listUsers();
      const user = userListUpdated?.users?.find((u) => u.email?.toLowerCase() === email);
      if (user) {
        await supabase.from("profiles").upsert({
          id: user.id,
          full_name: "Drone Soccer Admin",
          email,
          role: "admin",
        });
      }
    } catch (err) {
      console.error(`Failed to configure admin ${email}:`, err.message);
    }
  }

  console.log("\nAdmin accounts initialized successfully!");
  console.log("Initial default password for admin accounts: Admin@123456");
}

initAdmin();
