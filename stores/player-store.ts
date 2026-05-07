import type { Episode } from '@/types/podcast'
import { Store } from '@tanstack/store'

export interface PlayerStoreState {
  currentEpisode: Episode | null
  isPlaying: boolean
  isSourceChanging: boolean
}

let playerStore: Store<PlayerStoreState> | null = null

function createPlayerStore() {
  return new Store<PlayerStoreState>({
    currentEpisode: null,
    isPlaying: false,
    isSourceChanging: false,
  })
}

export function initPlayerStore(): Store<PlayerStoreState> {
  if (!playerStore) {
    playerStore = createPlayerStore()
  }
  return playerStore
}

export function getPlayerStore(): Store<PlayerStoreState> {
  if (!playerStore) {
    throw new Error('Player store has not been initialized')
  }
  return playerStore
}

export function setCurrentEpisode(episode: Episode) {
  const store = getPlayerStore()
  store.setState(state => ({
    currentEpisode: episode,
    isPlaying: true,
    isSourceChanging: state.currentEpisode?.id !== episode.id,
  }))
}

export function clearPlayerEpisode() {
  const store = getPlayerStore()
  store.setState(() => ({
    currentEpisode: null,
    isPlaying: false,
    isSourceChanging: false,
  }))
}

export function setIsPlaying(isPlaying: boolean) {
  const store = getPlayerStore()
  store.setState(state => ({ ...state, isPlaying }))
}

export function setIsSourceChanging(isSourceChanging: boolean) {
  const store = getPlayerStore()
  store.setState(state => ({ ...state, isSourceChanging }))
}

export function play() {
  const store = getPlayerStore()
  store.setState(state => ({ ...state, isPlaying: true }))
}

export function pause() {
  const store = getPlayerStore()
  store.setState(state => ({ ...state, isPlaying: false, isSourceChanging: false }))
}
