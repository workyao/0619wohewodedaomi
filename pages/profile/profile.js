// pages/profile/profile.js
const app = getApp()
const { getTimeAgo } = require('../../utils/util.js')

Page({
  data: {
    isLoggedIn: false,
    userInfo: null,
    userLevel: 1,
    userDesc: '',
    checkinDays: 0,
    totalCheckins: 0,
    totalSongs: 0,
    friendsCount: 0,
    badges: [],
    allBadges: [
      {
        id: 1,
        name: '新手稻米',
        icon: '🌱',
        unlocked: true,
        desc: '完成第一次打卡'
      },
      {
        id: 2,
        name: '坚持者',
        icon: '💪',
        unlocked: false,
        desc: '连续打卡7天',
        progress: { current: 3, total: 7 }
      },
      {
        id: 3,
        name: '音乐达人',
        icon: '🎵',
        unlocked: false,
        desc: '听过50首刀郎的歌',
        progress: { current: 25, total: 50 }
      },
      {
        id: 4,
        name: '社交达人',
        icon: '👥',
        unlocked: false,
        desc: '添加10个稻米朋友',
        progress: { current: 2, total: 10 }
      },
      {
        id: 5,
        name: '忠实粉丝',
        icon: '❤️',
        unlocked: false,
        desc: '连续打卡30天'
      },
      {
        id: 6,
        name: '分享达人',
        icon: '🔄',
        unlocked: false,
        desc: '分享10次动态'
      },
      {
        id: 7,
        name: '评论家',
        icon: '💬',
        unlocked: false,
        desc: '发表100条评论'
      },
      {
        id: 8,
        name: '稻米之王',
        icon: '👑',
        unlocked: false,
        desc: '连续打卡100天'
      }
    ],
    totalBadges: 8,
    recentActivities: []
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    if (this.data.isLoggedIn) {
      this.loadUserData()
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const isLoggedIn = app.globalData.isLoggedIn
    const userInfo = app.globalData.userInfo

    this.setData({
      isLoggedIn: isLoggedIn,
      userInfo: userInfo
    })

    if (isLoggedIn) {
      this.loadUserData()
    }
  },

  // 加载用户数据
  loadUserData() {
    this.loadUserStats()
    this.loadUserBadges()
    this.loadRecentActivities()
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
        const data = res.result.data
        this.setData({
          checkinDays: data.checkinDays || 0,
          totalCheckins: data.totalCheckins || 0,
          totalSongs: data.totalSongs || 0,
          userLevel: data.level || 1,
          badges: data.badges || []
        })
        
        // 更新徽章解锁状态
        this.updateBadgesStatus()
      }
    }).catch(err => {
      console.error('获取用户统计失败：', err)
    })

    // 获取朋友数量
    this.loadFriendsCount()
  },

  // 加载朋友数量
  loadFriendsCount() {
    // 这里应该调用获取朋友列表的云函数
    // 暂时使用模拟数据
    this.setData({
      friendsCount: 5
    })
  },

  // 加载用户徽章
  loadUserBadges() {
    // 根据用户数据更新徽章解锁状态
    this.updateBadgesStatus()
  },

  // 更新徽章状态
  updateBadgesStatus() {
    const { checkinDays, totalSongs, friendsCount, totalCheckins } = this.data
    const updatedBadges = this.data.allBadges.map(badge => {
      let unlocked = badge.unlocked
      let progress = badge.progress

      switch (badge.id) {
        case 1: // 新手稻米
          unlocked = totalCheckins > 0
          break
        case 2: // 坚持者
          unlocked = checkinDays >= 7
          if (!unlocked && progress) {
            progress = { ...progress, current: Math.min(checkinDays, 7) }
          }
          break
        case 3: // 音乐达人
          unlocked = totalSongs >= 50
          if (!unlocked && progress) {
            progress = { ...progress, current: Math.min(totalSongs, 50) }
          }
          break
        case 4: // 社交达人
          unlocked = friendsCount >= 10
          if (!unlocked && progress) {
            progress = { ...progress, current: Math.min(friendsCount, 10) }
          }
          break
        case 5: // 忠实粉丝
          unlocked = checkinDays >= 30
          break
        case 8: // 稻米之王
          unlocked = checkinDays >= 100
          break
      }

      return { ...badge, unlocked, progress }
    })

    this.setData({
      allBadges: updatedBadges
    })
  },

  // 加载最近活动
  loadRecentActivities() {
    // 模拟最近活动数据
    const activities = [
      {
        id: 1,
        icon: '📝',
        title: '完成了今日打卡',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000),
        timeAgo: getTimeAgo(new Date(Date.now() - 2 * 60 * 60 * 1000))
      },
      {
        id: 2,
        icon: '👍',
        title: '点赞了一条动态',
        time: new Date(Date.now() - 5 * 60 * 60 * 1000),
        timeAgo: getTimeAgo(new Date(Date.now() - 5 * 60 * 60 * 1000))
      },
      {
        id: 3,
        icon: '💬',
        title: '评论了朋友的打卡',
        time: new Date(Date.now() - 24 * 60 * 60 * 1000),
        timeAgo: getTimeAgo(new Date(Date.now() - 24 * 60 * 60 * 1000))
      }
    ]

    this.setData({
      recentActivities: activities
    })
  },

  // 处理登录
  handleLogin() {
    app.login().then(userInfo => {
      this.setData({
        isLoggedIn: true,
        userInfo: userInfo
      })
      this.loadUserData()
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
    }).catch(err => {
      wx.showToast({
        title: '登录失败',
        icon: 'error'
      })
    })
  },

  // 编辑个人资料
  editProfile() {
    wx.navigateTo({
      url: '/pages/edit-profile/edit-profile'
    })
  },

  // 显示徽章详情
  showBadgeDetail(e) {
    const badge = e.currentTarget.dataset.badge
    let content = badge.desc
    if (!badge.unlocked && badge.progress) {
      content += `\n进度：${badge.progress.current}/${badge.progress.total}`
    }

    wx.showModal({
      title: `${badge.icon} ${badge.name}`,
      content: content,
      showCancel: false
    })
  },

  // 页面跳转方法
  goToCalendar() {
    wx.navigateTo({
      url: '/pages/calendar/calendar'
    })
  },

  goToHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    })
  },

  goToSongs() {
    wx.navigateTo({
      url: '/pages/songs/songs'
    })
  },

  goToFriends() {
    wx.navigateTo({
      url: '/pages/friends/friends'
    })
  },

  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  goToFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    })
  },

  goToAbout() {
    wx.navigateTo({
      url: '/pages/about/about'
    })
  },

  // 分享小程序
  shareApp() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 分享给朋友
  onShareAppMessage() {
    return {
      title: '我和我的稻米朋友们',
      desc: '一起听刀郎，感受音乐的力量',
      path: '/pages/index/index'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '我和我的稻米朋友们 - 刀郎歌迷专属社交打卡小程序'
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    if (this.data.isLoggedIn) {
      this.loadUserData()
    }
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  }
})
