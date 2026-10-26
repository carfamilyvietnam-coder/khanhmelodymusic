import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.khanhmelodymussic.com/api'
const USE_MOCK_DATA = true

const MOCK_SONGS = [
  { id: 1, title: 'Em Của Ngày Hôm Qua', artist: 'Sơn Tùng M-TP', album: 'm-tp', genre: 'Pop', price: 50000, play_count: 1500000, download_count: 50000, audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'Hoa Hải Đường', artist: 'Jack', album: 'Jack', genre: 'Pop', price: 45000, play_count: 2000000, download_count: 80000, audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'Bước Qua Mùa Cô Đơn', artist: 'Vũ.', album: 'Vũ.', genre: 'Ballad', price: 40000, play_count: 3000000, download_count: 120000, audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 4, title: 'Có Chăng Chỉ Là Giấc Mơ', artist: 'Reddy', album: 'Reddy', genre: 'Pop', price: 35000, play_count: 800000, download_count: 30000, audio_url: '' },
  { id: 5, title: 'Muốn Nói Với Em', artist: 'Hoàng Dũng', album: 'Hoàng Dũng', genre: 'Ballad', price: 40000, play_count: 1200000, download_count: 45000, audio_url: '' },
  { id: 6, title: 'Chạm Đáy Nỗi Đau', artist: 'Sơn Tùng M-TP', album: 'm-tp', genre: 'Pop', price: 50000, play_count: 5000000, download_count: 200000, audio_url: '' },
  { id: 7, title: 'Nếu Ngày Ấy', artist: 'Bùi Lan Hương', album: 'NHL', genre: 'Ballad', price: 30000, play_count: 600000, download_count: 25000, audio_url: '' },
  { id: 8, title: 'Đi Để Trở Về', artist: 'Soobin Hoàng Sơn', album: 'Soobin', genre: 'Pop', price: 45000, play_count: 900000, download_count: 35000, audio_url: '' },
  { id: 9, title: 'Bốn Chữ Lắm', artist: 'Đen Vâu', album: 'Đen', genre: 'Hip Hop', price: 40000, play_count: 2500000, download_count: 90000, audio_url: '' },
  { id: 10, title: 'Lối Nhỏ', artist: 'Đen Vâu', album: 'Đen', genre: 'Hip Hop', price: 40000, play_count: 1800000, download_count: 70000, audio_url: '' },
]

const QR_CODE_URL = 'https://img.vietqr.io/image/vib-197019779-compact2.png?amount=50000&addInfo=KhanhMelody+Nap+tien'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900 text-white">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<MemberPage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </Router>
  )
}

function MemberPage() {
  const [songs, setSongs] = useState([])
  const [mySongs, setMySongs] = useState([])
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('memberUser') || 'null'))
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedSong, setSelectedSong] = useState(null)
  const [walletBalance, setWalletBalance] = useState(0)
  const [activeTab, setActiveTab] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    fetchSongs()
    if (user) {
      fetchMySongs()
      setWalletBalance(user.wallet_balance || 0)
    }
  }, [user])

  const fetchSongs = async () => {
    try {
      if (USE_MOCK_DATA) {
        setSongs(MOCK_SONGS)
      } else {
        const res = await axios.get(`${API_BASE}/songs`)
        setSongs(res.data)
      }
    } catch (err) {
      console.error(err)
      setSongs(MOCK_SONGS)
    }
  }

  const fetchMySongs = async () => {
    try {
      if (USE_MOCK_DATA) {
        const purchasedIds = user.purchased_songs || []
        setMySongs(MOCK_SONGS.filter(s => purchasedIds.includes(s.id)))
      } else {
        const token = localStorage.getItem('memberToken')
        const res = await axios.get(`${API_BASE}/member/my-songs`, { headers: { Authorization: `Bearer ${token}` } })
        setMySongs(res.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handlePlay = (song) => {
    if (song.audio_url) {
      toast.success(`Đang phát: ${song.title}`)
    } else {
      toast.error('Bài hát chưa có file audio')
    }
  }

  const handleDownload = (song) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để tải nhạc')
      navigate('/register')
      return
    }

    const purchasedIds = user.purchased_songs || []
    if (purchasedIds.includes(song.id)) {
      toast.success('Bạn đã sở hữu bài hát này!')
      return
    }

    setSelectedSong(song)
    setShowPaymentModal(true)
  }

  const handlePayment = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập trước')
      setShowPaymentModal(false)
      navigate('/register')
      return
    }

    if (USE_MOCK_DATA) {
      const updatedUser = {
        ...user,
        purchased_songs: [...(user.purchased_songs || []), selectedSong.id],
        wallet_balance: (user.wallet_balance || 0) - 50000
      }
      localStorage.setItem('memberUser', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setWalletBalance(updatedUser.wallet_balance)
      setShowPaymentModal(false)
      toast.success('Thanh toán thành công! Bạn đã tải được bài hát')
      fetchMySongs()
    } else {
      try {
        const token = localStorage.getItem('memberToken')
        await axios.post(`${API_BASE}/member/download`, { song_id: selectedSong.id }, { headers: { Authorization: `Bearer ${token}` } })
        setShowPaymentModal(false)
        toast.success('Thanh toán thành công!')
        fetchMySongs()
      } catch (err) {
        toast.error('Thanh toán thất bại')
      }
    }
  }

  const displaySongs = activeTab === 'all' ? songs : mySongs

  return (
    <div className="min-h-screen">
      <nav className="bg-gray-900/80 backdrop-blur-md p-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-pink-500">KhanhMelody</h1>
            <p className="text-yellow-400 text-sm font-semibold">Nghe nhạc bản quyền đỉnh cao</p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-right">
                <p className="text-gray-300">Xin chào, {user.username}</p>
                <p className="text-green-400 font-semibold">Số dư: {walletBalance.toLocaleString()}đ</p>
              </div>
            )}
            <div className="flex gap-2">
              <Link to="/admin" className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700 font-semibold">
                Trang Quản Trị
              </Link>
              <Link to="/register" className="bg-pink-600 px-4 py-2 rounded hover:bg-pink-700 font-semibold">
                {user ? 'Đăng xuất' : 'Đăng thành viên'}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-lg font-semibold ${activeTab === 'all' ? 'bg-pink-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            Danh sách bài hát
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-6 py-3 rounded-lg font-semibold ${activeTab === 'my' ? 'bg-pink-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            Danh sách bài hát của tôi
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displaySongs.map((song) => (
            <div key={song.id} className="bg-gray-800/80 backdrop-blur-md rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-pink-400">{song.title}</h3>
                <p className="text-gray-300">{song.artist}</p>
                <p className="text-gray-400 text-sm">{song.genre}</p>
              </div>
              <div className="flex gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">🎧</span>
                  <span>{song.play_count?.toLocaleString() || 0} lượt nghe</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">⬇️</span>
                  <span>{song.download_count?.toLocaleString() || 0} lượt tải</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePlay(song)}
                  className="flex-1 bg-blue-600 py-2 rounded hover:bg-blue-700 font-semibold"
                >
                  Nghe thử
                </button>
                <button
                  onClick={() => handleDownload(song)}
                  className="flex-1 bg-green-600 py-2 rounded hover:bg-green-700 font-semibold"
                >
                  Tải về (50.000đ)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4 text-pink-500">Thanh toán</h3>
            <p className="text-gray-300 mb-4">
              Bài hát: <span className="text-pink-400 font-semibold">{selectedSong?.title}</span>
            </p>
            <p className="text-gray-300 mb-6">
              Số tiền: <span className="text-green-400 font-bold text-xl">50.000đ</span>
            </p>
            <div className="bg-white p-4 rounded-lg mb-6">
              <img src={QR_CODE_URL} alt="QR Code" className="w-full h-auto" />
              <p className="text-gray-800 text-center mt-2 text-sm font-semibold">
                QUÉT MÃ QR ĐỂ THANH TOÁN
              </p>
              <p className="text-gray-600 text-center text-xs mt-1">
                TRẦN XUÂN KHÁNH - VIB - 197019779
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handlePayment}
                className="flex-1 bg-green-600 py-3 rounded hover:bg-green-700 font-bold"
              >
                Đã thanh toán
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 bg-gray-600 py-3 rounded hover:bg-gray-700 font-bold"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (USE_MOCK_DATA) {
        if (username === 'admin' && password === 'admin123') {
          localStorage.setItem('adminToken', 'mock-admin-token')
          toast.success('Đăng nhập thành công!')
          window.location.href = '/admin/'
        } else {
          setError('Sai tên đăng nhập hoặc mật khẩu')
          toast.error('Sai tên đăng nhập hoặc mật khẩu')
        }
      } else {
        const res = await axios.post(`${API_BASE}/admin/login`, { username, password })
        localStorage.setItem('adminToken', res.data.access_token)
        toast.success('Đăng nhập thành công!')
        window.location.href = '/admin/'
      }
    } catch (err) {
      setError('Sai tên đăng nhập hoặc mật khẩu')
      toast.error('Đăng nhập thất bại')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-gray-800/80 backdrop-blur-md p-8 rounded-xl shadow-2xl w-96">
        <h2 className="text-3xl font-bold text-center mb-2 text-pink-500">Trang Quản Trị</h2>
        <p className="text-yellow-400 text-center mb-6 font-semibold">KhanhMelody Admin</p>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-pink-500 outline-none"
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-pink-500 outline-none"
            required
          />
          <button type="submit" className="w-full bg-pink-600 py-3 rounded hover:bg-pink-700 font-bold">
            Đăng nhập
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/" className="text-gray-400 hover:text-white">
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}

function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (USE_MOCK_DATA) {
        const user = {
          id: Date.now(),
          username,
          email,
          purchased_songs: [],
          wallet_balance: 0
        }
        localStorage.setItem('memberUser', JSON.stringify(user))
        localStorage.setItem('memberToken', 'mock-member-token')
        toast.success(isLogin ? 'Đăng nhập thành công!' : 'Đăng ký thành công!')
        navigate('/')
      } else {
        if (isLogin) {
          const res = await axios.post(`${API_BASE}/member/login`, { username, password })
          localStorage.setItem('memberToken', res.data.access_token)
          localStorage.setItem('memberUser', JSON.stringify(res.data.user))
          toast.success('Đăng nhập thành công!')
        } else {
          const res = await axios.post(`${API_BASE}/member/register`, { username, email, password })
          localStorage.setItem('memberToken', res.data.access_token)
          localStorage.setItem('memberUser', JSON.stringify(res.data.user))
          toast.success('Đăng ký thành công!')
        }
        navigate('/')
      }
    } catch (err) {
      toast.error('Thất bại. Vui lòng thử lại.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('memberUser')
    localStorage.removeItem('memberToken')
    toast.success('Đã đăng xuất')
    navigate('/')
  }

  const currentUser = JSON.parse(localStorage.getItem('memberUser') || 'null')

  if (currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-gray-800/80 backdrop-blur-md p-8 rounded-xl shadow-2xl w-96">
          <h2 className="text-2xl font-bold text-center mb-6 text-pink-500">Thông tin thành viên</h2>
          <div className="space-y-4 mb-6">
            <p className="text-gray-300">Tên: <span className="text-white font-semibold">{currentUser.username}</span></p>
            <p className="text-gray-300">Email: <span className="text-white font-semibold">{currentUser.email}</span></p>
            <p className="text-gray-300">Số dư: <span className="text-green-400 font-bold">{(currentUser.wallet_balance || 0).toLocaleString()}đ</span></p>
            <p className="text-gray-300">Bài hát đã mua: <span className="text-pink-400 font-semibold">{(currentUser.purchased_songs || []).length}</span></p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 py-3 rounded hover:bg-red-700 font-bold"
          >
            Đăng xuất
          </button>
          <div className="mt-4 text-center">
            <Link to="/" className="text-gray-400 hover:text-white">
              ← Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-gray-800/80 backdrop-blur-md p-8 rounded-xl shadow-2xl w-96">
        <h2 className="text-3xl font-bold text-center mb-2 text-pink-500">
          {isLogin ? 'Đăng nhập' : 'Đăng ký thành viên'}
        </h2>
        <p className="text-yellow-400 text-center mb-6 font-semibold">KhanhMelody</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-pink-500 outline-none"
            required
          />
          {!isLogin && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-pink-500 outline-none"
              required
            />
          )}
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-pink-500 outline-none"
            required
          />
          <button type="submit" className="w-full bg-pink-600 py-3 rounded hover:bg-pink-700 font-bold">
            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-400 hover:text-white"
          >
            {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
          </button>
        </div>
        <div className="mt-2 text-center">
          <Link to="/" className="text-gray-400 hover:text-white">
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}

export default App
