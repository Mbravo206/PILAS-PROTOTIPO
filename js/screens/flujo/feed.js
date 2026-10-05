// js/screens/flujo/feed.js — pantalla feed (Instagram y TikTok simulados). Extraído tal cual de app.js (sin cambios de lógica).
Object.assign(renderers, {
    // Feed simulado: Instagram (historias + fotos 4:5) y TikTok (una publicación por pantalla). Todo ficticio.
    feed() {
      const isTikTok = state.app === "clipz";
      const app = D.APP[state.app]?.name || "Red";
      const logo = D.APP[state.app]?.logo ? `<img src="${D.APP[state.app].logo}" alt="" class="w-7 h-7 rounded-[22.5%]">` : "";
      const dot = (p, size = 32) => `<span class="inline-flex items-center justify-center rounded-full border border-line shrink-0 font-bold text-ink select-none" style="width:${size}px;height:${size}px;background:${p.color};font-size:${Math.round(size * 0.45)}px;line-height:1" aria-hidden="true">${p.user[0].toUpperCase()}</span>`;
      const top = `
        <div class="px-md py-sm flex items-center justify-between border-b border-line bg-background">
          <span class="flex items-center gap-sm text-title-md text-ink">${logo}${app}</span>
          ${iconButton("x", `Salir de ${app}`, "feed-exit")}
        </div>`;

      if (isTikTok) {
        const side = (icon, n) => `<span class="flex flex-col items-center gap-xs"><span class="w-11 h-11 rounded-full bg-surface inline-flex items-center justify-center"><i data-lucide="${icon}" class="w-5 h-5 text-ink" stroke-width="1.5" aria-hidden="true"></i></span><span class="text-caption text-ink bg-surface/90 rounded-full px-xs">${n}</span></span>`;
        const clips = D.feedPosts.map((p, i) => `
          <article class="relative h-full shrink-0 snap-start overflow-hidden bg-line">
            <img src="${p.image}" alt="${p.caption}" class="absolute inset-0 w-full h-full object-cover" loading="lazy">
            <div class="absolute right-md bottom-xl flex flex-col gap-md">${side("heart", p.likes)}${side("message-circle", 48 + i * 17)}${side("share-2", "Enviar")}</div>
            <div class="absolute left-md right-[84px] bottom-md bg-surface/90 rounded-card p-md">
              <p class="flex items-center gap-sm text-label text-ink">${dot(p, 28)}@${p.user}</p>
              <p class="text-caption text-ink mt-xs">${p.caption}</p>
              <p class="flex items-center gap-xs text-caption text-ink-soft mt-xs"><i data-lucide="music" class="w-4 h-4" stroke-width="1.5" aria-hidden="true"></i>sonido original</p>
            </div>
          </article>`).join("");
        return `<div class="h-full flex flex-col bg-background">${top}<div class="screen-body snap-y snap-mandatory flex flex-col">${clips}</div></div>`;
      }

      const stories = D.group.filter((m) => !m.self).slice(0, 5).map((m) => `
        <span class="flex flex-col items-center gap-xs shrink-0">
          <span class="p-[3px] rounded-full" style="background:linear-gradient(135deg,#FFAD33,#C28CAE,#6698CC)">
            <span class="block p-[2px] rounded-full bg-background">${personAvatar(m, 52)}</span></span>
          <span class="text-caption text-ink">${m.name}</span>
        </span>`).join("");
      const posts = D.feedPosts.map((p) => `
        <article class="shrink-0 bg-surface rounded-card border border-line overflow-hidden">
          <div class="flex items-center gap-sm p-md">${dot(p)}<span class="text-label text-ink">${p.user}</span></div>
          <img src="${p.image}" alt="${p.caption}" class="w-full aspect-[4/5] object-cover bg-line" loading="lazy">
          <div class="px-md pt-md flex items-center gap-md">
            <i data-lucide="heart" class="w-6 h-6 text-ink" stroke-width="1.5" aria-hidden="true"></i>
            <i data-lucide="message-circle" class="w-6 h-6 text-ink" stroke-width="1.5" aria-hidden="true"></i>
            <i data-lucide="send" class="w-6 h-6 text-ink" stroke-width="1.5" aria-hidden="true"></i>
            <i data-lucide="bookmark" class="w-6 h-6 text-ink ml-auto" stroke-width="1.5" aria-hidden="true"></i>
          </div>
          <p class="px-md pt-sm text-label text-ink">${p.likes} Me gusta</p>
          <p class="px-md pt-xs pb-md text-label text-ink"><span class="font-medium">${p.user}</span> ${p.caption}</p>
        </article>`).join("");
      return `
        <div class="h-full flex flex-col bg-background">${top}
          <div class="screen-body px-md py-md flex flex-col gap-md">
            <div class="shrink-0 flex gap-md overflow-x-auto pb-xs" aria-label="Historias">${stories}</div>
            ${posts}
          </div>
        </div>`;
    },
});
