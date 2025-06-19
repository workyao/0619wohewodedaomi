// 测试数据初始化脚本
// 在微信开发者工具的调试器控制台中，复制粘贴以下代码并按回车执行

console.log('🚀 开始初始化数据...')

wx.cloud.callFunction({
  name: 'initData',
  data: {
    action: 'initAll'
  }
}).then(res => {
  console.log('✅ 数据初始化成功！')
  console.log('详细结果：', res)
  
  if (res.result && res.result.success) {
    console.log('🎉 恭喜！数据库已成功初始化')
    console.log('📊 初始化统计：', res.result.data)
  } else {
    console.log('⚠️ 初始化可能有问题，请检查：', res.result)
  }
}).catch(err => {
  console.error('❌ 数据初始化失败：', err)
  console.log('💡 可能的解决方案：')
  console.log('1. 确认 initData 云函数已正确部署')
  console.log('2. 检查云环境ID是否正确')
  console.log('3. 确认网络连接正常')
})
