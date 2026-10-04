import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("menu_categories")
    .select("id, name, description")
    .order("sort_order");

  if (error) {
    return (
      <main style={{ padding: 40, fontFamily: "system-ui" }}>
        <h1>❌ Supabase connection error</h1>
        <pre style={{ background: "#fee", padding: 20 }}>
          {JSON.stringify(error, null, 2)}
        </pre>
      </main>
    );
  }

  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>✅ Supabase Connected</h1>
      <p>Fetched {categories?.length ?? 0} menu categories:</p>
      <ul>
        {categories?.map((c) => (
          <li key={c.id}>
            <strong>{c.name}</strong> — {c.description}
          </li>
        ))}
      </ul>
    </main>
  );
}
