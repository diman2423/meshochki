(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const l of s.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&o(l)}).observe(document,{childList:!0,subtree:!0});function a(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(n){if(n.ep)return;n.ep=!0;const s=a(n);fetch(n.href,s)}})();const U=[5e4,1e4,5e3,1e3],ut={5e4:.5,1e4:.3,5e3:.15,1e3:.05};function Q(t){const e=[];let a=Math.floor(t);for(const o of U){const n=Math.floor(t*ut[o]/o);for(let s=0;s<n&&a>=o;s++)e.push(o),a-=o}for(const o of U)for(;a>=o;)e.push(o),a-=o;return e.sort((o,n)=>n-o),{values:e,change:a}}const ft={5e4:[1e4,1e4,1e4,1e4,1e4],1e4:[5e3,5e3],5e3:[1e3,1e3,1e3,1e3,1e3]};function pt(t){return ft[t]??null}function A(t){return{id:crypto.randomUUID(),value:t}}const Z="meshochki-v1";function ht(){try{const t=localStorage.getItem(Z);if(t){const e=JSON.parse(t);if(Array.isArray(e.bags)&&typeof e.wallet=="number")return Array.isArray(e.log)||(e.log=[]),e}}catch{}return{bags:[],wallet:0,log:[]}}function y(t){localStorage.setItem(Z,JSON.stringify(t))}const i=ht(),u=new Set,b=new Set,gt=document.querySelector("#app");gt.innerHTML=`
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
      <button class="log-link log-link--danger" id="reset-btn">Сбросить…</button>
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
      <p class="dialog__title">Что сбросить?</p>
      <label class="reset-opt"><input type="checkbox" id="reset-bags" checked /> Мешки и кошелёк мелочи</label>
      <label class="reset-opt"><input type="checkbox" id="reset-log" /> История трат</label>
      <p class="dialog__text">Если что, ↶ сможет вернуть.</p>
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
`;const c=t=>document.getElementById(t),z=c("balance"),I=c("floor"),mt=c("wallet"),L=c("chest"),bt=c("chest-sum"),B=c("chest-chips"),vt=c("chest-hint"),F=c("spend-btn"),tt=c("undo-btn"),et=c("tidy-btn"),D=c("overlay"),S=c("amount"),H=c("spend-overlay"),yt=c("spend-title"),G=c("cats"),nt=c("note"),st=c("log-overlay"),M=c("log-list"),v=t=>`${t.toLocaleString("ru-RU")} ₽`,ot=t=>`${t/1e3}к`,R="meshochki-history-v1";let h=[];try{const t=localStorage.getItem(R);t&&(h=JSON.parse(t))}catch{h=[]}function k(){h.push(JSON.parse(JSON.stringify(i))),h.length>30&&h.shift(),localStorage.setItem(R,JSON.stringify(h))}function Et(){const t=h.pop();t&&(localStorage.setItem(R,JSON.stringify(h)),i.bags=t.bags,i.wallet=t.wallet,i.log=t.log,u.clear(),y(i),f())}let j=0,$=0;function T(t,e,a,o){if(document.hidden){o();return}const n=t.animate(e,a);n.onfinish=o,n.oncancel=o}function wt(t){cancelAnimationFrame($);const e=j;if(j=t,e===t||document.hidden){z.textContent=v(t);return}const a=performance.now(),o=500,n=s=>{const l=Math.min((s-a)/o,1),r=1-(1-l)**3;z.textContent=v(Math.round(e+(t-e)*r)),l<1&&($=requestAnimationFrame(n))};$=requestAnimationFrame(n)}function f(){const t=i.bags.reduce((n,s)=>n+s.value,0)+i.wallet;wt(t),mt.textContent=v(i.wallet),I.innerHTML="";const e=i.bags.filter(n=>!u.has(n.id));e.length===0&&(I.innerHTML='<p class="floor__empty">Пусто. Жми «Инкам», когда придут деньги.</p>');let a=0;for(const n of e){const s=_t(n);b.has(n.id)&&(s.style.animationDelay=`${Math.min(a++*40,800)}ms`),I.append(s)}B.innerHTML="";let o=0;for(const n of i.bags.filter(s=>u.has(s.id))){o+=n.value;const s=document.createElement("button");s.className="chip",s.textContent=ot(n.value),s.title="Вернуть в комнату",s.addEventListener("click",()=>{u.delete(n.id),f()}),B.append(s)}bt.textContent=v(o),vt.hidden=o>0,F.disabled=o===0,tt.disabled=h.length===0,et.disabled=e.length<2,b.clear()}function _t(t){const e=document.createElement("div");return e.className=`bag bag--${t.value}`,b.has(t.id)&&e.classList.add("bag--new"),e.textContent=ot(t.value),Lt(e,t),e}const m={base:.05,k:1.5,fastFollow:.9,slowFollow:.12};function kt(t){const e=i.bags.filter(n=>!u.has(n.id)).reduce((n,s)=>n+s.value,0),a=e>0?Math.min(1,t/e):1,o=m.base+(1-m.base)*Math.pow(a,m.k);return m.fastFollow+(m.slowFollow-m.fastFollow)*o}function V(t){const e=L.getBoundingClientRect();return t.clientX>=e.left&&t.clientX<=e.right&&t.clientY>=e.top&&t.clientY<=e.bottom}function Lt(t,e){t.addEventListener("pointerdown",a=>{if(a.pointerType==="mouse"&&a.button!==0)return;a.preventDefault();try{t.setPointerCapture(a.pointerId)}catch{}const o=a.clientX,n=a.clientY,s=t.getBoundingClientRect();let l=!1,r=null,x=0,C=0,N=0,J=0,q=0,P=1,O=0;const X=d=>{const g=d-O;O=d;const p=Math.min(1,P*g/16.7);C+=(J-C)*p,N+=(q-N)*p,t.style.transform=`translate(${C}px, ${N}px) scale(1.1)`,x=requestAnimationFrame(X)},W=d=>{const g=d.clientX-o,p=d.clientY-n;!l&&Math.hypot(g,p)>8&&(l=!0,r=document.createElement("div"),r.style.width=`${s.width}px`,r.style.height=`${s.height}px`,r.style.visibility="hidden",t.before(r),t.classList.add("bag--drag"),t.style.position="fixed",t.style.left=`${s.left}px`,t.style.top=`${s.top}px`,t.style.zIndex="10",t.style.transform="translate(0, 0) scale(1.1)",P=kt(e.value),O=performance.now(),x=requestAnimationFrame(X)),l&&(J=g,q=p,L.classList.toggle("chest--over",V(d)))},K=(d,g)=>{if(t.removeEventListener("pointermove",W),cancelAnimationFrame(x),L.classList.remove("chest--over"),!l){g||St(e,t);return}if(t.style.pointerEvents="none",!g&&V(d)){const p=L.getBoundingClientRect(),rt=p.left+p.width/2-s.left-s.width/2,dt=p.top+p.height/2-s.top-s.height/2;T(t,[{transform:t.style.transform,opacity:1},{transform:`translate(${rt}px, ${dt}px) scale(0.25)`,opacity:.4}],{duration:200,easing:"ease-in",fill:"forwards"},()=>{u.add(e.id),f()})}else T(t,[{transform:t.style.transform},{transform:"translate(0, 0) scale(1)"}],{duration:260,easing:"cubic-bezier(0.34, 1.56, 0.64, 1)",fill:"forwards"},()=>f())};t.addEventListener("pointermove",W),t.addEventListener("pointerup",d=>K(d,!1),{once:!0}),t.addEventListener("pointercancel",d=>K(d,!0),{once:!0})})}function St(t,e){const a=pt(t.value);if(!a){e.classList.remove("bag--shake"),e.offsetWidth,e.classList.add("bag--shake");return}e.style.pointerEvents="none",T(e,[{transform:"scale(1)",opacity:1},{transform:"scale(1.4)",opacity:0}],{duration:160,easing:"ease-out",fill:"forwards"},()=>{const o=i.bags.findIndex(s=>s.id===t.id);if(o===-1){f();return}k();const n=a.map(s=>A(s));i.bags.splice(o,1,...n);for(const s of n)b.add(s.id);y(i),f()})}function xt(t){k();const{values:e,change:a}=Q(t);for(const o of e){const n=A(o);i.bags.push(n),b.add(n.id)}i.bags.sort((o,n)=>n.value-o.value),i.wallet+=a,y(i),f()}const Ct=["Жильё","Еда","Транспорт","Здоровье","Развлечения","Одежда","Связь","Другое"];let E=null;function at(){return i.bags.filter(t=>u.has(t.id)).reduce((t,e)=>t+e.value,0)}function it(){G.innerHTML="";for(const t of Ct){const e=document.createElement("button");e.className=E===t?"cat cat--on":"cat",e.textContent=t,e.addEventListener("click",()=>{E=E===t?null:t,it()}),G.append(e)}}function Nt(){const t=at();t!==0&&(yt.textContent=`Потратить ${v(t)}`,E=null,nt.value="",it(),H.hidden=!1)}function Ot(){if(M.innerHTML="",i.log.length===0){const t=document.createElement("p");t.className="log-empty",t.textContent="Пока пусто — трат не было.",M.append(t)}for(const t of i.log.slice(0,100)){const e=new Date(t.ts),a=document.createElement("div");a.className="log-item";const o=document.createElement("span");o.className="log-item__date",o.textContent=`${String(e.getDate()).padStart(2,"0")}.${String(e.getMonth()+1).padStart(2,"0")}`;const n=document.createElement("span");n.className="log-item__what",n.textContent=t.note?`${t.category} · ${t.note}`:t.category;const s=document.createElement("span");s.className="log-item__sum",s.textContent=v(t.amount),a.append(o,n,s),M.append(a)}st.hidden=!1}function It(){H.hidden=!0;const t=at();if(t===0)return;const e=E??"Без категории",a=nt.value.trim(),o=[...B.children];o.forEach((n,s)=>n.animate([{opacity:1,transform:"scale(1)"},{opacity:0,transform:"scale(0.4)"}],{duration:180,delay:s*30,easing:"ease-in",fill:"forwards"})),F.disabled=!0,setTimeout(()=>{k(),i.log.unshift({ts:Date.now(),amount:t,category:e,note:a||void 0}),i.bags=i.bags.filter(n=>!u.has(n.id)),u.clear(),y(i),f()},200+o.length*30)}function Mt(){const t=i.bags.filter(l=>!u.has(l.id)),e=t.reduce((l,r)=>l+r.value,0);if(e===0)return;const{values:a}=Q(e),o=t.map(l=>l.value).sort((l,r)=>r-l);if(o.length===a.length&&o.every((l,r)=>l===a[r]))return;k();const n=i.bags.filter(l=>u.has(l.id)),s=a.map(l=>A(l));for(const l of s)b.add(l.id);i.bags=[...n,...s],y(i),f()}c("income-btn").addEventListener("click",()=>{S.value="",D.hidden=!1,S.focus()});c("cancel-btn").addEventListener("click",()=>{D.hidden=!0});c("ok-btn").addEventListener("click",ct);S.addEventListener("keydown",t=>{t.key==="Enter"&&ct()});function ct(){const t=Number(S.value.replace(/\D/g,""));t>0&&(xt(t),D.hidden=!0)}F.addEventListener("click",Nt);tt.addEventListener("click",Et);et.addEventListener("click",Mt);c("spend-cancel").addEventListener("click",()=>{H.hidden=!0});c("spend-ok").addEventListener("click",It);c("log-btn").addEventListener("click",Ot);c("log-close").addEventListener("click",()=>{st.hidden=!0});const w=c("reset-bags"),_=c("reset-log"),lt=c("reset-ok");function Y(){lt.disabled=!w.checked&&!_.checked}w.addEventListener("change",Y);_.addEventListener("change",Y);c("reset-btn").addEventListener("click",()=>{w.checked=!0,_.checked=!1,Y(),c("reset-overlay").hidden=!1});c("reset-cancel").addEventListener("click",()=>{c("reset-overlay").hidden=!0});lt.addEventListener("click",()=>{c("reset-overlay").hidden=!0,!(!w.checked&&!_.checked)&&(k(),w.checked&&(i.bags=[],i.wallet=0,u.clear()),_.checked&&(i.log=[]),y(i),f())});f();"serviceWorker"in navigator&&navigator.serviceWorker.register("./sw.js");
