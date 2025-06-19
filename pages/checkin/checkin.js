// pages/checkin/checkin.js
const app = getApp()
const { categories, moods, getSongsByCategory } = require('../../data/songs.js')

Page({
  data: {
    todayDate: '',
    todayChecked: false,
    checkinDays: 0,
    categories: categories,
    currentCategory: 'all',
    currentCategoryName: '全部歌曲',
    currentSongs: [],
    selectedSongs: [],
    allSelected: false,
    moods: moods,
    currentMood: '',
    checkinNote: '',
    loading: false,
    submitting: false
  },

  onLoad() {
    this.initPage()
  },

  onShow() {
    this.loadTodayCheckin()
  },

  // 初始化页面
  initPage() {
    // 设置今日日期
    const today = new Date()
    this.setData({
      todayDate: this.formatDate(today)
    })

    // 检查登录状态
    if (!app.globalData.isLoggedIn) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再进行打卡',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/index/index'
            })
          }
        }
      })
      return
    }

    // 加载歌曲数据
    this.loadSongs()
    this.loadUserStats()
  },

  // 加载歌曲数据
  loadSongs() {
    this.setData({
      loading: true
    })

    // 优先从云数据库获取歌曲
    wx.cloud.callFunction({
      name: 'songs',
      data: {
        action: 'getSongs',
        category: this.data.currentCategory,
        page: 1,
        pageSize: 100
      }
    }).then(res => {
      if (res.result.success) {
        const songs = res.result.data.songs
        this.setData({
          currentSongs: songs.map(song => ({
            ...song,
            checked: false
          })),
          loading: false
        })

        // 更新已选歌曲的状态
        this.updateSongsCheckedStatus()
      } else {
        // 云数据库获取失败，使用本地数据
        this.loadLocalSongs()
      }
    }).catch(err => {
      console.error('从云数据库获取歌曲失败：', err)
      // 使用本地数据作为备选
      this.loadLocalSongs()
    })
  },

  // 加载本地歌曲数据（备选方案）
  loadLocalSongs() {
    try {
      const songs = getSongsByCategory(this.data.currentCategory)
      this.setData({
        currentSongs: songs.map(song => ({
          ...song,
          checked: false
        })),
        loading: false
      })

      // 更新已选歌曲的状态
      this.updateSongsCheckedStatus()
    } catch (error) {
      console.error('加载本地歌曲失败：', error)
      this.setData({
        loading: false
      })
      wx.showToast({
        title: '加载歌曲失败',
        icon: 'error'
      })
    }
  },

  // 加载用户统计数据
  loadUserStats() {
    wx.cloud.callFunction({
      name: 'checkin',
      data: {
        action: 'getCheckinStats'
      }
    }).then(res => {
      if (res.result.success) {
        this.setData({
          checkinDays: res.result.data.checkinDays
        })
      }
    }).catch(err => {
      console.error('获取用户统计失败：', err)
    })
  },

  // 加载今日打卡状态
  loadTodayCheckin() {
    const today = new Date().toISOString().split('T')[0]
    
    wx.cloud.callFunction({
      name: 'checkin',
      data: {
        action: 'getTodayCheckin',
        date: today
      }
    }).then(res => {
      if (res.result.success && res.result.data) {
        const checkinData = res.result.data
        this.setData({
          todayChecked: true,
          selectedSongs: checkinData.songs || [],
          currentMood: checkinData.mood || '',
          checkinNote: checkinData.note || ''
        })
        
        // 更新歌曲选中状态
        this.updateSongsCheckedStatus()
      }
    }).catch(err => {
      console.error('获取今日打卡状态失败：', err)
    })
  },

  // 更新歌曲选中状态
  updateSongsCheckedStatus() {
    const selectedIds = this.data.selectedSongs.map(song => song.id)
    const updatedSongs = this.data.currentSongs.map(song => ({
      ...song,
      checked: selectedIds.includes(song.id)
    }))
    
    this.setData({
      currentSongs: updatedSongs,
      allSelected: updatedSongs.length > 0 && updatedSongs.every(song => song.checked)
    })
  },

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category
    const categoryInfo = this.data.categories.find(cat => cat.key === category)
    
    this.setData({
      currentCategory: category,
      currentCategoryName: categoryInfo.name,
      selectedSongs: [], // 切换分类时清空选择
      allSelected: false
    })
    
    this.loadSongs()
  },

  // 切换歌曲选择状态
  toggleSong(e) {
    const songId = e.currentTarget.dataset.songId
    const songIndex = this.data.currentSongs.findIndex(song => song.id === songId)
    
    if (songIndex === -1) return
    
    const song = this.data.currentSongs[songIndex]
    const updatedSongs = [...this.data.currentSongs]
    updatedSongs[songIndex] = {
      ...song,
      checked: !song.checked
    }
    
    // 更新选中歌曲列表
    let selectedSongs = [...this.data.selectedSongs]
    if (updatedSongs[songIndex].checked) {
      // 添加到选中列表
      selectedSongs.push(song)
    } else {
      // 从选中列表移除
      selectedSongs = selectedSongs.filter(s => s.id !== songId)
    }
    
    this.setData({
      currentSongs: updatedSongs,
      selectedSongs: selectedSongs,
      allSelected: updatedSongs.every(song => song.checked)
    })
  },

  // 全选/取消全选
  toggleSelectAll() {
    const allSelected = !this.data.allSelected
    const updatedSongs = this.data.currentSongs.map(song => ({
      ...song,
      checked: allSelected
    }))
    
    const selectedSongs = allSelected ? [...this.data.currentSongs] : []
    
    this.setData({
      currentSongs: updatedSongs,
      selectedSongs: selectedSongs,
      allSelected: allSelected
    })
  },

  // 移除选中的歌曲
  removeSong(e) {
    const songId = e.currentTarget.dataset.songId
    const selectedSongs = this.data.selectedSongs.filter(song => song.id !== songId)
    
    // 更新当前分类中的歌曲状态
    const updatedSongs = this.data.currentSongs.map(song => ({
      ...song,
      checked: song.id === songId ? false : song.checked
    }))
    
    this.setData({
      selectedSongs: selectedSongs,
      currentSongs: updatedSongs,
      allSelected: false
    })
  },

  // 选择心情
  selectMood(e) {
    const mood = e.currentTarget.dataset.mood
    this.setData({
      currentMood: mood
    })
  },

  // 输入备注
  onNoteInput(e) {
    this.setData({
      checkinNote: e.detail.value
    })
  },

  // 查看歌曲详情
  viewSongDetail(e) {
    e.stopPropagation()
    const song = e.currentTarget.dataset.song
    wx.navigateTo({
      url: `/pages/song-detail/song-detail?id=${song.id}`
    })
  },

  // 保存草稿
  saveDraft() {
    if (this.data.selectedSongs.length === 0) {
      wx.showToast({
        title: '请至少选择一首歌曲',
        icon: 'error'
      })
      return
    }

    wx.setStorageSync('checkinDraft', {
      songs: this.data.selectedSongs,
      mood: this.data.currentMood,
      note: this.data.checkinNote,
      date: new Date().toISOString().split('T')[0]
    })

    wx.showToast({
      title: '草稿已保存',
      icon: 'success'
    })
  },

  // 提交打卡
  submitCheckin() {
    if (this.data.selectedSongs.length === 0) {
      wx.showToast({
        title: '请至少选择一首歌曲',
        icon: 'error'
      })
      return
    }

    if (!this.data.currentMood) {
      wx.showToast({
        title: '请选择今日心情',
        icon: 'error'
      })
      return
    }

    this.setData({
      submitting: true
    })

    const today = new Date().toISOString().split('T')[0]
    
    wx.cloud.callFunction({
      name: 'checkin',
      data: {
        action: 'submit',
        songs: this.data.selectedSongs,
        mood: this.data.currentMood,
        note: this.data.checkinNote,
        date: today
      }
    }).then(res => {
      this.setData({
        submitting: false
      })
      
      if (res.result.success) {
        this.setData({
          todayChecked: true
        })
        
        // 清除草稿
        wx.removeStorageSync('checkinDraft')
        
        wx.showToast({
          title: '打卡成功！',
          icon: 'success',
          duration: 2000
        })
        
        // 延迟跳转到首页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          })
        }, 2000)
      } else {
        wx.showToast({
          title: res.result.error || '打卡失败',
          icon: 'error'
        })
      }
    }).catch(err => {
      console.error('打卡失败：', err)
      this.setData({
        submitting: false
      })
      wx.showToast({
        title: '打卡失败，请重试',
        icon: 'error'
      })
    })
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    const weekday = weekdays[date.getDay()]
    
    return `${year}年${month}月${day}日 星期${weekday}`
  },

  // 页面卸载时保存草稿
  onUnload() {
    if (this.data.selectedSongs.length > 0 && !this.data.todayChecked) {
      this.saveDraft()
    }
  }
})
