import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <main class="room">
    <header class="room__header">
      <div>
        <span class="room__label">Хранилище</span>
        <span class="room__balance">0 ₽</span>
      </div>
      <button class="btn btn--income">+ Инкам</button>
    </header>
    <section class="room__floor" aria-label="Комната с мешками"></section>
    <section class="chest" aria-label="Сундук трат">
      <span class="chest__label">Сундук трат</span>
      <span class="chest__sum">0 ₽</span>
      <button class="btn btn--spend" disabled>Потратить</button>
    </section>
  </main>
`
