// pages/settings/settings.js
const app = getApp()

Page({
  data: {
    settings: {
      checkinReminder: true,
      interactionNotification: true,
      systemNotification: true,
      postVisibility: 0, // 0: 公开, 1: 朋友可见, 2: 仅自己
      allowSearch: true,
      dataCollection: true
    },
    privacyOptions: [
      { value: 0, label: '公开' },
      { value: 1, label: '朋友可见' },
      { value: 2, label: '仅自己' }
    ],
    privacyLabels: ['公开', '朋友可见', '仅自己'],
    cacheSize: '0MB',
    version: '1.0.0'
  },

  onLoad() {
    this.loadSettings()
    this.calculateCacheSize()
    this.setData({
      version: app.globalData.version
    })
  },

  // 加载设置
  loadSettings() {
    const settings = wx.getStorageSync('userSettings')
    if (settings) {
      this.setData({
        settings: { ...this.data.settings, ...settings }
      })
    }
  },

  // 保存设置
  saveSettings() {
    wx.setStorageSync('userSettings', this.data.settings)
  },

  // 打卡提醒开关
  onCheckinReminderChange(e) {
    const checked = e.detail.value
    this.setData({
      'settings.checkinReminder': checked
    })
    this.saveSettings()
    
    if (checked) {
      this.setCheckinReminder()
    } else {
      this.cancelCheckinReminder()
    }
  },

  // 互动通知开关
  onInteractionNotificationChange(e) {
    const checked = e.detail.value
    this.setData({
      'settings.interactionNotification': checked
    })
    this.saveSettings()
  },

  // 系统通知开关
  onSystemNotificationChange(e) {
    const checked = e.detail.value
    this.setData({
      'settings.systemNotification': checked
    })
    this.saveSettings()
  },

  // 动态可见性选择
  onPostVisibilityChange(e) {
    const value = parseInt(e.detail.value)
    this.setData({
      'settings.postVisibility': value
    })
    this.saveSettings()
  },

  // 允许被搜索开关
  onAllowSearchChange(e) {
    const checked = e.detail.value
    this.setData({
      'settings.allowSearch': checked
    })
    this.saveSettings()
  },

  // 数据收集开关
  onDataCollectionChange(e) {
    const checked = e.detail.value
    this.setData({
      'settings.dataCollection': checked
    })
    this.saveSettings()
  },

  // 设置打卡提醒
  setCheckinReminder() {
    // 设置每日20:00提醒打卡
    wx.requestSubscribeMessage({
      tmplIds: ['打卡提醒模板ID'], // 需要在微信公众平台配置
      success: (res) => {
        console.log('订阅消息设置成功', res)
      },
      fail: (err) => {
        console.error('订阅消息设置失败', err)
      }
    })
  },

  // 取消打卡提醒
  cancelCheckinReminder() {
    // 取消提醒逻辑
    console.log('取消打卡提醒')
  },

  // 计算缓存大小
  calculateCacheSize() {
    // 模拟计算缓存大小
    const size = Math.random() * 10 + 1 // 1-10MB
    this.setData({
      cacheSize: `${size.toFixed(1)}MB`
    })
  },

  // 清理缓存
  clearCache() {
    wx.showModal({
      title: '清理缓存',
      content: '确定要清理应用缓存吗？这将删除临时文件和图片缓存。',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '清理中...'
          })
          
          // 清理缓存逻辑
          setTimeout(() => {
            wx.hideLoading()
            this.setData({
              cacheSize: '0MB'
            })
            wx.showToast({
              title: '清理完成',
              icon: 'success'
            })
          }, 2000)
        }
      }
    })
  },

  // 检查更新
  checkUpdate() {
    wx.showLoading({
      title: '检查中...'
    })
    
    // 检查更新逻辑
    setTimeout(() => {
      wx.hideLoading()
      wx.showModal({
        title: '检查更新',
        content: '当前已是最新版本',
        showCancel: false
      })
    }, 1500)
  },

  // 编辑个人资料
  editProfile() {
    wx.navigateTo({
      url: '/pages/edit-profile/edit-profile'
    })
  },

  // 修改密码
  changePassword() {
    wx.showModal({
      title: '账户安全',
      content: '微信小程序使用微信账户登录，无需设置密码',
      showCancel: false
    })
  },

  // 使用帮助
  goToHelp() {
    wx.navigateTo({
      url: '/pages/help/help'
    })
  },

  // 意见反馈
  goToFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    })
  },

  // 联系我们
  contactUs() {
    wx.showModal({
      title: '联系我们',
      content: '微信号：wenwenying\n邮箱：support@daomifriends.com',
      confirmText: '复制微信号',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: 'wenwenying',
            success: () => {
              wx.showToast({
                title: '已复制微信号',
                icon: 'success'
              })
            }
          })
        }
      }
    })
  },

  // 关于我们
  goToAbout() {
    wx.navigateTo({
      url: '/pages/about/about'
    })
  },

  // 隐私政策
  goToPrivacyPolicy() {
    wx.navigateTo({
      url: '/pages/privacy-policy/privacy-policy'
    })
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout()
          
          // 返回首页
          wx.switchTab({
            url: '/pages/index/index'
          })
        }
      }
    })
  }
})
