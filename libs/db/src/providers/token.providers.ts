import { Token } from '@libs/db';

export const tokenProviders = [
  {
    provide: 'TOKEN_REPOSITORY',
    useValue: Token,
  },
];
