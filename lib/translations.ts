// utils/translations.ts
import { en } from "@/constants/en";
import { ro } from "@/constants/ro";

type Language = "en" | "ro";

export function getTranslations(language: Language) {
  switch (language) {
    case "ro":
      return ro;
    case "en":
    default:
      return en;
  }
}
