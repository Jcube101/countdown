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
