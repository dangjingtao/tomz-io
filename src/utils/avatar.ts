import type { SyntheticEvent } from 'react';
import { appBase } from './paths';

const localMiraAvatarUrl = `${appBase}mira-avatar.webp`;
export function handleMiraAvatarError(event: SyntheticEvent<HTMLImageElement>) {
  if (event.currentTarget.dataset.avatarFallbackApplied) return;
  event.currentTarget.dataset.avatarFallbackApplied = "true";
  event.currentTarget.src = localMiraAvatarUrl;
}
