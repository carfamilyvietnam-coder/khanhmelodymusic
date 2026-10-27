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
        </Routes>
      </div>
    </Router>
  )
}

function MemberPage() {
  const [songs, setSongs] = useState([])
  const [mySongs, setMySongs] = useState([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedSong, setSelectedSong] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [purchasedIds, setPurchasedIds] = useState(JSON.parse(localStorage.getItem('purchasedSongs') || '[]'))

  useEffect(() => {
    fetchSongs()
    setMySongs(MOCK_SONGS.filter(s => purchasedIds.includes(s.id)))
  }, [purchasedIds])

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


  const handlePlay = (song) => {
    if (song.audio_url) {
      toast.success(`Đang phát: ${song.title}`)
    } else {
      toast.error('Bài hát chưa có file audio')
    }
  }

  const handleDownload = (song) => {
    if (purchasedIds.includes(song.id)) {
      toast.success('Bạn đã sở hữu bài hát này!')
      return
    }

    setSelectedSong(song)
    setShowPaymentModal(true)
  }

  const handlePayment = async () => {
    const newPurchasedIds = [...purchasedIds, selectedSong.id]
    localStorage.setItem('purchasedSongs', JSON.stringify(newPurchasedIds))
    setPurchasedIds(newPurchasedIds)
    setShowPaymentModal(false)
    toast.success('Thanh toán thành công! Bạn đã tải được bài hát')
  }

  const displaySongs = activeTab === 'all' ? songs : mySongs

  return (
    <div className="min-h-screen pb-20">
      <nav className="bg-gray-900/95 backdrop-blur-md p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-pink-500">KhanhMelody</h1>
            <p className="text-yellow-400 text-sm font-semibold">Nghe nhạc bản quyền đỉnh cao</p>
          </div>
          <a href="/admin" target="_blank" rel="noopener noreferrer" className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold text-sm">
            Trang Quản Trị
          </a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-4">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold ${activeTab === 'all' ? 'bg-pink-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            Danh sách bài hát
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold ${activeTab === 'my' ? 'bg-pink-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            Bài hát của tôi ({mySongs.length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displaySongs.map((song) => (
            <div key={song.id} className="bg-gray-800/90 backdrop-blur-md rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-pink-400">{song.title}</h3>
                <p className="text-gray-300">{song.artist}</p>
                <p className="text-gray-400 text-sm">{song.genre}</p>
              </div>
              <div className="flex gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">🎧</span>
                  <span>{(song.play_count || 0).toLocaleString()} lượt nghe</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">⬇️</span>
                  <span>{(song.download_count || 0).toLocaleString()} lượt tải</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePlay(song)}
                  className="flex-1 bg-blue-600 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Nghe thử
                </button>
                <button
                  onClick={() => handleDownload(song)}
                  className={`flex-1 py-2 rounded-lg font-semibold ${purchasedIds.includes(song.id) ? 'bg-green-800' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {purchasedIds.includes(song.id) ? 'Đã mua' : 'Tải về (50.000đ)'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full">
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
                className="flex-1 bg-green-600 py-3 rounded-lg hover:bg-green-700 font-bold"
              >
                Đã thanh toán
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 bg-gray-600 py-3 rounded-lg hover:bg-gray-700 font-bold"
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


export default App
