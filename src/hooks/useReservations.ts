import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { localDateString } from "@/lib/localDate";
import type { Reservation, ReservationStatus } from "@/types";

export interface ReservationsFilters {
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  status?: "all" | ReservationStatus;
  search?: string; // matches customer_name OR customer_phone
}

export interface ReservationsResult {
  rows: Reservation[];
  total: number;
}

const PAGE_SIZE = 8;

export function useReservations(filters: ReservationsFilters, page = 1) {
  return useQuery({
    queryKey: ["reservations", filters, page],
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<ReservationsResult> => {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("reservations")
        .select(
          "*, table:restaurant_tables(id,name,capacity,zone_id)",
          { count: "exact" },
        )
        .gte("reservation_date", filters.fromDate)
        .lte("reservation_date", filters.toDate)
        .order("reservation_date", { ascending: false })
        .order("reservation_time", { ascending: false })
        .range(from, to);

      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters.search && filters.search.trim()) {
        const s = filters.search.trim();
        // El nombre se busca contra customer_name_search (columna generada
        // en minúsculas y sin tildes), normalizando aquí igual.
        const sNorm = s
          .toLowerCase()
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "");
        query = query.or(
          `customer_name_search.ilike.%${sNorm}%,customer_phone.ilike.%${s}%`,
        );
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { rows: (data ?? []) as Reservation[], total: count ?? 0 };
    },
  });
}

export interface ReservationKpis {
  pendientes: number;
  confirmadasHoy: number;
  proximas7Dias: number;
  noShowsMes: number;
}

/**
 * KPIs de reservas con conteos dedicados en el servidor. Antes se
 * calculaban sobre las 20 filas visibles de la página filtrada, así que
 * "del mes" u "hoy" cambiaban según los filtros y casi nunca eran reales.
 */
export function useReservationKpis() {
  return useQuery({
    queryKey: ["reservations", "kpis"],
    queryFn: async (): Promise<ReservationKpis> => {
      const today = localDateString();
      const sevenAhead = new Date();
      sevenAhead.setDate(sevenAhead.getDate() + 7);
      const monthStart = today.slice(0, 7) + "-01";

      const base = () =>
        supabase
          .from("reservations")
          .select("*", { count: "exact", head: true });
      type CountQuery = ReturnType<typeof base>;
      const count = async (
        build: (q: CountQuery) => CountQuery,
      ): Promise<number> => {
        const { count: n, error } = await build(base());
        if (error) throw error;
        return n ?? 0;
      };

      const [pendientes, confirmadasHoy, proximas7Dias, noShowsMes] =
        await Promise.all([
          count((q) => q.eq("status", "pendiente")),
          count((q) =>
            q.eq("status", "confirmada").eq("reservation_date", today),
          ),
          count((q) =>
            q
              .eq("status", "confirmada")
              .gte("reservation_date", today)
              .lte("reservation_date", localDateString(sevenAhead)),
          ),
          count((q) =>
            q.eq("status", "no_show").gte("reservation_date", monthStart),
          ),
        ]);

      return { pendientes, confirmadasHoy, proximas7Dias, noShowsMes };
    },
    refetchInterval: 1000 * 60,
  });
}

/** Counts pending reservations — for the notifications dropdown. */
export function usePendingReservationsCount() {
  return useQuery({
    queryKey: ["reservations", "pending_count"],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from("reservations")
        .select("*", { count: "exact", head: true })
        .eq("status", "pendiente");
      if (error) throw error;
      return count ?? 0;
    },
    refetchInterval: 1000 * 30,
  });
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["reservations"] });
}

export function useConfirmReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      tableId,
    }: {
      id: string;
      tableId: string | null;
    }) => {
      const { error } = await supabase.rpc("confirm_reservation", {
        p_id: id,
        p_table_id: tableId ?? undefined,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll(queryClient);
      toast.success("Reserva confirmada");
    },
    onError: (err: Error) => toast.error(err.message || "Error al confirmar"),
  });
}

export function useAssignReservationTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      tableId,
    }: {
      id: string;
      tableId: string;
    }) => {
      const { error } = await supabase.rpc("assign_reservation_table", {
        p_id: id,
        p_table_id: tableId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll(queryClient);
      toast.success("Mesa actualizada");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Error al asignar mesa"),
  });
}

export function useUnassignReservationTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("unassign_reservation_table", {
        p_id: id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll(queryClient);
      toast.success("Mesa removida");
    },
    onError: (err: Error) => toast.error(err.message || "Error"),
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase.rpc("cancel_reservation", {
        p_id: id,
        p_reason: reason,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll(queryClient);
      toast.success("Reserva cancelada");
    },
    onError: (err: Error) => toast.error(err.message || "Error al cancelar"),
  });
}

export function useCompleteReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("complete_reservation", {
        p_id: id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll(queryClient);
      toast.success("Reserva marcada como completada");
    },
    onError: (err: Error) => toast.error(err.message || "Error"),
  });
}

export function useNoShowReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("noshow_reservation", { p_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll(queryClient);
      toast.success("Reserva marcada como no se presentó");
    },
    onError: (err: Error) => toast.error(err.message || "Error"),
  });
}

export const RESERVATIONS_PAGE_SIZE = PAGE_SIZE;
