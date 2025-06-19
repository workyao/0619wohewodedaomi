// pages/calendar/calendar.js
const app = getApp()
const { formatTime, getTimeAgo } = require('../../utils/util.js')

Page({
  data: {
    // 统计数据
    totalCheckins: 0,
    currentStreak: 0,
    thisMonthCheckins: 0,
    checkinRate: 0,
    
    // 日历相关
    currentYear: 2024,
    currentMonth: 1,
    isCurrentMonth: true,
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    calendarDays: [],
    
    // 选中日期
    selectedDay: null,
    
    // 趋势分析
    trendPeriod: '7天',
    trendPeriods: ['7天', '30天', '90天'],
    
    // 成就里程碑
    milestones: [
      {
        id: 1,
        title: '初来乍到',
        desc: '完成第一次打卡',
        icon: '🌱',
        target: 1,
        current: 0,
        achieved: false,
        progress: 0
      },
      {
        id: 2,
        title: '坚持一周',
        desc: '连续打卡7天',
        icon: '💪',
        target: 7,
        current: 0,
        achieved: false,
        progress: 0
      },
      {
        id: 3,
        title: '月度达人',
        desc: '单月打卡20天',
        icon: '🏆',
        target: 20,
        current: 0,
        achieved: false,
        progress: 0
      },
      {
        id: 4,
        title: '百日坚持',
        desc: '累计打卡100天',
        icon: '👑',
        target: 100,
        current: 0,
        achieved: false,
        progress: 0
      }
    ]
  },

  onLoad() {
    this.initCalendar()
    this.loadUserStats()
    this.loadCheckinData()
  },

  onShow() {
    this.loadUserStats()
    this.loadCheckinData()
  },

  // 初始化日历
  initCalendar() {
    const now = new Date()
    this.setData({
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1,
      isCurrentMonth: true
    })
    this.generateCalendar()
  },

  // 生成日历数据
  generateCalendar() {
    const { currentYear, currentMonth } = this.data
    const firstDay = new Date(currentYear, currentMonth - 1, 1)
    const lastDay = new Date(currentYear, currentMonth, 0)
    const firstDayWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    
    const calendarDays = []
    
    // 添加上个月的日期
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear
    const prevMonthLastDay = new Date(prevYear, prevMonth, 0).getDate()
    
    for (let i = firstDayWeek - 1; i >= 0; i--) {
      calendarDays.push({
        day: prevMonthLastDay - i,
        date: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(prevMonthLastDay - i).padStart(2, '0')}`,
        isCurrentMonth: false,
        isToday: false,
        hasCheckin: false
      })
    }
    
    // 添加当前月的日期
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const isToday = dateStr === todayStr
      
      calendarDays.push({
        day: day,
        date: dateStr,
        dateStr: this.formatDateStr(new Date(currentYear, currentMonth - 1, day)),
        isCurrentMonth: true,
        isToday: isToday,
        hasCheckin: false,
        checkinData: null
      })
    }
    
    // 添加下个月的日期（补齐6行）
    const remainingDays = 42 - calendarDays.length
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear
    
    for (let day = 1; day <= remainingDays; day++) {
      calendarDays.push({
        day: day,
        date: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        isCurrentMonth: false,
        isToday: false,
        hasCheckin: false
      })
    }
    
    this.setData({
      calendarDays: calendarDays
    })
  },

  // 加载用户统计数据
  loadUserStats() {
    wx.cloud.callFunction({
      name: 'checkin',
      data: {
        action: 'getCheckinStats'
      }
    }).then(res => {
      if (res.result.success) {
        const data = res.result.data
        this.setData({
          totalCheckins: data.totalCheckins || 0,
          currentStreak: data.checkinDays || 0
        })
        
        // 更新里程碑进度
        this.updateMilestones(data)
      }
    }).catch(err => {
      console.error('获取用户统计失败：', err)
    })
  },

  // 加载打卡数据
  loadCheckinData() {
    const { currentYear, currentMonth } = this.data
    const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`
    const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`
    
    wx.cloud.callFunction({
      name: 'checkin',
      data: {
        action: 'getCheckinHistory',
        startDate: startDate,
        endDate: endDate,
        limit: 50
      }
    }).then(res => {
      if (res.result.success) {
        const checkinData = res.result.data
        this.updateCalendarWithCheckins(checkinData)
        this.calculateMonthStats(checkinData)
      }
    }).catch(err => {
      console.error('获取打卡数据失败：', err)
    })
  },

  // 更新日历显示打卡数据
  updateCalendarWithCheckins(checkinData) {
    const checkinMap = {}
    checkinData.forEach(checkin => {
      checkinMap[checkin.date] = {
        ...checkin,
        timeStr: formatTime(new Date(checkin.createTime), 'HH:mm'),
        moodEmoji: this.getMoodEmoji(checkin.mood),
        moodText: this.getMoodText(checkin.mood)
      }
    })
    
    const updatedCalendarDays = this.data.calendarDays.map(day => {
      if (day.isCurrentMonth && checkinMap[day.date]) {
        return {
          ...day,
          hasCheckin: true,
          checkinData: checkinMap[day.date]
        }
      }
      return day
    })
    
    this.setData({
      calendarDays: updatedCalendarDays
    })
  },

  // 计算本月统计
  calculateMonthStats(checkinData) {
    const thisMonthCheckins = checkinData.length
    const daysInMonth = new Date(this.data.currentYear, this.data.currentMonth, 0).getDate()
    const checkinRate = Math.round((thisMonthCheckins / daysInMonth) * 100)
    
    this.setData({
      thisMonthCheckins: thisMonthCheckins,
      checkinRate: checkinRate
    })
  },

  // 更新里程碑进度
  updateMilestones(statsData) {
    const updatedMilestones = this.data.milestones.map(milestone => {
      let current = 0
      let achieved = false
      
      switch (milestone.id) {
        case 1: // 第一次打卡
          current = statsData.totalCheckins > 0 ? 1 : 0
          achieved = current >= milestone.target
          break
        case 2: // 连续7天
          current = Math.min(statsData.checkinDays || 0, milestone.target)
          achieved = current >= milestone.target
          break
        case 3: // 单月20天
          current = Math.min(this.data.thisMonthCheckins, milestone.target)
          achieved = current >= milestone.target
          break
        case 4: // 累计100天
          current = Math.min(statsData.totalCheckins || 0, milestone.target)
          achieved = current >= milestone.target
          break
      }
      
      const progress = Math.round((current / milestone.target) * 100)
      
      return {
        ...milestone,
        current: current,
        achieved: achieved,
        progress: progress
      }
    })
    
    this.setData({
      milestones: updatedMilestones
    })
  },

  // 选择日期
  selectDay(e) {
    const day = e.currentTarget.dataset.day
    if (!day.isCurrentMonth) return
    
    this.setData({
      selectedDay: day
    })
  },

  // 上一个月
  prevMonth() {
    let { currentYear, currentMonth } = this.data
    currentMonth--
    if (currentMonth < 1) {
      currentMonth = 12
      currentYear--
    }
    
    const now = new Date()
    const isCurrentMonth = currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1
    
    this.setData({
      currentYear: currentYear,
      currentMonth: currentMonth,
      isCurrentMonth: isCurrentMonth,
      selectedDay: null
    })
    
    this.generateCalendar()
    this.loadCheckinData()
  },

  // 下一个月
  nextMonth() {
    if (this.data.isCurrentMonth) return
    
    let { currentYear, currentMonth } = this.data
    currentMonth++
    if (currentMonth > 12) {
      currentMonth = 1
      currentYear++
    }
    
    const now = new Date()
    const isCurrentMonth = currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1
    
    this.setData({
      currentYear: currentYear,
      currentMonth: currentMonth,
      isCurrentMonth: isCurrentMonth,
      selectedDay: null
    })
    
    this.generateCalendar()
    this.loadCheckinData()
  },

  // 切换趋势周期
  changeTrendPeriod(e) {
    const period = e.currentTarget.dataset.period
    this.setData({
      trendPeriod: period
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

  // 格式化日期字符串
  formatDateStr(date) {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    const weekday = weekdays[date.getDay()]
    
    return `${month}月${day}日 星期${weekday}`
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadUserStats()
    this.loadCheckinData()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  }
})
