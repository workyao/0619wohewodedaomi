// 刀郎歌曲数据库
const songs = {
  // 经典老歌
  classic: [
    {
      id: 1,
      title: '2002年的第一场雪',
      album: '2002年的第一场雪',
      year: 2004,
      duration: '4:32',
      lyrics: '2002年的第一场雪\n比以往时候来的更晚一些\n停靠在八楼的二路汽车\n带走了最后一片飘落的黄叶...',
      category: 'classic'
    },
    {
      id: 2,
      title: '冲动的惩罚',
      album: '冲动的惩罚',
      year: 2004,
      duration: '4:18',
      lyrics: '都怪我\n冲动的惩罚\n我的心\n深深伤了你的心...',
      category: 'classic'
    },
    {
      id: 3,
      title: '西海情歌',
      album: '谢谢你',
      year: 2006,
      duration: '5:21',
      lyrics: '自你离开以后\n从此就丢了温柔\n等待在这雪山路漫长...',
      category: 'classic'
    },
    {
      id: 4,
      title: '新阿瓦尔古丽',
      album: '新阿瓦尔古丽',
      year: 2004,
      duration: '4:45',
      lyrics: '阿瓦尔古丽\n美丽的姑娘\n你的眼睛像星星一样明亮...',
      category: 'classic'
    },
    {
      id: 5,
      title: '手心里的温柔',
      album: '手心里的温柔',
      year: 2004,
      duration: '4:12',
      lyrics: '手心里的温柔\n是你给我的感受\n让我感动到现在...',
      category: 'classic'
    },
    {
      id: 6,
      title: '情人',
      album: '情人',
      year: 2004,
      duration: '4:28',
      lyrics: '亲爱的你慢慢飞\n小心前面带刺的玫瑰\n亲爱的你张张嘴...',
      category: 'classic'
    },
    {
      id: 7,
      title: '披着羊皮的狼',
      album: '披着羊皮的狼',
      year: 2004,
      duration: '3:58',
      lyrics: '你是披着羊皮的狼\n你的吻会让我受伤\n我不想在你的怀抱里流浪...',
      category: 'classic'
    },
    {
      id: 8,
      title: '谢谢你',
      album: '谢谢你',
      year: 2006,
      duration: '4:35',
      lyrics: '谢谢你给我的爱\n今生今世我不忘怀\n谢谢你给我的关怀...',
      category: 'classic'
    },
    {
      id: 9,
      title: '敖包相会',
      album: '敖包相会',
      year: 2005,
      duration: '4:20',
      lyrics: '十五的月亮升上了天空哟\n为什么旁边没有云彩\n我等待着美丽的姑娘呀...',
      category: 'classic'
    },
    {
      id: 10,
      title: '草原之夜',
      album: '草原之夜',
      year: 2005,
      duration: '3:58',
      lyrics: '美丽的夜色多沉静\n草原上只留下我的琴声\n想给远方的姑娘写封信...',
      category: 'classic'
    },
    {
      id: 11,
      title: '康定情歌',
      album: '康定情歌',
      year: 2005,
      duration: '4:12',
      lyrics: '跑马溜溜的山上\n一朵溜溜的云哟\n端端溜溜的照在\n康定溜溜的城哟...',
      category: 'classic'
    },
    {
      id: 12,
      title: '驼铃',
      album: '驼铃',
      year: 2005,
      duration: '4:45',
      lyrics: '送战友踏征程\n默默无语两眼泪\n耳边响起驼铃声\n路漫漫雾茫茫...',
      category: 'classic'
    }
  ],

  // 弹词话本
  tancihuaben: [
    {
      id: 101,
      title: '罗刹海市',
      album: '弹词话本',
      year: 2023,
      duration: '4:33',
      lyrics: '罗刹国向东两万六千里\n过七冲越焦海三寸的黄泥地\n只为那有一条一丈宽的河...',
      category: 'tancihuaben'
    },
    {
      id: 102,
      title: '花妖',
      album: '弹词话本',
      year: 2023,
      duration: '4:21',
      lyrics: '她说她是花妖\n来自桃花源\n专门迷惑那些痴情的男人...',
      category: 'tancihuaben'
    },
    {
      id: 103,
      title: '颠倒歌',
      album: '弹词话本',
      year: 2023,
      duration: '3:45',
      lyrics: '听我说\n颠倒歌\n蚂蚁踩死大象哥\n嘴说无凭要眼见...',
      category: 'tancihuaben'
    },
    {
      id: 104,
      title: '未来的主人翁',
      album: '弹词话本',
      year: 2023,
      duration: '4:12',
      lyrics: '未来的主人翁\n你们要记住\n这个世界是你们的...',
      category: 'tancihuaben'
    },
    {
      id: 105,
      title: '翩翩',
      album: '弹词话本',
      year: 2023,
      duration: '4:28',
      lyrics: '翩翩起舞的蝴蝶\n飞过了千山万水\n寻找着心中的花朵...',
      category: 'tancihuaben'
    },
    {
      id: 106,
      title: '搭搭飞',
      album: '弹词话本',
      year: 2023,
      duration: '3:52',
      lyrics: '搭搭飞\n搭搭飞\n飞到天边不回头...',
      category: 'tancihuaben'
    },
    {
      id: 107,
      title: '惊雷',
      album: '弹词话本',
      year: 2023,
      duration: '4:15',
      lyrics: '一声惊雷震天地\n唤醒了沉睡的心\n让我们重新站起来...',
      category: 'tancihuaben'
    }
  ],

  // 世间的每个人
  shijiandemeigeiren: [
    {
      id: 201,
      title: '世间的每个人',
      album: '世间的每个人',
      year: 2023,
      duration: '4:28',
      lyrics: '世间的每个人\n都有自己的故事\n有人欢喜有人愁...',
      category: 'shijiandemeigeiren'
    },
    {
      id: 202,
      title: '也许',
      album: '世间的每个人',
      year: 2023,
      duration: '4:15',
      lyrics: '也许明天\n也许今夜\n也许就在下一秒钟...',
      category: 'shijiandemeigeiren'
    }
  ],

  // 山歌廖哉
  shangeliaozai: [
    {
      id: 301,
      title: '山歌廖哉',
      album: '山歌廖哉',
      year: 2023,
      duration: '4:18',
      lyrics: '山歌廖哉\n唱不完的山歌\n道不尽的情怀...',
      category: 'shangeliaozai'
    }
  ]
}

// 分类信息
const categories = [
  {
    key: 'all',
    name: '全部歌曲',
    icon: '🎵'
  },
  {
    key: 'classic',
    name: '经典老歌',
    icon: '🎶'
  },
  {
    key: 'tancihuaben',
    name: '弹词话本',
    icon: '📖'
  },
  {
    key: 'shijiandemeigeiren',
    name: '世间的每个人',
    icon: '🌍'
  },
  {
    key: 'shangeliaozai',
    name: '山歌廖哉',
    icon: '🏔️'
  }
]

// 心情选项
const moods = [
  {
    value: 'happy',
    label: '开心',
    emoji: '😊'
  },
  {
    value: 'peaceful',
    label: '平静',
    emoji: '😌'
  },
  {
    value: 'moved',
    label: '感动',
    emoji: '🥺'
  },
  {
    value: 'nostalgic',
    label: '怀念',
    emoji: '😔'
  },
  {
    value: 'excited',
    label: '激动',
    emoji: '🤩'
  }
]

// 获取所有歌曲
function getAllSongs() {
  const allSongs = []
  Object.keys(songs).forEach(category => {
    allSongs.push(...songs[category])
  })
  return allSongs
}

// 根据分类获取歌曲
function getSongsByCategory(category) {
  if (category === 'all') {
    return getAllSongs()
  }
  return songs[category] || []
}

// 根据ID获取歌曲
function getSongById(id) {
  const allSongs = getAllSongs()
  return allSongs.find(song => song.id === id)
}

// 获取推荐歌曲
function getRecommendSongs(count = 3) {
  const allSongs = getAllSongs()
  const shuffled = allSongs.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

module.exports = {
  songs,
  categories,
  moods,
  getAllSongs,
  getSongsByCategory,
  getSongById,
  getRecommendSongs
}
