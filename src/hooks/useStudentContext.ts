import { useEffect, useState } from "react";
import { studentApi } from "@/api/student.api";
import { termApi } from "@/api/term.api";
import { useAuth } from "@/hooks/useAuth";
import type { StudentDto, TermDto } from "@/types";

interface State {
  student: StudentDto | null;
  term: TermDto | null;
  loading: boolean;
  error: string | null;
}

/**
 * Resolves the current student profile + active term for the logged-in user.
 * Used by every Student page that needs studentId/termId.
 */
export function useStudentContext(): State {
  const { userId } = useAuth();
  const [state, setState] = useState<State>({
    student: null,
    term: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!userId) {
      setState({ student: null, term: null, loading: false, error: null });
      return;
    }
    let mounted = true;
    setState((s) => ({ ...s, loading: true }));
    Promise.all([studentApi.byUserId(userId), termApi.active()])
      .then(([student, term]) => {
        if (!mounted) return;
        setState({ student, term, loading: false, error: null });
      })
      .catch((e) => {
        if (!mounted) return;
        setState({ student: null, term: null, loading: false, error: e.message });
      });
    return () => {
      mounted = false;
    };
  }, [userId]);

  return state;
}
