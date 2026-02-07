import { useEffect, useState } from "react";
import {
  getInstitutions,
  createInstitution,
} from "@/api/institution";

export function useInstitutions() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchInstitutions() {
    setLoading(true);
    try {
      const data = await getInstitutions();
      setInstitutions(data ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function create(name: string) {
    const institution = await createInstitution(name);
    setInstitutions((prev) => [...prev, institution]);
    return institution;
  }

  useEffect(() => {
    fetchInstitutions();
  }, []);

  return {
    institutions,
    loading,
    createInstitution: create,
    refetch: fetchInstitutions,
  };
}
