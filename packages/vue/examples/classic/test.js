Object.assign(window, Vue)

let app1 = createApp({
  template: `<p v-on:click="onOK()" >{{displayName}}</p>`,
  data() {
    return {
      name: 'Baoli'
    }
  },
  mounted() {
    console.log('mounted, app1')
  },
  computed: {
    displayName() {
      return 'Mr. ' + this.name
    }
  },
  methods: {
    onOK() {
      console.log('OK~~')
    }
  }
})

let m1 = app1.mount('#app2')

let app2Factory = () =>
  createApp(
    {
      // template:
      //   '<p @click="trace" style="color:black;text-shadow:3px 3px rgba(0,0,0,0.3);font-family:fantasy;font-size:45px;">The loard of {{displayName}}s<me ref="me" @me="trace"></me></p>',
      emits: {
        me: function() {
          return true
        }
        // me: function (){
        //   console.log("what?");
        // }
      },
      render() {
        let node = h(
          'div',
          {
            id: 'displayName',
            class: 'U2',
            style:
              'color:black;text-shadow:3px 3px rgba(0,0,0,0.3);font-family:fantasy;font-size:45px;'
          },
          [
            `The lord of ${this.displayName}s`,
            h('br'),
            h(resolveComponent('me'), { ref: 'me' })
          ]
        )
        return withDirectives(node, [[resolveDirective('balabala'), 'ok']])
      },
      created() {
        // this.provides("globalName", "ZBL")
      },
      mounted() {
        // this.$emit('me')
      },
      setup(ctx) {
        provide('globalName', 'ZBL')
        let name = ref('Ring')
        let displayName = computed(() => 'the ' + name.value)
        let rst = watchEffect(() => {
          console.log('~', name.value)
        })

        return {
          name,
          displayName,
          trace(e) {
            console.log('Hi, I am Baoli', e)
          }
        }
      }
    },
    {
      onMe(e) {
        console.log(e)
      },
      style: 'background-color: yellow;',
      abc: 'abc'
    }
  )
app2 = app2Factory()

let ngxCom = reactive({
  cardId: 0,
  playerId: 0,
  cashlessBalance: null,
  name: null,
  cardIn() {
    console.log('card in')
    this.cardId = Math.ceil(Math.random() * 100000)
    setTimeout(() => {
      this.playerId = Math.ceil(Math.random() * 100000)
      this.name = 'Baoli.Zhai'
    }, 1000)
    setTimeout(() => {
      this.cashlessBalance = Math.ceil(Math.random() * 100000)
    }, Math.random() * 3000)
  },
  cardOut() {
    console.log('card out')
    this.cardId = 0
    ;(this.cashlessBalance = null),
      setTimeout(() => {
        this.playerId = 0
        this.name = null
      }, 1000)
  }
})

let inSession = computed(() => ngxCom.playerId != 0)
class NgxCom {
  version = readonly(ref('5.4.0'))
  cardId = computed(() => ngxCom.cardId)
  playerId = computed(() => ngxCom.playerId)
  name = computed(() => (inSession && ngxCom.name) || 'Player')
  cashlessBalance = computed(() => inSession && ngxCom.cashlessBalance)
  inSession = inSession
  asyncGetCashlessCache() {
    return new Promise(function(res, rej) {
      let cashlessIsReady = appStore => {
        return (
          appStore.cardId != 0 &&
          appStore.playerId != 0 &&
          appStore.cashlessBalance != undefined
        )
      }

      if (cashlessIsReady(a)) {
        res(a)
      } else {
        let uw = watch(a, function(appStore) {
          // console.log(a.cardId, a.playerId, a.cashlessBalance);
          if (cashlessIsReady(a)) {
            uw()
            res(a)
          }
        })
      }
    })
  }
  echo() {
    return `Ready, ${this.name}(cardId:${this.cardId}, playerId:${
      this.playerId
    }), cashless balance: ${this.cashlessBalance}`
  }
}

let a = reactive(new NgxCom())

function getCashlessState() {
  a.asyncGetCashlessCache().then(function(a) {
    console.log('get valid Cashless cache', a.echo())
  })
}
getCashlessState()

app2.directive('balabala', {
  mounted(el, binding, vnode) {
    console.log(`%cbalabala ${binding.value}`, 'color: red;')
  }
})

app2.component('me', {
  template: `
  <h6 style='color: red;margin: 0 20px 0 0 ;display:inline-block;'>{{userName}}</h6>
  <button @click="getCashlessState">Get Cashless State</button>
  <button @click="cardIn">card in</button>
  <button @click="cardOut">card out</button>
  `,
  setup() {
    return {
      userName: inject('globalName', 'Horidream555'),
      getCashlessState,
      cardIn: ngxCom.cardIn.bind(ngxCom),
      cardOut: ngxCom.cardOut.bind(ngxCom)
    }
  }
})
app2.config.globalProperties.test = ref('test')
let m2 = app2.mount('#app1')
ngxCom.cardIn()

let c = m2.$
let mm = c.refs.me
let cc = c.refs.me.$
