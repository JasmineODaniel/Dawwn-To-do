import { watchEffect } from 'vue'

function updateMeta(nameOrProp: string, value: string) {
  const isOg = nameOrProp.startsWith('og:')
  const selector = isOg
    ? `meta[property="${nameOrProp}"]`
    : `meta[name="${nameOrProp}"]`
  let el = document.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(isOg ? 'property' : 'name', nameOrProp)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

export function useSEO(title: string, description: string) {
  watchEffect(() => {
    document.title = `${title} | DAWWN TODO`
    updateMeta('description', description)
    updateMeta('og:title', `${title} | DAWWN TODO`)
    updateMeta('og:description', description)
  })
}
