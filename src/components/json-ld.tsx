import { serializeSchema } from "@/lib/schema";

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeSchema(data) }}
    />
  );
}
