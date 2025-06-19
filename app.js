// app.js
App({
  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'cloud1-7gg3gi2d0e2effe2', // 云环境ID
        traceUser: true,
      })
    }

    // 检查用户登录状态
    this.checkLoginStatus()
  },

  onShow() {
    // 小程序显示时的处理
  },

  onHide() {
    // 小程序隐藏时的处理
  },

  onError(msg) {
    console.error('小程序发生错误：', msg)
  },

  // 检查用户登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
      this.globalData.isLoggedIn = true
    } else {
      this.globalData.isLoggedIn = false
    }
  },

  // 用户登录
  login() {
    return new Promise((resolve, reject) => {
      // 先获取用户授权
      wx.getUserProfile({
        desc: '用于完善会员资料',
        success: (res) => {
          const userInfo = res.userInfo

          // 调用云函数进行登录
          wx.cloud.callFunction({
            name: 'login',
            data: {
              nickName: userInfo.nickName,
              avatarUrl: userInfo.avatarUrl,
              gender: userInfo.gender,
              city: userInfo.city,
              province: userInfo.province,
              country: userInfo.country
            }
          }).then(loginRes => {
            if (loginRes.result.success) {
              this.globalData.userInfo = userInfo
              this.globalData.isLoggedIn = true
              this.globalData.openid = loginRes.result.openid

              // 保存用户信息到本地存储
              wx.setStorageSync('userInfo', userInfo)
              wx.setStorageSync('openid', loginRes.result.openid)

              resolve(userInfo)
            } else {
              reject(new Error(loginRes.result.error || '登录失败'))
            }
          }).catch(err => {
            console.error('云函数登录失败：', err)
            reject(err)
          })
        },
        fail: (err) => {
          console.error('获取用户信息失败：', err)
          reject(err)
        }
      })
    })
  },

  // 退出登录
  logout() {
    this.globalData.userInfo = null
    this.globalData.isLoggedIn = false
    this.globalData.openid = null

    // 清除本地存储
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('openid')

    wx.showToast({
      title: '已退出登录',
      icon: 'success'
    })
  },

  // 获取用户信息
  getUserInfo() {
    return new Promise((resolve, reject) => {
      if (this.globalData.isLoggedIn && this.globalData.userInfo) {
        resolve(this.globalData.userInfo)
      } else {
        // 尝试从本地存储获取
        const userInfo = wx.getStorageSync('userInfo')
        const openid = wx.getStorageSync('openid')

        if (userInfo && openid) {
          this.globalData.userInfo = userInfo
          this.globalData.isLoggedIn = true
          this.globalData.openid = openid
          resolve(userInfo)
        } else {
          reject(new Error('用户未登录'))
        }
      }
    })
  },

  // 全局数据
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    openid: null,
    currentDate: new Date().toISOString().split('T')[0], // 当前日期 YYYY-MM-DD
    version: '1.0.0',
    env: 'development' // development, production
  }
})
