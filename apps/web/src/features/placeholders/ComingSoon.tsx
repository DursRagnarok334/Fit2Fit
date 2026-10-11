export function ComingSoon({ title, text }: { title: string; text: string }) {
  return (
    <div className="stack">
      <h1>{title}</h1>
      <section className="card">
        <p className="muted">{text}</p>
      </section>
    </div>
  );
}
