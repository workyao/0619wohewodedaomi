// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 刀郎歌曲数据
const songsData = [
  // 经典老歌
  {
    id: 1,
    title: '2002年的第一场雪',
    album: '2002年的第一场雪',
    year: 2004,
    duration: '4:32',
    lyrics: '2002年的第一场雪\n比以往时候来的更晚一些\n停靠在八楼的二路汽车\n带走了最后一片飘落的黄叶\n我怀着烦乱的心情\n走进了网络\n你的聊天室里\n我放任了自己\n也许你永远都不会知道\n我可以为了你\n而放弃一切\n2002年的第一场雪\n是留在乌鲁木齐难舍的情结\n你像一只飞来飞去的蝴蝶\n在白雪飘飞的季节里摇曳\n你像一只飞来飞去的蝴蝶\n在白雪飘飞的季节里摇曳',
    category: 'classic',
    createTime: new Date()
  },
  {
    id: 2,
    title: '冲动的惩罚',
    album: '冲动的惩罚',
    year: 2004,
    duration: '4:18',
    lyrics: '都怪我\n冲动的惩罚\n我的心\n深深伤了你的心\n你流泪的样子\n我永远不能忘记\n是我太冲动\n伤害了你的心\n对不起\n我的爱人\n请你原谅我的冲动\n我愿意用一生\n来弥补我的过错',
    category: 'classic',
    createTime: new Date()
  },
  {
    id: 3,
    title: '西海情歌',
    album: '谢谢你',
    year: 2006,
    duration: '5:21',
    lyrics: '自你离开以后\n从此就丢了温柔\n等待在这雪山路漫长\n听寒风呼啸依旧\n看雪花飞舞依旧\n我的眼泪不停的流\n是谁带走了你\n是谁夺走了爱\n为何你不回头\n看我心如刀割\n痛苦中我呼唤着你\n你听见了吗\n我的爱人\n西海情歌为你唱\n愿你能听见',
    category: 'classic',
    createTime: new Date()
  },
  // 弹词话本
  {
    id: 101,
    title: '罗刹海市',
    album: '弹词话本',
    year: 2023,
    duration: '4:33',
    lyrics: '罗刹国向东两万六千里\n过七冲越焦海三寸的黄泥地\n只为那有一条一丈宽的河\n河水流向那遥远的地方\n那里有美丽的罗刹海市\n住着善良的罗刹国人\n他们的脸长在了后脑勺上\n却有着最美丽的心灵',
    category: 'tancihuaben',
    createTime: new Date()
  },
  {
    id: 102,
    title: '花妖',
    album: '弹词话本',
    year: 2023,
    duration: '4:21',
    lyrics: '她说她是花妖\n来自桃花源\n专门迷惑那些痴情的男人\n她的美貌如花\n她的心如蛇蝎\n让多少男人为她神魂颠倒\n可是我不怕\n因为我的心\n早已被另一个人占据',
    category: 'tancihuaben',
    createTime: new Date()
  }
]

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action } = event
  
  try {
    switch (action) {
      case 'initSongs':
        return await initSongs()
      case 'initCategories':
        return await initCategories()
      case 'initAll':
        const songsResult = await initSongs()
        const categoriesResult = await initCategories()
        return {
          success: true,
          data: {
            songs: songsResult,
            categories: categoriesResult
          }
        }
      default:
        return {
          success: false,
          error: '未知操作'
        }
    }
  } catch (error) {
    console.error('数据初始化失败：', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 初始化歌曲数据
async function initSongs() {
  const songs = db.collection('songs')
  
  // 检查是否已经初始化
  const existingSongs = await songs.count()
  if (existingSongs.total > 0) {
    return {
      success: true,
      message: '歌曲数据已存在，跳过初始化',
      count: existingSongs.total
    }
  }
  
  // 批量添加歌曲
  const batchSize = 20
  const results = []
  
  for (let i = 0; i < songsData.length; i += batchSize) {
    const batch = songsData.slice(i, i + batchSize)
    const batchResult = await songs.add({
      data: batch
    })
    results.push(batchResult)
  }
  
  return {
    success: true,
    message: '歌曲数据初始化成功',
    count: songsData.length,
    results: results
  }
}

// 初始化分类数据
async function initCategories() {
  const categories = db.collection('categories')
  
  const categoriesData = [
    {
      key: 'all',
      name: '全部歌曲',
      icon: '🎵',
      order: 0,
      createTime: new Date()
    },
    {
      key: 'classic',
      name: '经典老歌',
      icon: '🎶',
      order: 1,
      createTime: new Date()
    },
    {
      key: 'tancihuaben',
      name: '弹词话本',
      icon: '📖',
      order: 2,
      createTime: new Date()
    },
    {
      key: 'shijiandemeigeiren',
      name: '世间的每个人',
      icon: '🌍',
      order: 3,
      createTime: new Date()
    },
    {
      key: 'shangeliaozai',
      name: '山歌廖哉',
      icon: '🏔️',
      order: 4,
      createTime: new Date()
    }
  ]
  
  // 检查是否已经初始化
  const existingCategories = await categories.count()
  if (existingCategories.total > 0) {
    return {
      success: true,
      message: '分类数据已存在，跳过初始化',
      count: existingCategories.total
    }
  }
  
  // 批量添加分类
  const result = await categories.add({
    data: categoriesData
  })
  
  return {
    success: true,
    message: '分类数据初始化成功',
    count: categoriesData.length,
    result: result
  }
}
