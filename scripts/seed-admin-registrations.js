const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const env = fs.readFileSync(".env.local", "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();
const supabase = createClient(url, key);

async function seed() {
  console.log("Seeding diverse registrations & payments into Supabase with adaptive column mapping...");

  const sampleTeams = [
    {
      name: "Starlight Aviators",
      slug: `starlight-aviators-${Date.now().toString().slice(-4)}`,
      captain_name: "Sneha Reddy",
      captain_email: "sneha_reddy@srmap.edu.in",
      captain_phone: "9848022338",
      training_addon: true,
      status: "approved",
      tagline: "Checked student IDs; eligible for high-bay arena.",
      pilots: [
        { name: "Sneha Reddy", role: "Striker" },
        { name: "Rahul Verma", role: "Defender" },
        { name: "Manish Rao", role: "Keeper" },
        { name: "Pooja Hegde", role: "Defender" },
      ],
      payment: {
        amount_paise: 20000, // ₹200 (₹100 league + ₹100 training)
        status: "paid",
        method: "venue_upi",
        transaction_id: "UPI-SRM-9823419082",
        paid_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    },
    {
      name: "Cyber Drones SRM",
      slug: `cyber-drones-${Date.now().toString().slice(-4)}`,
      captain_name: "Aditya Nair",
      captain_email: "aditya_nair@srmap.edu.in",
      captain_phone: "9123456780",
      training_addon: false,
      status: "pending",
      tagline: "Participant submitted UTR receipt screenshot.",
      pilots: [
        { name: "Aditya Nair", role: "Striker" },
        { name: "Tanmay B", role: "Defender" },
        { name: "Kavya P", role: "Keeper" },
      ],
      payment: {
        amount_paise: 10000,
        status: "created", // Treated as Verification Required / Pending
        method: "venue_upi",
        transaction_id: "UPI-GPay-4482019941",
      },
    },
    {
      name: "Thunder Vortex",
      slug: `thunder-vortex-${Date.now().toString().slice(-4)}`,
      captain_name: "Deepak Sharma",
      captain_email: "deepak_s@srmap.edu.in",
      captain_phone: "9988776655",
      training_addon: false,
      status: "pending",
      pilots: [
        { name: "Deepak Sharma", role: "Striker" },
        { name: "Vikram Sen", role: "Defender" },
        { name: "Surya K", role: "Keeper" },
      ],
    },
    {
      name: "Rogue Propellers",
      slug: `rogue-propellers-${Date.now().toString().slice(-4)}`,
      captain_name: "Rohan Das",
      captain_email: "rohan_d@srmap.edu.in",
      captain_phone: "9000112233",
      training_addon: false,
      status: "rejected",
      tagline: "REJECTED: Invalid student enrollment number and duplicate team roster.",
      pilots: [
        { name: "Rohan Das", role: "Striker" },
        { name: "Amit G", role: "Defender" },
        { name: "Pranav M", role: "Keeper" },
      ],
      payment: {
        amount_paise: 10000,
        status: "failed",
        method: "venue_upi",
        transaction_id: "FAILED-UTR-00921",
      },
    },
  ];

  for (const st of sampleTeams) {
    // 1. Insert Team
    const { data: team, error: teamErr } = await supabase
      .from("teams")
      .insert({
        name: st.name,
        slug: st.slug,
        captain_name: st.captain_name,
        captain_email: st.captain_email,
        captain_phone: st.captain_phone,
        training_addon: st.training_addon,
        status: st.status,
        tagline: st.tagline || null,
      })
      .select("id, name")
      .single();

    if (teamErr) {
      console.error("Error creating team:", st.name, teamErr.message);
      continue;
    }

    console.log("Created team:", team.name, "(ID: " + team.id + ")");

    // 2. Insert Pilots
    const pilotsData = st.pilots.map((p, idx) => ({
      team_id: team.id,
      name: p.name,
      role: p.role,
      jersey_no: idx + 1,
    }));

    await supabase.from("team_members").insert(pilotsData);

    // 3. Insert Payment if defined
    if (st.payment) {
      await supabase.from("payments").insert({
        team_id: team.id,
        purpose: "registration",
        amount_paise: st.payment.amount_paise,
        currency: "INR",
        status: st.payment.status,
        method: st.payment.method,
        razorpay_payment_id: st.payment.transaction_id || null,
        paid_at: st.payment.paid_at || null,
      });
      console.log("  -> Inserted payment for", team.name);
    }
  }

  console.log("✅ Seed completed successfully!");
}

seed().catch(console.error);
