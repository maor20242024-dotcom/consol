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

    }

  }

});