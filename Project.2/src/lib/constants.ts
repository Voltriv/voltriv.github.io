const BASE_PATH = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
const MEDIA_BASE_PATH = `${BASE_PATH}/pics%20and%20vid`;
export const BIRTHDAY_DATE = new Date('November 30, 2025 00:00:00');

export function mediaAsset(path: string) {
  return `${MEDIA_BASE_PATH}/${path}`;
}
