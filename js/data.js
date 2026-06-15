/* ============================================================
   data.js — Default example content + storage layer
   Content is stored in localStorage so it persists in the
   visitor's browser and can be managed via the admin UI.
   ============================================================ */

(function (global) {
  "use strict";

  const STORAGE_KEY = "portfolio_content_v2";

  /* ---------- Default / example content ---------- */
  const DEFAULT_DATA = {
    hobbies: [
      {
        id: "h1",
        title: "Fotografia",
        description: "Catturo paesaggi e momenti di vita urbana. Amo il lato narrativo di un singolo scatto.",
        image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80&auto=format&fit=crop",
      },
      {
        id: "h4",
        title: "Progetti di programmazione",
        description: "Sviluppo piccole web app e giochi per imparare nuove tecnologie, solo per divertimento.",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80&auto=format&fit=crop",
      },
      {
        id: "h5",
        title: "Scacchi",
        description: "Strategia e pazienza. Membro del club di scacchi della scuola e giocatore online nel weekend.",
        image: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=80&auto=format&fit=crop",
      },
    ],

    pcto: [
      {
        id: "p1",
        title: "Tirocinio di sviluppo front-end",
        org: "TechNova Solutions",
        date: "Luglio 2024",
        description: "Quattro settimane con il team web per costruire componenti UI responsive e imparare i flussi di lavoro con Git, le code review e gli sprint agile. Ho rilasciato una piccola dashboard interna.",
        images: ["https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80&auto=format&fit=crop"],
        files: [],
      },
      {
        id: "p2",
        title: "Workshop di Digital Marketing",
        org: "BrightMedia Agency",
        date: "Marzo 2024",
        description: "Programma pratico su strategia dei contenuti, nozioni base di SEO e analisi dei social media. Ho creato una campagna di esempio presentata ai tutor dell'agenzia.",
        images: [],
        files: [],
      },
      {
        id: "p3",
        title: "Progetto Archivio Digitale del Museo",
        org: "Museo di Storia Cittadino",
        date: "Novembre 2023",
        description: "Ho contribuito a digitalizzare e catalogare documenti storici e ho costruito un semplice database consultabile per la collezione del museo.",
        images: ["https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80&auto=format&fit=crop"],
        files: [],
      },
    ],

    civic: [
      {
        id: "c1",
        title: "Campagna di riciclo nella comunità",
        org: "Green Future Club",
        date: "Aprile 2024",
        description: "Ho organizzato un'iniziativa di riciclo per tutta la scuola che ha ridotto i rifiuti del 30%. Ho progettato i manifesti, condotto le assemblee e monitorato i risultati durante il trimestre.",
        images: ["https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80&auto=format&fit=crop"],
        files: [],
      },
      {
        id: "c2",
        title: "Progetto su Costituzione e Cittadinanza",
        org: "Corso di Educazione Civica",
        date: "Gennaio 2024",
        description: "Ho fatto ricerca e una presentazione sui diritti costituzionali e sulle responsabilità della cittadinanza digitale nell'era moderna.",
        images: [],
        files: [],
      },
      {
        id: "c3",
        title: "Sensibilizzazione sulle elezioni locali",
        org: "Consiglio dei Giovani",
        date: "Ottobre 2023",
        description: "Ho creato materiali informativi per incoraggiare la prima iscrizione al voto dei giovani e la partecipazione civica nella nostra comunità.",
        images: ["https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&q=80&auto=format&fit=crop"],
        files: [],
      },
    ],

    portfolio: [
      {
        id: "f1",
        title: "App Dashboard Meteo",
        category: "project",
        description: "Un'app meteo responsive costruita con JavaScript puro e un'API pubblica, con ricerca per località e previsioni.",
        image: "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=800&q=80&auto=format&fit=crop",
      },
      {
        id: "f2",
        title: "Certificato Google IT Support",
        category: "certification",
        description: "Ho completato il certificato professionale di base per il supporto IT, su reti, sistemi e risoluzione dei problemi.",
        image: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&q=80&auto=format&fit=crop",
      },
      {
        id: "f3",
        title: "Ricerca di Fisica",
        category: "academic",
        description: "Un elaborato premiato sull'efficienza delle energie rinnovabili, presentato alla fiera scientifica regionale.",
        image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80&auto=format&fit=crop",
      },
      {
        id: "f4",
        title: "Sito Portfolio",
        category: "project",
        description: "Proprio questo sito — progettato e realizzato da zero con HTML, CSS e JavaScript.",
        image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80&auto=format&fit=crop",
      },
      {
        id: "f5",
        title: "Certificato Responsive Web Design",
        category: "certification",
        description: "Certificazione freeCodeCamp su HTML, CSS, flexbox, grid e buone pratiche di accessibilità.",
        image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80&auto=format&fit=crop",
      },
      {
        id: "f6",
        title: "Olimpiadi della Matematica",
        category: "academic",
        description: "Finalista regionale nella competizione nazionale di matematica per due anni consecutivi.",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80&auto=format&fit=crop",
      },
    ],
  };

  /* ---------- Storage API ---------- */
  function cleanHobbies(hobbies) {
    return (hobbies || []).filter((item) => !["Lettura", "Escursionismo", "Scacchi", "Suonare la chitarra"].includes(item.title));
  }

  const Store = {
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          this.save(DEFAULT_DATA);
          return structuredClone(DEFAULT_DATA);
        }
        const parsed = JSON.parse(raw);
        // Ensure all keys exist (forward compatibility)
        const loaded = Object.assign(structuredClone(DEFAULT_DATA), parsed);
        loaded.hobbies = cleanHobbies(loaded.hobbies);
        this.save(loaded);
        return loaded;
      } catch (e) {
        console.error("[v0] Failed to load data, using defaults:", e);
        return structuredClone(DEFAULT_DATA);
      }
    },
    save(data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
      } catch (e) {
        console.error("[v0] Failed to save data:", e);
        return false;
      }
    },
    reset() {
      localStorage.removeItem(STORAGE_KEY);
      return structuredClone(DEFAULT_DATA);
    },
  };

  global.PortfolioData = { DEFAULT_DATA, Store, STORAGE_KEY };
})(window);
