import { COUNTDOWN_COLLECTION, pb } from './pocketbase'

export type ThemeId = 'midnight-chronograph' | 'studio-minimal' | 'signal-board'
export type Countdown = { id: string; title: string; slug: string; deadline_date: string; deadline_time: string; timezone: string; theme_id: ThemeId; visibility: 'public'; note?: string; archived: boolean }
export type CountdownDraft = Omit<Countdown, 'id'>

export const themes: Array<{ id: ThemeId; name: string; description: string }> = [
  { id: 'midnight-chronograph', name: 'Midnight Chronograph', description: 'Dark, mechanical, and precise.' },
  { id: 'studio-minimal', name: 'Studio Minimal', description: 'Editorial, quiet, and clear.' },
  { id: 'signal-board', name: 'Signal Board', description: 'High-contrast, event-ready display.' },
]

export const newCountdown = (): CountdownDraft => ({ title: '', slug: '', deadline_date: '', deadline_time: '09:00', timezone: 'Asia/Kolkata', theme_id: 'midnight-chronograph', visibility: 'public', note: '', archived: false })
export const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
export const listPublic = () => pb.collection(COUNTDOWN_COLLECTION).getFullList<Countdown>({ sort: 'deadline_date,deadline_time' })
export const listManaged = () => pb.collection(COUNTDOWN_COLLECTION).getFullList<Countdown>({ sort: '-updated' })
export const saveCountdown = (draft: CountdownDraft, id?: string) => id ? pb.collection(COUNTDOWN_COLLECTION).update<Countdown>(id, draft) : pb.collection(COUNTDOWN_COLLECTION).create<Countdown>(draft)
export const archiveCountdown = (countdown: Countdown) => pb.collection(COUNTDOWN_COLLECTION).update<Countdown>(countdown.id, { archived: true })
