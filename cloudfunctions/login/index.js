// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    // 查询用户是否已存在
    const userResult = await db.collection('users').where({
      openid: wxContext.OPENID
    }).get()
    
    let userData = null
    
    if (userResult.data.length === 0) {
      // 新用户，创建用户记录
      const createResult = await db.collection('users').add({
        data: {
          openid: wxContext.OPENID,
          nickName: event.nickName || '稻米用户',
          avatarUrl: event.avatarUrl || '',
          gender: event.gender || 0,
          city: event.city || '',
          province: event.province || '',
          country: event.country || '',
          createTime: new Date(),
          lastLoginTime: new Date(),
          checkinDays: 0,
          totalCheckins: 0,
          totalSongs: 0,
          level: 1,
          badges: [],
          friendsCount: 0,
          isActive: true
        }
      })
      
      userData = {
        _id: createResult._id,
        openid: wxContext.OPENID,
        nickName: event.nickName || '稻米用户',
        avatarUrl: event.avatarUrl || '',
        checkinDays: 0,
        totalCheckins: 0,
        totalSongs: 0,
        level: 1,
        badges: [],
        friendsCount: 0
      }
    } else {
      // 老用户，更新登录时间
      userData = userResult.data[0]
      await db.collection('users').doc(userData._id).update({
        data: {
          lastLoginTime: new Date(),
          nickName: event.nickName || userData.nickName,
          avatarUrl: event.avatarUrl || userData.avatarUrl
        }
      })
    }
    
    return {
      success: true,
      data: userData,
      openid: wxContext.OPENID,
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID
    }
  } catch (error) {
    console.error('登录失败：', error)
    return {
      success: false,
      error: error.message
    }
  }
}
