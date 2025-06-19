# 🤝 贡献指南

> 欢迎加入"我和我的稻米朋友们"项目的开发！

感谢您对本项目的关注和支持！这是一个由稻米志愿者共同维护的公益项目，我们欢迎任何形式的贡献。

## 🌟 如何贡献

### 1. 报告问题
如果您发现了bug或有功能建议：
- 在GitHub或Gitee上创建Issue
- 详细描述问题或建议
- 提供复现步骤（如果是bug）
- 附上相关截图或日志

### 2. 代码贡献

#### 开发环境准备
1. Fork本项目到您的账号
2. 克隆到本地：
   ```bash
   git clone https://github.com/你的用户名/0619wohewodedaomitrae.git
   ```
3. 安装微信开发者工具
4. 配置云开发环境

#### 开发流程
1. **创建分支**
   ```bash
   git checkout -b feature/新功能名称
   # 或
   git checkout -b fix/修复问题描述
   ```

2. **进行开发**
   - 遵循项目的代码规范
   - 添加必要的注释
   - 确保功能正常工作

3. **测试验证**
   - 在微信开发者工具中测试
   - 确保不影响现有功能
   - 添加相应的测试用例

4. **提交代码**
   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   # 或
   git commit -m "fix: 修复问题描述"
   ```

5. **推送并创建PR**
   ```bash
   git push origin feature/新功能名称
   ```
   然后在GitHub/Gitee上创建Pull Request

### 3. 文档贡献
- 完善项目文档
- 翻译文档到其他语言
- 添加使用示例
- 改进代码注释

### 4. 设计贡献
- 优化UI/UX设计
- 制作图标和插画
- 改进视觉效果
- 提供设计建议

## 📝 代码规范

### JavaScript规范
```javascript
// 使用驼峰命名法
const userName = 'example';
const getUserInfo = () => {};

// 函数注释
/**
 * 获取用户打卡信息
 * @param {string} openid 用户openid
 * @param {string} date 日期
 * @returns {Object} 打卡信息
 */
function getCheckinInfo(openid, date) {
  // 实现代码
}

// 使用const/let，避免var
const config = {
  apiUrl: 'https://api.example.com'
};

// 错误处理
try {
  const result = await wx.cloud.callFunction({
    name: 'functionName',
    data: {}
  });
} catch (error) {
  console.error('调用失败:', error);
}
```

### WXML规范
```xml
<!-- 使用语义化标签 -->
<view class="container">
  <view class="header">
    <text class="title">标题</text>
  </view>
  <view class="content">
    <!-- 内容 -->
  </view>
</view>

<!-- 合理使用条件渲染 -->
<view wx:if="{{isLogin}}" class="user-info">
  <text>{{userInfo.nickName}}</text>
</view>
<view wx:else class="login-btn">
  <button bindtap="login">登录</button>
</view>
```

### WXSS规范
```css
/* 使用BEM命名规范 */
.song-card {
  padding: 20rpx;
  margin: 10rpx;
}

.song-card__title {
  font-size: 32rpx;
  font-weight: bold;
}

.song-card__content {
  color: #666;
}

.song-card--selected {
  background-color: #f0f0f0;
}

/* 使用CSS变量 */
:root {
  --primary-color: #d4a574;
  --text-color: #333;
}

.button {
  background-color: var(--primary-color);
  color: var(--text-color);
}
```

### 云函数规范
```javascript
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { action, ...params } = event;
  
  try {
    switch (action) {
      case 'getData':
        return await getData(params);
      case 'updateData':
        return await updateData(params);
      default:
        throw new Error('未知操作');
    }
  } catch (error) {
    console.error('云函数执行失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 获取数据
 * @param {Object} params 参数
 */
async function getData(params) {
  // 实现逻辑
}
```

## 🧪 测试指南

### 功能测试
1. **用户登录流程**
   - 测试微信授权登录
   - 验证用户信息获取
   - 检查登录状态持久化

2. **打卡功能**
   - 测试歌曲选择
   - 验证打卡提交
   - 检查数据存储
   - 测试重复打卡处理

3. **社交功能**
   - 测试动态发布
   - 验证点赞评论
   - 检查好友关注

### 兼容性测试
- 不同手机型号
- 不同微信版本
- 不同网络环境
- 不同屏幕尺寸

### 性能测试
- 页面加载速度
- 云函数响应时间
- 数据库查询效率
- 内存使用情况

## 🎨 设计指南

### 色彩规范
- **主色调**: #d4a574 (沙漠金)
- **辅助色**: #8b4513 (棕色)
- **背景色**: #f5f5dc (米色)
- **文字色**: #333333 (深灰)
- **强调色**: #ff6b35 (橙红)

### 字体规范
- **标题**: 32rpx - 40rpx
- **正文**: 28rpx - 32rpx
- **说明**: 24rpx - 28rpx
- **字重**: normal, bold

### 间距规范
- **页面边距**: 30rpx
- **组件间距**: 20rpx
- **元素间距**: 10rpx
- **内边距**: 20rpx

### 图标规范
- **尺寸**: 48rpx, 64rpx, 96rpx
- **风格**: 线性图标，简洁明了
- **颜色**: 与主题色调保持一致

## 📋 提交信息规范

使用约定式提交格式：

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

### 类型说明
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 示例
```
feat(checkin): 添加连续打卡天数统计功能

- 在用户打卡时计算连续天数
- 在个人页面显示连续打卡记录
- 添加连续打卡成就系统

Closes #123
```

## 🔍 代码审查

### 审查要点
1. **功能正确性**
   - 功能是否按预期工作
   - 边界情况处理
   - 错误处理机制

2. **代码质量**
   - 代码可读性
   - 命名规范
   - 注释完整性

3. **性能考虑**
   - 算法效率
   - 内存使用
   - 网络请求优化

4. **安全性**
   - 数据验证
   - 权限检查
   - 敏感信息保护

## 🏆 贡献者认可

我们会在以下地方认可贡献者：
- README.md中的贡献者列表
- 项目发布说明
- 小程序关于页面
- 社区感谢帖

## 📞 联系我们

如果您有任何问题或建议：
- 创建GitHub/Gitee Issue
- 发送邮件到项目维护者
- 加入稻米开发者交流群

## 📄 许可证

本项目采用MIT许可证，详见[LICENSE](./LICENSE)文件。

---

**感谢您的贡献！让我们一起为稻米社区打造更好的产品！** 🌾💪