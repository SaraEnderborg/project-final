import { useQuery } from "@tanstack/react-query";
import { http } from "../../../api/http";

export function useSavedTimelines() {
  return useQuery({
    queryKey: ["savedTimelines"],
    queryFn: async () => {
      const res = await http.get("/api/saved-timelines");
      return res.response;
    },
  });
}

export function useSavedTimeline(id) {
  return useQuery({
    queryKey: ["savedTimelines", id],
    queryFn: async () => {
      const res = await http.get(`/api/saved-timelines/${id}`);
      return res.response;
    },
    enabled: !!id,
  });
}
