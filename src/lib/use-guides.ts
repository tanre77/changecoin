import { useEffect, useMemo, useState } from "react";
import { listPublishedPractices, type PracticeRow } from "@/lib/changecoin.functions";
import { fieldsToGuide, SAMPLE_GUIDES, type Guide } from "@/lib/guides";
import { useCc } from "@/lib/store";

function rowToGuide(row: PracticeRow): Guide {
  return fieldsToGuide(
    {
      displayName: row.display_name,
      licensed: Boolean(row.licensed),
      credentialLabel: row.credential_label,
      region: row.region,
      bio: row.bio,
      rateCents: Number(row.rate_cents),
      specialties: row.specialties,
      promoted: Boolean(row.promoted),
      published: true,
    },
    `p:${row.user_id}`,
    false,
  );
}

export function useGuides() {
  const practice = useCc((s) => s.practice);
  const hidden = useCc((s) => s.hidden);
  const [remote, setRemote] = useState<Guide[]>([]);

  useEffect(() => {
    let cancel = false;
    listPublishedPractices()
      .then((rows) => {
        if (!cancel) setRemote(rows.map(rowToGuide));
      })
      .catch(() => {
        if (!cancel) setRemote([]);
      });
    return () => {
      cancel = true;
    };
  }, []);

  return useMemo(() => {
    const names = new Set(remote.map((g) => g.name.toLowerCase()));
    const list = [...SAMPLE_GUIDES, ...remote];
    if (practice.published && practice.displayName && !names.has(practice.displayName.toLowerCase())) {
      list.unshift(fieldsToGuide(practice, "local-practice", false));
    }
    return list
      .filter((g) => !hidden.includes(g.id))
      .sort((a, b) => Number(b.promoted) - Number(a.promoted) || a.name.localeCompare(b.name));
  }, [remote, practice, hidden]);
}
