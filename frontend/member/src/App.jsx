import { useEffect, useState } from 'react'
import { HashRouter as Router } from 'react-router-dom'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? '/api' : 'https://api.khanhmelodymussic.com/api')

function api(token) {
  return axios.create({
    baseURL: API_BASE,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('accessToken') || '')
  const [user, setUser] = useState(null)
  const [songs, setSongs] = useState([])
  const [mySongs, setMySongs] = useState([])
  const [loading, setLoading] = useState(Boolean(token))
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' })
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedSong, setSelectedSong] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [playingUrl, setPlayingUrl] = useState('')

  useEffect(() => {
    if (!token) {
      return
    }
    let active = true
    api(token).get('/me')
      .then(({ data }) => {
        if (active) setUser(data)
      })
      .catch(() => {
        if (!active) return
        localStorage.removeItem('accessToken')
        setToken('')
        setUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [token])

  useEffect(() => {
    if (!token || !user) return
    Promise.all([
      api(token).get('/songs'),
      api(token).get('/my-downloads'),
    ])
      .then(([songResponse, downloadsResponse]) => {
        setSongs(songResponse.data)
        setMySongs(downloadsResponse.data)
      })
      .catch(() => toast.error('Không thể tải dữ liệu từ máy chủ'))
  }, [token, user])

  const handleAuth = async (event) => {
    event.preventDefault()
    try {
      if (authMode === 'register') {
        await api().post('/register', authForm)
        toast.success('Đăng ký thành công. Hãy đăng nhập.')
        setAuthMode('login')
        return
      }
      const { data } = await api().post('/login', {
        username: authForm.username,
        password: authForm.password,
      })
      localStorage.setItem('accessToken', data.access_token)
      setUser(data.user)
      setToken(data.access_token)
      toast.success(`Xin chào ${data.user.username}`)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Không thể xác thực tài khoản')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    setToken('')
    setUser(null)
    setSongs([])
    setMySongs([])
    setPlayingUrl('')
  }

  const handlePlay = async (song) => {
    try {
      const { data } = await api(token).get(`/songs/${song.id}/stream`)
      setPlayingUrl(data.stream_url)
      toast.success(`Đang phát: ${song.title}`)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Không thể phát bài hát')
    }
  }

  const handleDownload = (song) => {
    if (mySongs.some((purchased) => purchased.id === song.id) || Number(song.price) <= 0) {
      completeDownload(song)
      return
    }
    setSelectedSong(song)
    setShowPaymentModal(true)
  }

  const completeDownload = async (song) => {
    const downloadTab = window.open('about:blank', '_blank')
    try {
      const { data } = await api(token).post(`/songs/${song.id}/download`)
      if (downloadTab) {
        downloadTab.opener = null
        downloadTab.location = data.stream_url
      } else {
        window.location.assign(data.stream_url)
      }
      const { data: downloads } = await api(token).get('/my-downloads')
      setMySongs(downloads)
      setShowPaymentModal(false)
      toast.success('Đã xác nhận quyền tải bài hát')
    } catch (error) {
      downloadTab?.close()
      toast.error(error.response?.data?.error || 'Không thể hoàn tất tải bài hát')
    }
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900 text-white">
        <Toaster position="top-right" />
        {loading ? (
          <main className="min-h-screen grid place-items-center">Đang kiểm tra phiên đăng nhập...</main>
        ) : !user ? (
          <main className="min-h-screen grid place-items-center p-4">
            <form onSubmit={handleAuth} className="w-full max-w-md rounded-2xl bg-gray-800 p-8 shadow-xl">
              <h1 className="mb-2 text-3xl font-bold text-pink-400">KhanhMelody</h1>
              <h2 className="mb-6 text-xl">{authMode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản thành viên'}</h2>
              <label className="mb-4 block">
                <span className="mb-1 block">Tên đăng nhập</span>
                <input
                  required
                  autoComplete="username"
                  className="w-full rounded-lg bg-gray-700 px-3 py-2"
                  value={authForm.username}
                  onChange={(event) => setAuthForm({ ...authForm, username: event.target.value })}
                />
              </label>
              {authMode === 'register' && (
                <label className="mb-4 block">
                  <span className="mb-1 block">Email</span>
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    className="w-full rounded-lg bg-gray-700 px-3 py-2"
                    value={authForm.email}
                    onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                  />
                </label>
              )}
              <label className="mb-6 block">
                <span className="mb-1 block">Mật khẩu</span>
                <input
                  required
                  minLength={8}
                  type="password"
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full rounded-lg bg-gray-700 px-3 py-2"
                  value={authForm.password}
                  onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                />
              </label>
              <button type="submit" className="w-full rounded-lg bg-pink-600 py-3 font-bold hover:bg-pink-700">
                {authMode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </button>
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="mt-4 w-full text-sm text-pink-300 hover:text-pink-200"
              >
                {authMode === 'login' ? 'Chưa có tài khoản? Đăng ký thành viên' : 'Đã có tài khoản? Đăng nhập'}
              </button>
            </form>
          </main>
        ) : (
          <MemberPage
            user={user}
            songs={songs}
            mySongs={mySongs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            playingUrl={playingUrl}
            onPlay={handlePlay}
            onDownload={handleDownload}
            onLogout={handleLogout}
          />
        )}
        {showPaymentModal && selectedSong && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
            <div className="w-full max-w-sm rounded-xl bg-gray-800 p-6 shadow-2xl">
              <h2 className="mb-3 text-xl font-bold text-pink-400">Mua bài hát</h2>
              <p className="mb-2">{selectedSong.title}</p>
              <p className="mb-5 text-green-300">
                {Number(selectedSong.price).toLocaleString('vi-VN')}đ sẽ được trừ từ ví của bạn.
              </p>
              <p className="mb-5 text-sm text-gray-300">
                Giao dịch được máy chủ kiểm tra. Không xác nhận thanh toán chỉ bằng thao tác trên trình duyệt.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => completeDownload(selectedSong)}
                  className="flex-1 rounded-lg bg-green-600 py-2 font-semibold hover:bg-green-700"
                >
                  Xác nhận mua
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 rounded-lg bg-gray-600 py-2 font-semibold hover:bg-gray-500"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  )
}

function MemberPage({ user, songs, mySongs, activeTab, setActiveTab, playingUrl, onPlay, onDownload, onLogout }) {
  const displaySongs = activeTab === 'all' ? songs : mySongs

  return (
    <div className="min-h-screen pb-20">
      <nav className="bg-gray-800 p-4 shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-pink-500 sm:text-2xl">KhanhMelody</h1>
            <p className="text-xs font-semibold text-yellow-400 sm:text-sm">Xin chào, {user.username}</p>
          </div>
          <button onClick={onLogout} className="rounded bg-gray-700 px-3 py-2 text-sm hover:bg-gray-600">
            Đăng xuất
          </button>
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
            Đã mua ({mySongs.length})
          </button>
        </div>
        {displaySongs.length === 0 ? (
          <p className="rounded-lg bg-gray-800 p-6 text-center text-gray-300">
            {activeTab === 'all' ? 'Chưa có bài hát nào.' : 'Bạn chưa mua bài hát nào.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full overflow-hidden rounded-lg bg-gray-800">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Bài hát</th>
                  <th className="hidden px-4 py-3 text-left text-sm font-semibold md:table-cell">Ca sĩ</th>
                  <th className="hidden px-4 py-3 text-left text-sm font-semibold lg:table-cell">Thể loại</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Giá</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {displaySongs.map((song) => {
                  const purchased = mySongs.some((entry) => entry.id === song.id)
                  return (
                    <tr key={song.id} className="border-t border-gray-700 hover:bg-gray-750">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-pink-400">{song.title}</div>
                        <div className="text-xs text-gray-400 md:hidden">{song.artist}</div>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">{song.artist}</td>
                      <td className="hidden px-4 py-3 lg:table-cell">{song.genre}</td>
                      <td className="px-4 py-3 text-center font-semibold text-green-400">
                        {Number(song.price || 0).toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => onPlay(song)} className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold hover:bg-blue-700">
                            Nghe
                          </button>
                          <button onClick={() => onDownload(song)} className="rounded bg-green-600 px-3 py-1 text-xs font-semibold hover:bg-green-700">
                            {purchased ? 'Tải lại' : Number(song.price) <= 0 ? 'Tải miễn phí' : 'Mua / tải'}
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
