export interface OrdiscanInscription {
  inscription_id: string;
  inscription_number: number;
  content_type: string;
  content_url: string;
  collection_slug: string | null;
}

export async function fetchWalletInscriptions(address: string): Promise<OrdiscanInscription[]> {
  const res = await fetch(`/api/inscriptions?address=${encodeURIComponent(address)}`);
  if (!res.ok) throw new Error(`Ordiscan error: ${res.status}`);
  const json = await res.json();
  return json.data ?? [];
}
