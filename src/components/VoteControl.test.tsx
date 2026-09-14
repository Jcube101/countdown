// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
const api=vi.hoisted(()=>({getPoll:vi.fn(),getResults:vi.fn(),submitVote:vi.fn()}))
vi.mock('../lib/poll',()=>({...api,savedVote:()=>null}))
import { VoteControl } from './VoteControl'
import { newCountdown } from '../lib/countdowns'
afterEach(cleanup)
it('keeps votes collapsed and disables choices after submission',async()=>{
 api.getPoll.mockResolvedValue({id:'p',question:'Ready?',options:['Yes','No'],enabled:true});api.getResults.mockResolvedValue({Yes:0,No:0});api.submitVote.mockResolvedValue(true)
 render(<VoteControl countdown={{...newCountdown(),id:'fixture'}}/>);
 fireEvent.click(await screen.findByRole('button',{name:'Vote'}));await screen.findByText('0 total votes.')
 fireEvent.click(screen.getByRole('button',{name:'Yes 0 · 0%'}));await screen.findByText('Your vote: Yes.')
 await waitFor(()=>expect((screen.getByRole('button',{name:'No 0 · 0%'}) as HTMLButtonElement).disabled).toBe(true))
})
