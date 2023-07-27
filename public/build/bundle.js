var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function s(t){t.forEach(e)}function r(t){return"function"==typeof t}function l(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}let c,a;function o(t,e){return c||(c=document.createElement("a")),c.href=e,t===c.href}function i(t,e){t.appendChild(e)}function f(t,e,n){t.insertBefore(e,n||null)}function u(t){t.parentNode&&t.parentNode.removeChild(t)}function d(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function g(t){return document.createElement(t)}function p(t){return document.createTextNode(t)}function m(){return p(" ")}function h(t,e,n,s){return t.addEventListener(e,n,s),()=>t.removeEventListener(e,n,s)}function v(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function b(t,e){e=""+e,t.data!==e&&(t.data=e)}function x(t,e){t.value=null==e?"":e}function k(t,e,n){t.classList[n?"add":"remove"](e)}function y(t){a=t}function $(t){(function(){if(!a)throw new Error("Function called outside component initialization");return a})().$$.on_mount.push(t)}const w=[],_=[];let C=[];const E=[],I=Promise.resolve();let S=!1;function M(t){C.push(t)}const O=new Set;let L=0;function j(){if(0!==L)return;const t=a;do{try{for(;L<w.length;){const t=w[L];L++,y(t),R(t.$$)}}catch(t){throw w.length=0,L=0,t}for(y(null),w.length=0,L=0;_.length;)_.pop()();for(let t=0;t<C.length;t+=1){const e=C[t];O.has(e)||(O.add(e),e())}C.length=0}while(w.length);for(;E.length;)E.pop()();S=!1,O.clear(),y(t)}function R(t){if(null!==t.fragment){t.update(),s(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(M)}}const N=new Set;function P(t,e){t&&t.i&&(N.delete(t),t.i(e))}function D(t,e){t.d(1),e.delete(t.key)}function F(t,e,n,r,l,c,a,o,i,f,u,d){let g=t.length,p=c.length,m=g;const h={};for(;m--;)h[t[m].key]=m;const v=[],b=new Map,x=new Map,k=[];for(m=p;m--;){const t=d(l,c,m),s=n(t);let o=a.get(s);o?r&&k.push((()=>o.p(t,e))):(o=f(s,t),o.c()),b.set(s,v[m]=o),s in h&&x.set(s,Math.abs(m-h[s]))}const y=new Set,$=new Set;function w(t){P(t,1),t.m(o,u),a.set(t.key,t),u=t.first,p--}for(;g&&p;){const e=v[p-1],n=t[g-1],s=e.key,r=n.key;e===n?(u=e.first,g--,p--):b.has(r)?!a.has(s)||y.has(s)?w(e):$.has(r)?g--:x.get(s)>x.get(r)?($.add(s),w(e)):(y.add(r),g--):(i(n,a),g--)}for(;g--;){const e=t[g];b.has(e.key)||i(e,a)}for(;p;)w(v[p-1]);return s(k),v}function A(t,e){const n=t.$$;null!==n.fragment&&(!function(t){const e=[],n=[];C.forEach((s=>-1===t.indexOf(s)?e.push(s):n.push(s))),n.forEach((t=>t())),C=e}(n.after_update),s(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function T(t,e){-1===t.$$.dirty[0]&&(w.push(t),S||(S=!0,I.then(j)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function J(l,c,o,i,f,d,g,p=[-1]){const m=a;y(l);const h=l.$$={fragment:null,ctx:[],props:d,update:t,not_equal:f,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(c.context||(m?m.$$.context:[])),callbacks:n(),dirty:p,skip_bound:!1,root:c.target||m.$$.root};g&&g(h.root);let v=!1;if(h.ctx=o?o(l,c.props||{},((t,e,...n)=>{const s=n.length?n[0]:e;return h.ctx&&f(h.ctx[t],h.ctx[t]=s)&&(!h.skip_bound&&h.bound[t]&&h.bound[t](s),v&&T(l,t)),e})):[],h.update(),v=!0,s(h.before_update),h.fragment=!!i&&i(h.ctx),c.target){if(c.hydrate){const t=function(t){return Array.from(t.childNodes)}(c.target);h.fragment&&h.fragment.l(t),t.forEach(u)}else h.fragment&&h.fragment.c();c.intro&&P(l.$$.fragment),function(t,n,l,c){const{fragment:a,after_update:o}=t.$$;a&&a.m(n,l),c||M((()=>{const n=t.$$.on_mount.map(e).filter(r);t.$$.on_destroy?t.$$.on_destroy.push(...n):s(n),t.$$.on_mount=[]})),o.forEach(M)}(l,c.target,c.anchor,c.customElement),j()}y(m)}class U{$destroy(){A(this,1),this.$destroy=t}$on(e,n){if(!r(n))return t;const s=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return s.push(n),()=>{const t=s.indexOf(n);-1!==t&&s.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}function B(t,e,n){const s=t.slice();return s[87]=e[n].path,s[88]=e[n].index,s[89]=e[n].tag,s}function G(t,e,n){const s=t.slice();return s[87]=e[n].path,s[88]=e[n].index,s[89]=e[n].tag,s}function q(t,e,n){const s=t.slice();return s[87]=e[n].path,s[88]=e[n].index,s[89]=e[n].tag,s}function z(t,e,n){const s=t.slice();return s[89]=e[n],s}function W(t,e,n){const s=t.slice();return s[87]=e[n].path,s[88]=e[n].index,s[89]=e[n].tag,s}function X(t,e,n){const s=t.slice();return s[89]=e[n],s}function Y(t,e,n){const s=t.slice();return s[87]=e[n].path,s[88]=e[n].index,s[102]=e[n].selected,s}function H(t,e,n){const s=t.slice();return s[87]=e[n].path,s[88]=e[n].index,s[102]=e[n].selected,s}function K(t,e,n){const s=t.slice();return s[89]=e[n],s}function Q(t){let e,n,r,l,c,a,o,p,b,x,k,y,$,w,_,C,E,I,S,M,O=t[4],L=[];for(let e=0;e<O.length;e+=1)L[e]=Z(K(t,O,e));return{c(){e=g("div"),n=g("h2"),n.textContent="Menu",r=m(),l=g("hr"),c=m(),a=g("div"),o=g("button"),o.textContent="Back",p=g("br"),b=m(),x=g("button"),x.textContent="Regenerate",k=g("br"),y=m(),$=g("button"),$.textContent="Download Labels",w=g("br"),_=m(),C=g("button"),C.textContent="Load Labels",E=g("br"),I=m();for(let t=0;t<L.length;t+=1)L[t].c();v(n,"class","svelte-f3prcs"),v(l,"class","svelte-f3prcs"),v(o,"class","btn btn-sm btn-primary svelte-f3prcs"),v(x,"class","btn btn-sm btn-secondary svelte-f3prcs"),v($,"class","btn btn-sm btn-secondary svelte-f3prcs"),v(C,"class","btn btn-sm btn-secondary svelte-f3prcs"),v(a,"class","btn-group-vertical"),v(e,"class","side-menu svelte-f3prcs")},m(s,u){f(s,e,u),i(e,n),i(e,r),i(e,l),i(e,c),i(e,a),i(a,o),i(a,p),i(a,b),i(a,x),i(a,k),i(a,y),i(a,$),i(a,w),i(a,_),i(a,C),i(a,E),i(a,I);for(let t=0;t<L.length;t+=1)L[t]&&L[t].m(a,null);S||(M=[h(o,"click",t[20]),h($,"click",t[11]),h(C,"click",t[12])],S=!0)},p(t,e){if(16&e[0]){let n;for(O=t[4],n=0;n<O.length;n+=1){const s=K(t,O,n);L[n]?L[n].p(s,e):(L[n]=Z(s),L[n].c(),L[n].m(a,null))}for(;n<L.length;n+=1)L[n].d(1);L.length=O.length}},d(t){t&&u(e),d(L,t),S=!1,s(M)}}}function V(e){let n,s,r,l;return{c(){n=g("div"),s=g("button"),s.textContent="Menu",v(s,"class","btn btn-primary svelte-f3prcs"),v(n,"class","menu svelte-f3prcs")},m(t,c){f(t,n,c),i(n,s),r||(l=h(s,"click",e[20]),r=!0)},p:t,d(t){t&&u(n),r=!1,l()}}}function Z(t){let e,n,s,r=t[89]+"";return{c(){e=g("button"),n=p(r),s=g("br"),v(e,"class","svelte-f3prcs")},m(t,r){f(t,e,r),i(e,n),f(t,s,r)},p(t,e){16&e[0]&&r!==(r=t[89]+"")&&b(n,r)},d(t){t&&u(e),t&&u(s)}}}function tt(t,e){let n,s,r,l,c,a,d,x,y,$,w=e[88]+"";function _(...t){return e[30](e[88],...t)}return{key:t,first:null,c(){n=g("div"),s=g("div"),r=p(w),l=m(),c=g("img"),x=m(),v(s,"class","image-number svelte-f3prcs"),o(c.src,a=e[87])||v(c,"src",a),v(c,"alt",d=e[87]),v(c,"class","panel-image img-rounded svelte-f3prcs"),k(c,"selected",e[5]==e[88]&&"real"==e[6]),v(n,"class","grid-item svelte-f3prcs"),this.first=n},m(t,e){f(t,n,e),i(n,s),i(s,r),i(n,l),i(n,c),i(n,x),y||($=h(c,"click",_),y=!0)},p(t,n){e=t,1&n[0]&&w!==(w=e[88]+"")&&b(r,w),1&n[0]&&!o(c.src,a=e[87])&&v(c,"src",a),1&n[0]&&d!==(d=e[87])&&v(c,"alt",d),97&n[0]&&k(c,"selected",e[5]==e[88]&&"real"==e[6])},d(t){t&&u(n),y=!1,$()}}}function et(t,e){let n,s,r,l,c,a,d,x,y,$,w=e[88]+"";function _(...t){return e[31](e[88],...t)}return{key:t,first:null,c(){n=g("div"),s=g("div"),r=p(w),l=m(),c=g("img"),x=m(),v(s,"class","image-number svelte-f3prcs"),o(c.src,a=e[87])||v(c,"src",a),v(c,"alt",d=e[87]),v(c,"class","panel-image img-rounded svelte-f3prcs"),k(c,"selected",e[5]==e[88]&&"real"==e[6]),v(n,"class","grid-item svelte-f3prcs"),this.first=n},m(t,e){f(t,n,e),i(n,s),i(s,r),i(n,l),i(n,c),i(n,x),y||($=h(c,"click",_),y=!0)},p(t,n){e=t,1&n[0]&&w!==(w=e[88]+"")&&b(r,w),1&n[0]&&!o(c.src,a=e[87])&&v(c,"src",a),1&n[0]&&d!==(d=e[87])&&v(c,"alt",d),97&n[0]&&k(c,"selected",e[5]==e[88]&&"real"==e[6])},d(t){t&&u(n),y=!1,$()}}}function nt(e){let n,s,r,l;return{c(){n=g("div"),s=g("button"),s.textContent="Discard Panel",v(s,"class","btn btn-primary svelte-f3prcs"),v(n,"class","close-button svelte-f3prcs")},m(t,c){f(t,n,c),i(n,s),r||(l=h(s,"click",e[21]),r=!0)},p:t,d(t){t&&u(n),r=!1,l()}}}function st(t){let e,n,r,l,c,a,o,p=t[4],b=[];for(let e=0;e<p.length;e+=1)b[e]=rt(X(t,p,e));return{c(){e=g("div");for(let t=0;t<b.length;t+=1)b[t].c();n=m(),r=g("input"),l=m(),c=g("button"),c.textContent="Save Tag",v(r,"type","text"),v(r,"placeholder","Tag"),v(r,"class","add-tag"),v(c,"class","svelte-f3prcs"),v(e,"class","tag-menu svelte-f3prcs")},m(s,u){f(s,e,u);for(let t=0;t<b.length;t+=1)b[t]&&b[t].m(e,null);i(e,n),i(e,r),x(r,t[3]),i(e,l),i(e,c),a||(o=[h(r,"input",t[36]),h(r,"input",pt),h(r,"keydown",t[37]),h(c,"click",t[38])],a=!0)},p(t,s){if(16402&s[0]){let r;for(p=t[4],r=0;r<p.length;r+=1){const l=X(t,p,r);b[r]?b[r].p(l,s):(b[r]=rt(l),b[r].c(),b[r].m(e,n))}for(;r<b.length;r+=1)b[r].d(1);b.length=p.length}8&s[0]&&r.value!==t[3]&&x(r,t[3])},d(t){t&&u(e),d(b,t),a=!1,s(o)}}}function rt(t){let e,n,s,r,l,c=t[89]+"";function a(){return t[35](t[88],t[89])}return{c(){e=g("button"),n=p(c),s=g("br"),v(e,"class","svelte-f3prcs")},m(t,c){f(t,e,c),i(e,n),f(t,s,c),r||(l=h(e,"click",a),r=!0)},p(e,s){t=e,16&s[0]&&c!==(c=t[89]+"")&&b(n,c)},d(t){t&&u(e),t&&u(s),r=!1,l()}}}function lt(t,e){let n,r,l,c,a,d,x,y,$,w,_,C,E,I,S=e[88]+"",M=e[89]+"",O=e[2]&&e[5]===e[88]&&st(e);function L(...t){return e[39](e[88],e[89],...t)}function j(...t){return e[40](e[88],e[89],...t)}function R(...t){return e[41](e[88],...t)}return{key:t,first:null,c(){n=g("div"),r=g("div"),l=p(S),c=m(),a=g("img"),y=m(),$=g("div"),w=p(M),_=m(),O&&O.c(),C=m(),v(r,"class","image-number svelte-f3prcs"),o(a.src,d=e[87])||v(a,"src",d),v(a,"alt",x=e[87]),v(a,"class","panel-image svelte-f3prcs"),k(a,"selected",e[5]==e[88]&&"generated"==e[6]),k(a,"tagged",""!==e[89]&&(e[5]!==e[88]||"generated"!==e[6])),v($,"class","tag-text svelte-f3prcs"),v(n,"class","grid-item svelte-f3prcs"),v(n,"draggable","true"),k(n,"draggable",!e[10]),this.first=n},m(t,e){f(t,n,e),i(n,r),i(r,l),i(n,c),i(n,a),i(n,y),i(n,$),i($,w),i(n,_),O&&O.m(n,null),i(n,C),E||(I=[h(n,"click",L),h(n,"dragstart",j),h(n,"dragenter",R)],E=!0)},p(t,s){e=t,2&s[0]&&S!==(S=e[88]+"")&&b(l,S),2&s[0]&&!o(a.src,d=e[87])&&v(a,"src",d),2&s[0]&&x!==(x=e[87])&&v(a,"alt",x),98&s[0]&&k(a,"selected",e[5]==e[88]&&"generated"==e[6]),98&s[0]&&k(a,"tagged",""!==e[89]&&(e[5]!==e[88]||"generated"!==e[6])),2&s[0]&&M!==(M=e[89]+"")&&b(w,M),e[2]&&e[5]===e[88]?O?O.p(e,s):(O=st(e),O.c(),O.m(n,C)):O&&(O.d(1),O=null),1024&s[0]&&k(n,"draggable",!e[10])},d(t){t&&u(n),O&&O.d(),E=!1,s(I)}}}function ct(t){let e,n,r,l,c,a,o,p=t[4],b=[];for(let e=0;e<p.length;e+=1)b[e]=at(z(t,p,e));return{c(){e=g("div");for(let t=0;t<b.length;t+=1)b[t].c();n=m(),r=g("input"),l=m(),c=g("button"),c.textContent="Save Tag",v(r,"type","text"),v(r,"placeholder","Tag"),v(r,"class","add-tag"),v(c,"class","svelte-f3prcs"),v(e,"class","tag-menu svelte-f3prcs")},m(s,u){f(s,e,u);for(let t=0;t<b.length;t+=1)b[t]&&b[t].m(e,null);i(e,n),i(e,r),x(r,t[3]),i(e,l),i(e,c),a||(o=[h(r,"input",t[43]),h(r,"input",mt),h(r,"keydown",t[44]),h(c,"click",t[45])],a=!0)},p(t,s){if(16402&s[0]){let r;for(p=t[4],r=0;r<p.length;r+=1){const l=z(t,p,r);b[r]?b[r].p(l,s):(b[r]=at(l),b[r].c(),b[r].m(e,n))}for(;r<b.length;r+=1)b[r].d(1);b.length=p.length}8&s[0]&&r.value!==t[3]&&x(r,t[3])},d(t){t&&u(e),d(b,t),a=!1,s(o)}}}function at(t){let e,n,s,r,l,c=t[89]+"";function a(){return t[42](t[88],t[89])}return{c(){e=g("button"),n=p(c),s=g("br"),v(e,"class","svelte-f3prcs")},m(t,c){f(t,e,c),i(e,n),f(t,s,c),r||(l=h(e,"click",a),r=!0)},p(e,s){t=e,16&s[0]&&c!==(c=t[89]+"")&&b(n,c)},d(t){t&&u(e),t&&u(s),r=!1,l()}}}function ot(t,e){let n,r,l,c,a,d,x,y,$,w,_,C,E,I,S=e[88]+"",M=e[89]+"",O=e[2]&&e[5]===e[88]&&ct(e);function L(...t){return e[46](e[88],e[89],...t)}function j(...t){return e[47](e[88],e[89],...t)}function R(...t){return e[48](e[88],...t)}return{key:t,first:null,c(){n=g("div"),r=g("div"),l=p(S),c=m(),a=g("img"),y=m(),$=g("div"),w=p(M),_=m(),O&&O.c(),C=m(),v(r,"class","image-number svelte-f3prcs"),o(a.src,d=e[87])||v(a,"src",d),v(a,"alt",x=e[87]),v(a,"class","panel-image svelte-f3prcs"),k(a,"selected",e[5]==e[88]&&"generated"==e[6]),k(a,"tagged",""!==e[89]&&(e[5]!==e[88]||"generated"!==e[6])),v($,"class","tag-text svelte-f3prcs"),v(n,"class","grid-item svelte-f3prcs"),v(n,"draggable","true"),k(n,"draggable",!e[10]),this.first=n},m(t,e){f(t,n,e),i(n,r),i(r,l),i(n,c),i(n,a),i(n,y),i(n,$),i($,w),i(n,_),O&&O.m(n,null),i(n,C),E||(I=[h(n,"click",L),h(n,"dragstart",j),h(n,"dragenter",R)],E=!0)},p(t,s){e=t,2&s[0]&&S!==(S=e[88]+"")&&b(l,S),2&s[0]&&!o(a.src,d=e[87])&&v(a,"src",d),2&s[0]&&x!==(x=e[87])&&v(a,"alt",x),98&s[0]&&k(a,"selected",e[5]==e[88]&&"generated"==e[6]),98&s[0]&&k(a,"tagged",""!==e[89]&&(e[5]!==e[88]||"generated"!==e[6])),2&s[0]&&M!==(M=e[89]+"")&&b(w,M),e[2]&&e[5]===e[88]?O?O.p(e,s):(O=ct(e),O.c(),O.m(n,C)):O&&(O.d(1),O=null),1024&s[0]&&k(n,"draggable",!e[10])},d(t){t&&u(n),O&&O.d(),E=!1,s(I)}}}function it(t){let e,n,r,l,c,a,o,d,p,b,x,k,y,$,w,_,C,E,I,S,M,O,L=[],j=new Map,R=[],N=new Map,P=t[8];const A=t=>t[87];for(let e=0;e<P.length;e+=1){let n=G(t,P,e),s=A(n);j.set(s,L[e]=ft(s,n))}let T=t[8];const J=t=>t[87];for(let e=0;e<T.length;e+=1){let n=B(t,T,e),s=J(n);N.set(s,R[e]=ut(s,n))}return{c(){e=g("div"),n=g("div"),r=g("h2"),r.textContent="Fake Images",l=m(),c=g("hr"),a=m(),o=g("div"),d=g("button"),d.textContent="Sort Fake Images by similarity with the selected image",p=m(),b=g("button"),b.textContent="Shuffle Fake Images",x=m(),k=g("button"),k.textContent="Reset Images Order",y=m(),$=g("hr"),w=m(),_=g("div");for(let t=0;t<L.length;t+=1)L[t].c();C=m(),E=g("hr"),I=m(),S=g("div");for(let t=0;t<R.length;t+=1)R[t].c();v(r,"class","fake-title svelte-f3prcs"),v(c,"class","svelte-f3prcs"),v(d,"class","btn btn-sm btn-secondary svelte-f3prcs"),v(b,"class","btn btn-sm btn-secondary svelte-f3prcs"),v(k,"class","btn btn-sm btn-secondary svelte-f3prcs"),v(o,"class","btn-group button-bar"),v(n,"class","top-panel svelte-f3prcs"),v($,"class","svelte-f3prcs"),v(_,"class","image-grid svelte-f3prcs"),v(E,"class","svelte-f3prcs"),v(S,"class","image-grid cancer svelte-f3prcs"),v(e,"class","panel fake-panel svelte-f3prcs")},m(s,u){f(s,e,u),i(e,n),i(n,r),i(n,l),i(n,c),i(n,a),i(n,o),i(o,d),i(o,p),i(o,b),i(o,x),i(o,k),i(e,y),i(e,$),i(e,w),i(e,_);for(let t=0;t<L.length;t+=1)L[t]&&L[t].m(_,null);i(e,C),i(e,E),i(e,I),i(e,S);for(let t=0;t<R.length;t+=1)R[t]&&R[t].m(S,null);M||(O=[h(d,"click",t[51]),h(b,"click",t[52]),h(k,"click",t[53]),h(e,"dragover",t[58]),h(e,"drop",t[59])],M=!0)},p(t,e){8421632&e[0]&&(P=t[8],L=F(L,e,A,1,t,P,j,_,D,ft,null,G)),8421632&e[0]&&(T=t[8],R=F(R,e,J,1,t,T,N,S,D,ut,null,B))},d(t){t&&u(e);for(let t=0;t<L.length;t+=1)L[t].d();for(let t=0;t<R.length;t+=1)R[t].d();M=!1,s(O)}}}function ft(t,e){let n,r,l,c,a,d,x,k,y,$,w,_,C,E=e[88]+"",I=e[89]+"";function S(...t){return e[54](e[88],e[89],...t)}function M(...t){return e[55](e[88],...t)}return{key:t,first:null,c(){n=g("div"),r=g("div"),l=p(E),c=m(),a=g("img"),k=m(),y=g("div"),$=p(I),w=m(),v(r,"class","image-number svelte-f3prcs"),o(a.src,d=e[87])||v(a,"src",d),v(a,"alt",x=e[87]),v(a,"class","panel-image svelte-f3prcs"),v(y,"class","tag-text svelte-f3prcs"),v(n,"class","grid-item svelte-f3prcs"),v(n,"draggable","true"),this.first=n},m(t,e){f(t,n,e),i(n,r),i(r,l),i(n,c),i(n,a),i(n,k),i(n,y),i(y,$),i(n,w),_||(C=[h(n,"click",S),h(n,"dragstart",M)],_=!0)},p(t,n){e=t,256&n[0]&&E!==(E=e[88]+"")&&b(l,E),256&n[0]&&!o(a.src,d=e[87])&&v(a,"src",d),256&n[0]&&x!==(x=e[87])&&v(a,"alt",x),256&n[0]&&I!==(I=e[89]+"")&&b($,I)},d(t){t&&u(n),_=!1,s(C)}}}function ut(t,e){let n,r,l,c,a,d,x,k,y,$,w,_,C,E=e[88]+"",I=e[89]+"";function S(...t){return e[56](e[88],e[89],...t)}function M(...t){return e[57](e[88],...t)}return{key:t,first:null,c(){n=g("div"),r=g("div"),l=p(E),c=m(),a=g("img"),k=m(),y=g("div"),$=p(I),w=m(),v(r,"class","image-number svelte-f3prcs"),o(a.src,d=e[87])||v(a,"src",d),v(a,"alt",x=e[87]),v(a,"class","panel-image svelte-f3prcs"),v(y,"class","tag-text svelte-f3prcs"),v(n,"class","grid-item svelte-f3prcs"),v(n,"draggable","true"),this.first=n},m(t,e){f(t,n,e),i(n,r),i(r,l),i(n,c),i(n,a),i(n,k),i(n,y),i(y,$),i(n,w),_||(C=[h(n,"click",S),h(n,"dragstart",M)],_=!0)},p(t,n){e=t,256&n[0]&&E!==(E=e[88]+"")&&b(l,E),256&n[0]&&!o(a.src,d=e[87])&&v(a,"src",d),256&n[0]&&x!==(x=e[87])&&v(a,"alt",x),256&n[0]&&I!==(I=e[89]+"")&&b($,I)},d(t){t&&u(n),_=!1,s(C)}}}function dt(e){let n,r,l,c,a,o,d,p,b,x,y,$,w,_,C,E,I,S,M,O,L,j,R,N,P,A,T,J,U,B,G,z,X,K,Z,st,rt,ct,at,ft,ut,dt,gt,pt,mt,ht,vt,bt=[],xt=new Map,kt=[],yt=new Map,$t=[],wt=new Map,_t=[],Ct=new Map;function Et(t,e){return t[7]?Q:V}let It=Et(e),St=It(e),Mt=e[0];const Ot=t=>t[87];for(let t=0;t<Mt.length;t+=1){let n=H(e,Mt,t),s=Ot(n);xt.set(s,bt[t]=tt(s,n))}let Lt=e[0];const jt=t=>t[87];for(let t=0;t<Lt.length;t+=1){let n=Y(e,Lt,t),s=jt(n);yt.set(s,kt[t]=et(s,n))}let Rt=!e[9]&&nt(e),Nt=e[1];const Pt=t=>t[87];for(let t=0;t<Nt.length;t+=1){let n=W(e,Nt,t),s=Pt(n);wt.set(s,$t[t]=lt(s,n))}let Dt=e[1];const Ft=t=>t[87];for(let t=0;t<Dt.length;t+=1){let n=q(e,Dt,t),s=Ft(n);Ct.set(s,_t[t]=ot(s,n))}let At=e[9]&&it(e);return{c(){n=g("div"),St.c(),r=m(),l=g("div"),c=g("h2"),c.textContent="Real Images",a=m(),o=g("hr"),d=m(),p=g("div"),b=g("button"),b.textContent="Sort Real Images by similarity with the selected image",x=m(),y=g("button"),y.textContent="Shuffle Real Images",$=m(),w=g("button"),w.textContent="Reset Images Order",_=m(),C=g("hr"),E=m(),I=g("div");for(let t=0;t<bt.length;t+=1)bt[t].c();S=m(),M=g("hr"),O=m(),L=g("div");for(let t=0;t<kt.length;t+=1)kt[t].c();j=m(),R=g("div"),Rt&&Rt.c(),N=m(),P=g("h2"),P.textContent="Generated Images",A=m(),T=g("hr"),J=m(),U=g("div"),B=g("button"),B.textContent="Sort Generated Images by similarity with the selected image",G=m(),z=g("button"),z.textContent="Shuffle Generated Images",X=m(),K=g("button"),K.textContent="Reset Images Order",Z=m(),st=g("button"),st.textContent="Fast tagging mode",rt=m(),ct=g("hr"),at=m(),ft=g("div");for(let t=0;t<$t.length;t+=1)$t[t].c();ut=m(),dt=g("hr"),gt=m(),pt=g("div");for(let t=0;t<_t.length;t+=1)_t[t].c();mt=m(),At&&At.c(),v(c,"class","top-panel svelte-f3prcs"),v(o,"class","svelte-f3prcs"),v(b,"class","btn btn-sm btn-secondary svelte-f3prcs"),v(y,"class","btn btn-sm btn-secondary svelte-f3prcs"),v(w,"class","btn btn-sm btn-secondary svelte-f3prcs"),v(p,"class","btn-group button-bar top-panel svelte-f3prcs"),v(C,"class","svelte-f3prcs"),v(I,"class","image-grid svelte-f3prcs"),v(M,"class","svelte-f3prcs"),v(L,"class","image-grid cancer svelte-f3prcs"),v(l,"class","panel container svelte-f3prcs"),v(P,"class","top-panel svelte-f3prcs"),v(T,"class","svelte-f3prcs"),v(B,"class","btn btn-sm btn-secondary svelte-f3prcs"),v(z,"class","btn btn-sm btn-secondary svelte-f3prcs"),v(K,"class","btn btn-sm btn-secondary svelte-f3prcs"),v(st,"class","btn btn-sm btn-secondary svelte-f3prcs"),k(st,"triggered",e[10]),v(U,"class","btn-group button-bar top-panel svelte-f3prcs"),v(ct,"class","svelte-f3prcs"),v(ft,"class","image-grid svelte-f3prcs"),v(dt,"class","svelte-f3prcs"),v(pt,"class","image-grid cancer svelte-f3prcs"),v(R,"class","panel svelte-f3prcs"),v(n,"class","App svelte-f3prcs")},m(t,s){f(t,n,s),St.m(n,null),i(n,r),i(n,l),i(l,c),i(l,a),i(l,o),i(l,d),i(l,p),i(p,b),i(p,x),i(p,y),i(p,$),i(p,w),i(l,_),i(l,C),i(l,E),i(l,I);for(let t=0;t<bt.length;t+=1)bt[t]&&bt[t].m(I,null);i(l,S),i(l,M),i(l,O),i(l,L);for(let t=0;t<kt.length;t+=1)kt[t]&&kt[t].m(L,null);i(n,j),i(n,R),Rt&&Rt.m(R,null),i(R,N),i(R,P),i(R,A),i(R,T),i(R,J),i(R,U),i(U,B),i(U,G),i(U,z),i(U,X),i(U,K),i(U,Z),i(U,st),i(R,rt),i(R,ct),i(R,at),i(R,ft);for(let t=0;t<$t.length;t+=1)$t[t]&&$t[t].m(ft,null);i(R,ut),i(R,dt),i(R,gt),i(R,pt);for(let t=0;t<_t.length;t+=1)_t[t]&&_t[t].m(pt,null);i(n,mt),At&&At.m(n,null),ht||(vt=[h(b,"click",e[27]),h(y,"click",e[28]),h(w,"click",e[29]),h(B,"click",e[32]),h(z,"click",e[33]),h(K,"click",e[34]),h(st,"click",e[22]),h(R,"drop",e[49]),h(R,"dragover",e[50])],ht=!0)},p(t,e){It===(It=Et(t))&&St?St.p(t,e):(St.d(1),St=It(t),St&&(St.c(),St.m(n,r))),65633&e[0]&&(Mt=t[0],bt=F(bt,e,Ot,1,t,Mt,xt,I,D,tt,null,H)),65633&e[0]&&(Lt=t[0],kt=F(kt,e,jt,1,t,Lt,yt,L,D,et,null,Y)),t[9]?Rt&&(Rt.d(1),Rt=null):Rt?Rt.p(t,e):(Rt=nt(t),Rt.c(),Rt.m(R,N)),1024&e[0]&&k(st,"triggered",t[10]),25224318&e[0]&&(Nt=t[1],$t=F($t,e,Pt,1,t,Nt,wt,ft,D,lt,null,W)),25224318&e[0]&&(Dt=t[1],_t=F(_t,e,Ft,1,t,Dt,Ct,pt,D,ot,null,q)),t[9]?At?At.p(t,e):(At=it(t),At.c(),At.m(n,null)):At&&(At.d(1),At=null)},i:t,o:t,d(t){t&&u(n),St.d();for(let t=0;t<bt.length;t+=1)bt[t].d();for(let t=0;t<kt.length;t+=1)kt[t].d();Rt&&Rt.d();for(let t=0;t<$t.length;t+=1)$t[t].d();for(let t=0;t<_t.length;t+=1)_t[t].d();At&&At.d(),ht=!1,s(vt)}}}function gt(t,e,n){const s=e.findIndex((e=>e.index===t));n.push(e[s]),e.splice(s,1)}const pt=()=>{},mt=()=>{};function ht(t,e,n){let s=[],r=[];const l=[],c=async()=>{const t=await fetch("/real_images/manifest.json"),e=await t.json();n(0,s=e.map(((t,e)=>({path:`real_images/${t}`,index:e,tag:""}))))},a=async()=>{const t=await fetch("/generated_images/manifest.json"),e=await t.json();n(1,r=e.map(((t,e)=>({path:`generated_images/${t}`,index:e,tag:""}))))},o=async()=>{try{const t="distances/t10_0.csv",e=await fetch(t),n=await e.text();n.split("\n").forEach((t=>{const e=t.split(", ").map((t=>parseFloat(t)));l.push(e)}))}catch(t){console.error("Error loading distance matrix:",t)}},i=()=>{u();let t=[...r,...O.map((t=>({...t,tag:t.tag+", fake"})))];t=t.sort(((t,e)=>t.index-e.index));return t.map((t=>[t.index,t.path,t.tag].join(","))).join("\n")},f=()=>{console.log("store"),localStorage.setItem("generatedPaths",JSON.stringify(r)),localStorage.setItem("fakePaths",JSON.stringify(O))},u=()=>{console.log("load");const t=localStorage.getItem("generatedPaths"),e=[];if(t){JSON.parse(t).forEach((t=>{e.push({...t,index:parseInt(t.index)})})),n(1,r=e)}const s=localStorage.getItem("fakePaths"),l=[];if(s){JSON.parse(s).forEach((t=>{l.push({...t,index:parseInt(t.index)})})),n(8,O=l)}};let d=!1,g="",p=[];const m=()=>{g&&(n(4,p=[...p,g]),console.log(p),n(3,g=""))},h=(t,e,s)=>{"generated"===t&&(n(1,r=r.map((t=>t.index===e?{...t,tag:s}:t))),v(r),f())},v=(t,e)=>t.filter((t=>t.tag===e)).map((t=>t.index));let b=null,x="";let k=null,y=null;const w=(t,e)=>{n(5,k=e),n(6,y=t)},_=(t,e,s)=>{w("generated",e),((t,e)=>{t.clientX,t.clientY,n(2,d=!0),n(5,k=e)})(t,e)},C=(t,e)=>{w("real",e)},E=t=>{"real"===t?n(0,s=s.sort((()=>Math.random()-.5))):"generated"===t&&n(1,r=r.sort((()=>Math.random()-.5)))},I=t=>{"real"===t?n(0,s=s.sort(((t,e)=>t.index-e.index))):"generated"===t&&n(1,r=r.sort(((t,e)=>t.index-e.index)))},S=t=>{const e=l[k];"real"===t?n(0,s=s.sort(((t,n)=>e[t.index]-e[n.index]))):"generated"===t?n(1,r=r.sort(((t,n)=>e[n.index]-e[t.index]))):console.log("error: Wrong panel name in sortImages")};let M=!1;let O=[],L=null,j=null;let R=!0;let N=!0;const P=(t,e,n,s)=>{N?((t,e,n)=>{b=e,x=n})(0,n,s):function(t,e,n){L=n,j=e}(0,e,n)},D=(t,e)=>{N&&((t,e)=>{t.preventDefault(),null!==b&&h("generated",e,x)})(t,e)},F=t=>{N||function(t){t.preventDefault()}(t)},A=(t,e)=>{N?(t=>{t.preventDefault(),b=null,x=""})(t):function(t,e){t.preventDefault(),"generated"===j&&"fake"===e?gt(L,r,O):"generated"===e&&"fake"===j&&gt(L,O,r),n(8,O),n(1,r),f()}(t,e)},T=t=>{t.target.closest(".context-menu");!t.target.closest(".grid-item")&&n(2,d=!1)};$((async()=>(window.addEventListener("click",T),await Promise.all([c(),a(),o()]),()=>{window.removeEventListener("click",T)})));return[s,r,d,g,p,k,y,M,O,R,N,()=>{const t=new Blob([i()],{type:"text/csv"}),e=URL.createObjectURL(t),n=document.createElement("a");n.href=e,n.download="feedback.csv",n.click(),URL.revokeObjectURL(e)},u,m,h,_,C,E,I,S,()=>{n(7,M=!M)},()=>{n(9,R=!R)},()=>{n(10,N=!N)},P,D,F,A,()=>S("real"),()=>E("real"),()=>I("real"),(t,e)=>C(0,t),(t,e)=>C(0,t),()=>S("generated"),()=>E("generated"),()=>I("generated"),(t,e)=>h("generated",t,e),function(){g=this.value,n(3,g)},t=>{"Enter"===t.key&&m()},()=>m(),(t,e,n)=>_(n,t),(t,e,n)=>P(0,"generated",t,e),(t,e)=>D(e,t),(t,e)=>h("generated",t,e),function(){g=this.value,n(3,g)},t=>{"Enter"===t.key&&m()},()=>m(),(t,e,n)=>_(n,t),(t,e,n)=>P(0,"generated",t,e),(t,e)=>D(e,t),t=>A(t,"generated"),t=>F(t),()=>S("fake"),()=>E("fake"),()=>I("fake"),(t,e,n)=>_(n,t),(t,e)=>P(0,"generated",t),(t,e,n)=>_(n,t),(t,e)=>P(0,"generated",t),t=>F(t),t=>A(t,"fake")]}return new class extends U{constructor(t){super(),J(this,t,ht,dt,l,{},null,[-1,-1,-1,-1])}}({target:document.body,props:{name:"world"}})}();
//# sourceMappingURL=bundle.js.map
