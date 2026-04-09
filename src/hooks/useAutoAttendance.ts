import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

/**
 * Auto-registers attendance (check_in) when a worker logs in.
 * Compares with their assigned shift to detect tardanza automatically.
 * Runs once per session.
 */
export function useAutoAttendance() {
  const { user } = useAuthStore();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!user || hasRun.current) return;
    hasRun.current = true;

    const registerAutoAttendance = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const now = new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        // Find the worker linked to this auth user
        const { data: worker, error: workerError } = await supabase
          .from("workers")
          .select("id, full_name, status")
          .eq("user_id", user.id)
          .single();

        if (workerError || !worker || worker.status !== "activo") return;

        // Check if attendance already exists for today
        const { data: existing } = await supabase
          .from("attendance")
          .select("id")
          .eq("worker_id", worker.id)
          .eq("date", today)
          .maybeSingle();

        if (existing) return; // Already registered today

        // Check if the worker has a shift today to detect tardanza
        const { data: shift } = await supabase
          .from("shifts")
          .select("start_time")
          .eq("worker_id", worker.id)
          .eq("date", today)
          .maybeSingle();

        let status: "presente" | "tardanza" = "presente";
        let notes: string | null = null;

        if (shift?.start_time) {
          // Compare check_in time with shift start_time
          const shiftStart = shift.start_time.slice(0, 5); // "HH:MM"
          const checkIn = now.slice(0, 5);
          if (checkIn > shiftStart) {
            status = "tardanza";
            notes = `Ingreso automático por login. Turno: ${shiftStart}, llegada: ${checkIn}`;
          }
        }

        const { error: insertError } = await supabase
          .from("attendance")
          .insert({
            worker_id: worker.id,
            date: today,
            check_in: now,
            status,
            notes: notes || "Ingreso automático por login",
          });

        if (insertError) throw insertError;

        if (status === "tardanza") {
          toast.warning(
            `Tardanza registrada para ${worker.full_name}. Turno iniciaba a las ${shift?.start_time?.slice(0, 5)}.`,
          );
        } else {
          toast.success(`Asistencia registrada: ${worker.full_name} — entrada ${now.slice(0, 5)}`);
        }
      } catch {
        // Silently fail — auto-attendance is non-critical
      }
    };

    registerAutoAttendance();
  }, [user]);
}
