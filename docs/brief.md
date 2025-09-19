# Mealplanner – Projektbrief för Codex

> **Syfte:** Ge Codex en fokusbrief som säkerställer att utvecklingen av **Mealplanner** håller rätt riktning, med enkel vägledning för en icke‑utvecklare och tydliga leverabler.

---

## 1) Översikt och mål

**Problem att lösa**\
Planera veckomenyer och underlätta mathandling som tillfredsställer familjens olika behov, integrerat med måltidssamling i Notion och shoppinglista i Google Keep. 

**Mål**

- Stöd för vision (inventering via foto).
- Stöd för att söka på webben efter recept.
- Kunna svara på kunskapsfrågor om mat.
- Kunna generera grupperad inköpslista och Agent Handoff för varukorg (utan köp).
- Snabbt hämta, skapa och spara recept/måltider i Notion via Supabase Edge Functions.
- Kunna hämta, skapa och spara veckomeny i Notion via Supabase Edge Functions
- Kunna hämta och lägga till livsmedel på inköpslista i Google Keep via Supabase Edge Functions

**Vad Codex behöver göra**

- Producera minimal, testbar backend (Supabase Edge Functions) och tydliga README\:n/kommandon för varje steg.
- Dokumentera så att en icke‑utvecklare kan köra, testa och felsöka steg‑för‑steg.

---

## 2) Arkitektur (hög nivå)

```
User ──> Custom GPT (Matplaneraren)
           │  ├─ Vision (inventera varor)
           │  └─ Web Search Recipes
           │  └─ Agent Handoff
           │
           │ Actions (se custom-gpt/actions.md)
           ▼
     Supabase Edge Functions (TypeScript)
           │
           └─ Notion (databas: meals & meal-plans)
                ├─ Recept (meals)
                └─ Veckomenyer (meal-plans)
           └─ Google Keep
                └─ Inköpslista (shopping-list)
```

**Komponenter**

- **Custom GPT** – beter sig enligt `custom-gpt/systemprompt.md` (språk, stil, allergiregler, format).
- **Actions/OpenAPI** – definierar säkra anrop från GPT till orchestratorn, se `custom-gpt/actions.md`.
- **Supabase Edge Functions** – kapslar logik för att **läsa/skriva** mot Notion (meals & meal‑plans).
- **Notion** – källsanning för måltider och veckomenyer. Betygsfältet (multi-select) följer <bokstav><siffra>: A/H = vuxna, I/L = barn; siffror 1=Gott, 2=Okej, 3=Inte gott.
- **Shoppinglista** – integreras efter veckomeny (Google Keep via Make‑webhook eller Notion‑lista).

---

## 3) Krav och regler (sammanfattning)

**Språk & format**

- Svenska. Kort, konkret. SI‑mått (g, ml, °C), tider (total/aktiv), svårighetsgrad.

**Allergi & säkerhet**

- Recept/planer **måste** märka allergenstatus: “Fri från mjölk/ägg/nötter/gluten/kokos (spår tolereras)”.
- Föreslå säkra ersättningar vid riskingredienser.
- **Läck aldrig** API‑nycklar/tokens.
- **Inga köp** – endast Agent Handoff.

**Plan & listor**

- Veckomeny: per dag (mån–sön eller efter begäran), total/aktiv tid, svårighet.
- Inköpslista: **grupperad** i *Frukt & Grönt*, *Torrvaror*, *Kyl & Frys*.
- Vid webbrecept: ange **källa kort**.

**Felhantering**

- Vid API‑fel: kort beskrivning + tydligt nästa steg.
- Be om bekräftelse före masskrivningar (>30 artiklar till lista).

**Prioritetsordning**

1. Do\_not (säkerhet & begränsningar)
2. Familjens allergier & preferenser
3. Guidelines (stil, språk, format)
4. Exempel (önskat beteende)

> **Full policy och beteende:** `custom-gpt/systemprompt.md`.\
> **Actions/kontrakt:** `custom-gpt/actions.md`.

---

## 4) Roadmap (epics & ordning)

**Steg 1 – Notion‑koppling via Supabase Edge Functions (meals)**\
*Mål:* Kunna **läsa/skriva** måltider (recept) till en Notion‑databas.\
*Leverabler:*

- Edge Function `/meals` (GET/POST) inkl. scheman för ingredienser, tider, allergenstatus.
- OpenAPI/Actions uppdaterade i `custom-gpt/actions.md`.
- README med körning lokalt, env‑variabler (utan hemligheter i repo), och curl‑exempel.
- Enhetstester + minimal E2E: skapa recept → få Notion‑URL.

**Steg 2 – Veckomeny‑funktion (meal‑plans)**\
*Mål:* Skapa/uppdatera veckomeny i Notion med tider, svårighet och **grupperad inköpslista**.\
*Leverabler:*

- Edge Function `/meal-plan` (POST) som tar dagar, rätter, tider, svårighet, samt genererar grupperad lista.
- Normalisering till SI‑mått och **allergenstatus** per rätt.
- OpenAPI/Actions uppdaterade.
- Tester + demo‑data.

**Steg 3 – Koppling till inköpslista**\
*Mål:* Skicka grupperad lista till vald destination (Google Keep via Make‑webhook eller Notion‑lista).\
*Leverabler:*

- Edge Function `/shopping-list` (POST) med idempotens (inga dubletter) och >30‑items bekräftelse.
- README med exempel, felhantering och återkopplingsmeddelanden.

**Redan nu (parallellt i GPT)**

- **Vision:** Inventera foto → varutabla → receptförslag → kompletteringslista (grupperad).
- **Web Search Recipes:** Hämta idéer, normalisera till SI, sätt allergenstatus, ange källor kort.
- **Agent Handoff:** Generera instruktion som inkluderar vad och hur mycket som ska köpas + tabell + JSON (inga köp), för manuell agent‑session (computer use).
