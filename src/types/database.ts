export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          reg_no: string | null;
          email: string;
          phone: string | null;
          year: string | null;
          branch: string | null;
          block_residence: string | null;
          role: "player" | "captain" | "organiser" | "admin";
          waiver_signed_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          reg_no?: string | null;
          email: string;
          phone?: string | null;
          year?: string | null;
          branch?: string | null;
          block_residence?: string | null;
          role?: "player" | "captain" | "organiser" | "admin";
          waiver_signed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          name: string;
          slug: string;
          tagline: string | null;
          logo_url: string | null;
          captain_name: string;
          captain_email: string;
          captain_phone: string | null;
          captain_id: string | null;
          training_addon: boolean;
          status: "pending" | "approved" | "rejected";
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          tagline?: string | null;
          logo_url?: string | null;
          captain_name: string;
          captain_email: string;
          captain_phone?: string | null;
          captain_id?: string | null;
          training_addon?: boolean;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["teams"]["Insert"]>;
        Relationships: [];
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          profile_id: string | null;
          name: string;
          role: "Striker" | "Defender" | "Keeper" | "Tactician";
          jersey_no: number | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          profile_id?: string | null;
          name: string;
          role?: "Striker" | "Defender" | "Keeper" | "Tactician";
          jersey_no?: number | null;
          joined_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["team_members"]["Insert"]>;
        Relationships: [];
      };
      slots: {
        Row: {
          id: string;
          week_no: number;
          match_date: string;
          day_of_week: "Wednesday" | "Thursday";
          block: string;
          venue: string;
          start_time: string;
          end_time: string;
          capacity: number;
          required_active_players: number;
          status: "open" | "full" | "cancelled" | "completed";
          created_at: string;
        };
        Insert: {
          id?: string;
          week_no: number;
          match_date: string;
          day_of_week: "Wednesday" | "Thursday";
          block: string;
          venue: string;
          start_time?: string;
          end_time?: string;
          capacity?: number;
          required_active_players?: number;
          status?: "open" | "full" | "cancelled" | "completed";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["slots"]["Insert"]>;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          slot_id: string;
          team_id: string;
          status: "reserved" | "confirmed" | "waitlisted" | "cancelled";
          checked_in_at: string | null;
          qr_token: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slot_id: string;
          team_id: string;
          status?: "reserved" | "confirmed" | "waitlisted" | "cancelled";
          checked_in_at?: string | null;
          qr_token?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          booking_id: string | null;
          team_id: string;
          purpose: "registration" | "training_recharge";
          valid_week: number | null;
          amount_paise: number;
          currency: string;
          method: "razorpay" | "venue_upi" | "cash" | null;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          status: "created" | "paid" | "failed" | "refunded";
          paid_at: string | null;
          recorded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          team_id: string;
          purpose?: "registration" | "training_recharge";
          valid_week?: number | null;
          amount_paise?: number;
          currency?: string;
          method?: "razorpay" | "venue_upi" | "cash" | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          status?: "created" | "paid" | "failed" | "refunded";
          paid_at?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          slot_id: string | null;
          round_no: number;
          team_a: string;
          team_b: string;
          score_a: number;
          score_b: number;
          status: "scheduled" | "live" | "completed" | "forfeited";
          winner_id: string | null;
          notes: string | null;
          played_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slot_id?: string | null;
          round_no?: number;
          team_a: string;
          team_b: string;
          score_a?: number;
          score_b?: number;
          status?: "scheduled" | "live" | "completed" | "forfeited";
          winner_id?: string | null;
          notes?: string | null;
          played_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["matches"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      standings: {
        Row: {
          team_id: string;
          team_name: string;
          team_slug: string;
          captain_name: string;
          played: number;
          won: number;
          drawn: number;
          lost: number;
          goals_for: number;
          goals_against: number;
          goal_difference: number;
          points: number;
        };
      };
    };
  };
}
