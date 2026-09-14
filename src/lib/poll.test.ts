import { expect, it } from 'vitest'
import { validatePoll } from './poll'
it('requires a question and distinct nonempty options', () => {
 expect(() => validatePoll({question:'?',options:['Yes','Yes'],enabled:true})).toThrow()
 expect(() => validatePoll({question:'',options:['Yes','No'],enabled:true})).toThrow()
 expect(() => validatePoll({question:'Ready?',options:['Yes','No'],enabled:true})).not.toThrow()
})
