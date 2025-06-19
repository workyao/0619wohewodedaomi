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
      case 'getSongs':
        return await getSongs(event)
      case 'getSongById':
        return await getSongById(event)
      case 'searchSongs':
        return await searchSongs(event)
      case 'getCategories':
        return await getCategories(event)
      case 'getRecommendSongs':
        return await getRecommendSongs(event)
      case 'getSongStats':
        return await getSongStats(event)
      default:
        return {
          success: false,
          error: '未知操作'
        }
    }
  } catch (error) {
    console.error('歌曲操作失败：', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 获取歌曲列表
async function getSongs(event) {
  const { category = 'all', page = 1, pageSize = 20 } = event
  
  let query = db.collection('songs')
  
  if (category !== 'all') {
    query = query.where({
      category: category
    })
  }
  
  const skip = (page - 1) * pageSize
  const result = await query
    .orderBy('id', 'asc')
    .skip(skip)
    .limit(pageSize)
    .get()
  
  // 获取总数
  const countResult = category === 'all' 
    ? await db.collection('songs').count()
    : await db.collection('songs').where({ category: category }).count()
  
  return {
    success: true,
    data: {
      songs: result.data,
      total: countResult.total,
      page: page,
      pageSize: pageSize,
      hasMore: skip + result.data.length < countResult.total
    }
  }
}

// 根据ID获取歌曲详情
async function getSongById(event) {
  const { songId } = event
  
  const result = await db.collection('songs').where({
    id: songId
  }).get()
  
  if (result.data.length === 0) {
    return {
      success: false,
      error: '歌曲不存在'
    }
  }
  
  const song = result.data[0]
  
  // 获取相关推荐歌曲（同专辑或同分类）
  const relatedSongs = await getRelatedSongs(song)
  
  return {
    success: true,
    data: {
      song: song,
      relatedSongs: relatedSongs
    }
  }
}

// 搜索歌曲
async function searchSongs(event) {
  const { keyword, page = 1, pageSize = 20 } = event
  
  if (!keyword) {
    return {
      success: false,
      error: '搜索关键词不能为空'
    }
  }
  
  const skip = (page - 1) * pageSize
  
  // 使用正则表达式进行模糊搜索
  const result = await db.collection('songs').where(
    _.or([
      {
        title: db.RegExp({
          regexp: keyword,
          options: 'i'
        })
      },
      {
        album: db.RegExp({
          regexp: keyword,
          options: 'i'
        })
      },
      {
        lyrics: db.RegExp({
          regexp: keyword,
          options: 'i'
        })
      }
    ])
  )
  .skip(skip)
  .limit(pageSize)
  .get()
  
  return {
    success: true,
    data: {
      songs: result.data,
      keyword: keyword,
      page: page,
      pageSize: pageSize,
      hasMore: result.data.length === pageSize
    }
  }
}

// 获取分类列表
async function getCategories(event) {
  const result = await db.collection('categories')
    .orderBy('order', 'asc')
    .get()
  
  return {
    success: true,
    data: result.data
  }
}

// 获取推荐歌曲
async function getRecommendSongs(event) {
  const { count = 5, userId } = event
  
  // 如果有用户ID，可以根据用户的听歌历史推荐
  // 这里简单实现：随机推荐热门歌曲
  const result = await db.collection('songs')
    .aggregate()
    .sample({
      size: count
    })
    .end()
  
  return {
    success: true,
    data: result.list
  }
}

// 获取歌曲统计信息
async function getSongStats(event) {
  const { songId } = event
  
  // 获取该歌曲的打卡次数
  const checkinCount = await db.collection('checkins')
    .where({
      'songs.id': songId
    })
    .count()
  
  // 获取收藏次数（需要实现收藏功能）
  const favoriteCount = await db.collection('favorites')
    .where({
      songId: songId
    })
    .count()
  
  // 模拟收听次数
  const listenCount = Math.floor(Math.random() * 1000) + 100
  
  return {
    success: true,
    data: {
      songId: songId,
      checkinCount: checkinCount.total,
      favoriteCount: favoriteCount.total,
      listenCount: listenCount
    }
  }
}

// 获取相关歌曲
async function getRelatedSongs(song) {
  // 优先推荐同专辑的歌曲
  let relatedSongs = await db.collection('songs')
    .where({
      album: song.album,
      id: _.neq(song.id)
    })
    .limit(3)
    .get()
  
  // 如果同专辑歌曲不够，补充同分类的歌曲
  if (relatedSongs.data.length < 3) {
    const additionalSongs = await db.collection('songs')
      .where({
        category: song.category,
        album: _.neq(song.album),
        id: _.neq(song.id)
      })
      .limit(3 - relatedSongs.data.length)
      .get()
    
    relatedSongs.data = relatedSongs.data.concat(additionalSongs.data)
  }
  
  return relatedSongs.data
}
