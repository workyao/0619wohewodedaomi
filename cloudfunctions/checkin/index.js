// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action } = event
  
  try {
    switch (action) {
      case 'submit':
        return await submitCheckin(event, wxContext)
      case 'getTodayCheckin':
        return await getTodayCheckin(event, wxContext)
      case 'getCheckinHistory':
        return await getCheckinHistory(event, wxContext)
      case 'getCheckinStats':
        return await getCheckinStats(event, wxContext)
      default:
        return {
          success: false,
          error: '未知操作'
        }
    }
  } catch (error) {
    console.error('打卡操作失败：', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 输入验证函数
function validateCheckinData(data) {
  const { songs, mood, note, date } = data

  // 验证必需字段
  if (!songs || !Array.isArray(songs) || songs.length === 0) {
    throw new Error('请至少选择一首歌曲')
  }

  if (songs.length > 10) {
    throw new Error('一次最多只能打卡10首歌曲')
  }

  // 验证歌曲数据格式
  for (const song of songs) {
    if (!song.id || !song.title) {
      throw new Error('歌曲数据格式错误')
    }
  }

  // 验证心情
  const validMoods = ['happy', 'peaceful', 'moved', 'nostalgic', 'excited']
  if (mood && !validMoods.includes(mood)) {
    throw new Error('心情参数无效')
  }

  // 验证备注长度
  if (note && note.length > 200) {
    throw new Error('备注内容不能超过200字')
  }

  // 验证日期格式
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('日期格式错误')
  }

  // 验证日期不能是未来
  const today = new Date().toISOString().split('T')[0]
  if (date > today) {
    throw new Error('不能为未来日期打卡')
  }

  return true
}

// 提交打卡
async function submitCheckin(event, wxContext) {
  const { songs, mood, note, date } = event
  const openid = wxContext.OPENID

  // 验证输入数据
  validateCheckinData(event)
  
  // 检查今日是否已打卡
  const existingCheckin = await db.collection('checkins').where({
    openid: openid,
    date: date
  }).get()
  
  if (existingCheckin.data.length > 0) {
    // 更新已有打卡记录
    await db.collection('checkins').doc(existingCheckin.data[0]._id).update({
      data: {
        songs: songs,
        mood: mood,
        note: note,
        updateTime: new Date()
      }
    })
  } else {
    // 创建新的打卡记录
    await db.collection('checkins').add({
      data: {
        openid: openid,
        date: date,
        songs: songs,
        mood: mood,
        note: note,
        createTime: new Date()
      }
    })
    
    // 更新用户统计数据
    await updateUserStats(openid, songs.length)
  }
  
  // 创建动态记录
  await createActivity(openid, 'checkin', {
    songsCount: songs.length,
    mood: mood,
    date: date
  })
  
  return {
    success: true,
    message: '打卡成功'
  }
}

// 获取今日打卡
async function getTodayCheckin(event, wxContext) {
  const { date } = event
  const openid = wxContext.OPENID
  
  const result = await db.collection('checkins').where({
    openid: openid,
    date: date
  }).get()
  
  return {
    success: true,
    data: result.data.length > 0 ? result.data[0] : null
  }
}

// 获取打卡历史
async function getCheckinHistory(event, wxContext) {
  const { startDate, endDate, limit = 30 } = event
  const openid = wxContext.OPENID
  
  let query = db.collection('checkins').where({
    openid: openid
  })
  
  if (startDate && endDate) {
    query = query.where({
      date: _.gte(startDate).and(_.lte(endDate))
    })
  }
  
  const result = await query
    .orderBy('date', 'desc')
    .limit(limit)
    .get()
  
  return {
    success: true,
    data: result.data
  }
}

// 获取打卡统计
async function getCheckinStats(event, wxContext) {
  const openid = wxContext.OPENID
  
  // 获取用户信息
  const userResult = await db.collection('users').where({
    openid: openid
  }).get()
  
  if (userResult.data.length === 0) {
    return {
      success: false,
      error: '用户不存在'
    }
  }
  
  const userData = userResult.data[0]
  
  // 计算连续打卡天数
  const checkinDays = await calculateStreakDays(openid)
  
  // 获取总打卡次数
  const totalCheckinsResult = await db.collection('checkins').where({
    openid: openid
  }).count()
  
  // 获取听过的歌曲总数
  const checkinHistory = await db.collection('checkins').where({
    openid: openid
  }).get()
  
  const allSongs = new Set()
  checkinHistory.data.forEach(checkin => {
    checkin.songs.forEach(song => {
      allSongs.add(song.id)
    })
  })
  
  return {
    success: true,
    data: {
      checkinDays: checkinDays,
      totalCheckins: totalCheckinsResult.total,
      totalSongs: allSongs.size,
      level: userData.level || 1,
      badges: userData.badges || []
    }
  }
}

// 更新用户统计数据
async function updateUserStats(openid, songsCount) {
  const userResult = await db.collection('users').where({
    openid: openid
  }).get()
  
  if (userResult.data.length > 0) {
    const userData = userResult.data[0]
    const checkinDays = await calculateStreakDays(openid)
    
    await db.collection('users').doc(userData._id).update({
      data: {
        checkinDays: checkinDays,
        totalCheckins: _.inc(1),
        lastCheckinTime: new Date()
      }
    })
  }
}

// 计算连续打卡天数
async function calculateStreakDays(openid) {
  const today = new Date()
  let streakDays = 0
  let currentDate = new Date(today)
  
  // 从今天开始往前查找连续打卡记录
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const checkinResult = await db.collection('checkins').where({
      openid: openid,
      date: dateStr
    }).get()
    
    if (checkinResult.data.length > 0) {
      streakDays++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
    
    // 防止无限循环，最多查找100天
    if (streakDays >= 100) {
      break
    }
  }
  
  return streakDays
}

// 创建动态记录
async function createActivity(openid, type, data) {
  // 获取用户信息
  const userResult = await db.collection('users').where({
    openid: openid
  }).get()
  
  if (userResult.data.length > 0) {
    const userData = userResult.data[0]
    
    let actionText = ''
    switch (type) {
      case 'checkin':
        actionText = `打卡了 ${data.songsCount} 首刀郎的歌`
        break
      default:
        actionText = '进行了一次操作'
    }
    
    await db.collection('activities').add({
      data: {
        openid: openid,
        userName: userData.nickName,
        userAvatar: userData.avatarUrl,
        type: type,
        action: actionText,
        data: data,
        createTime: new Date()
      }
    })
  }
}
