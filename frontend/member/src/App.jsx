import { useEffect, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? '/api' : 'https://api.khanhmelodymussic.com/api')
const DOWNLOAD_PRICE = 50000
const PAYMENT_QR_IMAGE_URL = import.meta.env.VITE_PAYMENT_QR_IMAGE_URL
  || 'https://img.vietqr.io/image/vib-197019779-compact2.png?amount=50000&addInfo=KhanhMelody+Tai+nhac'

const api = axios.create({ baseURL: API_BASE })

function App() {
  const [songs, setSongs] = useState([])
  const [mySongs, setMySongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedSong, setSelectedSong] = useState(null)
  const [paymentForm, setPaymentForm] = useState({ customer_name: '', phone: '', transfer_reference: '' })
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [playingUrl, setPlayingUrl] = useState('')

  useEffect(() => {
    let active = true
    api.get('/public/songs')
      .then(({ data }) => {
        if (active) setSongs(data)
      })
      .catch(() => {
        if (active) toast.error('Không thể tải danh sách bài hát')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const handlePlay = async (song) => {
    try {
      const { data } = await api.get(`/public/songs/${song.id}/stream`)
      setPlayingUrl(data.stream_url)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Không thể phát bài hát')
    }
  }

  const handleDownload = (song) => {
    if (Number(song.price) <= 0) {
      completeDownload(song)
      return
    }
    setSelectedSong(song)
    setPaymentForm({ customer_name: '', phone: '', transfer_reference: '' })
    setShowPaymentModal(true)
  }

  const completeDownload = async (song, claim = {}) => {
    const downloadTab = window.open('about:blank', '_blank')
    setSubmitting(true)
    try {
      const payload = Number(song.price) > 0
        ? { ...claim, amount: DOWNLOAD_PRICE }
        : {}
      const { data } = await api.post(`/public/songs/${song.id}/download`, payload)
      if (downloadTab) {
        downloadTab.opener = null
        downloadTab.location = data.stream_url
      } else {
        window.location.assign(data.stream_url)
      }
      setMySongs((current) => current.some((item) => item.id === song.id)
        ? current
        : [...current, song])
      setShowPaymentModal(false)
      toast.success(Number(song.price) > 0
        ? 'Đã gửi thông tin xác nhận; giao dịch chưa được xác minh.'
        : 'Đang tải bài hát')
    } catch (error) {
      downloadTab?.close()
      toast.error(error.response?.data?.error || 'Không thể tải bài hát')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaymentSubmit = (event) => {
    event.preventDefault()
    if (selectedSong) completeDownload(selectedSong, paymentForm)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900 text-white">
      <Toaster position="top-right" />
      {loading ? (
        <main className="grid min-h-screen place-items-center">Đang tải danh sách bài hát...</main>
      ) : (
        <MemberPage
          user={{ username: 'Khách' }}
          songs={songs}
          mySongs={mySongs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          playingUrl={playingUrl}
          onPlay={handlePlay}
          onDownload={handleDownload}
        />
      )}
      {showPaymentModal && selectedSong && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/80 p-4">
          <form onSubmit={handlePaymentSubmit} className="my-4 w-full max-w-md rounded-xl bg-gray-800 p-6 shadow-2xl">
            <h2 className="mb-2 text-xl font-bold text-pink-400">Tải bài hát</h2>
            <p className="mb-4 text-gray-200">{selectedSong.title} — {selectedSong.artist}</p>
            <p className="mb-4 text-lg font-bold text-green-300">
              Chuyển khoản {DOWNLOAD_PRICE.toLocaleString('vi-VN')}đ
            </p>
            {PAYMENT_QR_IMAGE_URL ? (
              <img
                src={PAYMENT_QR_IMAGE_URL}
                alt="Mã QR chuyển khoản ngân hàng"
                className="mx-auto mb-4 aspect-square w-56 rounded-lg bg-white object-contain p-2"
              />
            ) : (
              <p className="mb-4 rounded-lg bg-yellow-900/50 p-3 text-sm text-yellow-100">
                Chưa cấu hình ảnh QR. Hãy đặt VITE_PAYMENT_QR_IMAGE_URL trong môi trường build của frontend.
              </p>
            )}
            <label className="mb-3 block text-sm">
              <span className="mb-1 block">Tên người chuyển khoản</span>
              <input
                required
                maxLength={100}
                autoComplete="name"
                className="w-full rounded-lg bg-gray-700 px-3 py-2"
                value={paymentForm.customer_name}
                onChange={(event) => setPaymentForm({ ...paymentForm, customer_name: event.target.value })}
              />
            </label>
            <label className="mb-3 block text-sm">
              <span className="mb-1 block">Số điện thoại</span>
              <input
                required
                type="tel"
                maxLength={20}
                autoComplete="tel"
                inputMode="tel"
                placeholder="Ví dụ: 0912345678"
                className="w-full rounded-lg bg-gray-700 px-3 py-2"
                value={paymentForm.phone}
                onChange={(event) => setPaymentForm({ ...paymentForm, phone: event.target.value })}
              />
              <span className="mt-1 block text-xs text-gray-400">
                Admin dùng số này để nhận diện và có thể khóa quyền tải của khách.
              </span>
            </label>
            <label className="mb-4 block text-sm">
              <span className="mb-1 block">Mã giao dịch chuyển khoản</span>
              <input
                required
                maxLength={120}
                className="w-full rounded-lg bg-gray-700 px-3 py-2"
                value={paymentForm.transfer_reference}
                onChange={(event) => setPaymentForm({ ...paymentForm, transfer_reference: event.target.value })}
              />
            </label>
            <p className="mb-5 text-xs text-yellow-200">
              Gửi thông tin sẽ mở tải ngay. Ứng dụng không kiểm tra tài khoản ngân hàng; việc nhập thông tin không xác nhận đã nhận tiền.
            </p>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-green-600 py-2 font-semibold hover:bg-green-700 disabled:opacity-60"
              >
                {submitting ? 'Đang gửi...' : 'Tôi đã chuyển — gửi và tải'}
              </button>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="rounded-lg bg-gray-600 px-4 py-2 font-semibold hover:bg-gray-500"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function MemberPage({ user, songs, mySongs, activeTab, setActiveTab, playingUrl, onPlay, onDownload }) {
  const displaySongs = activeTab === 'all' ? songs : mySongs

  return (
    <div className="min-h-screen pb-20">
      <nav className="bg-gray-800 p-4 shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-pink-500 sm:text-2xl">KhanhMelody</h1>
            <p className="text-xs font-semibold text-yellow-400 sm:text-sm">Nghe nhạc công khai — không cần đăng nhập</p>
          </div>
          <span className="rounded bg-gray-700 px-3 py-2 text-sm">{user.username}</span>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl p-4">
        {playingUrl && (
          <audio controls autoPlay src={playingUrl} className="mb-5 w-full" onError={() => toast.error('Không thể tải luồng âm thanh')} />
        )}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold ${activeTab === 'all' ? 'bg-pink-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            Tất cả bài hát
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold ${activeTab === 'my' ? 'bg-pink-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            Đã tải trong phiên này ({mySongs.length})
          </button>
        </div>
        {displaySongs.length === 0 ? (
          <p className="rounded-lg bg-gray-800 p-6 text-center text-gray-300">
            {activeTab === 'all' ? 'Chưa có bài hát nào.' : 'Bạn chưa tải bài hát nào trong phiên này.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full overflow-hidden rounded-lg bg-gray-800">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Bài hát</th>
                  <th className="hidden px-4 py-3 text-left text-sm font-semibold md:table-cell">Ca sĩ</th>
                  <th className="hidden px-4 py-3 text-left text-sm font-semibold lg:table-cell">Thể loại</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Giá tải</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {displaySongs.map((song) => {
                  const downloaded = mySongs.some((entry) => entry.id === song.id)
                  const price = Number(song.price || 0) > 0 ? DOWNLOAD_PRICE : 0
                  return (
                    <tr key={song.id} className="border-t border-gray-700 hover:bg-gray-750">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-pink-400">{song.title}</div>
                        <div className="text-xs text-gray-400 md:hidden">{song.artist}</div>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">{song.artist}</td>
                      <td className="hidden px-4 py-3 lg:table-cell">{song.genre}</td>
                      <td className="px-4 py-3 text-center font-semibold text-green-400">
                        {price ? `${price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => onPlay(song)} className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold hover:bg-blue-700">
                            Nghe
                          </button>
                          <button onClick={() => onDownload(song)} className="rounded bg-green-600 px-3 py-1 text-xs font-semibold hover:bg-green-700">
                            {downloaded ? 'Tải lại' : price ? 'Mua / tải' : 'Tải miễn phí'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
