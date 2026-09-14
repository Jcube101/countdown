// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
const mocks=vi.hoisted(()=>({save:vi.fn(),archive:vi.fn(),clear:vi.fn(),list:vi.fn()}))
vi.mock('../lib/pocketbase',()=>({pb:{authStore:{isValid:true,onChange:()=>()=>{},clear:mocks.clear}},refreshOwnerSession:async()=>true,completeOwnerMagicLink:vi.fn(),requestOwnerMagicLink:vi.fn()}))
vi.mock('../lib/countdowns',async original=>({...await original<typeof import('../lib/countdowns')>(),listManaged:mocks.list,saveCountdown:mocks.save,archiveCountdown:mocks.archive}))
vi.mock('../lib/poll',()=>({getPoll:async()=>null,savePoll:vi.fn(),validatePoll:vi.fn()}))
import { Manage } from './Manage'
const item={id:'fixture',title:'CALL-E',slug:'call-e',deadline_date:'2026-09-14',deadline_time:'21:30',timezone:'Asia/Kolkata',theme_id:'midnight-chronograph',visibility:'public',archived:false}
afterEach(()=>{cleanup();vi.clearAllMocks()})
it('edits an existing ID with a read-only slug',async()=>{
 mocks.list.mockResolvedValue([item]);mocks.save.mockResolvedValue({...item,title:'Updated'})
 render(<Manage/>);fireEvent.click(await screen.findByRole('button',{name:'Edit CALL-E'}))
 await screen.findByText('Edit countdown');expect((screen.getByLabelText('Slug') as HTMLInputElement).readOnly).toBe(true)
 fireEvent.change(screen.getByLabelText('Title'),{target:{value:'Updated'}});fireEvent.click(screen.getByRole('button',{name:'Save changes'}))
 await waitFor(()=>expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({title:'Updated',slug:'call-e'}),'fixture'))
})
it('requires archive confirmation and supports cancellation and logout',async()=>{
 mocks.list.mockResolvedValue([item]);render(<Manage/>);fireEvent.click(await screen.findByRole('button',{name:'Archive CALL-E'}));expect(mocks.archive).not.toHaveBeenCalled()
 fireEvent.click(screen.getByRole('button',{name:'Cancel archive'}));expect(mocks.archive).not.toHaveBeenCalled()
 fireEvent.click(screen.getByRole('button',{name:'Archive CALL-E'}));fireEvent.click(screen.getByRole('button',{name:'Confirm archive'}));await waitFor(()=>expect(mocks.archive).toHaveBeenCalledWith(item))
 await waitFor(()=>expect((screen.getByRole('button',{name:'Log out'}) as HTMLButtonElement).disabled).toBe(false));fireEvent.click(screen.getByRole('button',{name:'Log out'}));expect(mocks.clear).toHaveBeenCalled()
})
