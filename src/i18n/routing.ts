import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({

  locales: ["ar", "en"],

  defaultLocale: "ar",

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

    }

  }

});