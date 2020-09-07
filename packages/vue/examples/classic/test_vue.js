let m = (function() {
  // helper

  function textConvertable(target) {
    return Object.prototype.toString.call(target).slice(8, -1) !== 'Array'
  }

  // render
  function h(tag, props, children) {
    return {
      tag,
      props,
      children
    }
  }

  // mount
  function mount(vnode, container) {
    const el = (vnode.el = document.createElement(vnode.tag))

    if (vnode.props) {
      for (const key in vnode.props) {
        const value = vnode.props[key]
        if (key.startsWith('on')) {
          el.addEventListener(key.slice(2).toLowerCase(), value)
        } else {
          el.setAttribute(key, value)
        }
      }
    }
    if (vnode.children) {
      if (!textConvertable(vnode.children)) {
        vnode.children.forEach(node => {
          mount(node, el)
        })
      } else {
        el.textContent = String(vnode.children)
      }
    } else {
      el.textContent = String(vnode.children)
    }
    container.append(el)
  }

  // patch
  function patch(n1, n2) {
    let el = (n2.el = n1.el)
    if (n1.tag == n2.tag) {
      const oldProps = n1.props || {}
      const newProps = n2.props || {}
      for (const key in newProps) {
        const oldValue = oldProps[key]
        const newValue = newProps[key]

        if (newValue != oldValue) {
          if (key.startsWith('on')) {
            el.removeEventListener(key.slice(2).toLowerCase(), oldValue)
            el.addEventListener(key.slice(2).toLowerCase(), newValue)
          } else {
            el.setAttribute(key, newValue)
          }
        }
      }
      for (const key in oldProps) {
        if (!key in newProps) {
          el.removeAttriube(key)
        }
      }
    } else {
      let current = document.querySelector(el)
      let parent = current.parentElement
      parent.removeChild(current)
      mount(n2, parent)
    }

    const oldChildren = n1.children
    const newChildren = n2.children
    if (textConvertable(newChildren)) {
      if (textConvertable(oldChildren)) {
        if (newChildren != oldChildren) {
          el.textContent = String(newChildren)
        }
      } else {
        el.textContent = String(newChildren)
      }
    } else {
      if (textConvertable(oldChildren)) {
        el.innerHTML = ''
        newChildren.forEach(child => mount(child, el))
      } else {
        const commonLength = Math.min(oldChildren.length, newChildren.length)
        for (let i = 0; i < commonLength; i++) {
          patch(oldChildren[i], newChildren[i])
        }
        if (newChildren.length > oldChildren.length) {
          newChildren.slice(oldChildren.length).forEach(child => {
            mount(child, el)
          })
        } else if (oldChildren.length > newChildren.length) {
          olderChildren.slice(newChildren.length).forEach(child => {
            el.removeElement(child.el)
          })
        }
      }
    }
  }

  // effect
  let activeEffect
  class Dep {
    subscribers = new Set()
    depend() {
      if (activeEffect) {
        this.subscribers.add(activeEffect)
      }
    }
    notify() {
      this.subscribers.forEach(sub => {
        sub()
      })
    }
  }

  function watchEffect(effect) {
    activeEffect = effect
    effect()
    activeEffect = null
  }

  const targetMap = new WeakMap()
  function getDep(target, key) {
    let deps = targetMap.get(target)
    if (!deps) {
      deps = new Map()
      targetMap.set(target, deps)
    }
    let dep = deps.get(key)
    if (!dep) {
      dep = new Dep()
      deps.set(key, dep)
    }
    return dep
  }

  // reative
  const reactiveHandler = {
    get(target, key, receiver) {
      getDep(target, key).depend()
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      let rst = Reflect.set(target, key, value, receiver)
      getDep(target, key).notify()
      return rst
    }
  }

  function reactive(raw) {
    return new Proxy(raw, reactiveHandler)
  }

  // component

  const component = {
    data: reactive({
      count: 0,
      id: 'me',
      fontColor: 'red'
    }),
    render() {
      return h(
        'div',
        {
          id: this.data.id,
          style: 'color: ' + this.data.fontColor
        },
        [
          h(
            'p',
            null,
            `You have clicked ${this.data.count} time${
              this.data.count > 1 ? 's' : ''
            }`
          ),
          h(
            'button',
            {
              style:
                'font-size: 20px; border:none; color: white; background-color: gray; border-radius: 999px; padding: 10px 30px; outline:none;',
              onclick: () => {
                this.data.count++
              }
            },
            'click ' + this.data.id
          )
        ]
      )
    }
  }

  // api
  function mountApp(component, container) {
    let isMounted = false
    let lastDom
    watchEffect(() => {
      if (!isMounted) {
        const vdom = (lastDom = component.render())
        mount(vdom, container)
        isMounted = true
      } else {
        const newDom = component.render()
        patch(lastDom, newDom)
        lastDom = newDom
      }
    })
  }

  mountApp(component, document.getElementById('appV'))
  return component
})()
