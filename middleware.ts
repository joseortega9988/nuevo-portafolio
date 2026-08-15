import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Skip Next internals, the API surface and anything with a file extension
  // (public/ assets: logo, CVs, project images) so they are served untouched.
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
