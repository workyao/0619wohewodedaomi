// components/song-card/song-card.js
Component({
  properties: {
    song: {
      type: Object,
      value: {}
    },
    checked: {
      type: Boolean,
      value: false
    },
    showCheckbox: {
      type: Boolean,
      value: true
    },
    showActions: {
      type: Boolean,
      value: true
    },
    showPlay: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    onTap() {
      if (this.properties.showCheckbox) {
        this.triggerEvent('toggle', {
          song: this.properties.song,
          checked: !this.properties.checked
        })
      } else {
        this.triggerEvent('tap', {
          song: this.properties.song
        })
      }
    },

    onInfo(e) {
      e.stopPropagation()
      this.triggerEvent('info', {
        song: this.properties.song
      })
    },

    onPlay(e) {
      e.stopPropagation()
      this.triggerEvent('play', {
        song: this.properties.song
      })
    }
  }
})
