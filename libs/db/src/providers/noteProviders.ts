import { Note } from '@libs/db';

export const noteProviders = [
  {
    provide: 'NOTE_REPOSITORY',
    useValue: Note,
  },
];
