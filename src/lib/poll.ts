import { pb } from './pocketbase'

const POLLS = 'countdown_polls'
const VOTES = 'countdown_poll_votes'

export type Poll = { id: string; countdown: string; question: string; options: string[]; enabled: boolean }
export type PollResult = Record<string, number>

export function voteKey(pollId: string) { return `countdown:vote:${pollId}` }
export function savedVote(pollId: string) { return localStorage.getItem(voteKey(pollId)) }
export async function getPoll(countdownId: string, managed = false) { const polls = await pb.collection(POLLS).getFullList<Poll>({ filter: pb.filter('countdown = {:id}' + (managed ? '' : ' && enabled = true'), {id: countdownId}) }); return polls[0] ?? null }
export async function getResults(poll: Poll) { const votes = await pb.collection(VOTES).getFullList<{ choice: string }>({ filter: pb.filter('poll = {:id}', {id: poll.id}) }); return poll.options.reduce<PollResult>((result, option) => ({ ...result, [option]: votes.filter((vote) => vote.choice === option).length }), {}) }
export async function submitVote(poll: Poll, choice: string) { if (!poll.options.includes(choice) || savedVote(poll.id)) return false; await pb.collection(VOTES).create({ poll: poll.id, choice, voter: crypto.randomUUID().slice(0, 16) }); localStorage.setItem(voteKey(poll.id), choice); return true }

export type PollDraft = Pick<Poll, 'question' | 'options' | 'enabled'>
export function validatePoll(draft: PollDraft) {
 if (!draft.question.trim() || draft.question.length > 240 || draft.options.length < 2 || draft.options.length > 6 || draft.options.some(o => !o.trim() || o.length > 120) || new Set(draft.options.map(o => o.trim().toLowerCase())).size !== draft.options.length) throw new Error('Use a question and 2–6 distinct options (120 characters each).')
}
export async function savePoll(countdown: string, draft: PollDraft, existing: Poll | null) {
 if (!existing && !draft.enabled) return
 validatePoll(draft)
 // Published choices remain stable so existing votes keep their meaning.
 if (existing && (draft.question !== existing.question || JSON.stringify(draft.options) !== JSON.stringify(existing.options))) throw new Error('Published poll questions and choices are fixed. You can enable or disable the poll.')
 return existing ? pb.collection(POLLS).update<Poll>(existing.id, {enabled: draft.enabled}) : pb.collection(POLLS).create<Poll>({...draft, countdown})
}
