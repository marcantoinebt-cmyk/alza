# Diagnostic Maturité Data & IA Alzà

Projet Next.js prêt à importer dans Vercel.

## Déploiement

1. Importer le dépôt GitHub dans Vercel.
2. Détecter le framework Next.js.
3. Ajouter `BREVO_API_KEY` et `BREVO_LIST_ID` dans les variables d'environnement Vercel.
4. Créer dans Brevo les attributs personnalisés utilisés dans `app/api/submit/route.ts`.
5. Redéployer.

La route `POST /api/submit` reçoit les coordonnées, consentements, réponses et scores, puis ajoute le contact à la liste Brevo.

Avant production, remplacer la mention de politique de confidentialité par l'URL réelle et vérifier les textes RGPD.
