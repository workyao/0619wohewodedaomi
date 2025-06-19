// components/user-avatar/user-avatar.js
Component({
  properties: {
    src: {
      type: String,
      value: ''
    },
    size: {
      type: String,
      value: 'medium' // small, medium, large, xlarge
    },
    badge: {
      type: String,
      value: ''
    },
    showOnline: {
      type: Boolean,
      value: false
    },
    isOnline: {
      type: Boolean,
      value: false
    }
  },

  data: {
    defaultAvatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNURDIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IiM4QjQ1MTMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfjL48L3RleHQ+Cjwvc3ZnPgo='
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', {
        src: this.properties.src
      })
    }
  }
})
