// pages/friends/friends.js
const app = getApp()
const { getTimeAgo } = require('../../utils/util.js')

Page({
  data: {
    // 统计数据
    followingCount: 0,
    followersCount: 0,
    mutualFriendsCount: 0,
    
    // 搜索
    searchKeyword: '',
    
    // 标签页
    currentTab: 'following',
    tabs: [
      { key: 'following', name: '关注', count: 0 },
      { key: 'followers', name: '粉丝', count: 0 },
      { key: 'mutual', name: '互关', count: 0 },
      { key: 'search', name: '搜索', count: 0 }
    ],
    
    // 朋友列表
    currentFriends: [],
    allFriends: {
      following: [],
      followers: [],
      mutual: [],
      search: []
    },
    
    // 推荐朋友
    recommendFriends: [],
    
    // 状态
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 20,
    
    // 空状态
    emptyStateIcon: '👥',
    emptyStateText: '还没有关注任何人',
    emptyStateDesc: '去广场看看，关注感兴趣的稻米朋友吧',
    
    // 用户openid
    userOpenid: ''
  },

  onLoad() {
    this.initPage()
  },

  onShow() {
    this.loadFriendsData()
  },

  // 初始化页面
  initPage() {
    if (!app.globalData.isLoggedIn) {
      wx.showModal({
        title: '提示',
        content: '请先登录后查看朋友列表',
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

    this.setData({
      userOpenid: app.globalData.openid
    })

    this.loadUserStats()
    this.loadFriendsData()
    this.loadRecommendFriends()
  },

  // 加载用户统计
  loadUserStats() {
    // 模拟数据，实际应该从云函数获取
    this.setData({
      followingCount: 12,
      followersCount: 8,
      mutualFriendsCount: 5
    })

    // 更新标签页计数
    const updatedTabs = this.data.tabs.map(tab => {
      switch (tab.key) {
        case 'following':
          return { ...tab, count: this.data.followingCount }
        case 'followers':
          return { ...tab, count: this.data.followersCount }
        case 'mutual':
          return { ...tab, count: this.data.mutualFriendsCount }
        default:
          return tab
      }
    })

    this.setData({
      tabs: updatedTabs
    })
  },

  // 加载朋友数据
  loadFriendsData() {
    this.setData({
      loading: true
    })

    // 模拟朋友数据
    const mockFriends = {
      following: [
        {
          openid: 'user1',
          nickName: '音乐爱好者小王',
          avatarUrl: '/images/default-avatar.png',
          desc: '每天都要听刀郎的歌',
          checkinDays: 15,
          level: 2,
          isFollowing: true,
          isFollower: false
        },
        {
          openid: 'user2',
          nickName: '西域音乐迷',
          avatarUrl: '/images/default-avatar.png',
          desc: '刀郎的音乐让我找到了心灵的归宿',
          checkinDays: 32,
          level: 3,
          isFollowing: true,
          isFollower: true
        }
      ],
      followers: [
        {
          openid: 'user3',
          nickName: '稻米小粉丝',
          avatarUrl: '/images/default-avatar.png',
          desc: '新来的稻米，请多关照',
          checkinDays: 3,
          level: 1,
          isFollowing: false,
          isFollower: true
        }
      ],
      mutual: [
        {
          openid: 'user2',
          nickName: '西域音乐迷',
          avatarUrl: '/images/default-avatar.png',
          desc: '刀郎的音乐让我找到了心灵的归宿',
          checkinDays: 32,
          level: 3,
          isFollowing: true,
          isFollower: true
        }
      ],
      search: []
    }

    this.setData({
      allFriends: mockFriends,
      currentFriends: mockFriends[this.data.currentTab],
      loading: false
    })
  },

  // 加载推荐朋友
  loadRecommendFriends() {
    const recommendUsers = [
      {
        openid: 'rec1',
        nickName: '刀郎铁粉',
        avatarUrl: '/images/default-avatar.png',
        reason: '连续打卡30天'
      },
      {
        openid: 'rec2',
        nickName: '音乐达人',
        avatarUrl: '/images/default-avatar.png',
        reason: '听过所有专辑'
      }
    ]

    this.setData({
      recommendFriends: recommendUsers
    })
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },

  // 执行搜索
  onSearch() {
    if (!this.data.searchKeyword.trim()) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      })
      return
    }

    this.setData({
      currentTab: 'search',
      loading: true
    })

    // 模拟搜索结果
    setTimeout(() => {
      const searchResults = [
        {
          openid: 'search1',
          nickName: this.data.searchKeyword + '相关用户',
          avatarUrl: '/images/default-avatar.png',
          desc: '搜索到的用户',
          checkinDays: 10,
          level: 2,
          isFollowing: false,
          isFollower: false
        }
      ]

      this.setData({
        'allFriends.search': searchResults,
        currentFriends: searchResults,
        loading: false
      })
    }, 1000)
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: tab,
      currentFriends: this.data.allFriends[tab]
    })

    this.updateEmptyState(tab)
  },

  // 更新空状态
  updateEmptyState(tab) {
    let emptyStateIcon = '👥'
    let emptyStateText = '暂无数据'
    let emptyStateDesc = ''

    switch (tab) {
      case 'following':
        emptyStateIcon = '👥'
        emptyStateText = '还没有关注任何人'
        emptyStateDesc = '去广场看看，关注感兴趣的稻米朋友吧'
        break
      case 'followers':
        emptyStateIcon = '👤'
        emptyStateText = '还没有粉丝'
        emptyStateDesc = '多参与互动，会有更多朋友关注你'
        break
      case 'mutual':
        emptyStateIcon = '💕'
        emptyStateText = '还没有互关好友'
        emptyStateDesc = '互相关注的朋友会显示在这里'
        break
      case 'search':
        emptyStateIcon = '🔍'
        emptyStateText = '没有找到相关用户'
        emptyStateDesc = '试试其他关键词'
        break
    }

    this.setData({
      emptyStateIcon,
      emptyStateText,
      emptyStateDesc
    })
  },

  // 切换关注状态
  toggleFollow(e) {
    const friend = e.currentTarget.dataset.friend
    const isFollowing = friend.isFollowing

    // 更新本地状态
    const updatedFriends = this.data.currentFriends.map(item => {
      if (item.openid === friend.openid) {
        return {
          ...item,
          isFollowing: !isFollowing
        }
      }
      return item
    })

    this.setData({
      currentFriends: updatedFriends
    })

    wx.showToast({
      title: isFollowing ? '已取消关注' : '关注成功',
      icon: 'success'
    })
  },

  // 开始私聊
  startChat(e) {
    const friend = e.currentTarget.dataset.friend
    wx.showModal({
      title: '私聊功能',
      content: `即将开启与 ${friend.nickName} 的私聊`,
      showCancel: false
    })
  },

  // 显示更多操作
  showMoreActions(e) {
    const friend = e.currentTarget.dataset.friend
    wx.showActionSheet({
      itemList: ['查看资料', '举报用户'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.viewProfile(friend)
            break
          case 1:
            this.reportUser(friend)
            break
        }
      }
    })
  },

  // 查看用户资料
  viewProfile(friend) {
    wx.navigateTo({
      url: `/pages/user-profile/user-profile?openid=${friend.openid}`
    })
  },

  // 举报用户
  reportUser(friend) {
    wx.showModal({
      title: '举报用户',
      content: '确定要举报这个用户吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '举报已提交',
            icon: 'success'
          })
        }
      }
    })
  },

  // 关注推荐用户
  followRecommendUser(e) {
    const user = e.currentTarget.dataset.user
    wx.showToast({
      title: `已关注 ${user.nickName}`,
      icon: 'success'
    })
  },

  // 显示关注列表
  showFollowing() {
    this.setData({
      currentTab: 'following',
      currentFriends: this.data.allFriends.following
    })
  },

  // 显示粉丝列表
  showFollowers() {
    this.setData({
      currentTab: 'followers',
      currentFriends: this.data.allFriends.followers
    })
  },

  // 显示互关好友
  showMutualFriends() {
    this.setData({
      currentTab: 'mutual',
      currentFriends: this.data.allFriends.mutual
    })
  },

  // 跳转到广场
  goToSquare() {
    wx.switchTab({
      url: '/pages/square/square'
    })
  },

  // 加载更多
  loadMore() {
    if (this.data.hasMore && !this.data.loading) {
      // 实际项目中这里应该调用云函数加载更多数据
      wx.showToast({
        title: '没有更多数据了',
        icon: 'none'
      })
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadUserStats()
    this.loadFriendsData()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  // 触底加载更多
  onReachBottom() {
    this.loadMore()
  }
})
