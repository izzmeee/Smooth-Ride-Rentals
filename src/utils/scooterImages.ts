import hondaActiva6gImg from '../assets/images/honda_activa_6g_1795149445983.jpg';
import tvsJupiter125Img from '../assets/images/tvs_jupiter_125_1795149446086.jpg';
import suzukiAccess125Img from '../assets/images/suzuki_access_125_1795149447360.jpg';
import heroDestini125Img from '../assets/images/hero_destini_125_1795149446272.jpg';
import smoothRideHeroImg from '../assets/images/smooth_ride_hero_1795149446698.jpg';

export const HERO_RIDER_IMAGE = smoothRideHeroImg;

export const SCOOTER_IMAGE_CATALOG = {
  activa: hondaActiva6gImg,
  jupiter: tvsJupiter125Img,
  access: suzukiAccess125Img,
  destini: heroDestini125Img,
};

/**
 * Returns the exact photorealistic scooter image corresponding to the vehicle's
 * make/model name so every scooter displays its accurate model photo.
 */
export function getScooterImage(nameOrModel: string, customImageUrl?: string): string {
  if (customImageUrl && customImageUrl.trim().length > 0) {
    return customImageUrl;
  }

  const normalized = (nameOrModel || '').toLowerCase();

  if (normalized.includes('activa') || normalized.includes('honda')) {
    return hondaActiva6gImg;
  }
  if (normalized.includes('jupiter') || normalized.includes('tvs')) {
    return tvsJupiter125Img;
  }
  if (normalized.includes('access') || normalized.includes('suzuki')) {
    return suzukiAccess125Img;
  }
  if (normalized.includes('destini') || normalized.includes('hero')) {
    return heroDestini125Img;
  }

  return hondaActiva6gImg;
}
