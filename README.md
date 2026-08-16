# MyPravasa Tourism Intelligence Dashboard

Static prototype for a government/tourism authority presentation.

## Run in VS Code

1. Open this folder in VS Code.
2. Use the Live Server extension and open `index.html`.
3. Alternatively run any local static server from this folder, for example:

```bash
python -m http.server 5173
```

Then open `http://localhost:5173`.

## Architecture

- UI: `src/ui.js`
- App state and routing: `src/app.js`
- Repository abstraction: `src/data/repository.js`
- Isolated synthetic demo data: `src/data/demoData.js`
- Business logic: `src/services/intelligenceService.js`
- Action Center scoring and scenario logic: `src/services/actionEngine.js`
- Privacy rules: `src/services/privacyService.js`
- TypeScript domain schema: `src/domain/types.ts`
- Future ingestion contract: `docs/data-contract.md`

The active repository is `DemoDataRepository`. The UI does not import demo data directly.

## Major Views

- Dashboard
- Action Center
- Tourism Intelligence
- Crowd Management
- Tourism Opportunities
- Mobility & Roads
- Safety & Risk
- Recommendations
- Destinations
- Data & Privacy
