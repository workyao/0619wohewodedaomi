// pages/square/square.js
const app = getApp()
const { getTimeAgo } = require('../../utils/util.js')

Page({
  data: {
    searchKeyword: '',
    currentFilter: 'all',
    filterOptions: [
      { key: 'all', name: '全部', icon: '🌾' },
      { key: 'checkin', name: '打卡', icon: '📝' },
      { key: 'following', name: '关注', icon: '👥' },
      { key: 'hot', name: '热门', icon: '🔥' }
    ],
    activities: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad() {
    this.loadActivities()
  },

  onShow() {
    // 刷新数据
    this.refreshActivities()
  },

  // 加载动态列表
  loadActivities(refresh = false) {
    if (this.data.loading) return
    
    this.setData({
      loading: true
    })

    const page = refresh ? 1 : this.data.page
    
    wx.cloud.callFunction({
      name: 'social',
      data: {
        action: 'getActivities',
        filter: this.data.currentFilter,
        keyword: this.data.searchKeyword,
        page: page,
        pageSize: this.data.pageSize
      }
    }).then(res => {
      if (res.result.success) {
        const newActivities = res.result.data.activities.map(activity => ({
          ...activity,
          timeAgo: getTimeAgo(activity.createTime),
          typeName: this.getActivityTypeName(activity.type),
          isLiked: activity.likedBy && activity.likedBy.includes(app.globalData.openid),
          data: {
            ...activity.data,
            moodEmoji: this.getMoodEmoji(activity.data.mood),
            moodText: this.getMoodText(activity.data.mood)
          }
        }))

        if (refresh) {
          this.setData({
            activities: newActivities,
            page: 1,
            hasMore: res.result.data.hasMore
          })
        } else {
          this.setData({
            activities: [...this.data.activities, ...newActivities],
            hasMore: res.result.data.hasMore
          })
        }
        
        this.setData({
          page: page + 1,
          loading: false
        })
      } else {
        this.setData({
          loading: false
        })
        wx.showToast({
          title: '加载失败',
          icon: 'error'
        })
      }
    }).catch(err => {
      console.error('加载动态失败：', err)
      this.setData({
        loading: false
      })
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    })
  },

  // 刷新动态
  refreshActivities() {
    this.setData({
      page: 1,
      hasMore: true
    })
    this.loadActivities(true)
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },

  // 执行搜索
  onSearch() {
    this.refreshActivities()
  },

  // 切换筛选条件
  switchFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({
      currentFilter: filter
    })
    this.refreshActivities()
  },

  // 点赞/取消点赞
  toggleLike(e) {
    const activityId = e.currentTarget.dataset.activityId
    const activity = this.data.activities.find(item => item.id === activityId)
    
    if (!activity) return

    wx.cloud.callFunction({
      name: 'social',
      data: {
        action: 'toggleLike',
        activityId: activityId,
        isLiked: activity.isLiked
      }
    }).then(res => {
      if (res.result.success) {
        const updatedActivities = this.data.activities.map(item => {
          if (item.id === activityId) {
            return {
              ...item,
              isLiked: !item.isLiked,
              likesCount: item.isLiked ? item.likesCount - 1 : item.likesCount + 1
            }
          }
          return item
        })
        
        this.setData({
          activities: updatedActivities
        })
      }
    }).catch(err => {
      console.error('点赞操作失败：', err)
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      })
    })
  },

  // 显示评论
  showComments(e) {
    const activityId = e.currentTarget.dataset.activityId
    wx.navigateTo({
      url: `/pages/comments/comments?activityId=${activityId}`
    })
  },

  // 分享动态
  shareActivity(e) {
    const activity = e.currentTarget.dataset.activity
    
    wx.showActionSheet({
      itemList: ['分享给朋友', '分享到朋友圈', '复制链接'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.shareToFriend(activity)
            break
          case 1:
            this.shareToTimeline(activity)
            break
          case 2:
            this.copyLink(activity)
            break
        }
      }
    })
  },

  // 分享给朋友
  shareToFriend(activity) {
    // 记录分享行为
    this.recordShare(activity.id, 'friend')
  },

  // 分享到朋友圈
  shareToTimeline(activity) {
    // 记录分享行为
    this.recordShare(activity.id, 'timeline')
  },

  // 复制链接
  copyLink(activity) {
    const link = `pages/activity-detail/activity-detail?id=${activity.id}`
    wx.setClipboardData({
      data: link,
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success'
        })
        this.recordShare(activity.id, 'copy')
      }
    })
  },

  // 记录分享行为
  recordShare(activityId, type) {
    wx.cloud.callFunction({
      name: 'social',
      data: {
        action: 'recordShare',
        activityId: activityId,
        shareType: type
      }
    }).then(res => {
      if (res.result.success) {
        // 更新分享计数
        const updatedActivities = this.data.activities.map(item => {
          if (item.id === activityId) {
            return {
              ...item,
              sharesCount: item.sharesCount + 1
            }
          }
          return item
        })
        
        this.setData({
          activities: updatedActivities
        })
      }
    }).catch(err => {
      console.error('记录分享失败：', err)
    })
  },

  // 跳转到歌曲详情
  goToSongDetail(e) {
    const songId = e.currentTarget.dataset.songId
    wx.navigateTo({
      url: `/pages/song-detail/song-detail?id=${songId}`
    })
  },

  // 跳转到打卡页面
  goToCheckin() {
    wx.switchTab({
      url: '/pages/checkin/checkin'
    })
  },

  // 加载更多
  loadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadActivities()
    }
  },

  // 获取活动类型名称
  getActivityTypeName(type) {
    const typeMap = {
      'checkin': '打卡',
      'comment': '评论',
      'like': '点赞',
      'follow': '关注'
    }
    return typeMap[type] || '动态'
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

  // 下拉刷新
  onPullDownRefresh() {
    this.refreshActivities()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  // 触底加载更多
  onReachBottom() {
    this.loadMore()
  },

  // 分享小程序
  onShareAppMessage() {
    return {
      title: '稻米广场 - 和稻米朋友们一起分享音乐心情',
      path: '/pages/square/square'
    }
  }
})
