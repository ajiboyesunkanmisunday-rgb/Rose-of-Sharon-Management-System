import { useMutation } from "@tanstack/react-query";
import {
  assignSuperAdmin,
  AssignSuperAdminRequest,
  OperationalResponse,
} from "@/lib/api";

export function useAssignSuperAdmin() {
  return useMutation<OperationalResponse, Error, AssignSuperAdminRequest>({
    mutationFn: assignSuperAdmin,
  });
}
