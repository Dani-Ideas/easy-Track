import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { fetchAnaliticasData, presetRange } from "@/lib/analiticas";
import { AnaliticasClient } from "@/components/analiticas/AnaliticasClient";

export default async function AnaliticasPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const { desde, hasta } = presetRange("30d");
  const initialData = await fetchAnaliticasData(desde, hasta);

  return <AnaliticasClient initialData={initialData} />;
}
