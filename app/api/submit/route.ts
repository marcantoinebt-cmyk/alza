import { NextResponse } from "next/server";

const asText = (value: unknown) => {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined) return "";
  return String(value);
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const brevoApiKey = process.env.BREVO_API_KEY;
    const brevoListId = Number(process.env.BREVO_LIST_ID);

    const airtableToken = process.env.AIRTABLE_TOKEN;
    const airtableBaseId = process.env.AIRTABLE_BASE_ID;
    const airtableTableName = process.env.AIRTABLE_TABLE_NAME;

    if (
      !brevoApiKey ||
      !brevoListId ||
      !airtableToken ||
      !airtableBaseId ||
      !airtableTableName ||
      !body?.email ||
      !body?.consentReport
    ) {
      return NextResponse.json(
        { error: "Configuration ou données manquantes." },
        { status: 400 }
      );
    }

    const overall = Number(body.scores?.overall ?? 0);
    const level =
      overall < 2.5
        ? "Explorateur"
        : overall < 3.5
          ? "Déployeur"
          : overall < 4.25
            ? "Orchestrateur"
            : "Dirigeant 5.0";

    const airtableFields: Record<string, unknown> = {
      Email: body.email,
      "Prénom": asText(body.firstName),
      Nom: asText(body.lastName),
      Téléphone: asText(body.phone),
      Profil: asText(body.profile),
      Région: asText(body.region),
      Rôle: asText(body.role),
      Niveau: level,
      "Score global": overall,
      Potentiel: Number(body.scores?.potential ?? 0),
      Stratégie: Number(body.scores?.strategy ?? 0),
      Culture: Number(body.scores?.culture ?? 0),
      Compétences: Number(body.scores?.competences ?? 0),
      Gouvernance: Number(body.scores?.governance ?? 0),
      "Sobriété IA": Number(body.scores?.sobriety ?? 0),
      "Réponses JSON": JSON.stringify({
        answers: body.answers ?? {},
        barrierRanking: body.barrierRanking ?? [],
        monthlyRevenue: body.monthlyRevenue ?? null,
        salary: body.salary ?? null,
      }),
      "Consentement rapport": Boolean(body.consentReport),
      "Consentement marketing": Boolean(body.consentMarketing),
    };

    const airtableUrl =
      `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(airtableTableName)}`;

    const airtableResponse = await fetch(airtableUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${airtableToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [{ fields: airtableFields }],
      }),
    });

    if (!airtableResponse.ok) {
      const details = await airtableResponse.text();
      console.error("Erreur Airtable :", airtableResponse.status, details);

      return NextResponse.json(
        { error: "Airtable a refusé l'enregistrement." },
        { status: 502 }
      );
    }

    const brevoResponse = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        email: body.email,
        listIds: [brevoListId],
        updateEnabled: true,
        attributes: {
          PRENOM: body.firstName ?? "",
          NOM: body.lastName ?? "",
          PROFIL: body.profile ?? "",
          ROLE: body.role ?? "",
          REGION: body.region ?? "",
          NIVEAU: level,
          SCORE_GLOBAL: body.scores?.overall ?? 0,
          POTENTIEL: body.scores?.potential ?? 0,
          STRATEGIE: body.scores?.strategy ?? 0,
          CULTURE: body.scores?.culture ?? 0,
          COMPETENCES: body.scores?.competences ?? 0,
          GOUVERNANCE: body.scores?.governance ?? 0,
          SOBRIETE_IA: body.scores?.sobriety ?? 0,
          CONSENT_REPORT: true,
          CONSENT_MARKETING: Boolean(body.consentMarketing),
        },
      }),
    });

    if (!brevoResponse.ok) {
      const details = await brevoResponse.text();
      console.error("Erreur Brevo :", brevoResponse.status, details);

      return NextResponse.json(
        { error: "Brevo a refusé l'enregistrement." },
        { status: brevoResponse.status }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erreur générale :", error);

    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement." },
      { status: 500 }
    );
  }
}
