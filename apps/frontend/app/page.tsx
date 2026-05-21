async function getMessage() {
  const res = await fetch("http://backend:8000", {
    cache: "no-store",
  });

  return res.json();
}

export default async function Home() {
  const data = await getMessage();

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-5xl font-bold">
        {data.message}
      </div>
    </main>
  );
}
