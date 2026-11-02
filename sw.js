/* Insource / New Synergy service worker — Web Push + offline shell cache. */
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let data = { title: 'Insource', body: '', href: '/' }
  try {
    if (event.data) data = { ...data, ...event.data.json() }
  } catch {
    try {
      data.body = event.data ? event.data.text() : ''
    } catch { /* ignore */ }
  }
  const title = String(data.title || 'Notice')
  const options = {
    body: String(data.body || ''),
    tag: String(data.tag || data.entityId || title).slice(0, 64),
    renotify: true,
    data: { href: data.href || '/' },
    icon: data.icon || undefined,
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const href = (event.notification.data && event.notification.data.href) || '/'
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const client of all) {
      if ('focus' in client) {
        await client.focus()
        if ('navigate' in client) {
          try { await client.navigate(href) } catch { /* ignore */ }
        }
        return
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(href)
  })())
})
