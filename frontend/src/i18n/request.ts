import { getRequestConfig } from "next-intl/server";
import { routing } from "@/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale;
  }

  const [common, management] = await Promise.all([
    import(`@/messages/${locale}/common.json`).then((m) => m.default),
    import(`@/messages/${locale}/management.json`).then((m) => m.default),
  ]);

  return {
    locale: locale as string,
    messages: { ...common, ...management },
  };
});
