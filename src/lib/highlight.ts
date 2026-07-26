import { createHighlighter, type Highlighter } from "shiki";
import { LANGUAGES } from "./engine/algorithm";

let instance: Promise<Highlighter> | null = null;

function getHighlighter() {
  instance ??= createHighlighter({
    themes: ["github-light", "github-dark-default"],
    langs: ["python", "javascript", "java", "cpp", "text"],
  });
  return instance;
}

/**
 * Emits dual-theme markup (CSS variables for light and dark) so the code block
 * follows the app theme without re-highlighting on the client.
 */
export async function highlightAll(code: Record<string, string>) {
  const highlighter = await getHighlighter();
  const out: Record<string, string> = {};

  for (const lang of LANGUAGES) {
    out[lang.id] = highlighter.codeToHtml(code[lang.id] ?? "", {
      lang: lang.shiki,
      themes: { light: "github-light", dark: "github-dark-default" },
      defaultColor: false,
    });
  }

  return out;
}
