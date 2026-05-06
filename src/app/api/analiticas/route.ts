import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchAnaliticasData, presetRange } from "@/lib/analiticas";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const desdeParam = searchParams.get("desde");
  const hastaParam = searchParams.get("hasta");

  let desde: Date;
  let hasta: Date;

  if (desdeParam && hastaParam) {
    desde = new Date(desdeParam);
    hasta = new Date(hastaParam);
  } else {
    ({ desde, hasta } = presetRange("30d"));
  }

  const data = await fetchAnaliticasData(desde, hasta);
  return NextResponse.json(data);
}
