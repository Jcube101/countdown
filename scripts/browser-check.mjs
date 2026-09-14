// Run with PLAYWRIGHT_MODULE pointing to an installed playwright entry point.
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href)
const browser=await chromium.launch({headless:true, executablePath:process.env.CHROMIUM_PATH})
const base=process.env.COUNTDOWN_TEST_URL || 'http://127.0.0.1:5174'
const fixtures=['midnight-chronograph','studio-minimal','signal-board'].map((theme,i)=>({id:`fixture${i}`,title:['CALL-E','Buildathon','Signal event'][i],slug:`fixture-${i}`,deadline_date:'2099-09-14',deadline_time:'21:30',timezone:'Asia/Kolkata',theme_id:theme,visibility:'public',archived:false}))
const owner={id:'fixtureowner',collectionId:'fixtureowners',collectionName:'countdown_owners'}
// Synthetic, unsigned test token, accepted only by intercepted responses.
const token=`fixture.${Buffer.from(JSON.stringify({exp:4102444800})).toString('base64url')}.fixture`
for(const width of [390,1280]){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'})
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message))
 let records=structuredClone(fixtures), writes=0
 let poll={id:'pollfixture',countdown:'fixture0',question:'Ready?',options:['Yes','No'],enabled:true}; const votes=[]
 await page.route('https://pb-apps.job-joseph.com/**',async route=>{
  const req=route.request(),url=new URL(req.url());let data
  if(url.pathname.endsWith('/auth-refresh'))data={token,record:owner}
  else if(url.pathname.includes('/countdown_items/records')){
   if(req.method()==='PATCH'){writes++;const id=url.pathname.split('/').at(-1);const patch=req.postDataJSON();assert(!('slug' in patch));records=records.map(r=>r.id===id?{...r,...patch}:r);data=records.find(r=>r.id===id)}
   else data={page:1,perPage:500,totalPages:1,totalItems:records.length,items:url.searchParams.has('filter')?records.filter(r=>!r.archived):records}
  }else if(url.pathname.includes('/countdown_polls/records')){
   if(req.method()==='PATCH'){poll={...poll,...req.postDataJSON()};data=poll}
   else data={page:1,totalPages:1,items:(url.searchParams.get('filter')||'').includes('fixture0')?[poll]:[]}
  }else if(url.pathname.includes('/countdown_poll_votes/records')){
   if(req.method()==='POST'){data={id:'votefixture',...req.postDataJSON()};votes.push(data)}
   else data={page:1,totalPages:1,items:votes}
  }
  else throw new Error(`Unexpected intercepted request: ${req.method()} ${url.pathname}`)
  await route.fulfill({json:data})
 })
 await page.goto(base);await page.getByRole('heading',{name:'CALL-E'}).waitFor();await page.getByRole('heading',{name:'Buildathon'}).waitFor()
 for(let i=0;i<3;i++){
  await page.goto(`${base}/c/fixture-${i}`);await page.getByRole('timer').waitFor()
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow theme ${i} at ${width}`)
  if(i===0){assert.equal(await page.getByText('Ready?').count(),0);await page.getByRole('button',{name:'Vote',exact:true}).click();await page.getByText('0 total votes.').waitFor();await page.getByRole('button',{name:/Yes/}).click();await page.getByText('Your vote: Yes.').waitFor();assert.equal(votes.length,1)}
  await page.screenshot({path:`/tmp/countdown-${width}-${i}.png`,fullPage:true})
 }
 await page.goto(`${base}/manage`);await page.getByRole('button',{name:'Send magic link'}).waitFor()
 await page.evaluate(({token,owner})=>localStorage.setItem('pocketbase_auth',JSON.stringify({token,record:owner})),{token,owner})
 await page.reload();await page.getByRole('button',{name:'Edit CALL-E'}).click();await page.getByRole('heading',{name:'Edit countdown',exact:true}).waitFor()
 assert(await page.getByLabel('Slug',{exact:true}).getAttribute('readonly')!==null)
 await page.getByLabel('Enable Vote control').uncheck();
 await page.getByLabel('Title',{exact:true}).fill('CALL-E edited fixture');await page.getByRole('button',{name:'Save changes'}).click();await page.getByText('Countdown and poll configuration saved.').waitFor()
 assert.equal(poll.enabled,false);
 await page.getByRole('button',{name:'Archive Buildathon'}).click();await page.getByRole('button',{name:'Cancel archive'}).click();assert.equal(writes,1)
 await page.getByRole('button',{name:'Archive Buildathon'}).click();await page.getByRole('button',{name:'Confirm archive'}).click();await page.getByText('Countdown archived. Its slug remains reserved.').waitFor();assert.equal(writes,2)
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`manage overflow at ${width}`)
 await page.getByRole('button',{name:'Log out'}).click();await page.getByRole('button',{name:'Send magic link'}).waitFor()
 assert.deepEqual(errors,[]);console.log(`PASS ${width}px: public index, three themes, vote submission, poll configuration, owner edit, stable slug, archive cancel/confirm, logout; no overflow or page errors`)
 await context.close()
}
await browser.close()
