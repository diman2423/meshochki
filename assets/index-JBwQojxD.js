(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const c of s.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&o(c)}).observe(document,{childList:!0,subtree:!0});function a(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(n){if(n.ep)return;n.ep=!0;const s=a(n);fetch(n.href,s)}})();const A=[5e4,1e4,5e3,1e3],Q={5e4:.5,1e4:.3,5e3:.15,1e3:.05};function J(t){const e=[];let a=Math.floor(t);for(const o of A){const n=Math.floor(t*Q[o]/o);for(let s=0;s<n&&a>=o;s++)e.push(o),a-=o}for(const o of A)for(;a>=o;)e.push(o),a-=o;return e.sort((o,n)=>n-o),{values:e,change:a}}const Z={5e4:[1e4,1e4,1e4,1e4,1e4],1e4:[5e3,5e3],5e3:[1e3,1e3,1e3,1e3,1e3]};function tt(t){return Z[t]??null}function N(t){return{id:crypto.randomUUID(),value:t}}const P="meshochki-v1";function et(){try{const t=localStorage.getItem(P);if(t){const e=JSON.parse(t);if(Array.isArray(e.bags)&&typeof e.wallet=="number")return Array.isArray(e.log)||(e.log=[]),e}}catch{}return{bags:[],wallet:0,log:[]}}function y(t){localStorage.setItem(P,JSON.stringify(t))}const i=et(),d=new Set,m=new Set,nt=document.querySelector("#app");nt.innerHTML=`
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
`;const l=t=>document.getElementById(t),D=l("balance"),L=l("floor"),st=l("wallet"),E=l("chest"),ot=l("chest-sum"),k=l("chest-chips"),at=l("chest-hint"),I=l("spend-btn"),X=l("undo-btn"),q=l("tidy-btn"),O=l("overlay"),_=l("amount"),$=l("spend-overlay"),it=l("spend-title"),H=l("cats"),F=l("note"),K=l("log-overlay"),S=l("log-list"),g=t=>`${t.toLocaleString("ru-RU")} ₽`,U=t=>`${t/1e3}к`,M="meshochki-history-v1";let p=[];try{const t=localStorage.getItem(M);t&&(p=JSON.parse(t))}catch{p=[]}function w(){p.push(JSON.parse(JSON.stringify(i))),p.length>30&&p.shift(),localStorage.setItem(M,JSON.stringify(p))}function ct(){const t=p.pop();t&&(localStorage.setItem(M,JSON.stringify(p)),i.bags=t.bags,i.wallet=t.wallet,i.log=t.log,d.clear(),y(i),u())}let Y=0,x=0;function C(t,e,a,o){if(document.hidden){o();return}const n=t.animate(e,a);n.onfinish=o,n.oncancel=o}function lt(t){cancelAnimationFrame(x);const e=Y;if(Y=t,e===t||document.hidden){D.textContent=g(t);return}const a=performance.now(),o=500,n=s=>{const c=Math.min((s-a)/o,1),r=1-(1-c)**3;D.textContent=g(Math.round(e+(t-e)*r)),c<1&&(x=requestAnimationFrame(n))};x=requestAnimationFrame(n)}function u(){const t=i.bags.reduce((n,s)=>n+s.value,0)+i.wallet;lt(t),st.textContent=g(i.wallet),L.innerHTML="";const e=i.bags.filter(n=>!d.has(n.id));e.length===0&&(L.innerHTML='<p class="floor__empty">Пусто. Жми «Инкам», когда придут деньги.</p>');let a=0;for(const n of e){const s=rt(n);m.has(n.id)&&(s.style.animationDelay=`${Math.min(a++*40,800)}ms`),L.append(s)}k.innerHTML="";let o=0;for(const n of i.bags.filter(s=>d.has(s.id))){o+=n.value;const s=document.createElement("button");s.className="chip",s.textContent=U(n.value),s.title="Вернуть в комнату",s.addEventListener("click",()=>{d.delete(n.id),u()}),k.append(s)}ot.textContent=g(o),at.hidden=o>0,I.disabled=o===0,X.disabled=p.length===0,q.disabled=e.length<2,m.clear()}function rt(t){const e=document.createElement("div");return e.className=`bag bag--${t.value}`,m.has(t.id)&&e.classList.add("bag--new"),e.textContent=U(t.value),dt(e,t),e}function R(t){const e=E.getBoundingClientRect();return t.clientX>=e.left&&t.clientX<=e.right&&t.clientY>=e.top&&t.clientY<=e.bottom}function dt(t,e){t.addEventListener("pointerdown",a=>{if(a.pointerType==="mouse"&&a.button!==0)return;a.preventDefault();try{t.setPointerCapture(a.pointerId)}catch{}const o=a.clientX,n=a.clientY,s=t.getBoundingClientRect();let c=!1,r=null;const T=f=>{const v=f.clientX-o,h=f.clientY-n;!c&&Math.hypot(v,h)>8&&(c=!0,r=document.createElement("div"),r.style.width=`${s.width}px`,r.style.height=`${s.height}px`,r.style.visibility="hidden",t.before(r),t.classList.add("bag--drag"),t.style.position="fixed",t.style.left=`${s.left}px`,t.style.top=`${s.top}px`,t.style.zIndex="10"),c&&(t.style.transform=`translate(${v}px, ${h}px) scale(1.1)`,E.classList.toggle("chest--over",R(f)))},B=(f,v)=>{if(t.removeEventListener("pointermove",T),E.classList.remove("chest--over"),!c){v||ut(e,t);return}if(t.style.pointerEvents="none",!v&&R(f)){const h=E.getBoundingClientRect(),G=h.left+h.width/2-s.left-s.width/2,V=h.top+h.height/2-s.top-s.height/2;C(t,[{transform:t.style.transform,opacity:1},{transform:`translate(${G}px, ${V}px) scale(0.25)`,opacity:.4}],{duration:200,easing:"ease-in",fill:"forwards"},()=>{d.add(e.id),u()})}else C(t,[{transform:t.style.transform},{transform:"translate(0, 0) scale(1)"}],{duration:260,easing:"cubic-bezier(0.34, 1.56, 0.64, 1)",fill:"forwards"},()=>u())};t.addEventListener("pointermove",T),t.addEventListener("pointerup",f=>B(f,!1),{once:!0}),t.addEventListener("pointercancel",f=>B(f,!0),{once:!0})})}function ut(t,e){const a=tt(t.value);if(!a){e.classList.remove("bag--shake"),e.offsetWidth,e.classList.add("bag--shake");return}e.style.pointerEvents="none",C(e,[{transform:"scale(1)",opacity:1},{transform:"scale(1.4)",opacity:0}],{duration:160,easing:"ease-out",fill:"forwards"},()=>{const o=i.bags.findIndex(s=>s.id===t.id);if(o===-1){u();return}w();const n=a.map(s=>N(s));i.bags.splice(o,1,...n);for(const s of n)m.add(s.id);y(i),u()})}function ft(t){w();const{values:e,change:a}=J(t);for(const o of e){const n=N(o);i.bags.push(n),m.add(n.id)}i.bags.sort((o,n)=>n.value-o.value),i.wallet+=a,y(i),u()}const pt=["Жильё","Еда","Транспорт","Здоровье","Развлечения","Одежда","Связь","Другое"];let b=null;function W(){return i.bags.filter(t=>d.has(t.id)).reduce((t,e)=>t+e.value,0)}function z(){H.innerHTML="";for(const t of pt){const e=document.createElement("button");e.className=b===t?"cat cat--on":"cat",e.textContent=t,e.addEventListener("click",()=>{b=b===t?null:t,z()}),H.append(e)}}function ht(){const t=W();t!==0&&(it.textContent=`Потратить ${g(t)}`,b=null,F.value="",z(),$.hidden=!1)}function mt(){if(S.innerHTML="",i.log.length===0){const t=document.createElement("p");t.className="log-empty",t.textContent="Пока пусто — трат не было.",S.append(t)}for(const t of i.log.slice(0,100)){const e=new Date(t.ts),a=document.createElement("div");a.className="log-item";const o=document.createElement("span");o.className="log-item__date",o.textContent=`${String(e.getDate()).padStart(2,"0")}.${String(e.getMonth()+1).padStart(2,"0")}`;const n=document.createElement("span");n.className="log-item__what",n.textContent=t.note?`${t.category} · ${t.note}`:t.category;const s=document.createElement("span");s.className="log-item__sum",s.textContent=g(t.amount),a.append(o,n,s),S.append(a)}K.hidden=!1}function gt(){$.hidden=!0;const t=W();if(t===0)return;const e=b??"Без категории",a=F.value.trim(),o=[...k.children];o.forEach((n,s)=>n.animate([{opacity:1,transform:"scale(1)"},{opacity:0,transform:"scale(0.4)"}],{duration:180,delay:s*30,easing:"ease-in",fill:"forwards"})),I.disabled=!0,setTimeout(()=>{w(),i.log.unshift({ts:Date.now(),amount:t,category:e,note:a||void 0}),i.bags=i.bags.filter(n=>!d.has(n.id)),d.clear(),y(i),u()},200+o.length*30)}function vt(){const t=i.bags.filter(c=>!d.has(c.id)),e=t.reduce((c,r)=>c+r.value,0);if(e===0)return;const{values:a}=J(e),o=t.map(c=>c.value).sort((c,r)=>r-c);if(o.length===a.length&&o.every((c,r)=>c===a[r]))return;w();const n=i.bags.filter(c=>d.has(c.id)),s=a.map(c=>N(c));for(const c of s)m.add(c.id);i.bags=[...n,...s],y(i),u()}l("income-btn").addEventListener("click",()=>{_.value="",O.hidden=!1,_.focus()});l("cancel-btn").addEventListener("click",()=>{O.hidden=!0});l("ok-btn").addEventListener("click",j);_.addEventListener("keydown",t=>{t.key==="Enter"&&j()});function j(){const t=Number(_.value.replace(/\D/g,""));t>0&&(ft(t),O.hidden=!0)}I.addEventListener("click",ht);X.addEventListener("click",ct);q.addEventListener("click",vt);l("spend-cancel").addEventListener("click",()=>{$.hidden=!0});l("spend-ok").addEventListener("click",gt);l("log-btn").addEventListener("click",mt);l("log-close").addEventListener("click",()=>{K.hidden=!0});u();"serviceWorker"in navigator&&navigator.serviceWorker.register("./sw.js");
