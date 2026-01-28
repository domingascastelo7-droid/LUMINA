
export type MediaType = 'image' | 'video' | 'audio' | 'stream';
export type MediaSource = 'system' | 'user' | 'usb' | 'network' | 'iptv';
export type ViewMode = 'grid' | 'list';
export type ConnectionStatus = 'online' | 'offline' | 'checking' | 'unknown';

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnail: string;
  title: string;
  description: string;
  aiDescription?: string;
  category: string;
  date: string;
  duration?: string;
  isUserUploaded?: boolean;
  source?: MediaSource;
  isLive?: boolean;
  size?: number; // in bytes
  folder?: string;
  genre?: string;
  isFavorite?: boolean;
  sourceId?: string; // Reference to a NetworkSource
}

export interface NetworkSource {
  id: string;
  name: string;
  url: string;
  status: ConnectionStatus;
  lastChecked: string;
  type: 'iptv' | 'network';
}

export interface Album {
  id: string;
  name: string;
  mediaIds: string[];
  createdAt: string;
}

export enum NavigationSection {
  SIDEBAR = 'SIDEBAR',
  CONTENT = 'CONTENT',
  PLAYER = 'PLAYER',
  HEADER = 'HEADER',
  MODAL = 'MODAL',
  ALBUM_PICKER = 'ALBUM_PICKER',
  AI_HUB = 'AI_HUB',
  PLAYER_CONTROLS = 'PLAYER_CONTROLS',
  SOURCE_MANAGER = 'SOURCE_MANAGER'
}

export interface NavState {
  section: NavigationSection;
  sidebarIndex: number;
  contentIndex: number;
  headerIndex: number;
  pickerIndex?: number;
  playerControlIndex?: number;
  playerOptionIndex?: number;
}
