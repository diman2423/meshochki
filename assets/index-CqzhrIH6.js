(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const c of s.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&o(c)}).observe(document,{childList:!0,subtree:!0});function a(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(n){if(n.ep)return;n.ep=!0;const s=a(n);fetch(n.href,s)}})();const X=[5e4,1e4,5e3,1e3],ct={5e4:.5,1e4:.3,5e3:.15,1e3:.05};function G(t){const e=[];let a=Math.floor(t);for(const o of X){const n=Math.floor(t*ct[o]/o);for(let s=0;s<n&&a>=o;s++)e.push(o),a-=o}for(const o of X)for(;a>=o;)e.push(o),a-=o;return e.sort((o,n)=>n-o),{values:e,change:a}}const lt={5e4:[1e4,1e4,1e4,1e4,1e4],1e4:[5e3,5e3],5e3:[1e3,1e3,1e3,1e3,1e3]};function rt(t){return lt[t]??null}function T(t){return{id:crypto.randomUUID(),value:t}}const j="meshochki-v1";function dt(){try{const t=localStorage.getItem(j);if(t){const e=JSON.parse(t);if(Array.isArray(e.bags)&&typeof e.wallet=="number")return Array.isArray(e.log)||(e.log=[]),e}}catch{}return{bags:[],wallet:0,log:[]}}function E(t){localStorage.setItem(j,JSON.stringify(t))}const i=dt(),u=new Set,v=new Set,ut=document.querySelector("#app");ut.innerHTML=`
  <main class="room">
    <header class="room__header">
      <div>
        <span class="room__label">Хранилище</span>
        <span class="room__balance" id="balance">0 ₽</span>
      </div>
      <div class="room__actions">
        <button class="btn btn--undo" id="undo-btn" title="Отменить последнее действие" disabled>↶</button>
        <button class="btn" id="income-btn">+ Инкам</button>
      </div>
    </header>
    <section class="floor" id="floor" aria-label="Комната с мешками"></section>
    <div class="wallet">
      <span>Кошелёк мелочи · <span id="wallet">0 ₽</span></span>
      <button class="wallet__tidy" id="tidy-btn" disabled>Прибраться</button>
    </div>
    <section class="chest" id="chest" aria-label="Сундук трат">
      <div class="chest__top">
        <span class="chest__label">Сундук трат</span>
        <span class="chest__sum" id="chest-sum">0 ₽</span>
      </div>
      <div class="chest__chips" id="chest-chips"></div>
      <p class="chest__hint" id="chest-hint">Перетащи мешки сюда. Тап по мешку — размен.</p>
      <button class="btn chest__spend" id="spend-btn" disabled>Потратить</button>
    </section>
    <button class="log-link" id="log-btn">История трат</button>
  </main>
  <div class="overlay" id="overlay" hidden>
    <div class="dialog">
      <p class="dialog__title">Сколько пришло?</p>
      <input id="amount" type="text" inputmode="numeric" placeholder="100 000" autocomplete="off" />
      <div class="dialog__actions">
        <button class="btn btn--ghost" id="cancel-btn">Отмена</button>
        <button class="btn" id="ok-btn">Занести</button>
      </div>
    </div>
  </div>
  <div class="overlay" id="spend-overlay" hidden>
    <div class="dialog">
      <p class="dialog__title" id="spend-title">Потратить</p>
      <div class="cats" id="cats"></div>
      <input id="note" type="text" placeholder="Заметка (необязательно)" autocomplete="off" />
      <div class="dialog__actions">
        <button class="btn btn--ghost" id="spend-cancel">Отмена</button>
        <button class="btn" id="spend-ok">Потратить</button>
      </div>
    </div>
  </div>
  <div class="overlay" id="log-overlay" hidden>
    <div class="dialog dialog--log">
      <p class="dialog__title">История трат</p>
      <div class="log-list" id="log-list"></div>
      <div class="dialog__actions">
        <button class="btn" id="log-close">Закрыть</button>
      </div>
    </div>
  </div>
`;const l=t=>document.getElementById(t),W=l("balance"),N=l("floor"),ft=l("wallet"),w=l("chest"),pt=l("chest-sum"),O=l("chest-chips"),mt=l("chest-hint"),A=l("spend-btn"),V=l("undo-btn"),Q=l("tidy-btn"),B=l("overlay"),_=l("amount"),F=l("spend-overlay"),ht=l("spend-title"),K=l("cats"),Z=l("note"),tt=l("log-overlay"),I=l("log-list"),b=t=>`${t.toLocaleString("ru-RU")} ₽`,et=t=>`${t/1e3}к`,D="meshochki-history-v1";let m=[];try{const t=localStorage.getItem(D);t&&(m=JSON.parse(t))}catch{m=[]}function L(){m.push(JSON.parse(JSON.stringify(i))),m.length>30&&m.shift(),localStorage.setItem(D,JSON.stringify(m))}function gt(){const t=m.pop();t&&(localStorage.setItem(D,JSON.stringify(m)),i.bags=t.bags,i.wallet=t.wallet,i.log=t.log,u.clear(),E(i),p())}let U=0,M=0;function $(t,e,a,o){if(document.hidden){o();return}const n=t.animate(e,a);n.onfinish=o,n.oncancel=o}function vt(t){cancelAnimationFrame(M);const e=U;if(U=t,e===t||document.hidden){W.textContent=b(t);return}const a=performance.now(),o=500,n=s=>{const c=Math.min((s-a)/o,1),r=1-(1-c)**3;W.textContent=b(Math.round(e+(t-e)*r)),c<1&&(M=requestAnimationFrame(n))};M=requestAnimationFrame(n)}function p(){const t=i.bags.reduce((n,s)=>n+s.value,0)+i.wallet;vt(t),ft.textContent=b(i.wallet),N.innerHTML="";const e=i.bags.filter(n=>!u.has(n.id));e.length===0&&(N.innerHTML='<p class="floor__empty">Пусто. Жми «Инкам», когда придут деньги.</p>');let a=0;for(const n of e){const s=bt(n);v.has(n.id)&&(s.style.animationDelay=`${Math.min(a++*40,800)}ms`),N.append(s)}O.innerHTML="";let o=0;for(const n of i.bags.filter(s=>u.has(s.id))){o+=n.value;const s=document.createElement("button");s.className="chip",s.textContent=et(n.value),s.title="Вернуть в комнату",s.addEventListener("click",()=>{u.delete(n.id),p()}),O.append(s)}pt.textContent=b(o),mt.hidden=o>0,A.disabled=o===0,V.disabled=m.length===0,Q.disabled=e.length<2,v.clear()}function bt(t){const e=document.createElement("div");return e.className=`bag bag--${t.value}`,v.has(t.id)&&e.classList.add("bag--new"),e.textContent=et(t.value),Et(e,t),e}const g={base:.05,k:1.5,fastFollow:.9,slowFollow:.12};function yt(t){const e=i.bags.filter(n=>!u.has(n.id)).reduce((n,s)=>n+s.value,0),a=e>0?Math.min(1,t/e):1,o=g.base+(1-g.base)*Math.pow(a,g.k);return g.fastFollow+(g.slowFollow-g.fastFollow)*o}function z(t){const e=w.getBoundingClientRect();return t.clientX>=e.left&&t.clientX<=e.right&&t.clientY>=e.top&&t.clientY<=e.bottom}function Et(t,e){t.addEventListener("pointerdown",a=>{if(a.pointerType==="mouse"&&a.button!==0)return;a.preventDefault();try{t.setPointerCapture(a.pointerId)}catch{}const o=a.clientX,n=a.clientY,s=t.getBoundingClientRect();let c=!1,r=null,S=0,x=0,k=0,H=0,Y=0,R=1,C=0;const J=d=>{const h=d-C;C=d;const f=Math.min(1,R*h/16.7);x+=(H-x)*f,k+=(Y-k)*f,t.style.transform=`translate(${x}px, ${k}px) scale(1.1)`,S=requestAnimationFrame(J)},q=d=>{const h=d.clientX-o,f=d.clientY-n;!c&&Math.hypot(h,f)>8&&(c=!0,r=document.createElement("div"),r.style.width=`${s.width}px`,r.style.height=`${s.height}px`,r.style.visibility="hidden",t.before(r),t.classList.add("bag--drag"),t.style.position="fixed",t.style.left=`${s.left}px`,t.style.top=`${s.top}px`,t.style.zIndex="10",t.style.transform="translate(0, 0) scale(1.1)",R=yt(e.value),C=performance.now(),S=requestAnimationFrame(J)),c&&(H=h,Y=f,w.classList.toggle("chest--over",z(d)))},P=(d,h)=>{if(t.removeEventListener("pointermove",q),cancelAnimationFrame(S),w.classList.remove("chest--over"),!c){h||wt(e,t);return}if(t.style.pointerEvents="none",!h&&z(d)){const f=w.getBoundingClientRect(),at=f.left+f.width/2-s.left-s.width/2,it=f.top+f.height/2-s.top-s.height/2;$(t,[{transform:t.style.transform,opacity:1},{transform:`translate(${at}px, ${it}px) scale(0.25)`,opacity:.4}],{duration:200,easing:"ease-in",fill:"forwards"},()=>{u.add(e.id),p()})}else $(t,[{transform:t.style.transform},{transform:"translate(0, 0) scale(1)"}],{duration:260,easing:"cubic-bezier(0.34, 1.56, 0.64, 1)",fill:"forwards"},()=>p())};t.addEventListener("pointermove",q),t.addEventListener("pointerup",d=>P(d,!1),{once:!0}),t.addEventListener("pointercancel",d=>P(d,!0),{once:!0})})}function wt(t,e){const a=rt(t.value);if(!a){e.classList.remove("bag--shake"),e.offsetWidth,e.classList.add("bag--shake");return}e.style.pointerEvents="none",$(e,[{transform:"scale(1)",opacity:1},{transform:"scale(1.4)",opacity:0}],{duration:160,easing:"ease-out",fill:"forwards"},()=>{const o=i.bags.findIndex(s=>s.id===t.id);if(o===-1){p();return}L();const n=a.map(s=>T(s));i.bags.splice(o,1,...n);for(const s of n)v.add(s.id);E(i),p()})}function _t(t){L();const{values:e,change:a}=G(t);for(const o of e){const n=T(o);i.bags.push(n),v.add(n.id)}i.bags.sort((o,n)=>n.value-o.value),i.wallet+=a,E(i),p()}const Lt=["Жильё","Еда","Транспорт","Здоровье","Развлечения","Одежда","Связь","Другое"];let y=null;function nt(){return i.bags.filter(t=>u.has(t.id)).reduce((t,e)=>t+e.value,0)}function st(){K.innerHTML="";for(const t of Lt){const e=document.createElement("button");e.className=y===t?"cat cat--on":"cat",e.textContent=t,e.addEventListener("click",()=>{y=y===t?null:t,st()}),K.append(e)}}function St(){const t=nt();t!==0&&(ht.textContent=`Потратить ${b(t)}`,y=null,Z.value="",st(),F.hidden=!1)}function xt(){if(I.innerHTML="",i.log.length===0){const t=document.createElement("p");t.className="log-empty",t.textContent="Пока пусто — трат не было.",I.append(t)}for(const t of i.log.slice(0,100)){const e=new Date(t.ts),a=document.createElement("div");a.className="log-item";const o=document.createElement("span");o.className="log-item__date",o.textContent=`${String(e.getDate()).padStart(2,"0")}.${String(e.getMonth()+1).padStart(2,"0")}`;const n=document.createElement("span");n.className="log-item__what",n.textContent=t.note?`${t.category} · ${t.note}`:t.category;const s=document.createElement("span");s.className="log-item__sum",s.textContent=b(t.amount),a.append(o,n,s),I.append(a)}tt.hidden=!1}function kt(){F.hidden=!0;const t=nt();if(t===0)return;const e=y??"Без категории",a=Z.value.trim(),o=[...O.children];o.forEach((n,s)=>n.animate([{opacity:1,transform:"scale(1)"},{opacity:0,transform:"scale(0.4)"}],{duration:180,delay:s*30,easing:"ease-in",fill:"forwards"})),A.disabled=!0,setTimeout(()=>{L(),i.log.unshift({ts:Date.now(),amount:t,category:e,note:a||void 0}),i.bags=i.bags.filter(n=>!u.has(n.id)),u.clear(),E(i),p()},200+o.length*30)}function Ct(){const t=i.bags.filter(c=>!u.has(c.id)),e=t.reduce((c,r)=>c+r.value,0);if(e===0)return;const{values:a}=G(e),o=t.map(c=>c.value).sort((c,r)=>r-c);if(o.length===a.length&&o.every((c,r)=>c===a[r]))return;L();const n=i.bags.filter(c=>u.has(c.id)),s=a.map(c=>T(c));for(const c of s)v.add(c.id);i.bags=[...n,...s],E(i),p()}l("income-btn").addEventListener("click",()=>{_.value="",B.hidden=!1,_.focus()});l("cancel-btn").addEventListener("click",()=>{B.hidden=!0});l("ok-btn").addEventListener("click",ot);_.addEventListener("keydown",t=>{t.key==="Enter"&&ot()});function ot(){const t=Number(_.value.replace(/\D/g,""));t>0&&(_t(t),B.hidden=!0)}A.addEventListener("click",St);V.addEventListener("click",gt);Q.addEventListener("click",Ct);l("spend-cancel").addEventListener("click",()=>{F.hidden=!0});l("spend-ok").addEventListener("click",kt);l("log-btn").addEventListener("click",xt);l("log-close").addEventListener("click",()=>{tt.hidden=!0});p();"serviceWorker"in navigator&&navigator.serviceWorker.register("./sw.js");
