// pages/song-detail/song-detail.js
const app = getApp()
const { getSongById } = require('../../data/songs.js')

Page({
  data: {
    songId: null,
    song: null,
    loading: true,
    
    // 歌曲统计
    listenCount: 0,
    checkinCount: 0,
    favoriteCount: 0,
    
    // 收藏状态
    isFavorite: false,
    
    // 歌词相关
    lyricsLines: [],
    showPinyin: false,
    
    // 相关推荐
    relatedSongs: [],
    
    // 打卡记录
    checkinRecords: []
  },

  onLoad(options) {
    const songId = parseInt(options.id)
    if (songId) {
      this.setData({
        songId: songId
      })
      this.loadSongDetail()
    } else {
      wx.showToast({
        title: '歌曲ID无效',
        icon: 'error'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  // 加载歌曲详情
  loadSongDetail() {
    this.setData({
      loading: true
    })

    // 优先从云数据库获取
    wx.cloud.callFunction({
      name: 'songs',
      data: {
        action: 'getSongById',
        songId: this.data.songId
      }
    }).then(res => {
      if (res.result.success) {
        const songData = res.result.data
        this.setData({
          song: songData.song,
          relatedSongs: songData.relatedSongs || [],
          loading: false
        })
        
        this.processLyrics()
        this.loadSongStats()
        this.loadCheckinRecords()
        this.checkFavoriteStatus()
      } else {
        // 云数据库获取失败，使用本地数据
        this.loadLocalSongData()
      }
    }).catch(err => {
      console.error('从云数据库获取歌曲详情失败：', err)
      this.loadLocalSongData()
    })
  },

  // 加载本地歌曲数据（备选方案）
  loadLocalSongData() {
    try {
      const song = getSongById(this.data.songId)
      if (song) {
        this.setData({
          song: song,
          loading: false
        })
        
        this.processLyrics()
        this.loadSongStats()
        this.loadCheckinRecords()
        this.checkFavoriteStatus()
      } else {
        wx.showToast({
          title: '歌曲不存在',
          icon: 'error'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (error) {
      console.error('加载本地歌曲数据失败：', error)
      this.setData({
        loading: false
      })
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  // 处理歌词
  processLyrics() {
    const { song } = this.data
    if (!song || !song.lyrics) return

    const lines = song.lyrics.split('\n').filter(line => line.trim())
    const lyricsLines = lines.map(line => ({
      text: line.trim(),
      pinyin: this.generatePinyin(line.trim()) // 这里可以集成拼音库
    }))

    this.setData({
      lyricsLines: lyricsLines
    })
  },

  // 生成拼音（简单实现，实际可以使用专业的拼音库）
  generatePinyin(text) {
    // 这里是简化实现，实际项目中可以集成 pinyin 库
    // 或者调用云函数进行拼音转换
    return '' // 暂时返回空字符串
  },

  // 加载歌曲统计
  loadSongStats() {
    wx.cloud.callFunction({
      name: 'songs',
      data: {
        action: 'getSongStats',
        songId: this.data.songId
      }
    }).then(res => {
      if (res.result.success) {
        const stats = res.result.data
        this.setData({
          listenCount: stats.listenCount || 0,
          checkinCount: stats.checkinCount || 0,
          favoriteCount: stats.favoriteCount || 0
        })
      }
    }).catch(err => {
      console.error('获取歌曲统计失败：', err)
    })
  },

  // 加载打卡记录
  loadCheckinRecords() {
    if (!app.globalData.isLoggedIn) return

    wx.cloud.callFunction({
      name: 'checkin',
      data: {
        action: 'getSongCheckinHistory',
        songId: this.data.songId
      }
    }).then(res => {
      if (res.result.success) {
        const records = res.result.data.map(record => ({
          ...record,
          dateStr: this.formatDate(new Date(record.createTime)),
          moodEmoji: this.getMoodEmoji(record.mood),
          moodText: this.getMoodText(record.mood)
        }))
        
        this.setData({
          checkinRecords: records
        })
      }
    }).catch(err => {
      console.error('获取打卡记录失败：', err)
    })
  },

  // 检查收藏状态
  checkFavoriteStatus() {
    if (!app.globalData.isLoggedIn) return

    // 这里可以调用云函数检查收藏状态
    // 暂时使用本地存储模拟
    const favorites = wx.getStorageSync('favorites') || []
    const isFavorite = favorites.includes(this.data.songId)
    
    this.setData({
      isFavorite: isFavorite
    })
  },

  // 切换收藏状态
  toggleFavorite() {
    if (!app.globalData.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'error'
      })
      return
    }

    const { isFavorite, songId } = this.data
    let favorites = wx.getStorageSync('favorites') || []
    
    if (isFavorite) {
      // 取消收藏
      favorites = favorites.filter(id => id !== songId)
      wx.showToast({
        title: '已取消收藏',
        icon: 'success'
      })
    } else {
      // 添加收藏
      favorites.push(songId)
      wx.showToast({
        title: '已添加收藏',
        icon: 'success'
      })
    }
    
    wx.setStorageSync('favorites', favorites)
    this.setData({
      isFavorite: !isFavorite,
      favoriteCount: isFavorite ? this.data.favoriteCount - 1 : this.data.favoriteCount + 1
    })
  },

  // 切换拼音显示
  togglePinyin() {
    this.setData({
      showPinyin: !this.data.showPinyin
    })
  },

  // 复制歌词
  copyLyrics() {
    const { song } = this.data
    if (!song || !song.lyrics) {
      wx.showToast({
        title: '暂无歌词',
        icon: 'error'
      })
      return
    }

    wx.setClipboardData({
      data: `《${song.title}》\n\n${song.lyrics}`,
      success: () => {
        wx.showToast({
          title: '歌词已复制',
          icon: 'success'
        })
      }
    })
  },

  // 查看完整简谱
  viewFullScore() {
    const { song } = this.data
    if (!song || !song.score) {
      wx.showToast({
        title: '暂无简谱',
        icon: 'error'
      })
      return
    }

    wx.previewImage({
      urls: [song.score],
      current: song.score
    })
  },

  // 跳转到其他歌曲
  goToSong(e) {
    const songId = e.currentTarget.dataset.songId
    wx.redirectTo({
      url: `/pages/song-detail/song-detail?id=${songId}`
    })
  },

  // 添加到打卡
  addToCheckin() {
    // 将歌曲添加到打卡草稿
    let draft = wx.getStorageSync('checkinDraft') || {
      songs: [],
      mood: '',
      note: '',
      date: new Date().toISOString().split('T')[0]
    }

    const { song } = this.data
    const existingSong = draft.songs.find(s => s.id === song.id)
    
    if (existingSong) {
      wx.showToast({
        title: '已在打卡列表中',
        icon: 'none'
      })
    } else {
      draft.songs.push(song)
      wx.setStorageSync('checkinDraft', draft)
      
      wx.showToast({
        title: '已添加到打卡',
        icon: 'success'
      })
    }

    // 跳转到打卡页面
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/checkin/checkin'
      })
    }, 1500)
  },

  // 分享给朋友
  shareToFriends() {
    // 分享逻辑
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  // 跳转到打卡页面
  goToCheckin() {
    wx.switchTab({
      url: '/pages/checkin/checkin'
    })
  },

  // 获取心情表情
  getMoodEmoji(mood) {
    const moodMap = {
      'happy': '😊',
      'peaceful': '😌',
      'moved': '🥺',
      'nostalgic': '😔',
      'excited': '🤩'
    }
    return moodMap[mood] || '😊'
  },

  // 获取心情文字
  getMoodText(mood) {
    const moodMap = {
      'happy': '开心',
      'peaceful': '平静',
      'moved': '感动',
      'nostalgic': '怀念',
      'excited': '激动'
    }
    return moodMap[mood] || '开心'
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    return `${year}年${month}月${day}日`
  },

  // 分享小程序
  onShareAppMessage() {
    const { song } = this.data
    return {
      title: `${song ? song.title : '歌曲详情'} - 我和我的稻米朋友们`,
      path: `/pages/song-detail/song-detail?id=${this.data.songId}`,
      imageUrl: song ? song.cover : ''
    }
  }
})
