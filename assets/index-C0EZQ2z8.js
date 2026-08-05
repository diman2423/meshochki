(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const l of s.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&o(l)}).observe(document,{childList:!0,subtree:!0});function a(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(n){if(n.ep)return;n.ep=!0;const s=a(n);fetch(n.href,s)}})();const X=[5e4,1e4,5e3,1e3],ct={5e4:.5,1e4:.3,5e3:.15,1e3:.05};function G(t){const e=[];let a=Math.floor(t);for(const o of X){const n=Math.floor(t*ct[o]/o);for(let s=0;s<n&&a>=o;s++)e.push(o),a-=o}for(const o of X)for(;a>=o;)e.push(o),a-=o;return e.sort((o,n)=>n-o),{values:e,change:a}}const lt={5e4:[1e4,1e4,1e4,1e4,1e4],1e4:[5e3,5e3],5e3:[1e3,1e3,1e3,1e3,1e3]};function rt(t){return lt[t]??null}function T(t){return{id:crypto.randomUUID(),value:t}}const j="meshochki-v1";function dt(){try{const t=localStorage.getItem(j);if(t){const e=JSON.parse(t);if(Array.isArray(e.bags)&&typeof e.wallet=="number")return Array.isArray(e.log)||(e.log=[]),e}}catch{}return{bags:[],wallet:0,log:[]}}function y(t){localStorage.setItem(j,JSON.stringify(t))}const i=dt(),u=new Set,v=new Set,ut=document.querySelector("#app");ut.innerHTML=`
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
    <div class="links">
      <button class="log-link" id="log-btn">История трат</button>
      <button class="log-link log-link--danger" id="reset-btn">Сбросить всё</button>
    </div>
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
  <div class="overlay" id="reset-overlay" hidden>
    <div class="dialog">
      <p class="dialog__title">Сбросить всё?</p>
      <p class="dialog__text">Обнулятся мешки, кошелёк мелочи и история трат. Если что, ↶ сможет вернуть.</p>
      <div class="dialog__actions">
        <button class="btn btn--ghost" id="reset-cancel">Отмена</button>
        <button class="btn btn--danger" id="reset-ok">Сбросить</button>
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
`;const c=t=>document.getElementById(t),W=c("balance"),N=c("floor"),ft=c("wallet"),_=c("chest"),pt=c("chest-sum"),O=c("chest-chips"),gt=c("chest-hint"),A=c("spend-btn"),V=c("undo-btn"),Q=c("tidy-btn"),B=c("overlay"),L=c("amount"),F=c("spend-overlay"),mt=c("spend-title"),K=c("cats"),Z=c("note"),tt=c("log-overlay"),I=c("log-list"),b=t=>`${t.toLocaleString("ru-RU")} ₽`,et=t=>`${t/1e3}к`,D="meshochki-history-v1";let g=[];try{const t=localStorage.getItem(D);t&&(g=JSON.parse(t))}catch{g=[]}function w(){g.push(JSON.parse(JSON.stringify(i))),g.length>30&&g.shift(),localStorage.setItem(D,JSON.stringify(g))}function ht(){const t=g.pop();t&&(localStorage.setItem(D,JSON.stringify(g)),i.bags=t.bags,i.wallet=t.wallet,i.log=t.log,u.clear(),y(i),f())}let U=0,M=0;function $(t,e,a,o){if(document.hidden){o();return}const n=t.animate(e,a);n.onfinish=o,n.oncancel=o}function vt(t){cancelAnimationFrame(M);const e=U;if(U=t,e===t||document.hidden){W.textContent=b(t);return}const a=performance.now(),o=500,n=s=>{const l=Math.min((s-a)/o,1),r=1-(1-l)**3;W.textContent=b(Math.round(e+(t-e)*r)),l<1&&(M=requestAnimationFrame(n))};M=requestAnimationFrame(n)}function f(){const t=i.bags.reduce((n,s)=>n+s.value,0)+i.wallet;vt(t),ft.textContent=b(i.wallet),N.innerHTML="";const e=i.bags.filter(n=>!u.has(n.id));e.length===0&&(N.innerHTML='<p class="floor__empty">Пусто. Жми «Инкам», когда придут деньги.</p>');let a=0;for(const n of e){const s=bt(n);v.has(n.id)&&(s.style.animationDelay=`${Math.min(a++*40,800)}ms`),N.append(s)}O.innerHTML="";let o=0;for(const n of i.bags.filter(s=>u.has(s.id))){o+=n.value;const s=document.createElement("button");s.className="chip",s.textContent=et(n.value),s.title="Вернуть в комнату",s.addEventListener("click",()=>{u.delete(n.id),f()}),O.append(s)}pt.textContent=b(o),gt.hidden=o>0,A.disabled=o===0,V.disabled=g.length===0,Q.disabled=e.length<2,v.clear()}function bt(t){const e=document.createElement("div");return e.className=`bag bag--${t.value}`,v.has(t.id)&&e.classList.add("bag--new"),e.textContent=et(t.value),Et(e,t),e}const h={base:.05,k:1.5,fastFollow:.9,slowFollow:.12};function yt(t){const e=i.bags.filter(n=>!u.has(n.id)).reduce((n,s)=>n+s.value,0),a=e>0?Math.min(1,t/e):1,o=h.base+(1-h.base)*Math.pow(a,h.k);return h.fastFollow+(h.slowFollow-h.fastFollow)*o}function z(t){const e=_.getBoundingClientRect();return t.clientX>=e.left&&t.clientX<=e.right&&t.clientY>=e.top&&t.clientY<=e.bottom}function Et(t,e){t.addEventListener("pointerdown",a=>{if(a.pointerType==="mouse"&&a.button!==0)return;a.preventDefault();try{t.setPointerCapture(a.pointerId)}catch{}const o=a.clientX,n=a.clientY,s=t.getBoundingClientRect();let l=!1,r=null,S=0,k=0,x=0,H=0,Y=0,R=1,C=0;const J=d=>{const m=d-C;C=d;const p=Math.min(1,R*m/16.7);k+=(H-k)*p,x+=(Y-x)*p,t.style.transform=`translate(${k}px, ${x}px) scale(1.1)`,S=requestAnimationFrame(J)},q=d=>{const m=d.clientX-o,p=d.clientY-n;!l&&Math.hypot(m,p)>8&&(l=!0,r=document.createElement("div"),r.style.width=`${s.width}px`,r.style.height=`${s.height}px`,r.style.visibility="hidden",t.before(r),t.classList.add("bag--drag"),t.style.position="fixed",t.style.left=`${s.left}px`,t.style.top=`${s.top}px`,t.style.zIndex="10",t.style.transform="translate(0, 0) scale(1.1)",R=yt(e.value),C=performance.now(),S=requestAnimationFrame(J)),l&&(H=m,Y=p,_.classList.toggle("chest--over",z(d)))},P=(d,m)=>{if(t.removeEventListener("pointermove",q),cancelAnimationFrame(S),_.classList.remove("chest--over"),!l){m||wt(e,t);return}if(t.style.pointerEvents="none",!m&&z(d)){const p=_.getBoundingClientRect(),at=p.left+p.width/2-s.left-s.width/2,it=p.top+p.height/2-s.top-s.height/2;$(t,[{transform:t.style.transform,opacity:1},{transform:`translate(${at}px, ${it}px) scale(0.25)`,opacity:.4}],{duration:200,easing:"ease-in",fill:"forwards"},()=>{u.add(e.id),f()})}else $(t,[{transform:t.style.transform},{transform:"translate(0, 0) scale(1)"}],{duration:260,easing:"cubic-bezier(0.34, 1.56, 0.64, 1)",fill:"forwards"},()=>f())};t.addEventListener("pointermove",q),t.addEventListener("pointerup",d=>P(d,!1),{once:!0}),t.addEventListener("pointercancel",d=>P(d,!0),{once:!0})})}function wt(t,e){const a=rt(t.value);if(!a){e.classList.remove("bag--shake"),e.offsetWidth,e.classList.add("bag--shake");return}e.style.pointerEvents="none",$(e,[{transform:"scale(1)",opacity:1},{transform:"scale(1.4)",opacity:0}],{duration:160,easing:"ease-out",fill:"forwards"},()=>{const o=i.bags.findIndex(s=>s.id===t.id);if(o===-1){f();return}w();const n=a.map(s=>T(s));i.bags.splice(o,1,...n);for(const s of n)v.add(s.id);y(i),f()})}function _t(t){w();const{values:e,change:a}=G(t);for(const o of e){const n=T(o);i.bags.push(n),v.add(n.id)}i.bags.sort((o,n)=>n.value-o.value),i.wallet+=a,y(i),f()}const Lt=["Жильё","Еда","Транспорт","Здоровье","Развлечения","Одежда","Связь","Другое"];let E=null;function nt(){return i.bags.filter(t=>u.has(t.id)).reduce((t,e)=>t+e.value,0)}function st(){K.innerHTML="";for(const t of Lt){const e=document.createElement("button");e.className=E===t?"cat cat--on":"cat",e.textContent=t,e.addEventListener("click",()=>{E=E===t?null:t,st()}),K.append(e)}}function St(){const t=nt();t!==0&&(mt.textContent=`Потратить ${b(t)}`,E=null,Z.value="",st(),F.hidden=!1)}function kt(){if(I.innerHTML="",i.log.length===0){const t=document.createElement("p");t.className="log-empty",t.textContent="Пока пусто — трат не было.",I.append(t)}for(const t of i.log.slice(0,100)){const e=new Date(t.ts),a=document.createElement("div");a.className="log-item";const o=document.createElement("span");o.className="log-item__date",o.textContent=`${String(e.getDate()).padStart(2,"0")}.${String(e.getMonth()+1).padStart(2,"0")}`;const n=document.createElement("span");n.className="log-item__what",n.textContent=t.note?`${t.category} · ${t.note}`:t.category;const s=document.createElement("span");s.className="log-item__sum",s.textContent=b(t.amount),a.append(o,n,s),I.append(a)}tt.hidden=!1}function xt(){F.hidden=!0;const t=nt();if(t===0)return;const e=E??"Без категории",a=Z.value.trim(),o=[...O.children];o.forEach((n,s)=>n.animate([{opacity:1,transform:"scale(1)"},{opacity:0,transform:"scale(0.4)"}],{duration:180,delay:s*30,easing:"ease-in",fill:"forwards"})),A.disabled=!0,setTimeout(()=>{w(),i.log.unshift({ts:Date.now(),amount:t,category:e,note:a||void 0}),i.bags=i.bags.filter(n=>!u.has(n.id)),u.clear(),y(i),f()},200+o.length*30)}function Ct(){const t=i.bags.filter(l=>!u.has(l.id)),e=t.reduce((l,r)=>l+r.value,0);if(e===0)return;const{values:a}=G(e),o=t.map(l=>l.value).sort((l,r)=>r-l);if(o.length===a.length&&o.every((l,r)=>l===a[r]))return;w();const n=i.bags.filter(l=>u.has(l.id)),s=a.map(l=>T(l));for(const l of s)v.add(l.id);i.bags=[...n,...s],y(i),f()}c("income-btn").addEventListener("click",()=>{L.value="",B.hidden=!1,L.focus()});c("cancel-btn").addEventListener("click",()=>{B.hidden=!0});c("ok-btn").addEventListener("click",ot);L.addEventListener("keydown",t=>{t.key==="Enter"&&ot()});function ot(){const t=Number(L.value.replace(/\D/g,""));t>0&&(_t(t),B.hidden=!0)}A.addEventListener("click",St);V.addEventListener("click",ht);Q.addEventListener("click",Ct);c("spend-cancel").addEventListener("click",()=>{F.hidden=!0});c("spend-ok").addEventListener("click",xt);c("log-btn").addEventListener("click",kt);c("log-close").addEventListener("click",()=>{tt.hidden=!0});c("reset-btn").addEventListener("click",()=>{c("reset-overlay").hidden=!1});c("reset-cancel").addEventListener("click",()=>{c("reset-overlay").hidden=!0});c("reset-ok").addEventListener("click",()=>{c("reset-overlay").hidden=!0,w(),i.bags=[],i.wallet=0,i.log=[],u.clear(),y(i),f()});f();"serviceWorker"in navigator&&navigator.serviceWorker.register("./sw.js");
