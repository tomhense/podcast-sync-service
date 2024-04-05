export interface CreateSubscriptionDto {
  add: string[];
  remove: string[];
}
export interface CreateEpisodeActionDto {
  podcast: string;
  episode: string;
  guid: string;
  action: string;
  timestamp: string;
  position: number;
  started: number;
  total: number;
}

export interface SubscriptionResponseDto {
  subscriptions: string[];
  timestamp: number;
}

export interface CreateSubscriptionChangeResponseDto {
  timestamp: number;
}

export interface CreateEpisodeActionResponseDto {
  timestamp: number;
}

export interface EpisodeActionResponseDto {
  actions: CreateEpisodeActionDto[];
  timestamp: number;
}
