import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiKey = process.env.BREVO_API_KEY;
    const listId = Number(process.env.BREVO_LIST_ID);

    if (!apiKey || !listId || !body?.email || !body?.consentReport) {
      return NextResponse.json({ error: "Configuration, email ou consentement manquant." }, { status: 400 });
    }

    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json", "api-key": apiKey },
      body: JSON.stringify({
        email: body.email,
        listIds: [listId],
        updateEnabled: true,
        attributes: {
          PRENOM: body.firstName ?? "",
          NOM: body.lastName ?? "",
          PROFIL: body.profile ?? "",
          ROLE: body.role ?? "",
          REGION: body.region ?? "",
          NIVEAU: body.level ?? "",
          SCORE_GLOBAL: body.scores?.overall ?? null,
          POTENTIEL: body.scores?.potential ?? null,
          STRATEGIE: body.scores?.strategy ?? null,
          CULTURE: body.scores?.culture ?? null,
          COMPETENCES: body.scores?.competences ?? null,
          GOUVERNANCE: body.scores?.governance ?? null,
          SOBRIETE_IA: body.scores?.sobriety ?? null,
          CONSENT_REPORT: true,
          CONSENT_MARKETING: Boolean(body.consentMarketing),
        },
      }),
    });

    if (!response.ok) return NextResponse.json({ error: "Brevo a refusé la soumission." }, { status: response.status });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'enregistrement." }, { status: 500 });
  }
}
