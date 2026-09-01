"use client";
import { useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, BarChart3, Check, ChevronDown, ChevronUp, GripVertical, LockKeyhole, Mail, Sparkles, Target, Users, X } from "lucide-react";
import { Bar, BarChart, CartesianGrid, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Option = { id: string; label: string };
type AnswerValue = string | number | string[] | null;

type Question = {
  id: string;
  title: string;
  prompt: string;
  kind: "info" | "multi" | "single" | "rank" | "slider" | "text" | "economic";
  options?: Option[];
};

const PROFILE_OPTIONS: Option[] = [
  { id: "entrepreneur", label: "Entrepreneur / dirigeant" },
  { id: "solopreneur", label: "Solopreneur" },
  { id: "manager", label: "Manager salarié" },
];

const REGIONS = ["Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Bretagne", "Centre-Val de Loire", "Corse", "Grand Est", "Hauts-de-France", "Île-de-France", "Normandie", "Nouvelle-Aquitaine", "Occitanie", "Pays de la Loire", "Provence-Alpes-Côte d'Azur", "Guadeloupe", "Martinique", "Guyane", "La Réunion", "Mayotte", "Belgique", "Suisse", "Canada", "États-Unis", "Royaume-Uni", "Maroc"];
const ROLES = ["Directeur Général / Président / Fondateur", "Directeur Administratif et Financier", "Directeur Marketing", "Directeur Commercial", "Directeur des Opérations", "Directeur des Systèmes d'Information (DSI)", "Chief Data Officer (ou équivalent)", "Directeur de Business Unit", "Autre"];

const QUESTIONS: Question[] = [
  { id: "info", title: "Votre profil", prompt: "Quelques informations pour personnaliser votre évaluation.", kind: "info" },
  { id: "intention", title: "Intention", prompt: "Pourquoi souhaitez-vous évaluer votre maturité data et IA ?", kind: "multi", options: [
    { id: "progress", label: "Je souhaite mesurer les progrès réalisés par rapport à l'an dernier." },
    { id: "beforeAi", label: "J'aimerais connaître mon niveau avant de mettre en place de l'IA." },
    { id: "strategy", label: "Je voudrais structurer une stratégie data claire." },
    { id: "direction", label: "Je veux sensibiliser ma Direction à ces sujets data / IA." },
    { id: "other", label: "Autre" },
  ] },
  { id: "goals", title: "Enjeux stratégiques de votre entreprise", prompt: "Quels sont vos objectifs prioritaires pour lesquels vous pensez que les données et l'IA peuvent vous aider ?", kind: "multi", options: [
    { id: "clients", label: "Acquérir et fidéliser les clients" },
    { id: "experience", label: "Améliorer la connaissance, la satisfaction et l'expérience client" },
    { id: "model", label: "Transformer notre modèle économique" },
    { id: "costs", label: "Réduire les coûts" },
    { id: "offers", label: "Proposer de nouveaux produits et services" },
    { id: "anticipation", label: "Mieux anticiper (prédire les ventes, organiser les stocks, maintenance prédictive...)" },
    { id: "steering", label: "Faciliter le pilotage de l'entreprise" },
    { id: "operations", label: "Optimiser notre performance opérationnelle (logistique, achats, opérations, administrative...)" },
    { id: "other", label: "Autre" },
  ] },
  { id: "technologies", title: "Technologies IA déployées", prompt: "Quelles technologies avez-vous déjà déployées ?", kind: "multi", options: [
    { id: "free", label: "Solutions grand public en versions gratuites (ChatGPT, Le Chat Mistral, Gemini...)" },
    { id: "paid", label: "Licences payantes d'outils type chatbot (ChatGPT, Le Chat Mistral, Gemini...)" },
    { id: "specific", label: "Outils spécifiques pour des besoins métiers (génération d'image, génération de code, génération de vidéos...)" },
    { id: "automation", label: "Outils d'automatisation (Make, Power Automate, n8n...)" },
    { id: "agent", label: "Agent IA pour répondre à une tâche spécifique" },
    { id: "rag", label: "Chatbot sur base de connaissance interne (RAG)" },
    { id: "mcp", label: "Modèles de Création de Processus (MCP) / orchestrateurs d'actions pilotés par l'IA" },
    { id: "other", label: "Autre" },
  ] },
  { id: "usage", title: "Utilisation de l'IA générative", prompt: "Comment l'IA générative est-elle utilisée dans votre entreprise ?", kind: "single", options: [
    { id: "integrated", label: "Elle est intégrée dans la stratégie de l'entreprise (identification d'outil et attribution de licences...)" },
    { id: "informal", label: "De façon informelle, vos équipes utilisent les solutions qui leurs semblent adaptées" },
    { id: "forbidden", label: "L'utilisation de l'IA générative est interdite" },
    { id: "unknown", label: "Je ne sais pas" },
  ] },
  { id: "carbonKnowledge", title: "Impact environnemental de l'IA", prompt: "Connaissez-vous l'impact carbone et énergétique de vos usages IA ?", kind: "single", options: [
    { id: "measured", label: "Oui, nous le mesurons ou l'avons estimé" },
    { id: "aware", label: "Oui, j'en connais les principaux ordres de grandeur" },
    { id: "learn", label: "Non, mais je souhaite en savoir plus" },
    { id: "notTopic", label: "Non, ce n'est pas encore un sujet chez nous" },
  ] },
  { id: "sobrietyPractices", title: "Pratiques d'IA sobre", prompt: "Quelles pratiques avez-vous déjà mises en place pour limiter l'impact de vos usages IA ?", kind: "multi", options: [
    { id: "model", label: "Choisir le bon modèle pour la tâche" },
    { id: "specialist", label: "Créer des agents spécialisés plutôt qu'utiliser systématiquement un assistant généraliste" },
    { id: "data", label: "Maintenir une base de données propre et utile" },
    { id: "none", label: "Aucune pratique spécifique pour le moment" },
  ] },
  { id: "iterations", title: "Itérations et efficacité", prompt: "Vous arrive-t-il d'itérer en boucle ou d'utiliser un modèle disproportionné par rapport à la tâche ?", kind: "single", options: [
    { id: "rare", label: "Rarement, nous avons des repères pour choisir le bon usage" },
    { id: "sometimes", label: "Parfois, selon les personnes et les outils" },
    { id: "often", label: "Souvent, nous manquons encore de méthode" },
    { id: "unknown", label: "Je ne sais pas" },
  ] },
  { id: "benefitCost", title: "Bénéfice, coût et sobriété", prompt: "Avant de déployer un usage IA, évaluez-vous le bénéfice attendu par rapport à son coût énergétique et organisationnel ?", kind: "single", options: [
    { id: "systematic", label: "Oui, systématiquement" },
    { id: "sometimes", label: "Parfois, sur les projets importants" },
    { id: "no", label: "Non, nous regardons surtout le gain de temps" },
    { id: "unknown", label: "Je ne sais pas" },
  ] },
  { id: "barriers", title: "Freins à l'usage de l'IA générative", prompt: "Classez les freins à l'usage de l'IA générative par ordre d'importance pour votre entreprise :", kind: "rank", options: [
    { id: "budget", label: "Manque de budget / financement" },
    { id: "skills", label: "Manque de connaissances / compétences" },
    { id: "security", label: "Réglementaire et sécurité (confidentialité, cybersécurité, souveraineté)" },
    { id: "data", label: "Qualité des données (faible volume, biais des données...)" },
    { id: "ethics", label: "Impact environnemental / sociétal / éthique" },
    { id: "time", label: "Manque de temps" },
    { id: "governance", label: "Gouvernance et technologie (outils non adaptés, accès aux données, manque de stratégie...)" },
    { id: "change", label: "Conduite du changement (peur des impacts métier, peur d'être dépassé, adoption des outils et de la technologie...)" },
    { id: "other", label: "Autre" },
  ] },
  { id: "hasInternalProfile", title: "Responsable IA désigné", prompt: "Avez-vous un(e) responsable IA désigné en interne ?", kind: "single", options: [
    { id: "yes", label: "Oui" },
    { id: "no", label: "Non" },
  ] },
  { id: "profiles", title: "Profils IA en interne", prompt: "De quel(s) profils disposez-vous en interne ?", kind: "multi", options: [
    { id: "cao", label: "Chief AI Officer / Responsable des projets IA" },
    { id: "it", label: "Directeur(trice) des systèmes d'information" },
    { id: "prompt", label: "Prompt Engineer" },
    { id: "innovation", label: "Directeur(trice) de l'innovation" },
    { id: "developer", label: "Développeur IA" },
    { id: "engineer", label: "Ingénieur IA / Ingénieur ML / Architecte IA" },
    { id: "externalDirector", label: "Directeur IA externalisé" },
    { id: "internalProjectOwner", label: "Employé de l'entreprise responsable des projets IA" },
    { id: "other", label: "Autre" },
  ] },
  { id: "regulation", title: "Connaissance de l'AI Act", prompt: "L'AI Act entre en vigueur en août 2026 pour les PME. Le saviez-vous ?", kind: "single", options: [
    { id: "yes", label: "Oui" },
    { id: "no", label: "Non" },
    { id: "learn", label: "Non, mais je souhaite en savoir plus" },
  ] },
  { id: "actions", title: "Actions organisationnelles et réglementaires", prompt: "Quelles actions ont été mises en place sur les plans organisationnel et réglementaire ?", kind: "multi", options: [
    { id: "commission", label: "Gouvernance/Commission IA interne (rôles & responsabilités)" },
    { id: "policy", label: "Politique des usages (charte IA, guide de bonnes pratiques, charte éthique)" },
    { id: "none", label: "Rien de tout cela" },
    { id: "other", label: "Autre" },
  ] },
  { id: "adoption", title: "Adoption de l'IA", prompt: "Quelle est selon vous la part de vos collaborateurs qui ont un usage quotidien des outils IA ?", kind: "slider" },
  { id: "subjects", title: "Sujets d'intérêt", prompt: "Y a-t-il des sujets sur lesquels vous souhaitez avancer dans les prochains mois ?", kind: "multi", options: [
    { id: "storage", label: "Stockage & sécurité des données" },
    { id: "law", label: "Cadre législatif (RGPD, IA Act...)" },
    { id: "funding", label: "Accompagnement & financements possibles" },
    { id: "ethics", label: "Éthique des données, numérique responsable (RSE)" },
    { id: "openData", label: "Open data (usage de données libres d'accès)" },
    { id: "feedback", label: "Accès à des retours d'expériences d'entreprises" },
    { id: "tools", label: "Outils de pilotage" },
    { id: "useCases", label: "Identification des cas d'usage de l'IA générative" },
    { id: "other", label: "Autre" },
  ] },
  { id: "fundingDevices", title: "Dispositifs de financement", prompt: "Bénéficiez-vous ou avez-vous déjà bénéficié de l'un des dispositifs de financement suivants pour vos projets Data et IA ?", kind: "multi", options: [
    { id: "bpi", label: "Aide BPI (subvention, prêt, accompagnement)" },
    { id: "regional", label: "Financement régional ou local" },
    { id: "opco", label: "OPCO" },
    { id: "none", label: "Rien de tout cela" },
    { id: "other", label: "Autre" },
  ] },
  { id: "economic", title: "Repère économique", prompt: "Salaire brut ou chiffre d'affaires mensuel moyen", kind: "economic" },
];

const INTENTION_SUGGESTIONS = [
  "J'aimerais connaître mon niveau avant de mettre en place de l'IA.",
  "Je souhaite mesurer les progrès réalisés par rapport à l'an dernier.",
  "Je voudrais structurer une stratégie data claire.",
  "Je veux sensibiliser ma Direction à ces sujets data / IA.",
];

const clamp = (value: number, min = 1, max = 5) => Math.max(min, Math.min(max, value));
const fmt = (value: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(value));

export default function DiagnosticRoiIaLeadMagnet() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [person, setPerson] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [profileType, setProfileType] = useState("");
  const [profession, setProfession] = useState("");
  const [region, setRegion] = useState("");
  const [barrierRanking, setBarrierRanking] = useState<string[]>([]);
  const [leadOpen, setLeadOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [consentReport, setConsentReport] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [monthlyRevenue, setMonthlyRevenue] = useState(15000);
  const [salary, setSalary] = useState(3200);
  const logoUrl = "/logo-alza.png";

  const question = QUESTIONS[step];
  const selected = (id: string) => Array.isArray(answers[id]) ? answers[id] as string[] : [];
  const setAnswer = (id: string, value: AnswerValue) => setAnswers((current) => ({ ...current, [id]: value }));
  const toggle = (id: string, option: string) => setAnswer(id, selected(id).includes(option) ? selected(id).filter((item) => item !== option) : [...selected(id), option]);
  const addBarrier = (id: string) => setBarrierRanking((current) => current.includes(id) ? current : [...current, id]);
  const removeBarrier = (id: string) => setBarrierRanking((current) => current.filter((item) => item !== id));
  const moveBarrier = (index: number, direction: -1 | 1) => setBarrierRanking((current) => { const next = [...current]; const target = index + direction; if (target < 0 || target >= next.length) return current; [next[index], next[target]] = [next[target], next[index]]; return next; });

  const maturity = useMemo(() => {
    const goals = selected("goals").length;
    const technologies = selected("technologies").length;
    const profiles = selected("profiles").length;
    const actions = selected("actions").filter((id) => id !== "none").length;
    const subjects = selected("subjects").length;
    const adoption = typeof answers.adoption === "number" ? answers.adoption : 0;
    const usage = answers.usage;
    const regulation = answers.regulation;
    const hasInternalProfile = answers.hasInternalProfile;
    const carbonKnowledge = answers.carbonKnowledge;
    const sobrietyPractices = selected("sobrietyPractices").filter((id) => id !== "none").length;
    const values = {
      potential: clamp(1 + goals * 0.35 + subjects * 0.12),
      strategy: clamp(1 + goals * 0.35 + (usage === "integrated" ? 1.6 : usage === "informal" ? 0.7 : 0)),
      culture: clamp(1 + adoption / 100 * 2.6),
      competences: clamp(1 + technologies * 0.28 + profiles * 0.22 + (hasInternalProfile === "yes" ? 0.8 : 0)),
      governance: clamp(1 + actions * 0.75 + (regulation === "yes" ? 1.2 : regulation === "learn" ? 0.45 : 0)),
    };
    const sobriety = clamp(1 + sobrietyPractices * 0.55 + (carbonKnowledge === "measured" ? 1.3 : carbonKnowledge === "aware" ? 0.8 : carbonKnowledge === "learn" ? 0.35 : 0) + (answers.iterations === "rare" ? 0.6 : answers.iterations === "sometimes" ? 0.25 : 0) + (answers.benefitCost === "systematic" ? 0.9 : answers.benefitCost === "sometimes" ? 0.45 : 0));
    const overall = (Object.values(values).reduce((sum, value) => sum + value, 0) + sobriety) / 6;
    return { ...values, sobriety, overall };
  }, [answers]);

  const annualValue = useMemo(() => {
    const hourlyValue = profileType === "entrepreneur" || profileType === "solopreneur" ? monthlyRevenue / 151.67 : salary / 151.67;
    const recoverableRate = Math.min(0.42, 0.16 + selected("technologies").length * 0.025);
    const adoption = typeof answers.adoption === "number" ? answers.adoption : 0;
    return Math.min(35, adoption === 0 ? 0 : 12) * 4.33 * hourlyValue * recoverableRate * 12;
  }, [answers.adoption, monthlyRevenue, profileType, salary, answers.technologies]);

  const isAnswered = () => {
    if (question.kind === "info") return Boolean(person.firstName && person.lastName && person.email && profileType && profession && region);
    if (question.kind === "multi") return selected(question.id).length > 0;
    if (question.kind === "single") return typeof answers[question.id] === "string";
    if (question.kind === "rank") return barrierRanking.length > 0;
    if (question.kind === "text") return typeof answers[question.id] === "string" && (answers[question.id] as string).trim().length > 0;
    if (question.kind === "economic") return profileType === "entrepreneur" || profileType === "solopreneur" ? monthlyRevenue > 0 : salary > 0;
    return typeof answers[question.id] === "number";
  };
  const previousStep = () => {
    const previous = question.id === "regulation" && answers.hasInternalProfile === "no" ? step - 2 : step - 1;
    setStep(Math.max(0, previous));
  };
  const nextStep = () => {
    const next = question.id === "hasInternalProfile" && answers.hasInternalProfile === "no" ? step + 2 : step + 1;
    setStep(Math.min(QUESTIONS.length - 1, next));
  };

  if (submitted) {
    return <ReportView maturity={maturity} onRestart={() => { setSubmitted(false); setStep(0); }} />;
  }

  return (
    <main className="min-h-screen bg-white px-4 py-6 text-slate-900">
      <style>{`
        .brand-bg { background-color: #001558 !important; color: #ffffff !important; }
        .brand-text { color: #001558 !important; }
        .brand-text-muted { color: rgba(0, 21, 88, 0.65) !important; }
        .brand-border { border-color: #001558 !important; }
        .brand-soft { background-color: rgba(0, 21, 88, 0.08) !important; border-color: rgba(0, 21, 88, 0.3) !important; }
        .brand-accent { accent-color: #001558 !important; }
      `}</style>
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5"><div className="flex items-center gap-3"><div className="flex h-12 w-24 items-center justify-center overflow-hidden rounded-xl bg-white"><>{logoUrl ? <img src={logoUrl} alt="Logo Alzà" className="max-h-full max-w-full object-contain" /> : <span className="text-lg font-black brand-text">Alzà</span>}</></div><div><p className="text-xs font-semibold uppercase tracking-widest brand-text">Évaluation IA</p><p className="text-lg font-bold">Maturité Data & IA</p></div></div><div className="hidden items-center gap-2 text-sm text-slate-400 sm:flex"><LockKeyhole className="h-4 w-4" /> Confidentiel</div></header>
        <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          <section className="space-y-5"><div><div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold brand-text">Question {step + 1} sur {QUESTIONS.length}</span><span className="text-slate-500">{Math.round(((step + 1) / QUESTIONS.length) * 100)} %</span></div><div className="h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full brand-bg transition-all" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} /></div></div>
            <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7"><div className="mb-6 flex gap-4"><span className="text-sm font-bold brand-text">{String(step + 1).padStart(2, "0")}</span><div><h1 className="text-2xl font-bold tracking-tight brand-text">{question.title}</h1><p className="mt-2 text-sm leading-relaxed text-slate-400">{question.prompt}</p></div></div>
              {question.kind === "info" && <InfoStep person={person} setPerson={setPerson} profileType={profileType} setProfileType={setProfileType} profession={profession} setProfession={setProfession} region={region} setRegion={setRegion} />}
              {question.kind === "multi" && <MultiStep options={question.options ?? []} values={selected(question.id)} onToggle={(id) => toggle(question.id, id)} />}
              {question.kind === "single" && <div className="space-y-3">{(question.options ?? []).map((option) => <OptionButton key={option.id} selected={answers[question.id] === option.id} onClick={() => setAnswer(question.id, option.id)}>{option.label}</OptionButton>)}</div>}
              {question.kind === "rank" && <RankStep options={question.options ?? []} ranking={barrierRanking} onAdd={addBarrier} onRemove={removeBarrier} onMove={moveBarrier} />}
              {question.kind === "slider" && <div className="py-5"><input type="range" min={0} max={100} step={1} value={typeof answers.adoption === "number" ? answers.adoption : 0} onChange={(event) => setAnswer("adoption", Number(event.target.value))} className="w-full brand-accent" /><div className="mt-6 text-center"><span className="inline-flex rounded-xl border brand-border brand-soft px-6 py-3 text-4xl font-black brand-text">{typeof answers.adoption === "number" ? answers.adoption : 0}<span className="ml-1 text-xl">%</span></span></div><div className="mt-4 flex justify-between text-xs text-slate-500"><span>0 %</span><span>100 %</span></div><button onClick={() => setAnswer("adoption", 0)} className="mx-auto mt-5 block rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-700">Je ne sais pas</button></div>}
              {question.kind === "text" && <div><textarea value={typeof answers.intention === "string" ? answers.intention : ""} onChange={(event) => setAnswer("intention", event.target.value)} rows={5} placeholder="Votre réponse..." className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:brand-border" /><div className="mt-4"><p className="mb-2 text-sm text-slate-500">Suggestions</p><div className="flex flex-wrap gap-2">{INTENTION_SUGGESTIONS.map((suggestion) => <button key={suggestion} onClick={() => setAnswer("intention", suggestion)} className="rounded-full border brand-border brand-soft px-3 py-2 text-left text-xs brand-text hover:brand-soft">{suggestion}</button>)}</div></div></div>}
              {question.kind === "economic" && <div className="space-y-4"><p className="rounded-xl border brand-border brand-soft p-4 text-sm brand-text">Cette information ne modifie pas le score de maturité. Elle pourra être utilisée plus tard pour une analyse économique.</p>{profileType === "entrepreneur" || profileType === "solopreneur" ? <RangeField label="Chiffre d'affaires mensuel moyen" value={monthlyRevenue} min={1000} max={100000} step={1000} suffix=" €" onChange={setMonthlyRevenue} /> : <RangeField label="Salaire brut mensuel moyen" value={salary} min={1800} max={12000} step={100} suffix=" €" onChange={setSalary} />}</div>}
              <div className="mt-7 flex items-center justify-between gap-3 border-t border-slate-200 pt-5"><button onClick={previousStep} disabled={step === 0} className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 hover:bg-slate-100 disabled:invisible"><ArrowLeft className="h-4 w-4" /> Précédent</button>{step < QUESTIONS.length - 1 ? <button onClick={() => isAnswered() && nextStep()} disabled={!isAnswered()} style={{ backgroundColor: isAnswered() ? "#001558" : "#6f80b8" }} className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed">Suivant <ArrowRight className="h-4 w-4" /></button> : <button onClick={() => setLeadOpen(true)} className="flex items-center gap-2 rounded-xl brand-bg px-5 py-3 text-sm font-bold text-slate-950 hover:brand-bg">Voir mon rapport <BarChart3 className="h-4 w-4" /></button>}</div>
            </section>
          </section>
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-black/20 sm:p-6"><div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest brand-text">Votre profil</p><h2 className="mt-1 text-xl font-bold">Résultat en direct</h2></div><Sparkles className="h-6 w-6 brand-text" /></div><div className="rounded-2xl border brand-border p-5" style={{ backgroundColor: "#f590eb" }}><p className="text-sm brand-text">Maturité Data & IA</p><p className="mt-2 text-4xl font-black brand-text">{maturity.overall.toFixed(1)} <span className="text-xl brand-text">/ 5</span></p><p className="mt-2 text-xs brand-text-muted">Score provisoire calculé à partir de vos réponses.</p></div><div className="mt-5 grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(115px, 1fr))" }}>{([['Potentiel', maturity.potential], ['Stratégie', maturity.strategy], ['Culture', maturity.culture], ['Compétences', maturity.competences], ['Gouvernance', maturity.governance], ['Sobriété IA', maturity.sobriety]] as [string, number][]).map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-slate-100 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-bold brand-text">{value.toFixed(1)}<span className="text-xs text-slate-500"> / 5</span></p></div>)}</div><div className="mt-5 rounded-2xl border border-slate-200 bg-slate-100 p-4"><div className="flex items-start gap-3"><Target className="mt-0.5 h-4 w-4 brand-text" /><p className="text-xs leading-relaxed brand-text">Le score reflète votre niveau de structuration Data & IA et vos pratiques de sobriété.</p></div></div></aside>
        </div>
        <div className="flex justify-center border-t border-slate-200 pt-6">{logoUrl ? <img src={logoUrl} alt="Logo Alzà" className="h-16 w-auto object-contain" /> : <span className="text-lg font-black brand-text">Alzà</span>}</div>
      </div>
      {leadOpen && !submitted && <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"><div className="relative w-full max-w-md rounded-3xl border border-slate-300 bg-slate-50 p-6 shadow-2xl"><button onClick={() => setLeadOpen(false)} aria-label="Fermer" className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-white"><X className="h-5 w-5" /></button><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl brand-soft brand-text"><Mail className="h-6 w-6" /></div><p className="text-sm font-semibold brand-text">Votre rapport est prêt</p><h2 className="mt-1 text-2xl font-bold">Recevez votre diagnostic personnalisé</h2><p className="mt-2 text-sm leading-relaxed text-slate-400">Entrez votre email pour débloquer le détail des scores et des recommandations.</p><div className="mt-5 space-y-3"><input value={person.email} onChange={(event) => setPerson({ ...person, email: event.target.value })} placeholder="Email professionnel" className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 outline-none focus:brand-border" /><label className="flex items-start gap-2 text-xs text-slate-700"><input type="checkbox" checked={consentReport} onChange={(event) => setConsentReport(event.target.checked)} className="mt-0.5 brand-accent" /> J'accepte que mes réponses soient traitées pour recevoir mon rapport personnalisé. <span className="brand-text">*</span></label><label className="flex items-start gap-2 text-xs text-slate-700"><input type="checkbox" checked={consentMarketing} onChange={(event) => setConsentMarketing(event.target.checked)} className="mt-0.5 brand-accent" /> Je souhaite recevoir ponctuellement des conseils sur l'IA et la transformation des organisations.</label><p className="text-xs leading-relaxed text-slate-500">Vos données servent à générer votre diagnostic et à vous envoyer le résultat. Vous pouvez retirer votre consentement à tout moment. <span className="brand-text">Politique de confidentialité à ajouter.</span></p><button onClick={async () => { setSubmitting(true); const response = await fetch("/api/submit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: person.email, firstName: person.firstName, lastName: person.lastName, profile: profileType, role: profession, region, answers, scores: maturity, consentReport, consentMarketing }) }); setSubmitting(false); if (response.ok) { setSubmitted(true); setLeadOpen(false); } else { alert("Impossible d’enregistrer votre diagnostic pour le moment."); } }} disabled={!person.email || !consentReport || submitting} className="flex w-full items-center justify-center gap-2 rounded-xl brand-bg px-5 py-3 font-bold text-slate-950 disabled:opacity-40"> {submitting ? "Enregistrement..." : "Débloquer mon rapport"} <ArrowRight className="h-4 w-4" /></button></div></div></div>}
    </main>
  );
}

function Card({ className = "", children }: { className?: string; children: ReactNode }) { return <section className={`rounded-2xl border bg-white ${className}`}>{children}</section>; }
function CardHeader({ children }: { children: ReactNode }) { return <div className="border-b border-slate-200 px-5 py-4">{children}</div>; }
function CardTitle({ children }: { children: ReactNode }) { return <h3 className="font-bold text-slate-900">{children}</h3>; }
function CardContent({ children }: { children: ReactNode }) { return <div className="p-5">{children}</div>; }
function ChartContainer({ className = "", children }: { className?: string; children: ReactNode }) { return <div className={className}><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div>; }
function ChartTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number | string }>; label?: string }) { if (!active || !payload?.length) return null; return <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg"><p className="font-semibold text-slate-900">{label}</p><p className="text-slate-600">{payload[0].name}: {payload[0].value}</p></div>; }

function ReportView({ maturity, onRestart }: { maturity: { potential: number; strategy: number; culture: number; competences: number; governance: number; sobriety: number; overall: number }; onRestart: () => void }) {
  const dimensions = [
    { dimension: "Potentiel", score: Number(maturity.potential.toFixed(1)) },
    { dimension: "Stratégie", score: Number(maturity.strategy.toFixed(1)) },
    { dimension: "Culture", score: Number(maturity.culture.toFixed(1)) },
    { dimension: "Compétences", score: Number(maturity.competences.toFixed(1)) },
    { dimension: "Gouvernance", score: Number(maturity.governance.toFixed(1)) },
    { dimension: "Sobriété IA", score: Number(maturity.sobriety.toFixed(1)) },
  ];
  const priorities = [...dimensions].sort((a, b) => a.score - b.score).slice(0, 3);
  const strengths = [...dimensions].sort((a, b) => b.score - a.score).slice(0, 3);
  const level = maturity.overall < 2.5 ? "Explorateur" : maturity.overall < 3.5 ? "Déployeur" : maturity.overall < 4.25 ? "Orchestrateur" : "Dirigeant 5.0";
  const chartConfig = { score: { label: "Score", color: "#001558" } };

  return <main className="min-h-screen bg-white px-4 py-6 text-slate-900"><div className="mx-auto max-w-6xl space-y-6"><header className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl brand-bg text-xl font-black text-white">◉</div><div><p className="text-xs font-semibold uppercase tracking-widest brand-text">Votre rapport</p><p className="text-lg font-bold">Maturité Data & IA</p></div></div><button onClick={onRestart} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-500">Refaire l'évaluation</button></header><section className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}><div className="rounded-3xl border brand-border p-6" style={{ backgroundColor: "#f590eb" }}><p className="text-sm font-semibold brand-text">Votre score global</p><p className="mt-2 text-5xl font-black brand-text">{maturity.overall.toFixed(1)}<span className="text-2xl"> / 5</span></p><p className="mt-3 inline-flex rounded-full bg-white/70 px-3 py-1 text-sm font-bold brand-text">Niveau : {level}</p><p className="mt-5 text-sm leading-relaxed brand-text">Votre maturité est calculée sur six dimensions, dont la sobriété IA.</p></div><div className="rounded-3xl border border-slate-200 bg-slate-50 p-6"><p className="text-sm font-semibold text-slate-600">Lecture rapide</p><h2 className="mt-2 text-2xl font-bold">Passez du potentiel à la pratique</h2><p className="mt-3 text-sm leading-relaxed text-slate-600">Votre rapport met en évidence les dimensions déjà solides et les leviers à travailler en priorité pour structurer vos usages.</p><div className="mt-5 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full brand-bg text-white"><Target className="h-5 w-5" /></div><p className="text-sm font-semibold text-slate-700">Commencez par vos trois priorités ci-dessous.</p></div></div></section><div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}><Card className="border-slate-200"><CardHeader><CardTitle>Vue d'ensemble</CardTitle></CardHeader><CardContent><ChartContainer config={chartConfig} className="h-80 w-full"><RadarChart data={dimensions}><PolarGrid /><PolarAngleAxis dataKey="dimension" tick={{ fill: "#001558", fontSize: 11 }} /><PolarRadiusAxis domain={[0, 5]} tick={{ fill: "#64748b", fontSize: 10 }} /><Tooltip content={<ChartTooltipContent />} /><Radar name="Score" dataKey="score" stroke="#001558" fill="#f590eb" fillOpacity={0.75} /></RadarChart></ChartContainer></CardContent></Card><Card className="border-slate-200"><CardHeader><CardTitle>Scores par dimension</CardTitle></CardHeader><CardContent><ChartContainer config={chartConfig} className="h-80 w-full"><BarChart data={dimensions} layout="vertical" margin={{ left: 12, right: 18, top: 8, bottom: 8 }}><CartesianGrid horizontal={false} /><XAxis type="number" domain={[0, 5]} hide /><YAxis type="category" dataKey="dimension" width={88} tick={{ fill: "#001558", fontSize: 11 }} /><Tooltip content={<ChartTooltipContent />} /><Bar dataKey="score" fill="#001558" radius={5} /></BarChart></ChartContainer></CardContent></Card></div><section className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}><div className="rounded-3xl border border-slate-200 bg-slate-50 p-6"><p className="text-sm font-semibold brand-text">Vos points forts</p><div className="mt-4 space-y-3">{strengths.map((item) => <div key={item.dimension} className="flex items-center justify-between gap-3 rounded-xl bg-white p-3"><span className="text-sm font-medium text-slate-700">{item.dimension}</span><span className="font-bold brand-text">{item.score}/5</span></div>)}</div></div><div className="rounded-3xl border border-slate-200 bg-slate-50 p-6"><p className="text-sm font-semibold brand-text">Vos priorités</p><div className="mt-4 space-y-3">{priorities.map((item, index) => <div key={item.dimension} className="flex items-center gap-3 rounded-xl bg-white p-3"><span className="flex h-7 w-7 items-center justify-center rounded-full brand-bg text-sm font-bold text-white">{index + 1}</span><span className="flex-1 text-sm font-medium text-slate-700">{item.dimension}</span><span className="font-bold brand-text">{item.score}/5</span></div>)}</div></div></section><section className="rounded-3xl border brand-border bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-semibold brand-text">Prochaine étape</p><h2 className="mt-1 text-2xl font-bold">Transformez ce diagnostic en plan d'action</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">Utilisez vos priorités pour choisir un premier cas d'usage, cadrer sa mise en œuvre et mesurer son impact avec sobriété.</p></div><button onClick={onRestart} className="flex items-center gap-2 rounded-xl brand-bg px-5 py-3 text-sm font-bold text-white">Recommencer <ArrowRight className="h-4 w-4" /></button></div></section></div></main>;
}

function OptionButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) { return <button onClick={onClick} className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left text-sm transition ${selected ? "brand-border brand-soft brand-text" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400"}`}><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${selected ? "brand-border brand-bg text-slate-950" : "border-slate-400"}`}>{selected && <Check className="h-3.5 w-3.5" />}</span><span>{children}</span></button>; }

function MultiStep({ options, values, onToggle }: { options: Option[]; values: string[]; onToggle: (id: string) => void }) { return <div className="space-y-3"><p className="text-sm text-slate-500">Plusieurs réponses possibles</p>{options.map((option) => <OptionButton key={option.id} selected={values.includes(option.id)} onClick={() => onToggle(option.id)}>{option.label}</OptionButton>)}</div>; }

function RankStep({ options, ranking, onAdd, onRemove, onMove }: { options: Option[]; ranking: string[]; onAdd: (id: string) => void; onRemove: (id: string) => void; onMove: (index: number, direction: -1 | 1) => void }) { return <div><p className="text-sm text-slate-500">Ajoutez les freins qui vous concernent et classez-les du plus important au moins important.</p><p className="mb-3 mt-5 text-sm font-semibold text-slate-700">Freins disponibles, cliquez pour ajouter :</p><div className="flex flex-wrap gap-2">{options.filter((option) => !ranking.includes(option.id)).map((option) => <button key={option.id} onClick={() => onAdd(option.id)} className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-left text-sm text-slate-700 hover:brand-border">+ {option.label}</button>)}</div><p className="mb-3 mt-6 text-sm font-semibold text-slate-700">Vos freins classés par ordre d'importance :</p><div className="space-y-2">{ranking.map((id, index) => <div key={id} className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-100 p-3"><GripVertical className="h-4 w-4 shrink-0 text-slate-600" /><span className="min-w-0 flex-1 text-sm text-slate-800">{index + 1}. {options.find((option) => option.id === id)?.label}</span><button onClick={() => onMove(index, -1)} aria-label="Monter" className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:brand-text"><ChevronUp className="h-4 w-4" /></button><button onClick={() => onMove(index, 1)} aria-label="Descendre" className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:brand-text"><ChevronDown className="h-4 w-4" /></button><button onClick={() => onRemove(id)} aria-label="Retirer" className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-red-300"><X className="h-4 w-4" /></button></div>)}</div></div>; }

function InfoStep({ person, setPerson, profileType, setProfileType, profession, setProfession, region, setRegion }: { person: { firstName: string; lastName: string; email: string; phone: string }; setPerson: (value: { firstName: string; lastName: string; email: string; phone: string }) => void; profileType: string; setProfileType: (value: string) => void; profession: string; setProfession: (value: string) => void; region: string; setRegion: (value: string) => void }) { return <div className="space-y-5"><div className="grid gap-3 sm:grid-cols-2">{([["firstName", "Prénom"], ["lastName", "Nom"], ["email", "Email professionnel"], ["phone", "Téléphone"]] as [keyof typeof person, string][]).map(([key, label]) => <label key={key} className="space-y-1.5 text-sm"><span className="text-slate-700">{label}{key !== "phone" && <span className="brand-text"> *</span>}</span><input type={key === "email" ? "email" : "text"} value={person[key]} onChange={(event) => setPerson({ ...person, [key]: event.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 outline-none focus:brand-border" /></label>)}</div><div><p className="mb-3 text-sm font-medium text-slate-700">Quel est votre profil ?<span className="brand-text"> *</span></p><div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>{PROFILE_OPTIONS.map((option) => <button key={option.id} onClick={() => setProfileType(option.id)} className={`rounded-2xl border p-4 text-left text-sm font-semibold transition ${profileType === option.id ? "brand-border brand-soft brand-text" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400"}`}>{option.label}</button>)}</div></div><div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1.5 text-sm"><span className="text-slate-700">Dans quelle région se situe votre entreprise ?<span className="brand-text"> *</span></span><select value={region} onChange={(event) => setRegion(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 outline-none focus:brand-border"><option value="">Sélectionnez</option>{REGIONS.map((item) => <option key={item}>{item}</option>)}</select></label><label className="space-y-1.5 text-sm"><span className="text-slate-700">Quel est votre rôle dans votre entreprise ?<span className="brand-text"> *</span></span><select value={profession} onChange={(event) => setProfession(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 outline-none focus:brand-border"><option value="">Sélectionnez</option>{ROLES.map((item) => <option key={item}>{item}</option>)}</select></label></div></div>; }

function RangeField({ label, value, min, max, step, suffix, onChange }: { label: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (value: number) => void }) { return <label className="block rounded-xl border border-slate-300 bg-slate-50 p-3"><div className="mb-2 flex items-center justify-between gap-3"><span className="text-xs text-slate-400">{label}</span><span className="text-sm font-bold brand-text">{fmt(value)}{suffix}</span></div><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full brand-accent" /></label>; }
