// pages/challenges/challenges.js
const app = getApp()

Page({
  data: {
    loading: true,
    completedChallenges: 0,
    activeChallenges: [],
    availableChallenges: [],
    completedChallengesList: []
  },

  onLoad() {
    this.initPage()
  },

  onShow() {
    this.loadChallenges()
  },

  // 初始化页面
  initPage() {
    // 检查用户登录状态
    if (!app.globalData.isLoggedIn) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再查看挑战',
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
    
    this.loadChallenges()
  },

  // 加载挑战数据
  loadChallenges() {
    this.setData({ loading: true })
    
    // 模拟数据，实际项目中应该从云数据库获取
    const mockData = this.getMockChallenges()
    
    setTimeout(() => {
      this.setData({
        loading: false,
        activeChallenges: mockData.active,
        availableChallenges: mockData.available,
        completedChallengesList: mockData.completed,
        completedChallenges: mockData.completed.length
      })
    }, 1000)
  },

  // 获取模拟挑战数据
  getMockChallenges() {
    return {
      active: [
        {
          id: 1,
          title: '连续打卡7天',
          description: '连续7天完成音乐打卡',
          icon: '🔥',
          progress: 3,
          target: 7,
          progressPercent: 43,
          reward: {
            name: '坚持者勋章',
            icon: '🏅'
          },
          remainingTime: '4天'
        }
      ],
      available: [
        {
          id: 2,
          title: '音乐探索家',
          description: '打卡10首不同风格的歌曲',
          icon: '🎵',
          difficulty: 'medium',
          difficultyText: '中等',
          targetText: '打卡10首不同风格歌曲',
          duration: '30天',
          participantCount: 156,
          reward: {
            name: '探索者称号',
            description: '获得专属头像框'
          }
        },
        {
          id: 3,
          title: '社交达人',
          description: '邀请5位好友加入应用',
          icon: '👥',
          difficulty: 'hard',
          difficultyText: '困难',
          targetText: '邀请5位好友',
          duration: '不限时',
          participantCount: 89,
          reward: {
            name: '社交达人勋章',
            description: '获得特殊称号'
          }
        },
        {
          id: 4,
          title: '早起鸟儿',
          description: '连续7天在早上8点前打卡',
          icon: '🌅',
          difficulty: 'easy',
          difficultyText: '简单',
          targetText: '早上8点前打卡7天',
          duration: '7天',
          participantCount: 234,
          reward: {
            name: '早起鸟勋章',
            description: '获得专属背景'
          }
        }
      ],
      completed: [
        {
          id: 5,
          title: '新手上路',
          description: '完成首次音乐打卡',
          icon: '🎯',
          reward: {
            name: '新手勋章',
            icon: '🥉'
          },
          completionTime: '2024-06-15'
        }
      ]
    }
  },

  // 查看挑战详情
  viewChallenge(e) {
    const challenge = e.currentTarget.dataset.challenge
    wx.showModal({
      title: challenge.title,
      content: challenge.description,
      showCancel: false
    })
  },

  // 参与挑战
  joinChallenge(e) {
    e.stopPropagation()
    const challenge = e.currentTarget.dataset.challenge
    
    wx.showModal({
      title: '参与挑战',
      content: `确定要参与"${challenge.title}"挑战吗？`,
      success: (res) => {
        if (res.confirm) {
          this.doJoinChallenge(challenge)
        }
      }
    })
  },

  // 执行参与挑战
  doJoinChallenge(challenge) {
    wx.showLoading({
      title: '加入中...'
    })
    
    // 模拟加入挑战的过程
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '挑战加入成功',
        icon: 'success'
      })
      
      // 更新数据
      this.loadChallenges()
    }, 1500)
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadChallenges()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  }
})
