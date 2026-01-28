
import { MediaItem } from './types';

export const MOCK_MEDIA: MediaItem[] = [
  {
    id: '1',
    type: 'image',
    url: 'https://picsum.photos/id/10/1920/1080',
    thumbnail: 'https://picsum.photos/id/10/400/225',
    title: 'Aurora Boreal',
    description: 'Uma vista deslumbrante das luzes do norte.',
    category: 'Natureza',
    date: '2024-01-15',
    size: 2048576,
    folder: 'Viagens',
    isFavorite: true
  },
  {
    id: '2',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://picsum.photos/id/20/400/225',
    title: 'O Coelho e o Bosque',
    description: 'Uma curta animação sobre a vida na floresta.',
    category: 'Animação',
    date: '2024-02-10',
    duration: '9:56',
    folder: 'Filmes',
    size: 52428800
  },
  {
    id: '3',
    type: 'audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    thumbnail: 'https://picsum.photos/id/30/400/225',
    title: 'Melodia Noturna',
    description: 'Composição instrumental para relaxar.',
    category: 'Música',
    date: '2024-03-05',
    duration: '7:12',
    genre: 'Relax',
    folder: 'Playlist 1',
    isFavorite: true
  },
  {
    id: '4',
    type: 'image',
    url: 'https://picsum.photos/id/40/1920/1080',
    thumbnail: 'https://picsum.photos/id/40/400/225',
    title: 'Metrópole Futurista',
    description: 'Arquitetura urbana moderna e luzes da cidade.',
    category: 'Cidades',
    date: '2024-03-12',
    size: 1048576,
    folder: 'Trabalho'
  },
  {
    id: '5',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://picsum.photos/id/50/400/225',
    title: 'Sonho dos Elefantes',
    description: 'Exploração surrealista de máquinas e sonhos.',
    category: 'Animação',
    date: '2024-03-20',
    duration: '10:53',
    folder: 'Documentários',
    size: 83886080
  },
  {
    id: '6',
    type: 'audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    thumbnail: 'https://picsum.photos/id/60/400/225',
    title: 'Sinfonia do Oceano',
    description: 'Sons relaxantes das ondas do mar.',
    category: 'Natureza',
    date: '2024-04-01',
    duration: '6:34',
    genre: 'Natureza',
    folder: 'Relax'
  },
  {
    id: '7',
    type: 'image',
    url: 'https://picsum.photos/id/70/1920/1080',
    thumbnail: 'https://picsum.photos/id/70/400/225',
    title: 'Montanhas Nevadas',
    description: 'Picos brancos sob o céu azul profundo.',
    category: 'Natureza',
    date: '2024-04-10',
    size: 3145728,
    folder: 'Viagens'
  },
  {
    id: '8',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail: 'https://picsum.photos/id/80/400/225',
    title: 'A Jornada de Sintel',
    description: 'Uma aventura épica em busca de um dragão.',
    category: 'Aventura',
    date: '2024-04-15',
    duration: '14:48',
    folder: 'Filmes',
    size: 104857600
  }
];
