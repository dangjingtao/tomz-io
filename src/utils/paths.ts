export const appBase = import.meta.env.BASE_URL;

export function docHref(path: string) {
  return `${appBase}${path.replace(/^\/+/, '')}`;
}

export function decodedPathname(path: string) {
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}
