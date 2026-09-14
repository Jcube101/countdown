import { expect, it, vi } from 'vitest'
const api = vi.hoisted(() => ({ getFullList: vi.fn(), update: vi.fn(), create: vi.fn() }))
vi.mock('./pocketbase', () => ({ COUNTDOWN_COLLECTION: 'countdown_items', pb: { collection: () => api } }))
import { listPublic, saveCountdown, newCountdown, archiveCountdown, slugify } from './countdowns'
it('explicitly filters public, unarchived records even for owner sessions', async () => {
 await listPublic(); expect(api.getFullList).toHaveBeenCalledWith(expect.objectContaining({ filter: 'visibility = "public" && archived = false' }))
})
it('does not send a published slug during edits', async () => {
 await saveCountdown({...newCountdown(),title:'Updated',slug:'changed',deadline_date:'2026-09-14'}, 'existing')
 expect(api.update.mock.lastCall?.[1]).not.toHaveProperty('slug')
})
it('archives without deleting or changing the slug', async () => {
 await archiveCountdown({...newCountdown(),id:'existing'}); expect(api.update).toHaveBeenLastCalledWith('existing',{archived:true})
})
it('normalizes proposed slugs', () => expect(slugify(' CALL-E Launch! ')).toBe('call-e-launch'))
it('rejects unsafe theme IDs before writing', () => {
 expect(()=>saveCountdown({...newCountdown(),title:'Test',slug:'test',deadline_date:'2026-09-14',theme_id:'custom' as never})).toThrow()
})
