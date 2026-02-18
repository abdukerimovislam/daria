/* main.js - Логика сайта */

const $ = (id) => document.getElementById(id);
const qsa = (sel) => Array.from(document.querySelectorAll(sel));

let state = {
  lang: localStorage.getItem("lang") || "kg",
  mode: "online" 
};

/* ===== Слайдер Главного Экрана ===== */
let sliderTimer;
function renderSlider(slides) {
  const track = $("heroSliderTrack");
  const dots = $("heroSliderDots");
  if(!track || !dots || !slides || slides.length === 0) return;
  
  clearInterval(sliderTimer);

  track.innerHTML = slides.map(s => `<div class="heroSlide" style="background-image:url('${s}'), linear-gradient(135deg, #4a3b1f, #1a1a1c);"></div>`).join("");
  dots.innerHTML = slides.map((_, i) => `<div class="heroDot ${i===0?'active':''}" onclick="setSlide(${i})"></div>`).join("");
  
  window.currSlide = 0;
  window.totalSlides = slides.length;
  
  track.style.transition = 'none';
  track.style.transform = `translateX(0%)`;
  
  setTimeout(() => {
    track.style.transition = 'transform .8s cubic-bezier(0.25, 1, 0.5, 1)';
    updateSlider();
  }, 50);

  if(window.totalSlides > 1) {
      sliderTimer = setInterval(() => { 
        window.currSlide = (window.currSlide+1) % window.totalSlides; 
        updateSlider(); 
      }, 4000);
  }
}

window.setSlide = (i) => { 
  window.currSlide = i; 
  updateSlider(); 
  clearInterval(sliderTimer); 
  if(window.totalSlides > 1) {
      sliderTimer = setInterval(() => { 
        window.currSlide = (window.currSlide+1) % window.totalSlides; 
        updateSlider(); 
      }, 4000);
  }
};

function updateSlider(){
  const track = $("heroSliderTrack");
  if(track) track.style.transform = `translateX(-${window.currSlide * 100}%)`;
  qsa(".heroDot").forEach((d,i) => d.classList.toggle("active", i === window.currSlide));
}

/* ===== Основная функция рендера ===== */
function render() {
  if (typeof CONTENT === 'undefined') return;

  const root = CONTENT[state.lang];
  const common = root.common;
  const specific = root[state.mode]; 
  
  // УПРАВЛЕНИЕ ТЕМОЙ
  document.body.className = 'mode-' + state.mode;

  /* 1. Общие тексты */
  const brandEl = $("brandName");
  if(brandEl) brandEl.textContent = common.brandName;
  
  qsa("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    const parts = key.split(".");
    
    if(parts[0] === "modes") {
        el.textContent = common.modes[parts[1]];
        return;
    }
    
    if(common[parts[0]] && common[parts[0]][parts[1]]) {
        el.textContent = common[parts[0]][parts[1]];
    } 
    else if(specific[parts[0]] && specific[parts[0]][parts[1]]) {
        el.textContent = specific[parts[0]][parts[1]];
    }
  });

  $("footerText").textContent = common.footer.text();

  // Отзывы / Фото
  const visualData = specific.visuals;
  const tWrap = $("testimonialsTrack");
  if(tWrap && visualData) {
    tWrap.innerHTML = visualData.images.map(imgSrc => `
        <img src="${imgSrc}" class="reviewSlide" alt="Фото" loading="lazy">
    `).join("");
    $("testimonialsTitle").textContent = visualData.title;
    $("testimonialsSubtitle").textContent = visualData.subtitle;
  }

  /* 2. Специфичные тексты */
  const s = specific;

  $("heroBadge").textContent = s.hero.badge;
  $("heroTitle").textContent = s.hero.title;
  $("heroSubtitle").textContent = s.hero.subtitle;
  
  $("heroMeta").innerHTML = s.hero.meta.map(m => `<span class="pill">${m}</span>`).join("");
  $("heroMiniStats").innerHTML = s.hero.miniStats.map(x => `
    <div class="miniStat"><div class="miniStat__v">${x.v}</div><div class="miniStat__l">${x.l}</div></div>
  `).join("");
  
  renderSlider(s.hero.slides);

  const logosTitle = document.querySelector('[data-i18n="logos.title"]');
  if(logosTitle) logosTitle.textContent = common.logos.title;
  
  const chips = state.mode === 'online' 
      ? [] 
      : [];
  $("logosRow").innerHTML = chips.map(t => `<div class="logoChip">${t}</div>`).join("");

  $("resultsTitle").textContent = s.results.title;
  $("resultsSubtitle").textContent = s.results.subtitle;
  $("resultsGrid").innerHTML = s.results.items.map(r => `
    <div class="item reveal">
      <div class="item__title">${r.title}</div>
      <div class="item__text">${r.text}</div>
    </div>
  `).join("");
  
  // СЧЕТЧИК 2000+ (Показываем только в онлайне)
  const countersBlock = document.getElementById("countersWrapper");
  if (countersBlock) {
      countersBlock.style.display = state.mode === 'online' ? 'flex' : 'none';
  }

  const c1 = $("counter1");
  const c1L = $("counter1Label");
  if(c1 && c1L) {
      c1.textContent = "2000+";
      c1L.textContent = state.lang === 'kg' ? "Катышуучулар" : "Участниц";
  }

  $("programTitle").textContent = s.program.title;
  $("programSubtitle").textContent = s.program.subtitle;
  $("programGrid").innerHTML = s.program.items.map((p,i) => `
    <div class="item reveal">
      <div class="item__title">${p.title}</div>
      <div class="item__text">${p.text}</div>
    </div>
  `).join("");
  
  $("calloutTitle").textContent = s.program.callout.title;
  $("calloutText").textContent = s.program.callout.text;
  const callCta = document.querySelector('[data-i18n="program.calloutCta"]');
  if(callCta) callCta.textContent = s.program.callout.cta;

  // ===== ГЕНЕРАЦИЯ ССЫЛОК НА WHATSAPP ДЛЯ ВСЕХ ОБЩИХ КНОПОК =====
  let baseWaText = '';
  if (state.mode === 'online') {
      baseWaText = state.lang === 'kg' 
          ? 'Саламатсызбы! «Баланстагы Айым» курсу боюнча жазайын дедим эле.' 
          : 'Здравствуйте! Хочу узнать подробнее про курс «Женщина в Балансе».';
  } else {
      baseWaText = state.lang === 'kg' 
          ? 'Саламатсызбы! Насаатчылыкка жазылайын дедим эле.' 
          : 'Здравствуйте! Хочу записаться на наставничество.';
  }
  const baseWaLink = `https://wa.me/996774131414?text=${encodeURIComponent(baseWaText)}`;

  // Все кнопки с классом js-dynamic-cta теперь ведут в ватсапп
  qsa('.js-dynamic-cta').forEach(el => {
      el.href = baseWaLink;
      el.target = "_blank";
  });

  /* PRICING LOGIC */
  $("pricingTitle").textContent = s.pricing.title;
  $("pricingSubtitle").textContent = s.pricing.subtitle;
  $("pricingFineprint").textContent = s.pricing.fineprint;

  const pGrid = $("pricingGrid");
  if (s.pricing.plans.length === 1) {
    pGrid.className = "grid1"; 
  } else {
    pGrid.className = "grid2"; 
  }

  pGrid.innerHTML = s.pricing.plans.map(p => {
    // Текст для кнопок в тарифах
    const priceWaText = state.lang === 'kg'
        ? `Саламатсызбы! ${state.mode === 'online' ? '«Баланстагы Айым» курсуна' : 'Насаатчылыкка'} жазылайын дедим эле. Тариф: ${p.name}`
        : `Здравствуйте! Хочу записаться на ${state.mode === 'online' ? 'курс «Женщина в Балансе»' : 'наставничество'}. Тариф: ${p.name}`;
    
    const ctaHref = `https://wa.me/996774131414?text=${encodeURIComponent(priceWaText)}`;

    return `
      <div class="item reveal" style="display:flex; flex-direction:column; ${s.pricing.plans.length===1 ? 'border-color:var(--gold); box-shadow:var(--shadow-gold); transform: scale(1.02);' : ''}">
        <div class="price">
          <div class="item__title" style="margin:0; font-size:28px;">${p.name}</div>
          ${p.tag ? `<span class="tag">${p.tag}</span>` : ''}
        </div>
        <div class="price__value">${p.price}</div>
        <ul class="list" style="flex:1">
          ${p.features.map(f => `<li><span class="dot"></span><span>${f}</span></li>`).join("")}
        </ul>
        <a class="btn ${p.popular ? 'btn--primary' : 'btn--ghost'} item__cta" href="${ctaHref}" target="_blank">${p.cta}</a>
      </div>
    `;
  }).join("");

  setTimeout(() => {
    const obs = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting) e.target.classList.add('reveal--in'); }));
    qsa(".reveal").forEach(e => { e.classList.remove('reveal--in'); obs.observe(e); });
  }, 100);
}

function initObservers() {
    const obs = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting) e.target.classList.add('reveal--in'); }));
    qsa(".reveal").forEach(e => { e.classList.remove('reveal--in'); obs.observe(e); });
}

document.addEventListener("DOMContentLoaded", () => {
    const mainContent = $("mainContent");

    const setMode = (m) => {
        if(state.mode === m) return;
        
        if(mainContent) {
            mainContent.style.opacity = 0;
            mainContent.style.transform = "translateY(15px)";
            
            setTimeout(() => {
                state.mode = m;
                qsa(".modeBtn").forEach(b => b.classList.toggle("active", b.dataset.mode === m));
                render(); 
                
                setTimeout(() => {
                    mainContent.style.opacity = 1;
                    mainContent.style.transform = "translateY(0)";
                    initObservers();
                }, 50);
            }, 300);
        } else {
            state.mode = m;
            qsa(".modeBtn").forEach(b => b.classList.toggle("active", b.dataset.mode === m));
            render();
            initObservers();
        }
    };

    const btnOn = $("modeOnline");
    const btnOff = $("modeOffline");
    if(btnOn) btnOn.onclick = () => setMode("online");
    if(btnOff) btnOff.onclick = () => setMode("offline");

    const setLang = (l) => {
        state.lang = l;
        localStorage.setItem("lang", l);
        const btnRu = $("langRu");
        const btnKg = $("langKg");
        if(btnRu) btnRu.setAttribute("aria-pressed", l === "ru");
        if(btnKg) btnKg.setAttribute("aria-pressed", l === "kg");
        render();
        initObservers();
    };
    if($("langRu")) $("langRu").onclick = () => setLang("ru");
    if($("langKg")) $("langKg").onclick = () => setLang("kg");

    const burger = $("burger");
    const nav = $("mobileNav");
    if(burger && nav) {
        burger.onclick = () => { nav.classList.toggle("show"); };
        nav.onclick = (e) => { if(e.target.tagName==="A") nav.classList.remove("show"); };
    }
    
    const revTrack = $("testimonialsTrack");
    const btnP = $("prevTest");
    const btnN = $("nextTest");
    
    if(btnP && revTrack) {
        btnP.onclick = () => {
            if(revTrack.children.length > 0) {
               const slideWidth = revTrack.children[0].getBoundingClientRect().width + 20;
               revTrack.scrollBy({ left: -slideWidth, behavior: 'smooth' });
            }
        };
    }
    if(btnN && revTrack) {
        btnN.onclick = () => {
            if(revTrack.children.length > 0) {
               const slideWidth = revTrack.children[0].getBoundingClientRect().width + 20;
               revTrack.scrollBy({ left: slideWidth, behavior: 'smooth' });
            }
        };
    }

    const modal = $("imageModal");
    const modalImg = $("modalImg");
    const modalClose = $("modalClose");

    if (revTrack && modal && modalImg && modalClose) {
        revTrack.addEventListener("click", (e) => {
            if (e.target.classList.contains("reviewSlide")) {
                modalImg.src = e.target.src;
                modal.classList.add("show");
            }
        });
        modalClose.addEventListener("click", () => {
            modal.classList.remove("show");
        });
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.remove("show");
            }
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("show")) {
                modal.classList.remove("show");
            }
        });
    }

    setLang(state.lang);

});
