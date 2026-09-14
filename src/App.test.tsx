// @vitest-environment jsdom
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
const api=vi.hoisted(()=>({listPublic:vi.fn()}))
vi.mock('./lib/countdowns', async importOriginal=>({...await importOriginal<typeof import('./lib/countdowns')>(),listPublic:api.listPublic}))
import App from './App'
afterEach(()=>{cleanup();history.replaceState(null,'','/')})
it('shows loading before the public request finishes',()=>{api.listPublic.mockReturnValue(new Promise(()=>{}));render(<App/>);expect(screen.getByRole('status').textContent).toContain('Loading')})
it('shows a retryable public failure',async()=>{api.listPublic.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce([]);render(<App/>);fireEvent.click(await screen.findByRole('button',{name:'Try again'}));expect(await screen.findByText('No public countdowns yet.')).toBeTruthy()})
it('distinguishes missing details from loading',async()=>{history.replaceState(null,'','/c/missing');api.listPublic.mockResolvedValue([]);render(<App/>);expect(await screen.findByText('Countdown unavailable')).toBeTruthy()})
it('keeps a timer page free of library chrome',async()=>{
 history.replaceState(null,'','/c/live')
 api.listPublic.mockResolvedValue([{id:'1',title:'Buildathon',slug:'live',deadline_date:'2099-01-01',deadline_time:'12:00',timezone:'UTC',theme_id:'midnight-chronograph',visibility:'public',archived:false}])
 render(<App/>)
 expect(await screen.findByRole('timer')).toBeTruthy()
 expect(screen.queryByRole('navigation',{name:'Main navigation'})).toBeNull()
 expect(screen.getByRole('link',{name:'Library'})).toBeTruthy()
 expect(screen.getByRole('link',{name:'Settings'})).toBeTruthy()
 expect(screen.queryByText('Midnight Chronograph')).toBeNull()
 expect(screen.queryByText('PUBLIC LIBRARY')).toBeNull()
})
it('keeps ended Midnight digits on stage',async()=>{
 history.replaceState(null,'','/c/ended')
 api.listPublic.mockResolvedValue([{id:'2',title:'CALL-E Hackathon',slug:'ended',deadline_date:'2020-01-01',deadline_time:'00:00',timezone:'UTC',theme_id:'midnight-chronograph',visibility:'public',archived:false}])
 render(<App/>)
 expect(await screen.findByRole('timer')).toBeTruthy()
 expect(document.querySelectorAll('.flip-digit').length).toBeGreaterThan(0)
 expect(screen.queryByText('This countdown has ended.')).toBeNull()
})
