import './style.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? 'http://127.0.0.1:8882/api' : 'https://api.khanhmelodymussic.com/api')
const PRICE = 50000
const QR_URL = import.meta.env.VITE_PAYMENT_QR_IMAGE_URL
  || 'https://img.vietqr.io/image/vib-197019779-compact2.png?amount=50000&addInfo=KhanhMelody+Tai+nhac'

const state = {
  songs: [],
  downloads: [],
  playingId: null,
  playingUrl: '',
  busy: false,
  adminToken: sessionStorage.getItem('khanhmelody-admin-token') || '',
  adminTab: 'songs',
  adminSongs: [],
  claims: [],
  customers: [],
  wallets: [],
  revenue: null,
  toast: '',
}

const root = document.querySelector('#app')

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character])
}

async function request(path, options = {}, token = '') {
  const headers = new Headers(options.headers || {})
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const text = await response.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = { error: 'Phản hồi máy chủ không hợp lệ' } }
  if (!response.ok) throw new Error(data?.error || `Máy chủ trả về HTTP ${response.status}`)
  return data
}

function notify(message) {
  state.toast = message
  const toast = document.querySelector('#toast')
  if (toast) {
    toast.textContent = message
    toast.hidden = false
    window.setTimeout(() => { toast.hidden = true }, 4000)
  }
}

function money(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`
}

function renderPublic() {
  document.title = 'KhanhMelody — Nghe nhạc của bạn'
  root.innerHTML = `
    <div class="site-shell">
      <header class="topbar">
        <a class="brand" href="#/">Khanh<span>Melody</span></a>
        <nav class="top-actions">
          <a class="text-link" href="#catalog">Khám phá</a>
          <a class="admin-link" href="#/admin">Quản trị</a>
        </nav>
      </header>
      <main>
        <section class="hero">
          <div class="hero-copy">
            <p class="eyebrow">ÂM NHẠC CỦA BẠN</p>
            <h1>Nghe điều bạn thích.<br /><span>Lưu lại giai điệu.</span></h1>
            <p class="hero-description">Khám phá danh sách nhạc và nghe trực tuyến miễn phí. Không cần tạo tài khoản.</p>
            <a class="primary-button" href="#catalog">Khám phá bài hát <span aria-hidden="true">↓</span></a>
          </div>
          <div class="hero-art" aria-hidden="true">
            <div class="vinyl"><div class="vinyl-center">KM</div></div>
            <div class="equalizer"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
          </div>
        </section>
        <section id="catalog" class="catalog-section">
          <div class="section-heading">
            <div><p class="eyebrow">DANH SÁCH</p><h2>Bài hát mới nhất</h2></div>
            <button class="quiet-button" data-action="refresh">Làm mới</button>
          </div>
          <div id="song-list" class="song-grid">${renderSongCards()}</div>
        </section>
      </main>
      <footer class="footer"><span>KhanhMelody</span><span>Nghe nhạc công khai · Không cần đăng nhập</span></footer>
      ${state.playingUrl ? `<div class="player-bar"><div><strong>${escapeHtml(state.songs.find((song) => song.id === state.playingId)?.title || 'Đang phát')}</strong><span>${escapeHtml(state.songs.find((song) => song.id === state.playingId)?.artist || '')}</span></div><audio controls autoplay src="${escapeHtml(state.playingUrl)}"></audio></div>` : ''}
      ${renderPaymentModal()}
      <div id="toast" class="toast" role="status" hidden></div>
    </div>`
}

function renderSongCards() {
  if (!state.songs.length) {
    return `<div class="empty-state"><div class="empty-icon">♫</div><h3>Chưa có bài hát</h3><p>Bài hát sẽ xuất hiện tại đây sau khi Admin tải lên.</p><a href="#/admin">Đăng nhập quản trị</a></div>`
  }
  return state.songs.map((song, index) => {
    const paid = Number(song.price) > 0
    const downloaded = state.downloads.includes(song.id)
    return `<article class="song-card">
      <div class="cover cover-${index % 5}"><span>♫</span><small>${escapeHtml((song.genre || 'MUSIC').toUpperCase())}</small></div>
      <div class="song-info"><h3>${escapeHtml(song.title)}</h3><p>${escapeHtml(song.artist)}</p>
        <div class="song-meta"><span>${escapeHtml(song.album || 'KhanhMelody')}</span><span>${paid ? money(PRICE) : 'Miễn phí'}</span></div>
      </div>
      <div class="song-actions">
        <button class="icon-button" data-action="play" data-id="${song.id}" aria-label="Nghe ${escapeHtml(song.title)}">${state.playingId === song.id ? 'Ⅱ' : '▶'}</button>
        <button class="download-button" data-action="download" data-id="${song.id}">${downloaded ? 'Tải lại' : 'Tải bài hát'}</button>
      </div>
    </article>`
  }).join('')
}

function renderPaymentModal() {
  const song = state.paymentSong
  if (!song) return ''
  return `<div class="modal-backdrop" data-action="dismiss-payment">
    <form id="payment-form" class="payment-card">
      <button type="button" class="modal-close" data-action="close-payment" aria-label="Đóng">×</button>
      <p class="eyebrow">TẢI BÀI HÁT</p><h2>${escapeHtml(song.title)}</h2><p class="muted">${escapeHtml(song.artist)}</p>
      <div class="price-line"><span>Số tiền chuyển khoản</span><strong>${money(PRICE)}</strong></div>
      <img class="qr-image" src="${escapeHtml(QR_URL)}" alt="Mã QR chuyển khoản ${money(PRICE)}" />
      <p class="qr-hint">Quét mã bằng ứng dụng ngân hàng, kiểm tra đúng số tiền ${money(PRICE)}.</p>
      <label>Tên người chuyển khoản<input name="customer_name" maxlength="100" required autocomplete="name" /></label>
      <label>Số điện thoại<input name="phone" type="tel" inputmode="tel" maxlength="20" required autocomplete="tel" placeholder="Ví dụ: 0912345678" /></label>
      <label>Mã giao dịch ngân hàng<input name="transfer_reference" maxlength="120" required /></label>
      <p class="notice">Khi gửi thông tin, ứng dụng sẽ mở tải ngay. Thông tin này chưa được ngân hàng xác minh.</p>
      <button class="primary-button full-width" type="submit" ${state.busy ? 'disabled' : ''}>${state.busy ? 'Đang gửi…' : 'Tôi đã chuyển — gửi và tải'}</button>
    </form>
  </div>`
}

function renderAdmin() {
  document.title = 'KhanhMelody — Quản trị'
  if (!state.adminToken) {
    root.innerHTML = `<main class="admin-login-wrap"><a class="brand" href="#/">Khanh<span>Melody</span></a>
      <form id="login-form" class="login-card"><p class="eyebrow">KHU VỰC QUẢN TRỊ</p><h1>Đăng nhập Admin</h1>
        <label>Tên đăng nhập<input name="username" value="admin" required autocomplete="username" /></label>
        <label>Mật khẩu<input name="password" type="password" required autocomplete="current-password" /></label>
        <button class="primary-button full-width" type="submit" ${state.busy ? 'disabled' : ''}>${state.busy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
        <a class="back-link" href="#/">← Trở về trang nghe nhạc</a>
      </form><div id="toast" class="toast" role="status" hidden></div></main>`
    return
  }
  const tabNames = { songs: 'Bài hát', claims: 'Xác nhận tải', revenue: 'Doanh thu', wallets: 'Ví khách hàng' }
  root.innerHTML = `<div class="admin-shell">
    <header class="topbar"><a class="brand" href="#/">Khanh<span>Melody</span> <small>ADMIN</small></a>
      <div class="top-actions"><a class="text-link" href="#/">Trang công khai</a><button class="admin-link" data-action="logout">Đăng xuất</button></div>
    </header>
    <main class="admin-main"><div class="admin-title"><div><p class="eyebrow">TRUNG TÂM QUẢN TRỊ</p><h1>Quản lý KhanhMelody</h1></div><button class="quiet-button" data-action="admin-refresh">Làm mới</button></div>
      <div class="admin-tabs">${Object.entries(tabNames).map(([id, name]) => `<button class="${state.adminTab === id ? 'selected' : ''}" data-action="admin-tab" data-tab="${id}">${name}</button>`).join('')}</div>
      <section id="admin-content">${renderAdminContent()}</section>
    </main><div id="toast" class="toast" role="status" hidden></div></div>`
}

function renderAdminContent() {
  if (state.adminTab === 'songs') return renderAdminSongs()
  if (state.adminTab === 'claims') return renderAdminClaims()
  if (state.adminTab === 'revenue') return renderRevenue()
  if (state.adminTab === 'wallets') return renderWallets()
  return ''
}

function renderAdminSongs() {
  return `<div class="admin-panel">
    <h2>Tải bài hát lên</h2>
    <form id="upload-form" class="upload-grid">
      <label>Tên bài hát<input name="title" maxlength="255" required /></label>
      <label>Ca sĩ<input name="artist" maxlength="255" required /></label>
      <label>Album<input name="album" maxlength="255" /></label>
      <label>Thể loại<input name="genre" maxlength="50" /></label>
      <label>Giá tải<select name="price"><option value="50000">50.000đ</option><option value="0">Miễn phí</option></select></label>
      <label class="file-field">Tệp âm thanh<input name="file" type="file" accept=".mp3,.wav,.ogg,.m4a,.flac,audio/*" required /></label>
      <button class="primary-button" type="submit" ${state.busy ? 'disabled' : ''}>${state.busy ? 'Đang tải lên…' : 'Tải lên và đăng bài'}</button>
    </form>
  </div>
  <div class="admin-panel"><h2>Danh sách bài hát (${state.adminSongs.length})</h2>
    ${state.adminSongs.length ? `<div class="table-wrap"><table><thead><tr><th>Bài hát</th><th>Ca sĩ</th><th>Giá</th><th>Lượt nghe</th><th>Lượt tải</th><th></th></tr></thead><tbody>${state.adminSongs.map((song) => `<tr><td>${escapeHtml(song.title)}</td><td>${escapeHtml(song.artist)}</td><td>${Number(song.price) ? money(PRICE) : 'Miễn phí'}</td><td>${Number(song.play_count || 0).toLocaleString('vi-VN')}</td><td>${Number(song.download_count || 0).toLocaleString('vi-VN')}</td><td><button class="danger-button" data-action="delete-song" data-id="${song.id}">Xóa</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Chưa có bài hát. Tải bài đầu tiên bằng biểu mẫu phía trên.</p>'}
  </div>`
}

function renderAdminClaims() {
  return `<div class="admin-panel"><div class="panel-heading"><div><h2>Khách xác nhận đã chuyển</h2><p class="muted">Đây là thông tin khách tự khai, chưa được ngân hàng xác minh.</p></div><span class="badge">${state.claims.length} gần nhất</span></div>
    ${state.customers.length ? `<div class="table-wrap"><table><thead><tr><th>Số điện thoại</th><th>Số lần gửi</th><th>Trạng thái</th><th></th></tr></thead><tbody>${state.customers.map((customer) => `<tr><td>${escapeHtml(customer.phone)}</td><td>${customer.claims_count}</td><td>${customer.is_blocked ? 'Đã khóa' : 'Hoạt động'}</td><td><button class="danger-button" data-action="block-customer" data-phone="${escapeHtml(customer.phone)}" ${customer.is_blocked ? 'disabled' : ''}>${customer.is_blocked ? 'Đã khóa' : 'Khóa vĩnh viễn'}</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Chưa có xác nhận tải nào.</p>'}
  </div>
  <div class="admin-panel"><h2>Lịch sử xác nhận</h2>
    ${state.claims.length ? `<div class="table-wrap"><table><thead><tr><th>Thời gian</th><th>Khách</th><th>Điện thoại</th><th>Bài hát</th><th>Mã giao dịch</th><th>Số tiền</th><th>Thanh toán</th></tr></thead><tbody>${state.claims.map((claim) => `<tr><td>${new Date(claim.created_at).toLocaleString('vi-VN')}</td><td>${escapeHtml(claim.customer_name)}</td><td>${escapeHtml(claim.customer_phone)}</td><td>${escapeHtml(claim.song_title)}</td><td>${escapeHtml(claim.transfer_reference)}</td><td>${money(claim.amount)}</td><td>${claim.payment_verified ? 'Đã xác minh' : 'Chưa xác minh'}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Chưa có xác nhận tải nào.</p>'}
  </div>`
}

function renderRevenue() {
  if (!state.revenue) return '<div class="admin-panel"><p>Đang tải doanh thu…</p></div>'
  return `<div class="stats-grid"><article class="stat-card"><span>Doanh thu đã xác minh</span><strong>${money(state.revenue.total_revenue)}</strong></article><article class="stat-card"><span>Giao dịch đã ghi sổ</span><strong>${Number(state.revenue.total_transactions || 0).toLocaleString('vi-VN')}</strong></article></div>
    <div class="admin-panel"><h2>Giao dịch ghi nhận</h2><p class="muted">Thông tin xác nhận khách tự khai không được tính là doanh thu.</p>
      ${state.revenue.transactions?.length ? `<div class="table-wrap"><table><thead><tr><th>Ngày</th><th>Bài hát</th><th>Số tiền</th><th>Loại</th></tr></thead><tbody>${state.revenue.transactions.map((transaction) => `<tr><td>${new Date(transaction.created_at).toLocaleString('vi-VN')}</td><td>${escapeHtml(transaction.song_title || '—')}</td><td>${money(transaction.amount)}</td><td>${escapeHtml(transaction.transaction_type)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Chưa có giao dịch đã xác minh.</p>'}
    </div>`
}

function renderWallets() {
  return `<div class="admin-panel"><h2>Ví khách hàng</h2>
    ${state.wallets.length ? `<div class="table-wrap"><table><thead><tr><th>Tài khoản</th><th>Số dư</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>${state.wallets.map((wallet) => `<tr><td>${escapeHtml(wallet.username)}</td><td>${money(wallet.balance)}</td><td>${wallet.is_active ? 'Hoạt động' : 'Đã khóa'}</td><td class="wallet-actions"><button data-action="wallet-action" data-operation="topup" data-id="${wallet.id}">Nạp</button><button data-action="wallet-action" data-operation="deduct" data-id="${wallet.id}">Trừ</button><button data-action="wallet-action" data-operation="toggle-status" data-id="${wallet.id}">${wallet.is_active ? 'Khóa ví' : 'Mở ví'}</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Chưa có ví khách hàng.</p>'}
  </div>`
}

async function loadSongs() {
  const data = await request('/public/songs')
  state.songs = data
  renderPublic()
}

async function loadAdminTab() {
  if (!state.adminToken) return
  if (state.adminTab === 'songs') {
    state.adminSongs = await request('/admin/songs', {}, state.adminToken)
  } else if (state.adminTab === 'claims') {
    const data = await request('/admin/guest-downloads', {}, state.adminToken)
    state.claims = data.claims
    state.customers = data.customers
  } else if (state.adminTab === 'revenue') {
    state.revenue = await request('/admin/revenue', {}, state.adminToken)
  } else if (state.adminTab === 'wallets') {
    state.wallets = await request('/admin/wallets', {}, state.adminToken)
  }
  state.busy = false
  renderAdmin()
}

async function playSong(id) {
  try {
    const data = await request(`/public/songs/${id}/stream`)
    state.playingId = id
    state.playingUrl = data.stream_url
    renderPublic()
    document.querySelector('.player-bar audio')?.play().catch(() => {})
  } catch (error) { notify(error.message) }
}

function openDownload(id) {
  const song = state.songs.find((item) => item.id === id)
  if (!song) return
  if (Number(song.price || 0) <= 0) {
    downloadSong(song, {})
    return
  }
  state.paymentSong = song
  renderPublic()
}

async function downloadSong(song, formData) {
  const downloadWindow = window.open('about:blank', '_blank')
  state.busy = true
  try {
    const data = await request(`/public/songs/${song.id}/download`, {
      method: 'POST',
      body: JSON.stringify(Number(song.price || 0) > 0 ? {
        customer_name: formData.customer_name,
        phone: formData.phone,
        transfer_reference: formData.transfer_reference,
        amount: PRICE,
      } : {}),
    })
    if (downloadWindow) {
      downloadWindow.opener = null
      downloadWindow.location = data.stream_url
    } else {
      window.location.assign(data.stream_url)
    }
    state.downloads = [...new Set([...state.downloads, song.id])]
    state.paymentSong = null
    renderPublic()
    notify('Đã gửi xác nhận. Giao dịch chưa được ngân hàng xác minh.')
  } catch (error) {
    downloadWindow?.close()
    notify(error.message)
  } finally { state.busy = false }
}

async function login(form) {
  state.busy = true
  renderAdmin()
  try {
    const data = await request('/login', {
      method: 'POST',
      body: JSON.stringify({ username: form.username, password: form.password }),
    })
    if (data.user?.role !== 'admin') throw new Error('Tài khoản này không có quyền Admin.')
    state.adminToken = data.access_token
    sessionStorage.setItem('khanhmelody-admin-token', data.access_token)
    state.adminTab = 'songs'
    await loadAdminTab()
  } catch (error) {
    state.busy = false
    renderAdmin()
    notify(error.message)
  }
}

async function uploadSong(form) {
  const file = form.elements.namedItem('file').files[0]
  const values = new FormData(form)
  if (!file) return
  state.busy = true
  renderAdmin()
  try {
    const upload = new FormData()
    upload.append('file', file)
    const uploaded = await request('/upload/r2', { method: 'POST', body: upload }, state.adminToken)
    await request('/admin/songs', {
      method: 'POST',
      body: JSON.stringify({
        title: String(values.get('title')).trim(),
        artist: String(values.get('artist')).trim(),
        album: String(values.get('album') || '').trim(),
        genre: String(values.get('genre') || '').trim(),
        price: Number(values.get('price')),
        audio_url: uploaded.objectKey,
      }),
    }, state.adminToken)
    state.busy = false
    await loadAdminTab()
    notify('Đã tải lên và đăng bài hát.')
  } catch (error) {
    state.busy = false
    renderAdmin()
    notify(error.message)
  }
}

async function handleClick(event) {
  const button = event.target.closest('[data-action]')
  if (!button) return
  const action = button.dataset.action
  if (action === 'dismiss-payment' && event.target === button) {
    state.paymentSong = null
    renderPublic()
  } else if (action === 'close-payment') {
    state.paymentSong = null
    renderPublic()
  } else if (action === 'refresh') {
    try { await loadSongs() } catch (error) { notify(error.message) }
  } else if (action === 'play') {
    await playSong(Number(button.dataset.id))
  } else if (action === 'download') {
    openDownload(Number(button.dataset.id))
  } else if (action === 'logout') {
    sessionStorage.removeItem('khanhmelody-admin-token')
    state.adminToken = ''
    state.adminSongs = []
    renderAdmin()
  } else if (action === 'admin-tab') {
    state.adminTab = button.dataset.tab
    state.revenue = null
    state.busy = true
    renderAdmin()
    try {
      await loadAdminTab()
    } catch (error) {
      state.busy = false
      renderAdmin()
      notify(error.message)
    }
  } else if (action === 'admin-refresh') {
    try { await loadAdminTab() } catch (error) { notify(error.message) }
  } else if (action === 'block-customer') {
    if (!window.confirm(`Khóa vĩnh viễn số ${button.dataset.phone} khỏi tải nhạc?`)) return
    try {
      await request(`/admin/guest-customers/${encodeURIComponent(button.dataset.phone)}/block`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Admin đã khóa khách tải nhạc' }),
      }, state.adminToken)
      await loadAdminTab()
      notify('Đã khóa số điện thoại này.')
    } catch (error) { notify(error.message) }
  } else if (action === 'delete-song') {
    const song = state.adminSongs.find((item) => item.id === Number(button.dataset.id))
    if (!song || !window.confirm(`Xóa bài hát "${song.title}"?`)) return
    try {
      await request(`/admin/songs/${song.id}`, { method: 'DELETE' }, state.adminToken)
      await loadAdminTab()
      notify('Đã xóa bài hát.')
    } catch (error) { notify(error.message) }
  } else if (action === 'wallet-action') {
    const walletId = Number(button.dataset.id)
    const operation = button.dataset.operation
    try {
      if (operation === 'toggle-status') {
        await request(`/admin/wallets/${walletId}/toggle-status`, { method: 'PUT' }, state.adminToken)
      } else {
        const amount = window.prompt(operation === 'topup' ? 'Số tiền nạp vào ví:' : 'Số tiền trừ khỏi ví:')
        if (amount === null) return
        const parsedAmount = Number(amount)
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
          notify('Vui lòng nhập số tiền hợp lệ.')
          return
        }
        await request(`/admin/wallets/${walletId}/${operation}`, {
          method: 'POST',
          body: JSON.stringify({ amount: parsedAmount }),
        }, state.adminToken)
      }
      await loadAdminTab()
      notify('Đã cập nhật ví khách hàng.')
    } catch (error) { notify(error.message) }
  }
}

async function handleSubmit(event) {
  event.preventDefault()
  const form = event.target
  if (form.id === 'payment-form') {
    if (!form.reportValidity()) return
    const values = Object.fromEntries(new FormData(form).entries())
    await downloadSong(state.paymentSong, values)
  } else if (form.id === 'login-form') {
    if (!form.reportValidity()) return
    await login(Object.fromEntries(new FormData(form).entries()))
  } else if (form.id === 'upload-form') {
    if (!form.reportValidity()) return
    await uploadSong(form)
  }
}

function route() {
  if (location.hash.startsWith('#/admin')) {
    renderAdmin()
    if (state.adminToken) {
      loadAdminTab().catch((error) => {
        sessionStorage.removeItem('khanhmelody-admin-token')
        state.adminToken = ''
        renderAdmin()
        notify(error.message)
      })
    }
  } else {
    renderPublic()
  }
}

root.addEventListener('click', (event) => { handleClick(event) })
root.addEventListener('submit', (event) => { handleSubmit(event) })
window.addEventListener('hashchange', route)
route()
loadSongs().catch((error) => {
  const list = document.querySelector('#song-list')
  if (list) list.innerHTML = `<div class="error-state">Không thể kết nối máy chủ nhạc: ${escapeHtml(error.message)}</div>`
})
