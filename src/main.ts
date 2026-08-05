import './style.css'
import { breakdown, splitValues, makeBag, type Bag } from './money'
import { loadState, saveState, type AppState } from './state'

const state = loadState()
const chest = new Set<string>()
const newIds = new Set<string>()

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
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
`

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T
const balanceEl = $('balance')
const floorEl = $('floor')
const walletEl = $('wallet')
const chestEl = $('chest')
const chestSumEl = $('chest-sum')
const chestChipsEl = $('chest-chips')
const chestHintEl = $('chest-hint')
const spendBtn = $<HTMLButtonElement>('spend-btn')
const undoBtn = $<HTMLButtonElement>('undo-btn')
const tidyBtn = $<HTMLButtonElement>('tidy-btn')
const overlayEl = $('overlay')
const amountInput = $<HTMLInputElement>('amount')
const spendOverlayEl = $('spend-overlay')
const spendTitleEl = $('spend-title')
const catsEl = $('cats')
const noteInput = $<HTMLInputElement>('note')
const logOverlayEl = $('log-overlay')
const logListEl = $('log-list')

const fmt = (n: number) => `${n.toLocaleString('ru-RU')} ₽`
const short = (v: number) => `${v / 1000}к`

const HISTORY_KEY = 'meshochki-history-v1'
let history: AppState[] = []
try {
  const raw = localStorage.getItem(HISTORY_KEY)
  if (raw) history = JSON.parse(raw) as AppState[]
} catch {
  history = []
}

function snapshot(): void {
  history.push(JSON.parse(JSON.stringify(state)) as AppState)
  if (history.length > 30) history.shift()
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

function undo(): void {
  const prev = history.pop()
  if (!prev) return
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  state.bags = prev.bags
  state.wallet = prev.wallet
  state.log = prev.log
  chest.clear()
  saveState(state)
  render()
}

let shownTotal = 0
let balanceRaf = 0

// В скрытой вкладке rAF и WAAPI-анимации не тикают — состояние меняем сразу,
// анимация только украшает видимый экран.
function animateThen(
  el: HTMLElement,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
  done: () => void,
): void {
  if (document.hidden) {
    done()
    return
  }
  const anim = el.animate(keyframes, options)
  anim.onfinish = done
  anim.oncancel = done
}

function animateBalance(to: number): void {
  cancelAnimationFrame(balanceRaf)
  const from = shownTotal
  shownTotal = to
  if (from === to || document.hidden) {
    balanceEl.textContent = fmt(to)
    return
  }
  const start = performance.now()
  const dur = 500
  const tick = (now: number) => {
    const t = Math.min((now - start) / dur, 1)
    const eased = 1 - (1 - t) ** 3
    balanceEl.textContent = fmt(Math.round(from + (to - from) * eased))
    if (t < 1) balanceRaf = requestAnimationFrame(tick)
  }
  balanceRaf = requestAnimationFrame(tick)
}

function render(): void {
  const total = state.bags.reduce((sum, b) => sum + b.value, 0) + state.wallet
  animateBalance(total)
  walletEl.textContent = fmt(state.wallet)

  floorEl.innerHTML = ''
  const roomBags = state.bags.filter((b) => !chest.has(b.id))
  if (roomBags.length === 0) {
    floorEl.innerHTML = '<p class="floor__empty">Пусто. Жми «Инкам», когда придут деньги.</p>'
  }
  let newIdx = 0
  for (const bag of roomBags) {
    const el = createBagEl(bag)
    if (newIds.has(bag.id)) el.style.animationDelay = `${Math.min(newIdx++ * 40, 800)}ms`
    floorEl.append(el)
  }

  chestChipsEl.innerHTML = ''
  let chestSum = 0
  for (const bag of state.bags.filter((b) => chest.has(b.id))) {
    chestSum += bag.value
    const chip = document.createElement('button')
    chip.className = 'chip'
    chip.textContent = short(bag.value)
    chip.title = 'Вернуть в комнату'
    chip.addEventListener('click', () => {
      chest.delete(bag.id)
      render()
    })
    chestChipsEl.append(chip)
  }
  chestSumEl.textContent = fmt(chestSum)
  chestHintEl.hidden = chestSum > 0
  spendBtn.disabled = chestSum === 0
  undoBtn.disabled = history.length === 0
  tidyBtn.disabled = roomBags.length < 2
  newIds.clear()
}

function createBagEl(bag: Bag): HTMLElement {
  const el = document.createElement('div')
  el.className = `bag bag--${bag.value}`
  if (newIds.has(bag.id)) el.classList.add('bag--new')
  el.textContent = short(bag.value)
  makeDraggable(el, bag)
  return el
}

// «Тяжесть от остатка» (spec_weight_from_balance.md): мешок вязко отстаёт от
// пальца тем сильнее, чем большую долю оставшихся денег сейчас отдаёшь.
const WEIGHT = { base: 0.05, k: 1.5, fastFollow: 0.9, slowFollow: 0.12 }

function dragFollow(bagValue: number): number {
  const remaining = state.bags
    .filter((b) => !chest.has(b.id))
    .reduce((sum, b) => sum + b.value, 0)
  const fraction = remaining > 0 ? Math.min(1, bagValue / remaining) : 1
  const resistance = WEIGHT.base + (1 - WEIGHT.base) * Math.pow(fraction, WEIGHT.k)
  return WEIGHT.fastFollow + (WEIGHT.slowFollow - WEIGHT.fastFollow) * resistance
}

function isOverChest(e: PointerEvent): boolean {
  const r = chestEl.getBoundingClientRect()
  return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
}

function makeDraggable(el: HTMLElement, bag: Bag): void {
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.preventDefault()
    try {
      el.setPointerCapture(e.pointerId)
    } catch {
      // указатель мог исчезнуть между down и capture — драг всё равно отработает
    }
    const startX = e.clientX
    const startY = e.clientY
    const rect = el.getBoundingClientRect()
    let dragging = false
    let placeholder: HTMLElement | null = null
    let raf = 0
    let bx = 0
    let by = 0
    let tx = 0
    let ty = 0
    let follow = 1
    let last = 0

    const step = (now: number) => {
      const dt = now - last
      last = now
      const f = Math.min(1, (follow * dt) / 16.7)
      bx += (tx - bx) * f
      by += (ty - by) * f
      el.style.transform = `translate(${bx}px, ${by}px) scale(1.1)`
      raf = requestAnimationFrame(step)
    }

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      if (!dragging && Math.hypot(dx, dy) > 8) {
        dragging = true
        placeholder = document.createElement('div')
        placeholder.style.width = `${rect.width}px`
        placeholder.style.height = `${rect.height}px`
        placeholder.style.visibility = 'hidden'
        el.before(placeholder)
        el.classList.add('bag--drag')
        el.style.position = 'fixed'
        el.style.left = `${rect.left}px`
        el.style.top = `${rect.top}px`
        el.style.zIndex = '10'
        el.style.transform = 'translate(0, 0) scale(1.1)'
        follow = dragFollow(bag.value)
        last = performance.now()
        raf = requestAnimationFrame(step)
      }
      if (dragging) {
        tx = dx
        ty = dy
        chestEl.classList.toggle('chest--over', isOverChest(ev))
      }
    }

    const finish = (ev: PointerEvent, cancelled: boolean) => {
      el.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
      chestEl.classList.remove('chest--over')
      if (!dragging) {
        if (!cancelled) trySplit(bag, el)
        return
      }
      el.style.pointerEvents = 'none'
      if (!cancelled && isOverChest(ev)) {
        const c = chestEl.getBoundingClientRect()
        const targetX = c.left + c.width / 2 - rect.left - rect.width / 2
        const targetY = c.top + c.height / 2 - rect.top - rect.height / 2
        animateThen(
          el,
          [
            { transform: el.style.transform, opacity: 1 },
            { transform: `translate(${targetX}px, ${targetY}px) scale(0.25)`, opacity: 0.4 },
          ],
          { duration: 200, easing: 'ease-in', fill: 'forwards' },
          () => {
            chest.add(bag.id)
            render()
          },
        )
      } else {
        animateThen(
          el,
          [{ transform: el.style.transform }, { transform: 'translate(0, 0) scale(1)' }],
          { duration: 260, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'forwards' },
          () => render(),
        )
      }
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', (ev) => finish(ev, false), { once: true })
    el.addEventListener('pointercancel', (ev) => finish(ev, true), { once: true })
  })
}

function trySplit(bag: Bag, el: HTMLElement): void {
  const parts = splitValues(bag.value)
  if (!parts) {
    el.classList.remove('bag--shake')
    void el.offsetWidth
    el.classList.add('bag--shake')
    return
  }
  el.style.pointerEvents = 'none'
  animateThen(
    el,
    [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.4)', opacity: 0 },
    ],
    { duration: 160, easing: 'ease-out', fill: 'forwards' },
    () => {
      const idx = state.bags.findIndex((b) => b.id === bag.id)
      if (idx === -1) {
        render()
        return
      }
      snapshot()
      const children = parts.map((v) => makeBag(v))
      state.bags.splice(idx, 1, ...children)
      for (const c of children) newIds.add(c.id)
      saveState(state)
      render()
    },
  )
}

function income(amount: number): void {
  snapshot()
  const { values, change } = breakdown(amount)
  for (const v of values) {
    const bag = makeBag(v)
    state.bags.push(bag)
    newIds.add(bag.id)
  }
  state.bags.sort((a, b) => b.value - a.value)
  state.wallet += change
  saveState(state)
  render()
}

const CATEGORIES = ['Жильё', 'Еда', 'Транспорт', 'Здоровье', 'Развлечения', 'Одежда', 'Связь', 'Другое']
let selectedCat: string | null = null

function chestSumNow(): number {
  return state.bags.filter((b) => chest.has(b.id)).reduce((sum, b) => sum + b.value, 0)
}

function renderCats(): void {
  catsEl.innerHTML = ''
  for (const c of CATEGORIES) {
    const b = document.createElement('button')
    b.className = selectedCat === c ? 'cat cat--on' : 'cat'
    b.textContent = c
    b.addEventListener('click', () => {
      selectedCat = selectedCat === c ? null : c
      renderCats()
    })
    catsEl.append(b)
  }
}

function openSpendDialog(): void {
  const sum = chestSumNow()
  if (sum === 0) return
  spendTitleEl.textContent = `Потратить ${fmt(sum)}`
  selectedCat = null
  noteInput.value = ''
  renderCats()
  spendOverlayEl.hidden = false
}

function openLog(): void {
  logListEl.innerHTML = ''
  if (state.log.length === 0) {
    const p = document.createElement('p')
    p.className = 'log-empty'
    p.textContent = 'Пока пусто — трат не было.'
    logListEl.append(p)
  }
  for (const rec of state.log.slice(0, 100)) {
    const d = new Date(rec.ts)
    const item = document.createElement('div')
    item.className = 'log-item'
    const date = document.createElement('span')
    date.className = 'log-item__date'
    date.textContent = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
    const what = document.createElement('span')
    what.className = 'log-item__what'
    what.textContent = rec.note ? `${rec.category} · ${rec.note}` : rec.category
    const sum = document.createElement('span')
    sum.className = 'log-item__sum'
    sum.textContent = fmt(rec.amount)
    item.append(date, what, sum)
    logListEl.append(item)
  }
  logOverlayEl.hidden = false
}

function spend(): void {
  spendOverlayEl.hidden = true
  const amount = chestSumNow()
  if (amount === 0) return
  const category = selectedCat ?? 'Без категории'
  const note = noteInput.value.trim()
  const chips = [...chestChipsEl.children] as HTMLElement[]
  chips.forEach((chip, i) =>
    chip.animate(
      [
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0, transform: 'scale(0.4)' },
      ],
      { duration: 180, delay: i * 30, easing: 'ease-in', fill: 'forwards' },
    ),
  )
  spendBtn.disabled = true
  setTimeout(() => {
    snapshot()
    state.log.unshift({ ts: Date.now(), amount, category, note: note || undefined })
    state.bags = state.bags.filter((b) => !chest.has(b.id))
    chest.clear()
    saveState(state)
    render()
  }, 200 + chips.length * 30)
}

function consolidate(): void {
  const roomBags = state.bags.filter((b) => !chest.has(b.id))
  const total = roomBags.reduce((sum, b) => sum + b.value, 0)
  if (total === 0) return
  const { values } = breakdown(total)
  const current = roomBags.map((b) => b.value).sort((a, b) => b - a)
  if (current.length === values.length && current.every((v, i) => v === values[i])) return
  snapshot()
  const chestBags = state.bags.filter((b) => chest.has(b.id))
  const fresh = values.map((v) => makeBag(v))
  for (const b of fresh) newIds.add(b.id)
  state.bags = [...chestBags, ...fresh]
  saveState(state)
  render()
}

$('income-btn').addEventListener('click', () => {
  amountInput.value = ''
  overlayEl.hidden = false
  amountInput.focus()
})
$('cancel-btn').addEventListener('click', () => {
  overlayEl.hidden = true
})
$('ok-btn').addEventListener('click', submitIncome)
amountInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitIncome()
})

function submitIncome(): void {
  const amount = Number(amountInput.value.replace(/\D/g, ''))
  if (amount > 0) {
    income(amount)
    overlayEl.hidden = true
  }
}

spendBtn.addEventListener('click', openSpendDialog)
undoBtn.addEventListener('click', undo)
tidyBtn.addEventListener('click', consolidate)
$('spend-cancel').addEventListener('click', () => {
  spendOverlayEl.hidden = true
})
$('spend-ok').addEventListener('click', spend)
$('log-btn').addEventListener('click', openLog)
$('log-close').addEventListener('click', () => {
  logOverlayEl.hidden = true
})
const resetBagsCb = $<HTMLInputElement>('reset-bags')
const resetLogCb = $<HTMLInputElement>('reset-log')
const resetOkBtn = $<HTMLButtonElement>('reset-ok')

function updateResetOk(): void {
  resetOkBtn.disabled = !resetBagsCb.checked && !resetLogCb.checked
}
resetBagsCb.addEventListener('change', updateResetOk)
resetLogCb.addEventListener('change', updateResetOk)

$('reset-btn').addEventListener('click', () => {
  resetBagsCb.checked = true
  resetLogCb.checked = false
  updateResetOk()
  $('reset-overlay').hidden = false
})
$('reset-cancel').addEventListener('click', () => {
  $('reset-overlay').hidden = true
})
resetOkBtn.addEventListener('click', () => {
  $('reset-overlay').hidden = true
  if (!resetBagsCb.checked && !resetLogCb.checked) return
  snapshot()
  if (resetBagsCb.checked) {
    state.bags = []
    state.wallet = 0
    chest.clear()
  }
  if (resetLogCb.checked) state.log = []
  saveState(state)
  render()
})

render()

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
}
