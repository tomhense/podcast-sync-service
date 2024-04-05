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
