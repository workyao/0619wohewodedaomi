// pages/index/index.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    todayDate: '',
    todayChecked: false,
    todayCheckedSongs: [],
    checkinDays: 0,
    totalCheckins: 0,
    totalSongs: 0,
    friendsCount: 0,
    recommendSongs: [
      {
        id: 1,
        title: '2002年的第一场雪',
        album: '2002年的第一场雪',
        duration: '4:32'
      },
      {
        id: 2,
        title: '冲动的惩罚',
        album: '冲动的惩罚',
        duration: '4:18'
      },
      {
        id: 3,
        title: '西海情歌',
        album: '谢谢你',
        duration: '5:21'
      }
    ],
    recentActivities: []
  },

  onLoad() {
    this.initPage()
  },

  onShow() {
    this.refreshData()
  },

  // 初始化页面
  initPage() {
    // 设置今日日期
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    this.setData({
      todayDate: this.formatDate(today)
    })

    // 检查用户登录状态
    if (app.globalData.isLoggedIn) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
      this.loadUserData()
    }
  },

  // 刷新数据
  refreshData() {
    if (app.globalData.isLoggedIn) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
      this.loadUserData()
      this.loadTodayCheckin()
      this.loadRecentActivities()
    }
  },

  // 统一错误处理
  handleError(error, defaultMessage = '操作失败') {
    console.error('Error:', error)
    let message = defaultMessage

    if (error && error.message) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }

    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
  },

  // 网络错误处理
  handleNetworkError(error) {
    console.error('Network Error:', error)
    wx.showModal({
      title: '网络错误',
      content: '网络连接失败，请检查网络设置后重试',
      showCancel: true,
      confirmText: '重试',
      success: (res) => {
        if (res.confirm) {
          this.refreshData()
        }
      }
    })
  },

  // 处理用户登录
  handleLogin() {
    wx.showLoading({
      title: '登录中...'
    })

    app.login().then(userInfo => {
      wx.hideLoading()
      this.setData({
        userInfo: userInfo
      })
      this.loadUserData()
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
    }).catch(err => {
      wx.hideLoading()
      this.handleError(err, '登录失败，请重试')
    })
  },

  // 加载用户数据
  loadUserData() {
    const db = wx.cloud.database()

    // 获取用户基础信息
    db.collection('users').where({
      openid: app.globalData.openid
    }).get().then(res => {
      if (res.data.length > 0) {
        const userData = res.data[0]
        this.setData({
          checkinDays: userData.checkinDays || 0,
          totalCheckins: userData.totalCheckins || 0,
          totalSongs: userData.totalSongs || 0,
          friendsCount: userData.friendsCount || 0
        })
      }
    }).catch(err => {
      this.handleNetworkError(err)
    })
  },

  // 加载今日打卡状态
  loadTodayCheckin() {
    const db = wx.cloud.database()
    const today = new Date().toISOString().split('T')[0]

    db.collection('checkins').where({
      openid: app.globalData.openid,
      date: today
    }).get().then(res => {
      if (res.data.length > 0) {
        const todayCheckin = res.data[0]
        this.setData({
          todayChecked: true,
          todayCheckedSongs: todayCheckin.songs || []
        })
      } else {
        this.setData({
          todayChecked: false,
          todayCheckedSongs: []
        })
      }
    }).catch(err => {
      console.error('获取今日打卡状态失败：', err)
    })
  },

  // 加载最新动态
  loadRecentActivities() {
    const db = wx.cloud.database()
    
    db.collection('activities')
      .orderBy('createTime', 'desc')
      .limit(5)
      .get()
      .then(res => {
        const activities = res.data.map(item => ({
          ...item,
          timeAgo: this.getTimeAgo(item.createTime)
        }))
        this.setData({
          recentActivities: activities
        })
      })
      .catch(err => {
        console.error('获取最新动态失败：', err)
      })
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    const weekday = weekdays[date.getDay()]
    
    return `${month}月${day}日 星期${weekday}`
  },

  // 计算时间差
  getTimeAgo(createTime) {
    const now = new Date()
    const create = new Date(createTime)
    const diff = now - create
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) {
      return `${days}天前`
    } else if (hours > 0) {
      return `${hours}小时前`
    } else if (minutes > 0) {
      return `${minutes}分钟前`
    } else {
      return '刚刚'
    }
  },

  // 页面跳转方法
  goToCheckin() {
    if (!app.globalData.isLoggedIn) {
      this.handleLogin()
      return
    }
    wx.switchTab({
      url: '/pages/checkin/checkin'
    })
  },

  goToCalendar() {
    if (!app.globalData.isLoggedIn) {
      this.handleLogin()
      return
    }
    wx.navigateTo({
      url: '/pages/calendar/calendar'
    })
  },

  goToSquare() {
    wx.switchTab({
      url: '/pages/square/square'
    })
  },

  goToFriends() {
    if (!app.globalData.isLoggedIn) {
      this.handleLogin()
      return
    }
    wx.navigateTo({
      url: '/pages/friends/friends'
    })
  },

  goToSongDetail(e) {
    const song = e.currentTarget.dataset.song
    wx.navigateTo({
      url: `/pages/song-detail/song-detail?id=${song.id}`
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.refreshData()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  }
})
