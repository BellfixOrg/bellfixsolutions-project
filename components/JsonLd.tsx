/**
 * JsonLd – Server Component
 * Safely renders a JSON-LD <script> block for structured data.
 * Uses dangerouslySetInnerHTML with JSON.stringify so the data
 * is serialised server-side and never causes hydration mismatches.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
