'use client';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {template,type Workflow,type Execution} from './engine';
type State={workflows:Workflow[];executions:Execution[];seeded:boolean;seed:()=>void;save:(w:Workflow)=>void;remove:(id:string)=>void;record:(e:Execution)=>void};
export const useStore=create<State>()(persist((set)=>({workflows:[],executions:[],seeded:false,seed:()=>set(s=>s.seeded?s:{seeded:true,workflows:[template(0),template(1),template(2)]}),save:(w)=>set(s=>({workflows:s.workflows.some(x=>x.id===w.id)?s.workflows.map(x=>x.id===w.id?w:x):[w,...s.workflows]})),remove:(id)=>set(s=>({workflows:s.workflows.filter(w=>w.id!==id)})),record:(e)=>set(s=>({executions:[e,...s.executions].slice(0,200)}))}),{name:'flow-ascen-v1',version:1,skipHydration:true}));
