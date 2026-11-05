"use client";
import NextLink from 'next/link';
import { forwardRef } from 'react';
import { useLocale } from 'use-intl';
import syncLocaleCookie from './syncLocaleCookie.js';
import { jsx } from 'react/jsx-runtime';

// Somehow the types for `next/link` don't work as expected
// when `moduleResolution: "nodenext"` is used.
const Link = NextLink;

// Links that change the locale are handled in a separate component,
// since they require additional handling for syncing the locale cookie.
function LocaleChangingLink({
  curLocale,
  linkRef,
  locale,
  localeCookie,
  onClick,
  prefetch,
  ...rest
}) {
  function onLinkClick(event) {
    // Even though we force a prefix when changing locales,
    // this could be a cache hit of the client-side router,
    // therefore we sync the cookie to ensure it's up to date.
    syncLocaleCookie(localeCookie, curLocale, locale);
    if (onClick) onClick(event);
  }
  if (prefetch && "development" !== 'production') {
    console.error('The `prefetch` prop is currently not supported when using the `locale` prop on `Link` to switch the locale.`');
  }
  return /*#__PURE__*/jsx(Link, {
    ref: linkRef,
    hrefLang: locale,
    onClick: onLinkClick,
    prefetch: false,
    ...rest
  });
}
function BaseLink({
  locale,
  localeCookie,
  ...rest
}, ref) {
  const curLocale = useLocale();
  const isChangingLocale = locale != null && locale !== curLocale;
  if (isChangingLocale) {
    return /*#__PURE__*/jsx(LocaleChangingLink, {
      curLocale: curLocale,
      linkRef: ref,
      locale: locale,
      localeCookie: localeCookie,
      ...rest
    });
  }
  return /*#__PURE__*/jsx(Link, {
    ref: ref,
    ...rest
  });
}
var BaseLink$1 = /*#__PURE__*/forwardRef(BaseLink);

export { BaseLink$1 as default };
