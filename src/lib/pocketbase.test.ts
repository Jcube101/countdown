import { expect, it, vi } from 'vitest'
import { pb, refreshOwnerSession } from './pocketbase'
it('rejects sessions from another collection', async () => {
 vi.spyOn(pb.authStore, 'isValid', 'get').mockReturnValue(true)
 vi.spyOn(pb.authStore, 'record', 'get').mockReturnValue({id:'other',collectionId:'other',collectionName:'other'})
 const clear = vi.spyOn(pb.authStore,'clear')
 expect(await refreshOwnerSession()).toBe(false)
 expect(clear).toHaveBeenCalled()
 vi.restoreAllMocks()
})
it('clears an expired owner session after refresh failure', async () => {
 vi.spyOn(pb.authStore,'isValid','get').mockReturnValue(true)
 vi.spyOn(pb.authStore,'record','get').mockReturnValue({id:'owner',collectionId:'owners',collectionName:'countdown_owners'})
 const service=pb.collection('countdown_owners')
 vi.spyOn(service,'authRefresh').mockRejectedValue(new Error('expired'))
 const clear=vi.spyOn(pb.authStore,'clear')
 expect(await refreshOwnerSession()).toBe(false);expect(clear).toHaveBeenCalled();vi.restoreAllMocks()
})
it('accepts a refreshed dedicated owner session', async () => {
 vi.spyOn(pb.authStore,'isValid','get').mockReturnValue(true)
 vi.spyOn(pb.authStore,'record','get').mockReturnValue({id:'owner',collectionId:'owners',collectionName:'countdown_owners'})
 vi.spyOn(pb.collection('countdown_owners'),'authRefresh').mockResolvedValue({token:'fixture',record:{id:'owner',collectionId:'owners',collectionName:'countdown_owners'}})
 expect(await refreshOwnerSession()).toBe(true);vi.restoreAllMocks()
})
