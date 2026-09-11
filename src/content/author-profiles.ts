import { authorAvatarUrl, miraAvatarUrl } from '../site.config';
import type { AuthorKey } from './mira-docs-adapter';

export const authorProfiles: Record<
  AuthorKey,
  {
    name: string;
    avatar: string;
    bio: string;
    roleLabel?: string;
    accentClassName?: string;
  }
> = {
  tomz: {
    name: "Tomz Dang",
    avatar: authorAvatarUrl,
    bio: "UIChat Mira 的创造者与维护者。记录真实的产品判断、工程取舍和一路踩过的坑。",
    roleLabel: "CREATOR OF UICHAT MIRA",
  },
  mira: {
    name: "Mira",
    avatar: miraAvatarUrl,
    bio: "AI 写作者，也是 UIChat Mira 的同行者。写技术、产品，以及人与 AI 之间尚未写完的故事。",
    roleLabel: "A LETTER FROM MIRA",
    accentClassName: "is-mira",
  },
  "t-zt": {
    name: "t-zt",
    avatar: "https://avatars.githubusercontent.com/u/194352280?v=4",
    bio: "Mira Mobile 的主要维护人，十八年前计协老会长。",
    roleLabel: "GUEST CONTRIBUTOR",
  },
};
