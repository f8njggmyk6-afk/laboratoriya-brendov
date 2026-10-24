import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=ts.transpileModule(fs.readFileSync('src/site/checkoutScroll.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
let y=1800, header=145, absolute=2400, focused=false;
const jobs=new Map(), listeners=new Map(), style=new Map([['scroll-behavior','smooth']]);let next=0;
const target={isConnected:true,focus(){focused=true;},getBoundingClientRect(){return {top:absolute-y}}};
const window={get scrollY(){return y},visualViewport:{offsetTop:0},scrollTo({top}){assert.equal(style.get('scroll-behavior'),'auto');y=top},addEventListener(name,fn){listeners.set(name,fn)},removeEventListener(name){listeners.delete(name)}};
const document={getElementById(){return target},querySelector(){return {getBoundingClientRect(){return {bottom:header}}}},documentElement:{style:{getPropertyValue:k=>style.get(k)||'',getPropertyPriority:()=>'',setProperty:(k,v)=>style.set(k,v),removeProperty:k=>style.delete(k)}}};
const context={exports:{},window,document,setTimeout:(fn,ms)=>{const id=++next;jobs.set(id,{fn,ms});return id},clearTimeout:id=>jobs.delete(id),requestAnimationFrame:fn=>{const id=++next;jobs.set(id,{fn,ms:16});return id},cancelAnimationFrame:id=>jobs.delete(id)};
vm.runInNewContext(source,context);
const run=ms=>{for(const [id,job] of [...jobs])if(job.ms===ms){jobs.delete(id);job.fn();}};
context.exports.revealCheckoutSection('checkout');assert(focused);assert.equal(absolute-y,169);
// Browser chrome expands and content shifts after the initial jump.
header=178;absolute+=75;y+=100;run(240);assert.equal(absolute-y,202);
// A user's gesture must stop all automatic corrections.
listeners.get('touchstart')();y=350;run(500);assert.equal(y,350);assert.equal(style.get('scroll-behavior'),'smooth');
context.exports.revealCheckoutSection('checkout');run(550);assert.equal(jobs.size,0);assert.equal(style.get('scroll-behavior'),'smooth');
console.log('PASS checkout scroll: mobile header/layout changes corrected, user gestures cancel correction, smooth-scroll settings restored.');
