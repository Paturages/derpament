var derpament=function(){"use strict";function t(){}function e(t,e){for(const n in e)t[n]=e[n];return t}function n(t){return t()}function s(){return Object.create(null)}function o(t){t.forEach(n)}function r(t){return"function"==typeof t}function l(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function c(e,n,s){e.$$.on_destroy.push(function(e,...n){if(null==e)return t;const s=e.subscribe(...n);return s.unsubscribe?()=>s.unsubscribe():s}(n,s))}function a(t){return null==t?"":t}function i(t,e){t.appendChild(e)}function u(t,e,n){t.insertBefore(e,n||null)}function f(t){t.parentNode.removeChild(t)}function p(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function d(t){return document.createElement(t)}function m(t){return document.createTextNode(t)}function h(){return m(" ")}function g(){return m("")}function $(t,e,n,s){return t.addEventListener(e,n,s),()=>t.removeEventListener(e,n,s)}function y(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function v(t,e){e=""+e,t.data!==e&&(t.data=e)}let b;function w(t){b=t}function x(){if(!b)throw new Error("Function called outside component initialization");return b}function k(t){x().$$.on_mount.push(t)}function C(){const t=x();return(e,n)=>{const s=t.$$.callbacks[e];if(s){const o=function(t,e){const n=document.createEvent("CustomEvent");return n.initCustomEvent(t,!1,!1,e),n}(e,n);s.slice().forEach(e=>{e.call(t,o)})}}}const L=[],I=[],j=[],_=[],E=Promise.resolve();let S=!1;function N(t){j.push(t)}let H=!1;const O=new Set;function B(){if(!H){H=!0;do{for(let t=0;t<L.length;t+=1){const e=L[t];w(e),F(e.$$)}for(L.length=0;I.length;)I.pop()();for(let t=0;t<j.length;t+=1){const e=j[t];O.has(e)||(O.add(e),e())}j.length=0}while(L.length);for(;_.length;)_.pop()();S=!1,H=!1,O.clear()}}function F(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(N)}}const A=new Set;let q;function R(){q={r:0,c:[],p:q}}function M(){q.r||o(q.c),q=q.p}function z(t,e){t&&t.i&&(A.delete(t),t.i(e))}function P(t,e,n,s){if(t&&t.o){if(A.has(t))return;A.add(t),q.c.push(()=>{A.delete(t),s&&(n&&t.d(1),s())}),t.o(e)}}function T(t,e){P(t,1,1,()=>{e.delete(t.key)})}function D(t,e){const n={},s={},o={$$scope:1};let r=t.length;for(;r--;){const l=t[r],c=e[r];if(c){for(const t in l)t in c||(s[t]=1);for(const t in c)o[t]||(n[t]=c[t],o[t]=1);t[r]=c}else for(const t in l)o[t]=1}for(const t in s)t in n||(n[t]=void 0);return n}function V(t){return"object"==typeof t&&null!==t?t:{}}function W(t){t&&t.c()}function G(t,e,s){const{fragment:l,on_mount:c,on_destroy:a,after_update:i}=t.$$;l&&l.m(e,s),N(()=>{const e=c.map(n).filter(r);a?a.push(...e):o(e),t.$$.on_mount=[]}),i.forEach(N)}function J(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function K(t,e){-1===t.$$.dirty[0]&&(L.push(t),S||(S=!0,E.then(B)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function Q(e,n,r,l,c,a,i=[-1]){const u=b;w(e);const p=n.props||{},d=e.$$={fragment:null,ctx:null,props:a,update:t,not_equal:c,bound:s(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(u?u.$$.context:[]),callbacks:s(),dirty:i};let m=!1;if(d.ctx=r?r(e,p,(t,n,...s)=>{const o=s.length?s[0]:n;return d.ctx&&c(d.ctx[t],d.ctx[t]=o)&&(d.bound[t]&&d.bound[t](o),m&&K(e,t)),n}):[],d.update(),m=!0,o(d.before_update),d.fragment=!!l&&l(d.ctx),n.target){if(n.hydrate){const t=function(t){return Array.from(t.childNodes)}(n.target);d.fragment&&d.fragment.l(t),t.forEach(f)}else d.fragment&&d.fragment.c();n.intro&&z(e.$$.fragment),G(e,n.target,n.anchor),B()}w(u)}class U{$destroy(){J(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(){}}const X=[];function Y(e,n=t){let s;const o=[];function r(t){if(l(e,t)&&(e=t,s)){const t=!X.length;for(let t=0;t<o.length;t+=1){const n=o[t];n[1](),X.push(n,e)}if(t){for(let t=0;t<X.length;t+=2)X[t][0](X[t+1]);X.length=0}}}return{set:r,update:function(t){r(t(e))},subscribe:function(l,c=t){const a=[l,c];return o.push(a),1===o.length&&(s=n(r)||t),l(e),()=>{const t=o.indexOf(a);-1!==t&&o.splice(t,1),0===o.length&&(s(),s=null)}}}}const Z=Y([]),tt=Y(null),et=Y(null);function nt(e){let n,s,o,r,l,c,a,p;return{c(){n=d("div"),s=d("div"),o=d("a"),r=m("< Back"),l=h(),c=d("input"),y(o,"href",e[0]),y(c,"type","search"),y(c,"placeholder","Filter on players"),y(c,"class","svelte-g01nhw"),y(s,"class","inner svelte-g01nhw"),y(n,"class","root svelte-g01nhw")},m(t,f){u(t,n,f),i(n,s),i(s,o),i(o,r),i(s,l),i(s,c),a||(p=$(c,"input",e[1]),a=!0)},p(t,[e]){1&e&&y(o,"href",t[0])},i:t,o:t,d(t){t&&f(n),a=!1,p()}}}function st(t,e,n){const s=C();let o,{backHref:r}=e;return t.$set=t=>{"backHref"in t&&n(0,r=t.backHref)},[r,function(t){o&&clearTimeout(o),o=setTimeout(()=>s("search",t.target.value),500)}]}class ot extends U{constructor(t){super(),Q(this,t,st,nt,l,{backHref:0})}}function rt(e){let n,s,o,r,l,c,a,p,g,$,b=e[0].name+"";return{c(){n=d("div"),s=d("div"),o=m(e[2]),r=m(".\r\n    "),l=d("a"),c=m(b),p=h(),g=d("div"),$=m(e[1]),y(l,"href",a="https://osu.ppy.sh/users/"+e[0].id),y(l,"target","_blank"),y(s,"class","name svelte-22sxgw"),y(g,"class","roll svelte-22sxgw"),y(n,"class","root svelte-22sxgw")},m(t,e){u(t,n,e),i(n,s),i(s,o),i(s,r),i(s,l),i(l,c),i(n,p),i(n,g),i(g,$)},p(t,[e]){4&e&&v(o,t[2]),1&e&&b!==(b=t[0].name+"")&&v(c,b),1&e&&a!==(a="https://osu.ppy.sh/users/"+t[0].id)&&y(l,"href",a),2&e&&v($,t[1])},i:t,o:t,d(t){t&&f(n)}}}function lt(t,e,n){let{player:s}=e,{roll:o}=e,{index:r}=e;return t.$set=t=>{"player"in t&&n(0,s=t.player),"roll"in t&&n(1,o=t.roll),"index"in t&&n(2,r=t.index)},[s,o,r]}class ct extends U{constructor(t){super(),Q(this,t,lt,rt,l,{player:0,roll:1,index:2})}}function at(t,e,n){const s=t.slice();return s[9]=e[n],s}function it(t){let e,n,s=t[2],o=[];for(let e=0;e<s.length;e+=1)o[e]=ft(at(t,s,e));const r=t=>P(o[t],1,1,()=>{o[t]=null});return{c(){e=d("div");for(let t=0;t<o.length;t+=1)o[t].c();y(e,"class","rolls svelte-wqk9m7")},m(t,s){u(t,e,s);for(let t=0;t<o.length;t+=1)o[t].m(e,null);n=!0},p(t,n){if(5&n){let l;for(s=t[2],l=0;l<s.length;l+=1){const r=at(t,s,l);o[l]?(o[l].p(r,n),z(o[l],1)):(o[l]=ft(r),o[l].c(),z(o[l],1),o[l].m(e,null))}for(R(),l=s.length;l<o.length;l+=1)r(l);M()}},i(t){if(!n){for(let t=0;t<s.length;t+=1)z(o[t]);n=!0}},o(t){o=o.filter(Boolean);for(let t=0;t<o.length;t+=1)P(o[t]);n=!1},d(t){t&&f(e),p(o,t)}}}function ut(t){let e;const n=new ct({props:{index:t[9].index,player:t[9].player,roll:t[9].value}});return{c(){W(n.$$.fragment)},m(t,s){G(n,t,s),e=!0},p(t,e){const s={};4&e&&(s.index=t[9].index),4&e&&(s.player=t[9].player),4&e&&(s.roll=t[9].value),n.$set(s)},i(t){e||(z(n.$$.fragment,t),e=!0)},o(t){P(n.$$.fragment,t),e=!1},d(t){J(n,t)}}}function ft(t){let e,n,s=!t[0]||t[9].player.name.toLowerCase().includes(t[0].toLowerCase()),o=s&&ut(t);return{c(){o&&o.c(),e=g()},m(t,s){o&&o.m(t,s),u(t,e,s),n=!0},p(t,n){5&n&&(s=!t[0]||t[9].player.name.toLowerCase().includes(t[0].toLowerCase())),s?o?(o.p(t,n),5&n&&z(o,1)):(o=ut(t),o.c(),z(o,1),o.m(e.parentNode,e)):o&&(R(),P(o,1,1,()=>{o=null}),M())},i(t){n||(z(o),n=!0)},o(t){P(o),n=!1},d(t){o&&o.d(t),t&&f(e)}}}function pt(t){let e,n,s,o,r,l,c,a,p=t[1]?"Hide":"Show",g=t[1]&&it(t);return{c(){e=d("div"),n=d("button"),s=m(p),o=m(" rolls"),r=h(),g&&g.c(),y(e,"class","root")},m(f,p){u(f,e,p),i(e,n),i(n,s),i(n,o),i(e,r),g&&g.m(e,null),l=!0,c||(a=$(n,"click",t[3]),c=!0)},p(t,[n]){(!l||2&n)&&p!==(p=t[1]?"Hide":"Show")&&v(s,p),t[1]?g?(g.p(t,n),2&n&&z(g,1)):(g=it(t),g.c(),z(g,1),g.m(e,null)):g&&(R(),P(g,1,1,()=>{g=null}),M())},i(t){l||(z(g),l=!0)},o(t){P(g),l=!1},d(t){t&&f(e),g&&g.d(),c=!1,a()}}}function dt(t,e,n){let{players:s}=e,{rolls:o}=e,{filter:r}=e,l=!0,c=[],a=0,i=0;Object.keys(o).forEach(t=>{o[t].forEach(e=>{++a,i+=e,c.push({player:s[t],value:e})})});(i/a).toFixed(2);return c=c.sort((t,e)=>t.value<e.value?1:-1),c.forEach((t,e)=>{t.index=e&&c[e-1].value===t.value?c[e-1].index:e+1}),t.$set=t=>{"players"in t&&n(4,s=t.players),"rolls"in t&&n(5,o=t.rolls),"filter"in t&&n(0,r=t.filter)},[r,l,c,function(){n(1,l=!l)},s,o]}class mt extends U{constructor(t){super(),Q(this,t,dt,pt,l,{players:4,rolls:5,filter:0})}}function ht(e){let n,s,o,r,l,c,a,p,g,$,b,w,x,k,C,L,I,j,_,E,S,N,H,O,B,F,A,q,R=e[0].name+"",M=e[3].max+"",z=e[3][300]+"",P=e[3][200]+"",T=e[3][100]+"",D=e[3][50]+"",V=e[3].miss+"",W=e[1].toLocaleString()+"";return{c(){n=d("div"),s=d("div"),o=m(e[4]),r=m(".\r\n    "),l=d("a"),c=m(R),p=h(),g=d("div"),$=d("div"),b=m(e[2]),w=m(" max combo"),x=h(),k=d("div"),C=m(M),L=m(" |\r\n      "),I=m(z),j=m(" |\r\n      "),_=m(P),E=m(" |\r\n      "),S=m(T),N=m(" |\r\n      "),H=m(D),O=m(" |\r\n      "),B=m(V),F=h(),A=d("div"),q=m(W),y(l,"href",a="https://osu.ppy.sh/users/"+e[0].id),y(l,"target","_blank"),y(s,"class","name svelte-i1dpsp"),y($,"class","combo"),y(k,"class","counts svelte-i1dpsp"),y(g,"class","info svelte-i1dpsp"),y(A,"class","score svelte-i1dpsp"),y(n,"class","root svelte-i1dpsp")},m(t,e){u(t,n,e),i(n,s),i(s,o),i(s,r),i(s,l),i(l,c),i(n,p),i(n,g),i(g,$),i($,b),i($,w),i(g,x),i(g,k),i(k,C),i(k,L),i(k,I),i(k,j),i(k,_),i(k,E),i(k,S),i(k,N),i(k,H),i(k,O),i(k,B),i(n,F),i(n,A),i(A,q)},p(t,[e]){16&e&&v(o,t[4]),1&e&&R!==(R=t[0].name+"")&&v(c,R),1&e&&a!==(a="https://osu.ppy.sh/users/"+t[0].id)&&y(l,"href",a),4&e&&v(b,t[2]),8&e&&M!==(M=t[3].max+"")&&v(C,M),8&e&&z!==(z=t[3][300]+"")&&v(I,z),8&e&&P!==(P=t[3][200]+"")&&v(_,P),8&e&&T!==(T=t[3][100]+"")&&v(S,T),8&e&&D!==(D=t[3][50]+"")&&v(H,D),8&e&&V!==(V=t[3].miss+"")&&v(B,V),2&e&&W!==(W=t[1].toLocaleString()+"")&&v(q,W)},i:t,o:t,d(t){t&&f(n)}}}function gt(t,e,n){let{player:s}=e,{score:o}=e,{combo:r}=e,{counts:l}=e,{index:c}=e;return t.$set=t=>{"player"in t&&n(0,s=t.player),"score"in t&&n(1,o=t.score),"combo"in t&&n(2,r=t.combo),"counts"in t&&n(3,l=t.counts),"index"in t&&n(4,c=t.index)},[s,o,r,l,c]}class $t extends U{constructor(t){super(),Q(this,t,gt,ht,l,{player:0,score:1,combo:2,counts:3,index:4})}}function yt(t,e,n){const s=t.slice();return s[17]=e[n],s[16]=n,s}function vt(t,e,n){const s=t.slice();return s[14]=e[n].player,s[5]=e[n].scores,s[16]=n,s}function bt(t,e,n){const s=t.slice();return s[19]=e[n],s[16]=n,s}function wt(t){let e,n,s,o,r,l,c,a,g,$,b,w,x,k,C,L,I,j,_,E,S,N,H,O,B,F,A,q,R,M,z=(100*t[2]/t[3]).toFixed(2)+"",P=t[1].length+"",T=(100*t[1].length/t[3]).toFixed(2)+"",D=t[1].length+t[2]+"",V=(100*(t[1].length+t[2])/t[3]).toFixed(2)+"",W=t[1].length&&xt(),G=Object.keys(t[9]),J=[];for(let e=0;e<G.length;e+=1)J[e]=kt(bt(t,G,e));return{c(){e=d("div"),n=m("Picked "),s=d("b"),o=m(t[2]),r=m("/"),l=m(t[3]),c=m(" ("),a=m(z),g=m("%) times"),$=h(),b=d("div"),w=m("Banned "),x=d("b"),k=m(P),C=m("/"),L=m(t[3]),I=m("\r\n        ("),j=m(T),_=m("%)\r\n        times"),W&&W.c(),E=h();for(let t=0;t<J.length;t+=1)J[t].c();S=h(),N=d("div"),H=m("Relevancy: "),O=d("b"),B=m(D),F=m("/"),A=m(t[3]),q=m(" ("),R=m(V),M=m("%)"),y(e,"class","picks"),y(b,"class","bans"),y(N,"class","relevancy")},m(t,f){u(t,e,f),i(e,n),i(e,s),i(s,o),i(s,r),i(s,l),i(e,c),i(e,a),i(e,g),u(t,$,f),u(t,b,f),i(b,w),i(b,x),i(x,k),i(x,C),i(x,L),i(b,I),i(b,j),i(b,_),W&&W.m(b,null),i(b,E);for(let t=0;t<J.length;t+=1)J[t].m(b,null);u(t,S,f),u(t,N,f),i(N,H),i(N,O),i(O,B),i(O,F),i(O,A),i(N,q),i(N,R),i(N,M)},p(t,e){if(4&e&&v(o,t[2]),8&e&&v(l,t[3]),12&e&&z!==(z=(100*t[2]/t[3]).toFixed(2)+"")&&v(a,z),2&e&&P!==(P=t[1].length+"")&&v(k,P),8&e&&v(L,t[3]),10&e&&T!==(T=(100*t[1].length/t[3]).toFixed(2)+"")&&v(j,T),t[1].length?W||(W=xt(),W.c(),W.m(b,E)):W&&(W.d(1),W=null),529&e){let n;for(G=Object.keys(t[9]),n=0;n<G.length;n+=1){const s=bt(t,G,n);J[n]?J[n].p(s,e):(J[n]=kt(s),J[n].c(),J[n].m(b,null))}for(;n<J.length;n+=1)J[n].d(1);J.length=G.length}6&e&&D!==(D=t[1].length+t[2]+"")&&v(B,D),8&e&&v(A,t[3]),14&e&&V!==(V=(100*(t[1].length+t[2])/t[3]).toFixed(2)+"")&&v(R,V)},d(t){t&&f(e),t&&f($),t&&f(b),W&&W.d(),p(J,t),t&&f(S),t&&f(N)}}}function xt(t){let e;return{c(){e=m(" by:")},m(t,n){u(t,e,n)},d(t){t&&f(e)}}}function kt(t){let e,n,s,o,r=t[0][t[19]].name+(t[9][t[19]]>1?` (${t[9][t[19]]}x)`:""),l=t[16]&&function(t){let e;return{c(){e=m(",")},m(t,n){u(t,e,n)},d(t){t&&f(e)}}}();return{c(){l&&l.c(),e=h(),n=d("span"),s=m(r),y(n,"class",o=a(t[4]&&t[0][t[19]].name.toLowerCase().includes(t[4].toLowerCase())&&"ban-highlighted")+" svelte-1plw7g3")},m(t,o){l&&l.m(t,o),u(t,e,o),u(t,n,o),i(n,s)},p(t,e){513&e&&r!==(r=t[0][t[19]].name+(t[9][t[19]]>1?` (${t[9][t[19]]}x)`:""))&&v(s,r),529&e&&o!==(o=a(t[4]&&t[0][t[19]].name.toLowerCase().includes(t[4].toLowerCase())&&"ban-highlighted")+" svelte-1plw7g3")&&y(n,"class",o)},d(t){l&&l.d(t),t&&f(e),t&&f(n)}}}function Ct(t){let e,n,s,o;const r=[It,Lt],l=[];function c(t,e){return t[6]?0:1}return n=c(t),s=l[n]=r[n](t),{c(){e=d("div"),s.c(),y(e,"class","scores svelte-1plw7g3")},m(t,s){u(t,e,s),l[n].m(e,null),o=!0},p(t,o){let a=n;n=c(t),n===a?l[n].p(t,o):(R(),P(l[a],1,1,()=>{l[a]=null}),M(),s=l[n],s||(s=l[n]=r[n](t),s.c()),z(s,1),s.m(e,null))},i(t){o||(z(s),o=!0)},o(t){P(s),o=!1},d(t){t&&f(e),l[n].d()}}}function Lt(t){let e,n,s=t[5],o=[];for(let e=0;e<s.length;e+=1)o[e]=_t(yt(t,s,e));const r=t=>P(o[t],1,1,()=>{o[t]=null});return{c(){for(let t=0;t<o.length;t+=1)o[t].c();e=g()},m(t,s){for(let e=0;e<o.length;e+=1)o[e].m(t,s);u(t,e,s),n=!0},p(t,n){if(49&n){let l;for(s=t[5],l=0;l<s.length;l+=1){const r=yt(t,s,l);o[l]?(o[l].p(r,n),z(o[l],1)):(o[l]=_t(r),o[l].c(),z(o[l],1),o[l].m(e.parentNode,e))}for(R(),l=s.length;l<o.length;l+=1)r(l);M()}},i(t){if(!n){for(let t=0;t<s.length;t+=1)z(o[t]);n=!0}},o(t){o=o.filter(Boolean);for(let t=0;t<o.length;t+=1)P(o[t]);n=!1},d(t){p(o,t),t&&f(e)}}}function It(t){let e,n,s=t[10],o=[];for(let e=0;e<s.length;e+=1)o[e]=St(vt(t,s,e));const r=t=>P(o[t],1,1,()=>{o[t]=null});return{c(){for(let t=0;t<o.length;t+=1)o[t].c();e=g()},m(t,s){for(let e=0;e<o.length;e+=1)o[e].m(t,s);u(t,e,s),n=!0},p(t,n){if(1040&n){let l;for(s=t[10],l=0;l<s.length;l+=1){const r=vt(t,s,l);o[l]?(o[l].p(r,n),z(o[l],1)):(o[l]=St(r),o[l].c(),z(o[l],1),o[l].m(e.parentNode,e))}for(R(),l=s.length;l<o.length;l+=1)r(l);M()}},i(t){if(!n){for(let t=0;t<s.length;t+=1)z(o[t]);n=!0}},o(t){o=o.filter(Boolean);for(let t=0;t<o.length;t+=1)P(o[t]);n=!1},d(t){p(o,t),t&&f(e)}}}function jt(t){let n;const s=[{index:t[16]+1},{player:t[0][t[17].userId]},t[17]];let o={};for(let t=0;t<s.length;t+=1)o=e(o,s[t]);const r=new $t({props:o});return{c(){W(r.$$.fragment)},m(t,e){G(r,t,e),n=!0},p(t,e){const n=33&e?D(s,[s[0],{player:t[0][t[17].userId]},32&e&&V(t[17])]):{};r.$set(n)},i(t){n||(z(r.$$.fragment,t),n=!0)},o(t){P(r.$$.fragment,t),n=!1},d(t){J(r,t)}}}function _t(t){let e,n,s=t[0][t[17].userId]&&(!t[4]||t[0][t[17].userId].name.toLowerCase().includes(t[4].toLowerCase())),o=s&&jt(t);return{c(){o&&o.c(),e=g()},m(t,s){o&&o.m(t,s),u(t,e,s),n=!0},p(t,n){49&n&&(s=t[0][t[17].userId]&&(!t[4]||t[0][t[17].userId].name.toLowerCase().includes(t[4].toLowerCase()))),s?o?(o.p(t,n),49&n&&z(o,1)):(o=jt(t),o.c(),z(o,1),o.m(e.parentNode,e)):o&&(R(),P(o,1,1,()=>{o=null}),M())},i(t){n||(z(o),n=!0)},o(t){P(o),n=!1},d(t){o&&o.d(t),t&&f(e)}}}function Et(t){let n;const s=[{index:t[16]+1},{player:t[14]},t[5][0]];let o={};for(let t=0;t<s.length;t+=1)o=e(o,s[t]);const r=new $t({props:o});return{c(){W(r.$$.fragment)},m(t,e){G(r,t,e),n=!0},p(t,e){const n=1024&e?D(s,[s[0],{player:t[14]},V(t[5][0])]):{};r.$set(n)},i(t){n||(z(r.$$.fragment,t),n=!0)},o(t){P(r.$$.fragment,t),n=!1},d(t){J(r,t)}}}function St(t){let e,n,s=!t[4]||t[14].name.toLowerCase().includes(t[4].toLowerCase()),o=s&&Et(t);return{c(){o&&o.c(),e=g()},m(t,s){o&&o.m(t,s),u(t,e,s),n=!0},p(t,n){16&n&&(s=!t[4]||t[14].name.toLowerCase().includes(t[4].toLowerCase())),s?o?(o.p(t,n),16&n&&z(o,1)):(o=Et(t),o.c(),z(o,1),o.m(e.parentNode,e)):o&&(R(),P(o,1,1,()=>{o=null}),M())},i(t){n||(z(o),n=!0)},o(t){P(o),n=!1},d(t){o&&o.d(t),t&&f(e)}}}function Nt(t){let e,n,s,r,l,c,a,p,g,b,w,x,k,C,L,I,j,_,E=(t[8]?t[8].toFixed(0):"N/A")+"",S=t[7]?"Hide":"Show",N=t[6]?"Show all player scores":"Only best scores",H=t[1]&&wt(t),O=t[7]&&Ct(t);return{c(){e=d("div"),n=d("div"),s=d("div"),r=m("Average score: "),l=d("b"),c=m(E),a=h(),H&&H.c(),p=h(),g=d("button"),b=m(S),w=m(" scores"),x=h(),k=d("button"),C=m(N),L=h(),O&&O.c(),y(s,"class","average"),y(n,"class","stats svelte-1plw7g3"),y(e,"class","root")},m(o,f){u(o,e,f),i(e,n),i(n,s),i(s,r),i(s,l),i(l,c),i(n,a),H&&H.m(n,null),i(e,p),i(e,g),i(g,b),i(g,w),i(e,x),i(e,k),i(k,C),i(e,L),O&&O.m(e,null),I=!0,j||(_=[$(g,"click",t[12]),$(k,"click",t[11])],j=!0)},p(t,[s]){(!I||256&s)&&E!==(E=(t[8]?t[8].toFixed(0):"N/A")+"")&&v(c,E),t[1]?H?H.p(t,s):(H=wt(t),H.c(),H.m(n,null)):H&&(H.d(1),H=null),(!I||128&s)&&S!==(S=t[7]?"Hide":"Show")&&v(b,S),(!I||64&s)&&N!==(N=t[6]?"Show all player scores":"Only best scores")&&v(C,N),t[7]?O?(O.p(t,s),128&s&&z(O,1)):(O=Ct(t),O.c(),z(O,1),O.m(e,null)):O&&(R(),P(O,1,1,()=>{O=null}),M())},i(t){I||(z(O),I=!0)},o(t){P(O),I=!1},d(t){t&&f(e),H&&H.d(),O&&O.d(),j=!1,o(_)}}}function Ht(t,e,n){let{players:s}=e,{scores:o}=e,{bans:r}=e,{pickCount:l}=e,{matchCount:c}=e,{filter:a}=e,i=!0,u=!0;const f={},p=[];let d=0;o.forEach(t=>{s[t.userId]&&(f[t.userId]||(f[t.userId]=[],p.push({player:s[t.userId],scores:f[t.userId]})),n(8,d+=t.score),f[t.userId].push(t))}),d/=o.length;const m={};return r&&r.forEach(t=>{s[t]&&(m[t]||n(9,m[t]=0,m),n(9,++m[t],m))}),t.$set=t=>{"players"in t&&n(0,s=t.players),"scores"in t&&n(5,o=t.scores),"bans"in t&&n(1,r=t.bans),"pickCount"in t&&n(2,l=t.pickCount),"matchCount"in t&&n(3,c=t.matchCount),"filter"in t&&n(4,a=t.filter)},[s,r,l,c,a,o,i,u,d,m,p,function(){n(6,i=!i)},function(){n(7,u=!u)}]}class Ot extends U{constructor(t){super(),Q(this,t,Ht,Nt,l,{players:0,scores:5,bans:1,pickCount:2,matchCount:3,filter:4})}}function Bt(e){let n,s,o,r,l,c,a,p,g,$,b,w,x,k,C,L,I,j,_,E,S,N,H,O,B,F,A,q,R,M,z,P,T,D,V,W,G,J,K,Q,U,X,Y,Z,tt,et,nt,st,ot,rt,lt,ct,at,it,ut,ft,pt,dt,mt,ht,gt,$t,yt=e[9].notes.total+"",vt=e[9].notes.rice+"",bt=e[9].notes.ln+"",wt=e[9].bpm+"",xt=e[9].sv+"",kt=e[9].notes.single+"",Ct=e[9].notes.jump+"",Lt=e[9].notes.hand+"",It=e[9].notes.quad+"";return{c(){n=d("div"),s=d("div"),o=d("a"),r=d("div"),l=m(e[1]),c=h(),a=d("div"),p=m(e[0]),$=h(),b=d("div"),w=d("b"),x=m("["),k=m(e[3]),C=m("]"),L=d("br"),I=m("beatmap set by "),j=d("b"),_=m(e[2]),E=h(),S=d("div"),N=m("HP "),H=m(e[6]),O=m(", OD "),B=m(e[7]),F=h(),A=d("div"),q=m(e[8]),R=h(),M=d("div"),z=m(yt),P=m(" notes"),T=d("br"),D=m("("),V=m(vt),W=m(" rice, "),G=m(bt),J=m(" LNs)"),K=d("br"),Q=h(),U=m(wt),X=m(" BPM events"),Y=d("br"),Z=h(),tt=m(xt),et=m(" SV events"),nt=d("br"),st=h(),ot=m(kt),rt=m(" singles"),lt=d("br"),ct=h(),at=m(Ct),it=m(" jumps"),ut=d("br"),ft=h(),pt=m(Lt),dt=m(" hands"),mt=d("br"),ht=h(),gt=m(It),$t=m(" quads"),y(r,"class","artist"),y(a,"class","name svelte-wc7mb7"),y(a,"title",e[0]),y(o,"href",g=`https://osu.ppy.sh/beatmapsets/${e[5]}#mania/${e[4]}`),y(o,"target","_blank"),y(b,"class","mapper"),y(S,"class","metrics svelte-wc7mb7"),y(s,"class","title svelte-wc7mb7"),y(A,"class","category svelte-wc7mb7"),y(M,"class","counts svelte-wc7mb7"),y(n,"class","root svelte-wc7mb7")},m(t,e){u(t,n,e),i(n,s),i(s,o),i(o,r),i(r,l),i(o,c),i(o,a),i(a,p),i(s,$),i(s,b),i(b,w),i(w,x),i(w,k),i(w,C),i(b,L),i(b,I),i(b,j),i(j,_),i(s,E),i(s,S),i(S,N),i(S,H),i(S,O),i(S,B),i(n,F),i(n,A),i(A,q),i(n,R),i(n,M),i(M,z),i(M,P),i(M,T),i(M,D),i(M,V),i(M,W),i(M,G),i(M,J),i(M,K),i(M,Q),i(M,U),i(M,X),i(M,Y),i(M,Z),i(M,tt),i(M,et),i(M,nt),i(M,st),i(M,ot),i(M,rt),i(M,lt),i(M,ct),i(M,at),i(M,it),i(M,ut),i(M,ft),i(M,pt),i(M,dt),i(M,mt),i(M,ht),i(M,gt),i(M,$t)},p(t,[e]){2&e&&v(l,t[1]),1&e&&v(p,t[0]),1&e&&y(a,"title",t[0]),48&e&&g!==(g=`https://osu.ppy.sh/beatmapsets/${t[5]}#mania/${t[4]}`)&&y(o,"href",g),8&e&&v(k,t[3]),4&e&&v(_,t[2]),64&e&&v(H,t[6]),128&e&&v(B,t[7]),256&e&&v(q,t[8]),512&e&&yt!==(yt=t[9].notes.total+"")&&v(z,yt),512&e&&vt!==(vt=t[9].notes.rice+"")&&v(V,vt),512&e&&bt!==(bt=t[9].notes.ln+"")&&v(G,bt),512&e&&wt!==(wt=t[9].bpm+"")&&v(U,wt),512&e&&xt!==(xt=t[9].sv+"")&&v(tt,xt),512&e&&kt!==(kt=t[9].notes.single+"")&&v(ot,kt),512&e&&Ct!==(Ct=t[9].notes.jump+"")&&v(at,Ct),512&e&&Lt!==(Lt=t[9].notes.hand+"")&&v(pt,Lt),512&e&&It!==(It=t[9].notes.quad+"")&&v(gt,It)},i:t,o:t,d(t){t&&f(n)}}}function Ft(t,e,n){let{title:s}=e,{artist:o}=e,{mapper:r}=e,{difficulty:l}=e,{beatmapId:c}=e,{beatmapSetId:a}=e,{hp:i}=e,{od:u}=e,{category:f}=e,{counts:p}=e;return t.$set=t=>{"title"in t&&n(0,s=t.title),"artist"in t&&n(1,o=t.artist),"mapper"in t&&n(2,r=t.mapper),"difficulty"in t&&n(3,l=t.difficulty),"beatmapId"in t&&n(4,c=t.beatmapId),"beatmapSetId"in t&&n(5,a=t.beatmapSetId),"hp"in t&&n(6,i=t.hp),"od"in t&&n(7,u=t.od),"category"in t&&n(8,f=t.category),"counts"in t&&n(9,p=t.counts)},[s,o,r,l,c,a,i,u,f,p]}class At extends U{constructor(t){super(),Q(this,t,Ft,Bt,l,{title:0,artist:1,mapper:2,difficulty:3,beatmapId:4,beatmapSetId:5,hp:6,od:7,category:8,counts:9})}}function qt(t,e,n){const s=t.slice();return s[7]=e[n],s}function Rt(e){let n;return{c(){n=d("p"),n.textContent="Loading tournament data..."},m(t,e){u(t,n,e)},p:t,i:t,o:t,d(t){t&&f(n)}}}function Mt(t){let e,n,s,o,r,l,c,a,p,g,$,b=t[4].name+"",w=t[4].maps.length+"",x=[],k=new Map;const C=new ot({props:{backHref:"#/tournaments/"+t[0]}});C.$on("search",t[5]);let L=t[4].rolls&&zt(t),I=t[4].maps;const j=t=>t[7].beatmapId;for(let e=0;e<I.length;e+=1){let n=qt(t,I,e),s=j(n);k.set(s,x[e]=Pt(s,n))}return{c(){W(C.$$.fragment),e=h(),n=d("h1"),s=m(b),o=h(),L&&L.c(),r=h(),l=d("h2"),c=m(w),a=m(" maps"),p=h(),g=d("div");for(let t=0;t<x.length;t+=1)x[t].c();y(g,"class","maps")},m(t,f){G(C,t,f),u(t,e,f),u(t,n,f),i(n,s),u(t,o,f),L&&L.m(t,f),u(t,r,f),u(t,l,f),i(l,c),i(l,a),u(t,p,f),u(t,g,f);for(let t=0;t<x.length;t+=1)x[t].m(g,null);$=!0},p(t,e){const n={};if(1&e&&(n.backHref="#/tournaments/"+t[0]),C.$set(n),(!$||16&e)&&b!==(b=t[4].name+"")&&v(s,b),t[4].rolls?L?(L.p(t,e),16&e&&z(L,1)):(L=zt(t),L.c(),z(L,1),L.m(r.parentNode,r)):L&&(R(),P(L,1,1,()=>{L=null}),M()),(!$||16&e)&&w!==(w=t[4].maps.length+"")&&v(c,w),28&e){const n=t[4].maps;R(),x=function(t,e,n,s,o,r,l,c,a,i,u,f){let p=t.length,d=r.length,m=p;const h={};for(;m--;)h[t[m].key]=m;const g=[],$=new Map,y=new Map;for(m=d;m--;){const t=f(o,r,m),c=n(t);let a=l.get(c);a?s&&a.p(t,e):(a=i(c,t),a.c()),$.set(c,g[m]=a),c in h&&y.set(c,Math.abs(m-h[c]))}const v=new Set,b=new Set;function w(t){z(t,1),t.m(c,u),l.set(t.key,t),u=t.first,d--}for(;p&&d;){const e=g[d-1],n=t[p-1],s=e.key,o=n.key;e===n?(u=e.first,p--,d--):$.has(o)?!l.has(s)||v.has(s)?w(e):b.has(o)?p--:y.get(s)>y.get(o)?(b.add(s),w(e)):(v.add(o),p--):(a(n,l),p--)}for(;p--;){const e=t[p];$.has(e.key)||a(e,l)}for(;d;)w(g[d-1]);return g}(x,e,j,1,t,n,k,g,T,Pt,null,qt),M()}},i(t){if(!$){z(C.$$.fragment,t),z(L);for(let t=0;t<I.length;t+=1)z(x[t]);$=!0}},o(t){P(C.$$.fragment,t),P(L);for(let t=0;t<x.length;t+=1)P(x[t]);$=!1},d(t){J(C,t),t&&f(e),t&&f(n),t&&f(o),L&&L.d(t),t&&f(r),t&&f(l),t&&f(p),t&&f(g);for(let t=0;t<x.length;t+=1)x[t].d()}}}function zt(t){let e,n,s;const o=new mt({props:{rolls:t[4].rolls,players:t[3].players,filter:t[2]}});return{c(){e=d("h2"),e.textContent="Rolls",n=h(),W(o.$$.fragment)},m(t,r){u(t,e,r),u(t,n,r),G(o,t,r),s=!0},p(t,e){const n={};16&e&&(n.rolls=t[4].rolls),8&e&&(n.players=t[3].players),4&e&&(n.filter=t[2]),o.$set(n)},i(t){s||(z(o.$$.fragment,t),s=!0)},o(t){P(o.$$.fragment,t),s=!1},d(t){t&&f(e),t&&f(n),J(o,t)}}}function Pt(t,n){let s,o,r,l;const c=[n[7]];let a={};for(let t=0;t<c.length;t+=1)a=e(a,c[t]);const p=new At({props:a}),m=new Ot({props:{players:n[3].players,scores:n[7].scores,bans:n[7].bans,pickCount:n[7].pickCount,matchCount:n[4].matchCount,filter:n[2]}});return{key:t,first:null,c(){s=d("div"),W(p.$$.fragment),o=h(),W(m.$$.fragment),r=h(),y(s,"class","map svelte-ztog05"),this.first=s},m(t,e){u(t,s,e),G(p,s,null),i(s,o),G(m,s,null),i(s,r),l=!0},p(t,e){const n=16&e?D(c,[V(t[7])]):{};p.$set(n);const s={};8&e&&(s.players=t[3].players),16&e&&(s.scores=t[7].scores),16&e&&(s.bans=t[7].bans),16&e&&(s.pickCount=t[7].pickCount),16&e&&(s.matchCount=t[4].matchCount),4&e&&(s.filter=t[2]),m.$set(s)},i(t){l||(z(p.$$.fragment,t),z(m.$$.fragment,t),l=!0)},o(t){P(p.$$.fragment,t),P(m.$$.fragment,t),l=!1},d(t){t&&f(s),J(p),J(m)}}}function Tt(t){let e,n,s,o;const r=[Mt,Rt],l=[];function c(t,e){return t[1]?1:0}return n=c(t),s=l[n]=r[n](t),{c(){e=d("main"),s.c(),y(e,"class","svelte-ztog05")},m(t,s){u(t,e,s),l[n].m(e,null),o=!0},p(t,[o]){let a=n;n=c(t),n===a?l[n].p(t,o):(R(),P(l[a],1,1,()=>{l[a]=null}),M(),s=l[n],s||(s=l[n]=r[n](t),s.c()),z(s,1),s.m(e,null))},i(t){o||(z(s),o=!0)},o(t){P(s),o=!1},d(t){t&&f(e),l[n].d()}}}function Dt(t,e,n){let s,o;c(t,tt,t=>n(3,s=t)),c(t,et,t=>n(4,o=t));let{id:r}=e,{tournamentId:l}=e,a=!0,i=null;return k(async()=>{if(!s||s.id!=l)try{tt.set(null),et.set(null);const t=await fetch(`data/${l}.json`);tt.set(await t.json());const e=await fetch(`data/${l}.${r}.json`);et.set(await e.json())}catch{location.hash=""}if(!o||o.id!=r)try{et.set(null);const t=await fetch(`data/${l}.${r}.json`);et.set(await t.json())}catch{location.hash="#/tournaments/"+l}n(1,a=!1)}),t.$set=t=>{"id"in t&&n(6,r=t.id),"tournamentId"in t&&n(0,l=t.tournamentId)},[l,a,i,s,o,function(t){n(2,i=t.detail)},r]}class Vt extends U{constructor(t){super(),Q(this,t,Dt,Tt,l,{id:6,tournamentId:0})}}function Wt(e){let n,s,o,r,l,c,a,p,g,$,b,w,x,k,C,L,I,j,_,E,S,N;return{c(){n=d("div"),s=d("div"),o=d("img"),l=h(),c=d("div"),a=d("a"),p=m(e[1]),$=h(),b=d("div"),w=m("#"),x=m(e[5]),k=m(" ("),C=m(e[4]),L=m(" pp)"),I=d("br"),j=h(),_=m(e[3]),E=m(" (#"),S=m(e[6]),N=m(")"),o.src!==(r=e[2])&&y(o,"src",r),y(o,"alt",""),y(o,"class","svelte-ot3nx9"),y(s,"class","avatar svelte-ot3nx9"),y(a,"href",g="https://osu.ppy.sh/users/"+e[0]),y(a,"target","_blank"),y(c,"class","name svelte-ot3nx9"),y(b,"class","info svelte-ot3nx9"),y(n,"class","root svelte-ot3nx9")},m(t,e){u(t,n,e),i(n,s),i(s,o),i(n,l),i(n,c),i(c,a),i(a,p),i(n,$),i(n,b),i(b,w),i(b,x),i(b,k),i(b,C),i(b,L),i(b,I),i(b,j),i(b,_),i(b,E),i(b,S),i(b,N)},p(t,[e]){4&e&&o.src!==(r=t[2])&&y(o,"src",r),2&e&&v(p,t[1]),1&e&&g!==(g="https://osu.ppy.sh/users/"+t[0])&&y(a,"href",g),32&e&&v(x,t[5]),16&e&&v(C,t[4]),8&e&&v(_,t[3]),64&e&&v(S,t[6])},i:t,o:t,d(t){t&&f(n)}}}function Gt(t,e,n){let{id:s}=e,{name:o}=e,{avatar:r}=e,{country:l}=e,{pp:c}=e,{rank:a}=e,{countryRank:i}=e;return t.$set=t=>{"id"in t&&n(0,s=t.id),"name"in t&&n(1,o=t.name),"avatar"in t&&n(2,r=t.avatar),"country"in t&&n(3,l=t.country),"pp"in t&&n(4,c=t.pp),"rank"in t&&n(5,a=t.rank),"countryRank"in t&&n(6,i=t.countryRank)},[s,o,r,l,c,a,i]}class Jt extends U{constructor(t){super(),Q(this,t,Gt,Wt,l,{id:0,name:1,avatar:2,country:3,pp:4,rank:5,countryRank:6})}}function Kt(t,e,n){const s=t.slice();return s[7]=e[n],s}function Qt(t){let n;const s=[t[7]];let o={};for(let t=0;t<s.length;t+=1)o=e(o,s[t]);const r=new Jt({props:o});return{c(){W(r.$$.fragment)},m(t,e){G(r,t,e),n=!0},p(t,e){const n=1&e?D(s,[V(t[7])]):{};r.$set(n)},i(t){n||(z(r.$$.fragment,t),n=!0)},o(t){P(r.$$.fragment,t),n=!1},d(t){J(r,t)}}}function Ut(t){let e,n,s,r,l,c,a,m,g,v=t[0],b=[];for(let e=0;e<v.length;e+=1)b[e]=Qt(Kt(t,v,e));const w=t=>P(b[t],1,1,()=>{b[t]=null});return{c(){e=d("div"),n=d("button"),n.textContent="Alphabetical",s=h(),r=d("button"),r.textContent="Rank",l=h(),c=d("div");for(let t=0;t<b.length;t+=1)b[t].c();y(c,"class","players svelte-xa7zg9"),y(e,"class","root")},m(o,f){u(o,e,f),i(e,n),i(e,s),i(e,r),i(e,l),i(e,c);for(let t=0;t<b.length;t+=1)b[t].m(c,null);a=!0,m||(g=[$(n,"click",t[1]),$(r,"click",t[2])],m=!0)},p(t,[e]){if(1&e){let n;for(v=t[0],n=0;n<v.length;n+=1){const s=Kt(t,v,n);b[n]?(b[n].p(s,e),z(b[n],1)):(b[n]=Qt(s),b[n].c(),z(b[n],1),b[n].m(c,null))}for(R(),n=v.length;n<b.length;n+=1)w(n);M()}},i(t){if(!a){for(let t=0;t<v.length;t+=1)z(b[t]);a=!0}},o(t){b=b.filter(Boolean);for(let t=0;t<b.length;t+=1)P(b[t]);a=!1},d(t){t&&f(e),p(b,t),m=!1,o(g)}}}function Xt(t,e,n){let s,{players:o}=e,{sort:r="rank"}=e;const l=t=>t.sort((t,e)=>t.name.toLowerCase()<e.name.toLowerCase()?-1:1),c=t=>t.sort((t,e)=>t.rank<e.rank?-1:1);return t.$set=t=>{"players"in t&&n(3,o=t.players),"sort"in t&&n(4,r=t.sort)},t.$$.update=()=>{24&t.$$.dirty&&n(0,s="rank"===r?c(o):l(o))},[s,function(){n(0,s=l(o))},function(){n(0,s=c(o))},o,r]}class Yt extends U{constructor(t){super(),Q(this,t,Xt,Ut,l,{players:3,sort:4})}}function Zt(e){let n,s,o,r,l,c,a,p;return{c(){n=d("div"),s=d("div"),o=d("a"),r=m(e[0]),l=h(),c=d("div"),a=m(e[1]),p=m(" maps"),y(o,"href",e[2]),y(s,"class","name svelte-b5fgg6"),y(c,"class","maps svelte-b5fgg6"),y(n,"class","root svelte-b5fgg6")},m(t,e){u(t,n,e),i(n,s),i(s,o),i(o,r),i(n,l),i(n,c),i(c,a),i(c,p)},p(t,[e]){1&e&&v(r,t[0]),4&e&&y(o,"href",t[2]),2&e&&v(a,t[1])},i:t,o:t,d(t){t&&f(n)}}}function te(t,e,n){let{name:s}=e,{mapCount:o}=e,{href:r}=e;return t.$set=t=>{"name"in t&&n(0,s=t.name),"mapCount"in t&&n(1,o=t.mapCount),"href"in t&&n(2,r=t.href)},[s,o,r]}class ee extends U{constructor(t){super(),Q(this,t,te,Zt,l,{name:0,mapCount:1,href:2})}}function ne(t,e,n){const s=t.slice();return s[6]=e[n],s}function se(e){let n;return{c(){n=d("p"),n.textContent="Loading tournament data..."},m(t,e){u(t,n,e)},p:t,i:t,o:t,d(t){t&&f(n)}}}function oe(t){let e,n,s,o,r,l,c,a,g,$,b,w,x,k,C,L,I=t[3].name+"",j=t[3].stages.length+"",_=Object.keys(t[3].players).length+"";const E=new ot({props:{backHref:"#/"}});E.$on("search",t[4]);let S=t[3].stages,N=[];for(let e=0;e<S.length;e+=1)N[e]=re(ne(t,S,e));const H=t=>P(N[t],1,1,()=>{N[t]=null}),O=new Yt({props:{players:t[1]}});return{c(){W(E.$$.fragment),e=h(),n=d("h1"),s=m(I),o=h(),r=d("h2"),l=m(j),c=m(" stages"),a=h(),g=d("div");for(let t=0;t<N.length;t+=1)N[t].c();$=h(),b=d("h2"),w=m(_),x=m(" players"),k=h(),C=d("div"),W(O.$$.fragment),y(g,"class","stages svelte-wv5a2v"),y(C,"class","players")},m(t,f){G(E,t,f),u(t,e,f),u(t,n,f),i(n,s),u(t,o,f),u(t,r,f),i(r,l),i(r,c),u(t,a,f),u(t,g,f);for(let t=0;t<N.length;t+=1)N[t].m(g,null);u(t,$,f),u(t,b,f),i(b,w),i(b,x),u(t,k,f),u(t,C,f),G(O,C,null),L=!0},p(t,e){if((!L||8&e)&&I!==(I=t[3].name+"")&&v(s,I),(!L||8&e)&&j!==(j=t[3].stages.length+"")&&v(l,j),9&e){let n;for(S=t[3].stages,n=0;n<S.length;n+=1){const s=ne(t,S,n);N[n]?(N[n].p(s,e),z(N[n],1)):(N[n]=re(s),N[n].c(),z(N[n],1),N[n].m(g,null))}for(R(),n=S.length;n<N.length;n+=1)H(n);M()}(!L||8&e)&&_!==(_=Object.keys(t[3].players).length+"")&&v(w,_);const n={};2&e&&(n.players=t[1]),O.$set(n)},i(t){if(!L){z(E.$$.fragment,t);for(let t=0;t<S.length;t+=1)z(N[t]);z(O.$$.fragment,t),L=!0}},o(t){P(E.$$.fragment,t),N=N.filter(Boolean);for(let t=0;t<N.length;t+=1)P(N[t]);P(O.$$.fragment,t),L=!1},d(t){J(E,t),t&&f(e),t&&f(n),t&&f(o),t&&f(r),t&&f(a),t&&f(g),p(N,t),t&&f($),t&&f(b),t&&f(k),t&&f(C),J(O)}}}function re(t){let n;const s=[t[6],{href:`#/tournaments/${t[0]}/stages/${t[6].id}`}];let o={};for(let t=0;t<s.length;t+=1)o=e(o,s[t]);const r=new ee({props:o});return{c(){W(r.$$.fragment)},m(t,e){G(r,t,e),n=!0},p(t,e){const n=9&e?D(s,[8&e&&V(t[6]),{href:`#/tournaments/${t[0]}/stages/${t[6].id}`}]):{};r.$set(n)},i(t){n||(z(r.$$.fragment,t),n=!0)},o(t){P(r.$$.fragment,t),n=!1},d(t){J(r,t)}}}function le(t){let e,n,s,o;const r=[oe,se],l=[];function c(t,e){return t[2]?1:0}return n=c(t),s=l[n]=r[n](t),{c(){e=d("main"),s.c(),y(e,"class","svelte-wv5a2v")},m(t,s){u(t,e,s),l[n].m(e,null),o=!0},p(t,[o]){let a=n;n=c(t),n===a?l[n].p(t,o):(R(),P(l[a],1,1,()=>{l[a]=null}),M(),s=l[n],s||(s=l[n]=r[n](t),s.c()),z(s,1),s.m(e,null))},i(t){o||(z(s),o=!0)},o(t){P(s),o=!1},d(t){t&&f(e),l[n].d()}}}function ce(t,e,n){let s;c(t,tt,t=>n(3,s=t));let o,r,{id:l}=e,a=!0;return k(async()=>{if(!s||s.id!=l)try{tt.set(null);const t=await fetch(`data/${l}.json`);tt.set(await t.json())}catch{location.hash=""}o=Object.values(s.players),n(1,r=o),n(2,a=!1)}),t.$set=t=>{"id"in t&&n(0,l=t.id)},[l,r,a,s,function(t){const e=t.detail;n(1,r=e?o.filter(t=>t.name.toLowerCase().includes(e.toLowerCase())):o)}]}class ae extends U{constructor(t){super(),Q(this,t,ce,le,l,{id:0})}}function ie(e){let n,s,o,r,l,c,a,p,g;return{c(){n=d("div"),s=d("div"),o=d("a"),r=m(e[0]),c=h(),a=d("div"),p=m(e[2]),g=m(" players"),y(o,"href",l="#/tournaments/"+e[1]),y(s,"class","name svelte-1lh8f59"),y(a,"class","players svelte-1lh8f59"),y(n,"class","root svelte-1lh8f59")},m(t,e){u(t,n,e),i(n,s),i(s,o),i(o,r),i(n,c),i(n,a),i(a,p),i(a,g)},p(t,[e]){1&e&&v(r,t[0]),2&e&&l!==(l="#/tournaments/"+t[1])&&y(o,"href",l),4&e&&v(p,t[2])},i:t,o:t,d(t){t&&f(n)}}}function ue(t,e,n){let{name:s}=e,{id:o}=e,{playersCount:r}=e;return t.$set=t=>{"name"in t&&n(0,s=t.name),"id"in t&&n(1,o=t.id),"playersCount"in t&&n(2,r=t.playersCount)},[s,o,r]}class fe extends U{constructor(t){super(),Q(this,t,ue,ie,l,{name:0,id:1,playersCount:2})}}function pe(t,e,n){const s=t.slice();return s[1]=e[n],s}function de(t){let e;return{c(){e=d("p"),e.textContent="Loading tournaments..."},m(t,n){u(t,e,n)},d(t){t&&f(e)}}}function me(t){let n;const s=[t[1]];let o={};for(let t=0;t<s.length;t+=1)o=e(o,s[t]);const r=new fe({props:o});return{c(){W(r.$$.fragment)},m(t,e){G(r,t,e),n=!0},p(t,e){const n=1&e?D(s,[V(t[1])]):{};r.$set(n)},i(t){n||(z(r.$$.fragment,t),n=!0)},o(t){P(r.$$.fragment,t),n=!1},d(t){J(r,t)}}}function he(t){let e,n,s,o,r,l,c,a=t[0],m=[];for(let e=0;e<a.length;e+=1)m[e]=me(pe(t,a,e));const g=t=>P(m[t],1,1,()=>{m[t]=null});let $=null;return a.length||($=de()),{c(){e=d("main"),n=d("h1"),n.textContent="Welcome!",s=h(),o=d("p"),o.textContent="Below are the available tournaments",r=h(),l=d("div");for(let t=0;t<m.length;t+=1)m[t].c();$&&$.c(),y(l,"class","tournaments svelte-saxtqp"),y(e,"class","svelte-saxtqp")},m(t,a){u(t,e,a),i(e,n),i(e,s),i(e,o),i(e,r),i(e,l);for(let t=0;t<m.length;t+=1)m[t].m(l,null);$&&$.m(l,null),c=!0},p(t,[e]){if(1&e){let n;for(a=t[0],n=0;n<a.length;n+=1){const s=pe(t,a,n);m[n]?(m[n].p(s,e),z(m[n],1)):(m[n]=me(s),m[n].c(),z(m[n],1),m[n].m(l,null))}for(R(),n=a.length;n<m.length;n+=1)g(n);M(),a.length?$&&($.d(1),$=null):$||($=de(),$.c(),$.m(l,null))}},i(t){if(!c){for(let t=0;t<a.length;t+=1)z(m[t]);c=!0}},o(t){m=m.filter(Boolean);for(let t=0;t<m.length;t+=1)P(m[t]);c=!1},d(t){t&&f(e),p(m,t),$&&$.d()}}}function ge(t,e,n){let s;return c(t,Z,t=>n(0,s=t)),k(async()=>{if(!s.length){const t=await fetch("data/tournaments.json");Z.set(await t.json())}}),[s]}class $e extends U{constructor(t){super(),Q(this,t,ge,he,l,{})}}function ye(e){let n;const s=new $e({});return{c(){W(s.$$.fragment)},m(t,e){G(s,t,e),n=!0},p:t,i(t){n||(z(s.$$.fragment,t),n=!0)},o(t){P(s.$$.fragment,t),n=!1},d(t){J(s,t)}}}function ve(t){let e;const n=new ae({props:{id:t[1]}});return{c(){W(n.$$.fragment)},m(t,s){G(n,t,s),e=!0},p(t,e){const s={};2&e&&(s.id=t[1]),n.$set(s)},i(t){e||(z(n.$$.fragment,t),e=!0)},o(t){P(n.$$.fragment,t),e=!1},d(t){J(n,t)}}}function be(t){let e;const n=new Vt({props:{id:t[2],tournamentId:t[1]}});return{c(){W(n.$$.fragment)},m(t,s){G(n,t,s),e=!0},p(t,e){const s={};4&e&&(s.id=t[2]),2&e&&(s.tournamentId=t[1]),n.$set(s)},i(t){e||(z(n.$$.fragment,t),e=!0)},o(t){P(n.$$.fragment,t),e=!1},d(t){J(n,t)}}}function we(t){let e,n,s,o;const r=[be,ve,ye],l=[];function c(t,e){return t[1]&&t[2]?0:t[1]?1:t[0]?2:-1}return~(e=c(t))&&(n=l[e]=r[e](t)),{c(){n&&n.c(),s=g()},m(t,n){~e&&l[e].m(t,n),u(t,s,n),o=!0},p(t,[o]){let a=e;e=c(t),e===a?~e&&l[e].p(t,o):(n&&(R(),P(l[a],1,1,()=>{l[a]=null}),M()),~e?(n=l[e],n||(n=l[e]=r[e](t),n.c()),z(n,1),n.m(s.parentNode,s)):n=null)},i(t){o||(z(n),o=!0)},o(t){P(n),o=!1},d(t){~e&&l[e].d(t),t&&f(s)}}}function xe(t,e,n){let s,o,r;const l=()=>{n(0,s=location.hash.slice(1)||"/");const[,t,e,l,c]=s.split("/");n(1,o="tournaments"===t?e:null),n(2,r="stages"===l?c:null)};var c;return k(()=>{l(),window.addEventListener("hashchange",l)}),c=()=>{window.removeEventListener("hashchange",l)},x().$$.on_destroy.push(c),[s,o,r]}return new class extends U{constructor(t){super(),Q(this,t,xe,we,l,{})}}({target:document.body})}();
//# sourceMappingURL=bundle.js.map
