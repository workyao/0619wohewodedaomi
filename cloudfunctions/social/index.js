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
      case 'getActivities':
        return await getActivities(event, wxContext)
      case 'toggleLike':
        return await toggleLike(event, wxContext)
      case 'addComment':
        return await addComment(event, wxContext)
      case 'getComments':
        return await getComments(event, wxContext)
      case 'followUser':
        return await followUser(event, wxContext)
      case 'unfollowUser':
        return await unfollowUser(event, wxContext)
      case 'getFollowing':
        return await getFollowing(event, wxContext)
      case 'getFollowers':
        return await getFollowers(event, wxContext)
      case 'recordShare':
        return await recordShare(event, wxContext)
      default:
        return {
          success: false,
          error: '未知操作'
        }
    }
  } catch (error) {
    console.error('社交操作失败：', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 获取动态列表
async function getActivities(event, wxContext) {
  const { filter = 'all', keyword = '', page = 1, pageSize = 10 } = event
  const openid = wxContext.OPENID
  
  let query = db.collection('activities')
  
  // 根据筛选条件构建查询
  switch (filter) {
    case 'checkin':
      query = query.where({ type: 'checkin' })
      break
    case 'following':
      // 获取用户关注的人的动态
      const followingResult = await db.collection('follows')
        .where({ followerOpenid: openid })
        .get()
      
      if (followingResult.data.length > 0) {
        const followingOpenids = followingResult.data.map(item => item.followingOpenid)
        query = query.where({
          openid: _.in(followingOpenids)
        })
      } else {
        // 如果没有关注任何人，返回空结果
        return {
          success: true,
          data: {
            activities: [],
            hasMore: false
          }
        }
      }
      break
    case 'hot':
      // 热门动态：按点赞数排序
      query = query.orderBy('likesCount', 'desc')
      break
    default:
      // 全部动态，按时间排序
      query = query.orderBy('createTime', 'desc')
  }
  
  // 关键词搜索
  if (keyword) {
    query = query.where({
      $or: [
        {
          'data.note': db.RegExp({
            regexp: keyword,
            options: 'i'
          })
        },
        {
          userName: db.RegExp({
            regexp: keyword,
            options: 'i'
          })
        }
      ]
    })
  }
  
  const skip = (page - 1) * pageSize
  const result = await query
    .skip(skip)
    .limit(pageSize + 1) // 多查询一条用于判断是否还有更多
    .get()
  
  const activities = result.data.slice(0, pageSize)
  const hasMore = result.data.length > pageSize
  
  // 为每个动态添加点赞状态
  const activitiesWithLikeStatus = await Promise.all(
    activities.map(async (activity) => {
      const likeResult = await db.collection('likes')
        .where({
          activityId: activity._id,
          openid: openid
        })
        .count()
      
      return {
        ...activity,
        id: activity._id,
        isLiked: likeResult.total > 0
      }
    })
  )
  
  return {
    success: true,
    data: {
      activities: activitiesWithLikeStatus,
      hasMore: hasMore
    }
  }
}

// 点赞/取消点赞
async function toggleLike(event, wxContext) {
  const { activityId, isLiked } = event
  const openid = wxContext.OPENID
  
  if (isLiked) {
    // 取消点赞
    await db.collection('likes')
      .where({
        activityId: activityId,
        openid: openid
      })
      .remove()
    
    // 减少点赞数
    await db.collection('activities')
      .doc(activityId)
      .update({
        data: {
          likesCount: _.inc(-1)
        }
      })
  } else {
    // 添加点赞
    await db.collection('likes').add({
      data: {
        activityId: activityId,
        openid: openid,
        createTime: new Date()
      }
    })
    
    // 增加点赞数
    await db.collection('activities')
      .doc(activityId)
      .update({
        data: {
          likesCount: _.inc(1)
        }
      })
  }
  
  return {
    success: true,
    message: isLiked ? '取消点赞成功' : '点赞成功'
  }
}

// 添加评论
async function addComment(event, wxContext) {
  const { activityId, content } = event
  const openid = wxContext.OPENID
  
  // 获取用户信息
  const userResult = await db.collection('users')
    .where({ openid: openid })
    .get()
  
  if (userResult.data.length === 0) {
    return {
      success: false,
      error: '用户不存在'
    }
  }
  
  const userData = userResult.data[0]
  
  // 添加评论
  const commentResult = await db.collection('comments').add({
    data: {
      activityId: activityId,
      openid: openid,
      userName: userData.nickName,
      userAvatar: userData.avatarUrl,
      content: content,
      createTime: new Date()
    }
  })
  
  // 增加评论数
  await db.collection('activities')
    .doc(activityId)
    .update({
      data: {
        commentsCount: _.inc(1)
      }
    })
  
  return {
    success: true,
    data: {
      commentId: commentResult._id
    }
  }
}

// 获取评论列表
async function getComments(event, wxContext) {
  const { activityId, page = 1, pageSize = 20 } = event
  
  const skip = (page - 1) * pageSize
  const result = await db.collection('comments')
    .where({ activityId: activityId })
    .orderBy('createTime', 'desc')
    .skip(skip)
    .limit(pageSize + 1)
    .get()
  
  const comments = result.data.slice(0, pageSize)
  const hasMore = result.data.length > pageSize
  
  return {
    success: true,
    data: {
      comments: comments,
      hasMore: hasMore
    }
  }
}

// 关注用户
async function followUser(event, wxContext) {
  const { targetOpenid } = event
  const openid = wxContext.OPENID
  
  if (openid === targetOpenid) {
    return {
      success: false,
      error: '不能关注自己'
    }
  }
  
  // 检查是否已经关注
  const existingFollow = await db.collection('follows')
    .where({
      followerOpenid: openid,
      followingOpenid: targetOpenid
    })
    .get()
  
  if (existingFollow.data.length > 0) {
    return {
      success: false,
      error: '已经关注过了'
    }
  }
  
  // 添加关注关系
  await db.collection('follows').add({
    data: {
      followerOpenid: openid,
      followingOpenid: targetOpenid,
      createTime: new Date()
    }
  })
  
  // 更新用户的关注数和粉丝数
  await db.collection('users')
    .where({ openid: openid })
    .update({
      data: {
        followingCount: _.inc(1)
      }
    })
  
  await db.collection('users')
    .where({ openid: targetOpenid })
    .update({
      data: {
        followersCount: _.inc(1)
      }
    })
  
  return {
    success: true,
    message: '关注成功'
  }
}

// 取消关注
async function unfollowUser(event, wxContext) {
  const { targetOpenid } = event
  const openid = wxContext.OPENID
  
  // 删除关注关系
  await db.collection('follows')
    .where({
      followerOpenid: openid,
      followingOpenid: targetOpenid
    })
    .remove()
  
  // 更新用户的关注数和粉丝数
  await db.collection('users')
    .where({ openid: openid })
    .update({
      data: {
        followingCount: _.inc(-1)
      }
    })
  
  await db.collection('users')
    .where({ openid: targetOpenid })
    .update({
      data: {
        followersCount: _.inc(-1)
      }
    })
  
  return {
    success: true,
    message: '取消关注成功'
  }
}

// 记录分享
async function recordShare(event, wxContext) {
  const { activityId, shareType } = event
  const openid = wxContext.OPENID
  
  // 记录分享行为
  await db.collection('shares').add({
    data: {
      activityId: activityId,
      openid: openid,
      shareType: shareType,
      createTime: new Date()
    }
  })
  
  // 增加分享数
  await db.collection('activities')
    .doc(activityId)
    .update({
      data: {
        sharesCount: _.inc(1)
      }
    })
  
  return {
    success: true,
    message: '分享记录成功'
  }
}
