import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  pathnames: {
    "/": "/",
    "/dashboard": {
      ar: "/dashboard",
      en: "/dashboard"
    },
    "/login": {
      ar: "/login",
      en: "/login"
    },
    "/voice": {
      ar: "/voice",
      en: "/voice"
    },
    "/crm": {
      ar: "/crm",
      en: "/crm"
    },
    "/admin": {
      ar: "/admin",
      en: "/admin"
    },
    "/ai-assistant": {
      ar: "/ai-assistant",
      en: "/ai-assistant"
    },
    "/ad-creator": {
      ar: "/ad-creator",
      en: "/ad-creator"
    },
    "/analytics": {
      ar: "/analytics",
      en: "/analytics"
    },
    "/campaigns-manager": {
      ar: "/campaigns-manager",
      en: "/campaigns-manager"
    },
    "/settings": {
      ar: "/settings",
      en: "/settings"
    },
    "/ab-testing": {
      ar: "/ab-testing",
      en: "/ab-testing"
    }
  }
});