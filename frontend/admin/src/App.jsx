import React, { useState, useEffect, useRef } from 'react'
import { HashRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import toast, { Toaster } from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.khanhmelodymussic.com/api'
const USE_MOCK_DATA = true // Set to true for testing, false when backend is available

// Mock data for testing
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
  { id: 11, title: 'Anh Ơi Ở Lại', artist: 'Chi Pu', album: 'Chi Pu', genre: 'Pop', price: 35000, play_count: 700000, download_count: 28000, audio_url: '' },
  { id: 12, title: 'Cô Gái M52', artist: 'Hòa Minzy', album: 'Hòa Minzy', genre: 'Pop', price: 30000, play_count: 550000, download_count: 22000, audio_url: '' },
]

const MOCK_USERS = [
  { id: 1, username: 'user1', email: 'user1@example.com', role: 'user', is_active: true, wallet_balance: 500000 },
  { id: 2, username: 'user2', email: 'user2@example.com', role: 'user', is_active: true, wallet_balance: 250000 },
  { id: 3, username: 'user3', email: 'user3@example.com', role: 'user', is_active: false, wallet_balance: 100000 },
  { id: 4, username: 'user4', email: 'user4@example.com', role: 'user', is_active: true, wallet_balance: 750000 },
  { id: 5, username: 'user5', email: 'user5@example.com', role: 'user', is_active: true, wallet_balance: 150000 },
  { id: 6, username: 'user6', email: 'user6@example.com', role: 'user', is_active: false, wallet_balance: 50000 },
  { id: 7, username: 'user7', email: 'user7@example.com', role: 'user', is_active: true, wallet_balance: 300000 },
  { id: 8, username: 'user8', email: 'user8@example.com', role: 'user', is_active: true, wallet_balance: 450000 },
  { id: 9, username: 'user9', email: 'user9@example.com', role: 'user', is_active: true, wallet_balance: 200000 },
  { id: 10, username: 'user10', email: 'user10@example.com', role: 'user', is_active: true, wallet_balance: 600000 },
  { id: 11, username: 'user11', email: 'user11@example.com', role: 'user', is_active: false, wallet_balance: 80000 },
  { id: 12, username: 'user12', email: 'user12@example.com', role: 'user', is_active: true, wallet_balance: 350000 },
]

const MOCK_REVENUE = {
  total_revenue: 150000000,
  total_transactions: 1250,
  transactions: [
    { id: 1, amount: 50000, created_at: '2024-01-15T10:30:00' },
    { id: 2, amount: 45000, created_at: '2024-01-15T11:45:00' },
    { id: 3, amount: 40000, created_at: '2024-01-15T14:20:00' },
    { id: 4, amount: 50000, created_at: '2024-01-16T09:15:00' },
    { id: 5, amount: 35000, created_at: '2024-01-16T16:30:00' },
  ]
}

const MOCK_WALLETS = MOCK_USERS.map(u => ({
  id: u.id,
  username: u.username,
  balance: u.wallet_balance,
  is_active: u.is_active
}))

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'))

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser({})
  }

  if (!token) {
    return <Login onLogin={(t, u) => { setToken(t); setUser(u) }} />
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Toaster position="top-right" />
        <nav className="bg-gray-800 p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-pink-500">KhanhMelody Admin</h1>
              <p className="text-yellow-400 text-sm font-semibold">Nghe nhạc bản quyền đỉnh cao</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-300">Welcome, {user.username}</span>
              <a href="/" target="_blank" rel="noopener noreferrer" className="bg-pink-600 px-4 py-2 rounded hover:bg-pink-700">
                Trang Thành Viên
              </a>
              <button onClick={logout} className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">
                Logout
              </button>
            </div>
          </div>
        </nav>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/songs" element={<SongManagement />} />
              <Route path="/music-player" element={<MusicPlayer />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/revenue" element={<RevenueManagement />} />
              <Route path="/wallets" element={<WalletManagement />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (USE_MOCK_DATA) {
        // Mock login for testing without backend
        if (username === 'admin' && password === 'admin123') {
          const mockToken = 'mock-jwt-token-' + Date.now()
          const mockUser = { username: 'admin', email: 'admin@khanhmelody.com', role: 'admin' }
          localStorage.setItem('token', mockToken)
          localStorage.setItem('user', JSON.stringify(mockUser))
          onLogin(mockToken, mockUser)
          toast.success('Login successful! (Mock Mode)')
        } else {
          setError('Invalid credentials')
          toast.error('Use admin / admin123 for mock login')
        }
      } else {
        // Real API call
        const res = await axios.post(`${API_BASE}/login`, { username, password })
        localStorage.setItem('token', res.data.access_token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        onLogin(res.data.access_token, res.data.user)
        toast.success('Login successful!')
      }
    } catch (err) {
      setError('Invalid credentials')
      toast.error('Login failed. Please check your credentials.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96">
        <h2 className="text-3xl font-bold text-center mb-2 text-pink-500">Admin Login</h2>
        <p className="text-yellow-400 text-center mb-6 font-semibold">Nghe nhạc bản quyền đỉnh cao</p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-pink-500 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-pink-500 outline-none"
          />
          <button type="submit" className="w-full bg-pink-600 py-3 rounded hover:bg-pink-700 font-bold">
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

function Sidebar() {
  return (
    <div className="w-64 bg-gray-800 min-h-screen p-4">
      <ul className="space-y-2">
        <li><Link to="/" className="block p-3 rounded hover:bg-gray-700 text-gray-300 hover:text-white">Dashboard</Link></li>
        <li><Link to="/songs" className="block p-3 rounded hover:bg-gray-700 text-gray-300 hover:text-white">Songs</Link></li>
        <li><Link to="/music-player" className="block p-3 rounded hover:bg-gray-700 text-gray-300 hover:text-white">Nghe Nhạc</Link></li>
        <li><Link to="/users" className="block p-3 rounded hover:bg-gray-700 text-gray-300 hover:text-white">Users</Link></li>
        <li><Link to="/revenue" className="block p-3 rounded hover:bg-gray-700 text-gray-300 hover:text-white">Revenue</Link></li>
        <li><Link to="/wallets" className="block p-3 rounded hover:bg-gray-700 text-gray-300 hover:text-white">Wallets</Link></li>
      </ul>
    </div>
  )
}

function Dashboard() {
  const [stats, setStats] = useState({ songs: 0, users: 0, revenue: 0 })
  const [revenueData, setRevenueData] = useState([])
  const [songData, setSongData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      if (USE_MOCK_DATA) {
        // Use mock data
        setStats({
          songs: MOCK_SONGS.length,
          users: MOCK_USERS.length,
          revenue: MOCK_REVENUE.total_revenue
        })

        setRevenueData([
          { name: 'Jan', revenue: 4000000 },
          { name: 'Feb', revenue: 3000000 },
          { name: 'Mar', revenue: 5000000 },
          { name: 'Apr', revenue: 7000000 },
          { name: 'May', revenue: 6000000 },
          { name: 'Jun', revenue: 8000000 },
        ])

        setSongData(MOCK_SONGS.slice(0, 5).map(song => ({
          name: song.title,
          plays: song.play_count,
          downloads: song.download_count
        })))
      } else {
        // Real API call
        const token = localStorage.getItem('token')
        const [songsRes, usersRes, revenueRes] = await Promise.all([
          axios.get(`${API_BASE}/admin/songs`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/admin/revenue`, { headers: { Authorization: `Bearer ${token}` } })
        ])
        setStats({
          songs: songsRes.data.length,
          users: usersRes.data.length,
          revenue: revenueRes.data.total_revenue
        })

        setRevenueData([
          { name: 'Jan', revenue: 4000000 },
          { name: 'Feb', revenue: 3000000 },
          { name: 'Mar', revenue: 5000000 },
          { name: 'Apr', revenue: 7000000 },
          { name: 'May', revenue: 6000000 },
          { name: 'Jun', revenue: 8000000 },
        ])

        setSongData(songsRes.data.slice(0, 5).map(song => ({
          name: song.title,
          plays: song.play_count,
          downloads: song.download_count
        })))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl text-gray-400">Total Songs</h3>
          <p className="text-4xl font-bold text-pink-500">{stats.songs}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl text-gray-400">Total Users</h3>
          <p className="text-4xl font-bold text-blue-500">{stats.users}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl text-gray-400">Total Revenue</h3>
          <p className="text-4xl font-bold text-green-500">{stats.revenue.toLocaleString()}đ</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl text-gray-400 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#EC4899" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl text-gray-400 mb-4">Top Songs Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={songData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
              <Legend />
              <Bar dataKey="plays" fill="#8B5CF6" name="Plays" />
              <Bar dataKey="downloads" fill="#10B981" name="Downloads" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function SongManagement() {
  const [songs, setSongs] = useState([])
  const [filteredSongs, setFilteredSongs] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingSong, setEditingSong] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGenre, setFilterGenre] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchSongs()
  }, [])

  useEffect(() => {
    filterSongs()
  }, [songs, searchTerm, filterGenre])

  const filterSongs = () => {
    let filtered = songs

    if (searchTerm) {
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterGenre) {
      filtered = filtered.filter(song =>
        song.genre && song.genre.toLowerCase() === filterGenre.toLowerCase()
      )
    }

    setFilteredSongs(filtered)
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(filteredSongs.length / itemsPerPage)
  const paginatedSongs = filteredSongs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const fetchSongs = async () => {
    setLoading(true)
    try {
      if (USE_MOCK_DATA) {
        setSongs(MOCK_SONGS)
      } else {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${API_BASE}/admin/songs`, { headers: { Authorization: `Bearer ${token}` } })
        setSongs(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        if (USE_MOCK_DATA) {
          setSongs(prev => prev.filter(s => s.id !== id))
          toast.success('Song deleted successfully (Mock Mode)')
        } else {
          const token = localStorage.getItem('token')
          await axios.delete(`${API_BASE}/admin/songs/${id}`, { headers: { Authorization: `Bearer ${token}` } })
          fetchSongs()
          toast.success('Song deleted successfully')
        }
      } catch (err) {
        console.error(err)
        toast.error('Failed to delete song')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Song Management</h2>
        <button onClick={() => setShowModal(true)} className="bg-pink-600 px-4 py-2 rounded hover:bg-pink-700">
          Upload Song
        </button>
      </div>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title or artist..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-pink-500 outline-none"
        />
        <select
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
          className="p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-pink-500 outline-none"
        >
          <option value="">All Genres</option>
          <option value="Pop">Pop</option>
          <option value="Rock">Rock</option>
          <option value="Hip Hop">Hip Hop</option>
          <option value="Electronic">Electronic</option>
          <option value="Ballad">Ballad</option>
        </select>
      </div>
      <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gray-700">
          <tr>
            <th className="p-3 text-left">Title</th>
            <th className="p-3 text-left">Artist</th>
            <th className="p-3 text-left">Price</th>
            <th className="p-3 text-left">Plays</th>
            <th className="p-3 text-left">Downloads</th>
            <th className="p-3 text-left">Audio URL</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedSongs.map((song) => (
            <tr key={song.id} className="border-b border-gray-700">
              <td className="p-3">{song.title}</td>
              <td className="p-3">{song.artist}</td>
              <td className="p-3">{song.price.toLocaleString()}đ</td>
              <td className="p-3">{song.play_count}</td>
              <td className="p-3">{song.download_count}</td>
              <td className="p-3">
                {song.audio_url ? (
                  <a href={song.audio_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs truncate block max-w-[150px]">
                    {song.audio_url}
                  </a>
                ) : (
                  <span className="text-gray-500 text-xs">No URL</span>
                )}
              </td>
              <td className="p-3">
                <button onClick={() => { setEditingSong(song); setShowModal(true) }} className="bg-blue-600 px-3 py-1 rounded mr-2 hover:bg-blue-700">Edit</button>
                <button onClick={() => handleDelete(song.id)} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
      {showModal && <SongModal song={editingSong} onClose={() => { setShowModal(false); setEditingSong(null) }} onSave={fetchSongs} />}
    </div>
  )
}

function SongModal({ song, onClose, onSave }) {
  const [formData, setFormData] = useState(song || { title: '', artist: '', album: '', genre: '', price: 50000, audio_url: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (USE_MOCK_DATA) {
        // Mock mode - add to MOCK_SONGS
        if (song) {
          const index = MOCK_SONGS.findIndex(s => s.id === song.id)
          if (index !== -1) {
            MOCK_SONGS[index] = { ...MOCK_SONGS[index], ...formData }
          }
          toast.success('Song updated successfully (Mock Mode)')
        } else {
          const newSong = {
            id: Date.now(),
            ...formData,
            play_count: 0,
            download_count: 0,
            audio_url: formData.audio_url || ''
          }
          MOCK_SONGS.push(newSong)
          toast.success('Song uploaded successfully (Mock Mode)')
        }
        onSave()
        onClose()
      } else {
        const token = localStorage.getItem('token')
        if (song) {
          await axios.put(`${API_BASE}/admin/songs/${song.id}`, formData, { headers: { Authorization: `Bearer ${token}` } })
          toast.success('Song updated successfully')
        } else {
          const form = new FormData()
          Object.keys(formData).forEach(key => form.append(key, formData[key]))
          await axios.post(`${API_BASE}/admin/songs`, form, { headers: { Authorization: `Bearer ${token}` } })
          toast.success('Song uploaded successfully')
        }
        onSave()
        onClose()
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to save song')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-96">
        <h3 className="text-2xl font-bold mb-4">{song ? 'Edit Song' : 'Upload Song'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-3 rounded bg-gray-700 text-white"
            required
          />
          <input
            type="text"
            placeholder="Artist"
            value={formData.artist}
            onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
            className="w-full p-3 rounded bg-gray-700 text-white"
            required
          />
          <input
            type="text"
            placeholder="Album"
            value={formData.album}
            onChange={(e) => setFormData({ ...formData, album: e.target.value })}
            className="w-full p-3 rounded bg-gray-700 text-white"
          />
          <input
            type="text"
            placeholder="Genre"
            value={formData.genre}
            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            className="w-full p-3 rounded bg-gray-700 text-white"
          />
          <input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            className="w-full p-3 rounded bg-gray-700 text-white"
            required
          />
          <input
            type="url"
            placeholder="Audio URL (Link nghe nhạc)"
            value={formData.audio_url}
            onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
            className="w-full p-3 rounded bg-gray-700 text-white"
          />
          {!song && (
            <input
              type="file"
              onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
              className="w-full p-3 rounded bg-gray-700 text-white"
              required
            />
          )}
          <div className="flex gap-4">
            <button type="submit" className="flex-1 bg-pink-600 py-2 rounded hover:bg-pink-700">Save</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-600 py-2 rounded hover:bg-gray-700">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function UserManagement() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, filterRole, filterStatus])

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterRole) {
      filtered = filtered.filter(user =>
        user.role && user.role.toLowerCase() === filterRole.toLowerCase()
      )
    }

    if (filterStatus) {
      filtered = filtered.filter(user =>
        filterStatus === 'active' ? user.is_active : !user.is_active
      )
    }

    setFilteredUsers(filtered)
    setCurrentPage(1)
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      if (USE_MOCK_DATA) {
        setUsers(MOCK_USERS)
      } else {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
        setUsers(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      if (USE_MOCK_DATA) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u))
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully (Mock Mode)`)
      } else {
        const token = localStorage.getItem('token')
        await axios.put(`${API_BASE}/admin/users/${userId}`, { is_active: !currentStatus }, { headers: { Authorization: `Bearer ${token}` } })
        fetchUsers()
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to update user status')
    }
  }

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure?')) {
      try {
        if (USE_MOCK_DATA) {
          setUsers(prev => prev.filter(u => u.id !== userId))
          toast.success('User deleted successfully (Mock Mode)')
        } else {
          const token = localStorage.getItem('token')
          await axios.delete(`${API_BASE}/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
          fetchUsers()
          toast.success('User deleted successfully')
        }
      } catch (err) {
        console.error(err)
        toast.error('Failed to delete user')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">User Management</h2>
        <button onClick={() => setShowModal(true)} className="bg-pink-600 px-4 py-2 rounded hover:bg-pink-700">
          Add User
        </button>
      </div>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by username or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-pink-500 outline-none"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-pink-500 outline-none"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-pink-500 outline-none"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gray-700">
          <tr>
            <th className="p-3 text-left">Username</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Role</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Wallet Balance</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.map((user) => (
            <tr key={user.id} className="border-b border-gray-700">
              <td className="p-3">{user.username}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3">{user.role}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded ${user.is_active ? 'bg-green-600' : 'bg-red-600'}`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="p-3">{user.wallet_balance.toLocaleString()}đ</td>
              <td className="p-3">
                <button onClick={() => { setEditingUser(user); setShowModal(true) }} className="bg-green-600 px-3 py-1 rounded mr-2 hover:bg-green-700">Edit</button>
                <button onClick={() => handleToggleStatus(user.id, user.is_active)} className="bg-blue-600 px-3 py-1 rounded mr-2 hover:bg-blue-700">
                  {user.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => handleDelete(user.id)} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
      {showModal && <UserModal user={editingUser} onClose={() => { setShowModal(false); setEditingUser(null) }} onSave={fetchUsers} />}
    </div>
  )
}

function UserModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState(user || { username: '', email: '', role: 'user', is_active: true, wallet_balance: 0 })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (USE_MOCK_DATA) {
        if (user) {
          const index = MOCK_USERS.findIndex(u => u.id === user.id)
          if (index !== -1) {
            MOCK_USERS[index] = { ...MOCK_USERS[index], ...formData }
          }
          toast.success('User updated successfully (Mock Mode)')
        } else {
          const newUser = {
            id: Date.now(),
            ...formData,
            wallet_balance: formData.wallet_balance || 0
          }
          MOCK_USERS.push(newUser)
          toast.success('User added successfully (Mock Mode)')
        }
        onSave()
        onClose()
      } else {
        const token = localStorage.getItem('token')
        if (user) {
          await axios.put(`${API_BASE}/admin/users/${user.id}`, formData, { headers: { Authorization: `Bearer ${token}` } })
          toast.success('User updated successfully')
        } else {
          await axios.post(`${API_BASE}/admin/users`, formData, { headers: { Authorization: `Bearer ${token}` } })
          toast.success('User added successfully')
        }
        onSave()
        onClose()
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to save user')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-96">
        <h3 className="text-2xl font-bold mb-4">{user ? 'Edit User' : 'Add User'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full p-3 rounded bg-gray-700 text-white"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-3 rounded bg-gray-700 text-white"
            required
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full p-3 rounded bg-gray-700 text-white"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={formData.is_active ? 'true' : 'false'}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
            className="w-full p-3 rounded bg-gray-700 text-white"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <input
            type="number"
            placeholder="Wallet Balance"
            value={formData.wallet_balance}
            onChange={(e) => setFormData({ ...formData, wallet_balance: parseFloat(e.target.value) || 0 })}
            className="w-full p-3 rounded bg-gray-700 text-white"
          />
          <div className="flex gap-4">
            <button type="submit" className="flex-1 bg-pink-600 py-2 rounded hover:bg-pink-700">Save</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-600 py-2 rounded hover:bg-gray-700">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RevenueManagement() {
  const [revenue, setRevenue] = useState({ total_revenue: 0, transactions: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRevenue()
  }, [])

  const fetchRevenue = async () => {
    setLoading(true)
    try {
      if (USE_MOCK_DATA) {
        setRevenue(MOCK_REVENUE)
      } else {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${API_BASE}/admin/revenue`, { headers: { Authorization: `Bearer ${token}` } })
        setRevenue(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Revenue Management</h2>
      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <h3 className="text-xl text-gray-400">Total Revenue</h3>
        <p className="text-5xl font-bold text-green-500">{revenue.total_revenue.toLocaleString()}đ</p>
        <p className="text-gray-400 mt-2">{revenue.total_transactions} transactions</p>
      </div>
      <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gray-700">
          <tr>
            <th className="p-3 text-left">Transaction ID</th>
            <th className="p-3 text-left">Amount</th>
            <th className="p-3 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {revenue.transactions.map((t) => (
            <tr key={t.id} className="border-b border-gray-700">
              <td className="p-3">#{t.id}</td>
              <td className="p-3 text-green-500">{t.amount.toLocaleString()}đ</td>
              <td className="p-3">{new Date(t.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function WalletManagement() {
  const [wallets, setWallets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWallets()
  }, [])

  const fetchWallets = async () => {
    setLoading(true)
    try {
      if (USE_MOCK_DATA) {
        setWallets(MOCK_WALLETS)
      } else {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${API_BASE}/admin/wallets`, { headers: { Authorization: `Bearer ${token}` } })
        setWallets(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Wallet Management</h2>
      <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gray-700">
          <tr>
            <th className="p-3 text-left">Username</th>
            <th className="p-3 text-left">Balance</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {wallets.map((wallet) => (
            <tr key={wallet.id} className="border-b border-gray-700">
              <td className="p-3">{wallet.username}</td>
              <td className="p-3 text-green-500">{wallet.balance.toLocaleString()}đ</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded ${wallet.is_active ? 'bg-green-600' : 'bg-red-600'}`}>
                  {wallet.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MusicPlayer() {
  const [songs, setSongs] = useState([])
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const audioRef = useRef(null)

  useEffect(() => {
    fetchSongs()
  }, [])

  const fetchSongs = async () => {
    try {
      if (USE_MOCK_DATA) {
        console.log('Loading mock songs:', MOCK_SONGS.length)
        setSongs(MOCK_SONGS)
      } else {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${API_BASE}/admin/songs`, { headers: { Authorization: `Bearer ${token}` } })
        setSongs(res.data)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch songs')
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = (song) => {
    if (currentSong?.id === song.id && isPlaying) {
      return
    }
    setCurrentSong(song)
    setIsPlaying(true)
  }

  const handleStop = () => {
    audioRef.current?.pause()
    audioRef.current.currentTime = 0
    setIsPlaying(false)
  }

  const handleExitSong = () => {
    handleStop()
    setCurrentSong(null)
  }

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.audio_url || ''
      if (isPlaying && currentSong.audio_url) {
        audioRef.current.play()
      }
    }
  }, [currentSong])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Nghe Nhạc</h2>
        <Link to="/" className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">
          Thoát Trang
        </Link>
      </div>

      {songs.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="text-xl">Không có bài hát nào</p>
        </div>
      ) : (
        <>
          {/* Audio Player Bar */}
          {currentSong && (
            <div className="bg-gray-800 p-4 rounded-lg mb-6 border-2 border-pink-500">
              <audio ref={audioRef} />
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white font-bold text-lg">{currentSong.title}</p>
                  <p className="text-gray-400">{currentSong.artist} - {currentSong.album}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePlay(currentSong)}
                    className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 font-bold"
                  >
                    ▶ Play
                  </button>
                  <button
                    onClick={handleStop}
                    className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 font-bold"
                  >
                    ⏹ Stop
                  </button>
                  <button
                    onClick={handleExitSong}
                    className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700 font-bold"
                  >
                    ✕ Thoát Bài
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Song List */}
          <div className="grid gap-4">
            {songs.map((song) => (
              <div
                key={song.id}
                className={`bg-gray-800 p-4 rounded-lg border-2 ${
                  currentSong?.id === song.id ? 'border-pink-500' : 'border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">{song.title}</h3>
                    <p className="text-gray-400">{song.artist} - {song.album}</p>
                    <p className="text-gray-500 text-sm">{song.genre} • {song.price.toLocaleString()}đ</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePlay(song)}
                      className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 font-bold"
                    >
                      ▶ Play
                    </button>
                    {currentSong?.id === song.id && (
                      <button
                        onClick={handleStop}
                        className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 font-bold"
                      >
                        ⏹ Stop
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default App
