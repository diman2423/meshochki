import './style.css'
import { breakdown, splitValues, makeBag, type Bag } from './money'
import { loadState, saveState } from './state'

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
      <button class="btn" id="income-btn">+ Инкам</button>
    </header>
    <section class="floor" id="floor" aria-label="Комната с мешками"></section>
    <div class="wallet">
      <span>Кошелёк мелочи</span>
      <span id="wallet">0 ₽</span>
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
const overlayEl = $('overlay')
const amountInput = $<HTMLInputElement>('amount')

const fmt = (n: number) => `${n.toLocaleString('ru-RU')} ₽`
const short = (v: number) => `${v / 1000}к`

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
      }
      if (dragging) {
        el.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`
        chestEl.classList.toggle('chest--over', isOverChest(ev))
      }
    }

    const finish = (ev: PointerEvent, cancelled: boolean) => {
      el.removeEventListener('pointermove', onMove)
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
      const children = parts.map((v) => makeBag(v))
      state.bags.splice(idx, 1, ...children)
      for (const c of children) newIds.add(c.id)
      saveState(state)
      render()
    },
  )
}

function income(amount: number): void {
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

function spend(): void {
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
    state.bags = state.bags.filter((b) => !chest.has(b.id))
    chest.clear()
    saveState(state)
    render()
  }, 200 + chips.length * 30)
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

spendBtn.addEventListener('click', spend)

render()

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
}
