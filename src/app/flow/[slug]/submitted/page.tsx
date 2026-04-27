import Link from "next/link";

export default async function FlowSubmittedPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const age = query.age ? String(query.age) : undefined;

  return (
    <main className="wf-confirm-shell">
      <div className="wf-confirm-card">
        <div className="wf-success-bubble">✓</div>
        <div>
          <h1>Gotowe</h1>
          <p>Twoje dane zostały pomyślnie przesłane</p>
        </div>
        <Link className="wf-btn wf-btn-primary wf-btn-block wf-btn-large" href={age ? `/flow/${slug}?age=${age}` : `/flow/${slug}`}>
          Wróć
        </Link>
      </div>
    </main>
  );
}