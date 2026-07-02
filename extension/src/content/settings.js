/**
 * @file settings.js — User settings for Claude Tracker.
 *
 * Persists to localStorage on the claude.ai origin (key "cc-settings").
 * Provides:
 *   - CC.settingsApi.get() / set(patch) / onChange(fn)
 *   - CC.settingsApi.t(key)         → localized string (7 languages, auto-detect)
 *   - CC.settingsApi.getFill(dark)  → bar fill color for current preset
 *   - CC.settingsApi.openPanel()    → dark settings panel (GitHub-style) with
 *     an author header + Ko-fi link + funding goal, all fetched live from
 *     meta.json on GitHub Pages so the app never goes stale.
 *   - CC.settingsApi.seenSettings() → whether the panel was ever opened
 *     (used for the one-time gear pulse hint).
 */
(() => {
	'use strict';

	const CC = (globalThis.ClaudeCounter = globalThis.ClaudeCounter || {});

	const STORAGE_KEY = 'cc-settings';
	const SEEN_KEY = 'cc-seen-settings';
	const META_CACHE_KEY = 'cc-meta-cache';
	const META_URL = 'https://markussela.github.io/claude-tracker-safari/meta.json';
	const META_TTL_MS = 6 * 60 * 60 * 1000; // 6h

	// Offline fallbacks (meta.json overrides these when reachable)
	const FALLBACK_META = Object.freeze({
		name: 'MarkusSela',
		avatar: 'https://github.com/MarkusSela.png?size=128',
		kofi: 'https://ko-fi.com/marukoshi',
		goal: { label: 'App Store', target: 99, current: 0, currency: '$' }
	});

	const APP_TITLE = 'Claude Tracker';
	const DEFAULTS = Object.freeze({ lang: 'auto', color: 'blue', layout: 'auto' });

	const COLOR_PRESETS = Object.freeze({
		blue: { dark: '#2c84db', light: '#5aa6ff' },
		claude: { dark: '#d97757', light: '#c96442' },
		green: { dark: '#3fb950', light: '#2da44e' },
		purple: { dark: '#a371f7', light: '#8957e5' }
	});

	const LANGS = ['auto', 'en', 'it', 'zh', 'ja', 'ru', 'pt', 'ar'];
	const LANG_LABELS = {
		auto: 'Auto',
		en: 'English',
		it: 'Italiano',
		zh: '中文',
		ja: '日本語',
		ru: 'Русский',
		pt: 'Português',
		ar: 'العربية'
	};

	const STRINGS = {
		en: {
			session: 'Session', weekly: 'Weekly', resetsIn: 'resets in',
			cachedFor: 'cached for', tokens: 'tokens',
			tipTokens: "Approximate tokens (excludes system prompt).\nUses a generic tokenizer, may differ from Claude's count.\nBecomes invalid after context compaction.\nBar scale: 200k tokens.",
			tipTokensFull: "Approximate tokens (excludes system prompt).\nThis count is invalid after compaction.",
			tipCache: 'Messages sent while cached are significantly cheaper.',
			tipSession: '5-hour session window.\nThe bar shows your usage.\nThe line marks where you are in time within the window.',
			tipWeekly: '7-day usage window.\nThe bar shows your usage.\nThe line marks where you are in time within the window.',
			settings: 'Settings', language: 'Language', barColor: 'Bar color',
			layout: 'Layout', optAuto: 'Auto', optInline: 'Inline', optStacked: 'Stacked',
			colorBlue: 'Blue', colorClaude: 'Claude', colorGreen: 'Green', colorPurple: 'Purple',
			close: 'Close', by: 'by', supportKofi: 'Support on Ko-fi'
		},
		it: {
			session: 'Sessione', weekly: 'Settimana', resetsIn: 'reset tra',
			cachedFor: 'in cache per', tokens: 'token',
			tipTokens: 'Token approssimativi (system prompt escluso).\nTokenizer generico, può differire dal conteggio di Claude.\nNon valido dopo la compattazione.\nScala barra: 200k token.',
			tipTokensFull: 'Token approssimativi (system prompt escluso).\nNon valido dopo la compattazione.',
			tipCache: 'I messaggi inviati con cache attiva costano molto meno.',
			tipSession: 'Finestra sessione di 5 ore.\nLa barra mostra il tuo utilizzo.\nLa linea indica dove sei nel tempo dentro la finestra.',
			tipWeekly: 'Finestra di 7 giorni.\nLa barra mostra il tuo utilizzo.\nLa linea indica dove sei nel tempo dentro la finestra.',
			settings: 'Impostazioni', language: 'Lingua', barColor: 'Colore barre',
			layout: 'Disposizione', optAuto: 'Auto', optInline: 'In linea', optStacked: 'Impilate',
			colorBlue: 'Blu', colorClaude: 'Claude', colorGreen: 'Verde', colorPurple: 'Viola',
			close: 'Chiudi', by: 'di', supportKofi: 'Offrimi un caffè su Ko-fi'
		},
		zh: {
			session: '会话', weekly: '每周', resetsIn: '距重置',
			cachedFor: '缓存剩余', tokens: 'tokens',
			tipTokens: '近似 token 数（不含系统提示词）。\n使用通用分词器，可能与 Claude 的计数不同。\n上下文压缩后失效。\n条形刻度：200k tokens。',
			tipTokensFull: '近似 token 数（不含系统提示词）。\n压缩后此计数失效。',
			tipCache: '缓存有效期内发送的消息成本显著更低。',
			tipSession: '5 小时会话窗口。\n条形显示你的用量。\n竖线标记你在窗口中的时间位置。',
			tipWeekly: '7 天使用窗口。\n条形显示你的用量。\n竖线标记你在窗口中的时间位置。',
			settings: '设置', language: '语言', barColor: '进度条颜色',
			layout: '布局', optAuto: '自动', optInline: '单行', optStacked: '堆叠',
			colorBlue: '蓝色', colorClaude: 'Claude', colorGreen: '绿色', colorPurple: '紫色',
			close: '关闭', by: '作者', supportKofi: '在 Ko-fi 上支持我'
		},
		ja: {
			session: 'セッション', weekly: '週間', resetsIn: 'リセットまで',
			cachedFor: 'キャッシュ残り', tokens: 'トークン',
			tipTokens: 'おおよそのトークン数（システムプロンプト除く）。\n汎用トークナイザー使用のため Claude の計数と異なる場合あり。\nコンテキスト圧縮後は無効。\nバーの目盛り：200k トークン。',
			tipTokensFull: 'おおよそのトークン数（システムプロンプト除く）。\n圧縮後は無効。',
			tipCache: 'キャッシュ有効中のメッセージは大幅に安価。',
			tipSession: '5時間のセッション枠。\nバーは使用量を表示。\n縦線は枠内での時間位置。',
			tipWeekly: '7日間の使用枠。\nバーは使用量を表示。\n縦線は枠内での時間位置。',
			settings: '設定', language: '言語', barColor: 'バーの色',
			layout: 'レイアウト', optAuto: '自動', optInline: '横並び', optStacked: '縦積み',
			colorBlue: '青', colorClaude: 'Claude', colorGreen: '緑', colorPurple: '紫',
			close: '閉じる', by: '作者', supportKofi: 'Ko-fi で支援する'
		},
		ru: {
			session: 'Сессия', weekly: 'Неделя', resetsIn: 'сброс через',
			cachedFor: 'кэш ещё', tokens: 'токенов',
			tipTokens: 'Примерное число токенов (без системного промпта).\nОбщий токенизатор — может отличаться от подсчёта Claude.\nНедействительно после сжатия контекста.\nШкала: 200k токенов.',
			tipTokensFull: 'Примерное число токенов (без системного промпта).\nНедействительно после сжатия.',
			tipCache: 'Сообщения при активном кэше значительно дешевле.',
			tipSession: 'Окно сессии 5 часов.\nПолоса — ваше использование.\nЛиния — где вы во времени внутри окна.',
			tipWeekly: 'Окно 7 дней.\nПолоса — ваше использование.\nЛиния — где вы во времени внутри окна.',
			settings: 'Настройки', language: 'Язык', barColor: 'Цвет полос',
			layout: 'Расположение', optAuto: 'Авто', optInline: 'В строку', optStacked: 'Столбиком',
			colorBlue: 'Синий', colorClaude: 'Claude', colorGreen: 'Зелёный', colorPurple: 'Фиолетовый',
			close: 'Закрыть', by: 'от', supportKofi: 'Поддержать на Ko-fi'
		},
		pt: {
			session: 'Sessão', weekly: 'Semanal', resetsIn: 'reinicia em',
			cachedFor: 'em cache por', tokens: 'tokens',
			tipTokens: 'Tokens aproximados (exclui system prompt).\nTokenizer genérico, pode diferir da contagem do Claude.\nInválido após compactação do contexto.\nEscala da barra: 200k tokens.',
			tipTokensFull: 'Tokens aproximados (exclui system prompt).\nInválido após compactação.',
			tipCache: 'Mensagens enviadas com cache ativo custam bem menos.',
			tipSession: 'Janela de sessão de 5 horas.\nA barra mostra seu uso.\nA linha marca onde você está no tempo dentro da janela.',
			tipWeekly: 'Janela de 7 dias.\nA barra mostra seu uso.\nA linha marca onde você está no tempo dentro da janela.',
			settings: 'Configurações', language: 'Idioma', barColor: 'Cor das barras',
			layout: 'Layout', optAuto: 'Auto', optInline: 'Em linha', optStacked: 'Empilhado',
			colorBlue: 'Azul', colorClaude: 'Claude', colorGreen: 'Verde', colorPurple: 'Roxo',
			close: 'Fechar', by: 'por', supportKofi: 'Apoiar no Ko-fi'
		},
		ar: {
			session: 'الجلسة', weekly: 'أسبوعي', resetsIn: 'يتجدد خلال',
			cachedFor: 'مخزّن لمدة', tokens: 'توكن',
			tipTokens: 'عدد توكن تقريبي (باستثناء موجه النظام).\nمُرمِّز عام، قد يختلف عن عدّ Claude.\nيصبح غير صالح بعد ضغط السياق.\nمقياس الشريط: 200 ألف توكن.',
			tipTokensFull: 'عدد توكن تقريبي (باستثناء موجه النظام).\nغير صالح بعد الضغط.',
			tipCache: 'الرسائل المُرسلة أثناء التخزين المؤقت أرخص بكثير.',
			tipSession: 'نافذة جلسة 5 ساعات.\nالشريط يعرض استخدامك.\nالخط يحدد موقعك الزمني داخل النافذة.',
			tipWeekly: 'نافذة 7 أيام.\nالشريط يعرض استخدامك.\nالخط يحدد موقعك الزمني داخل النافذة.',
			settings: 'الإعدادات', language: 'اللغة', barColor: 'لون الأشرطة',
			layout: 'التخطيط', optAuto: 'تلقائي', optInline: 'سطر واحد', optStacked: 'مكدّس',
			colorBlue: 'أزرق', colorClaude: 'Claude', colorGreen: 'أخضر', colorPurple: 'بنفسجي',
			close: 'إغلاق', by: 'بواسطة', supportKofi: 'ادعمني على Ko-fi'
		}
	};

	let settings = load();
	const listeners = [];

	function load() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			return { ...DEFAULTS, ...(raw ? JSON.parse(raw) : {}) };
		} catch {
			return { ...DEFAULTS };
		}
	}

	function save() {
		try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch { /* in-memory only */ }
	}

	function currentLang() {
		if (STRINGS[settings.lang]) return settings.lang;
		const nav = (navigator.language || 'en').toLowerCase();
		for (const code of ['it', 'zh', 'ja', 'ru', 'pt', 'ar']) {
			if (nav.startsWith(code)) return code;
		}
		return 'en';
	}

	function t(key) {
		const dict = STRINGS[currentLang()] || STRINGS.en;
		return dict[key] ?? STRINGS.en[key] ?? key;
	}

	function getFill(isDark) {
		const preset = COLOR_PRESETS[settings.color] || COLOR_PRESETS.blue;
		return isDark ? preset.dark : preset.light;
	}

	function get() { return { ...settings }; }

	function set(patch) {
		settings = { ...settings, ...patch };
		save();
		for (const fn of listeners) {
			try { fn(get()); } catch { /* keep others alive */ }
		}
	}

	function onChange(fn) { listeners.push(fn); }

	function seenSettings() {
		try { return localStorage.getItem(SEEN_KEY) === '1'; } catch { return true; }
	}

	function markSeen() {
		try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ }
	}

	// ---------- Live meta (profile + goal) from GitHub Pages ----------

	let meta = { ...FALLBACK_META };
	try {
		const cached = JSON.parse(localStorage.getItem(META_CACHE_KEY) || 'null');
		if (cached?.data) meta = { ...FALLBACK_META, ...cached.data };
	} catch { /* fallback stays */ }

	async function refreshMeta() {
		try {
			const cached = JSON.parse(localStorage.getItem(META_CACHE_KEY) || 'null');
			if (cached && Date.now() - cached.ts < META_TTL_MS) return meta;
		} catch { /* fetch anyway */ }
		try {
			const res = await fetch(META_URL, { cache: 'no-store' });
			if (!res.ok) return meta;
			const data = await res.json();
			meta = { ...FALLBACK_META, ...data };
			try { localStorage.setItem(META_CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch { /* ignore */ }
		} catch { /* CSP or offline — fallback stays */ }
		return meta;
	}

	// ---------- Settings panel ----------

	let overlay = null;

	function closePanel() {
		overlay?.remove();
		overlay = null;
	}

	function segRow(labelText, options, selectedValue, onPick) {
		const row = document.createElement('div');
		row.className = 'cc-set__row';

		const label = document.createElement('div');
		label.className = 'cc-set__label';
		label.textContent = labelText;
		row.appendChild(label);

		const seg = document.createElement('div');
		seg.className = 'cc-set__seg';
		for (const opt of options) {
			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'cc-set__segBtn';
			if (opt.value === selectedValue) btn.classList.add('cc-set__segBtn--on');
			if (opt.swatch) {
				const dot = document.createElement('span');
				dot.className = 'cc-set__dot';
				dot.style.background = opt.swatch;
				btn.appendChild(dot);
			}
			btn.appendChild(document.createTextNode(opt.label));
			btn.addEventListener('click', (e) => {
				e.stopPropagation();
				onPick(opt.value);
			});
			seg.appendChild(btn);
		}
		row.appendChild(seg);
		return row;
	}

	function goalBlock(m) {
		const wrap = document.createElement('div');
		wrap.className = 'cc-set__goal';
		const g = m.goal;
		if (!g || !g.target) return wrap;

		const cur = Math.max(0, Number(g.current) || 0);
		const target = Math.max(1, Number(g.target) || 1);
		const pct = Math.max(0, Math.min(100, (cur / target) * 100));
		const cy = g.currency || '$';

		const text = document.createElement('div');
		text.className = 'cc-set__goalText';
		text.textContent = `\u{1F3AF} ${g.label || 'Goal'} \u00B7 ${cy}${cur} / ${cy}${target}`;
		wrap.appendChild(text);

		const bar = document.createElement('div');
		bar.className = 'cc-set__goalBar';
		const fill = document.createElement('div');
		fill.className = 'cc-set__goalFill';
		fill.style.width = `${pct}%`;
		bar.appendChild(fill);
		wrap.appendChild(bar);

		return wrap;
	}

	function buildPanel() {
		const card = document.createElement('div');
		card.className = 'cc-set__card';
		card.addEventListener('click', (e) => e.stopPropagation());

		// Header: live avatar + title/author + Ko-fi + goal
		const head = document.createElement('div');
		head.className = 'cc-set__head';

		const img = document.createElement('img');
		img.className = 'cc-set__avatar';
		img.src = meta.avatar;
		img.alt = '';
		img.addEventListener('error', () => img.remove());
		head.appendChild(img);

		const metaBox = document.createElement('div');
		metaBox.className = 'cc-set__meta';
		const title = document.createElement('div');
		title.className = 'cc-set__title';
		title.textContent = APP_TITLE;
		const author = document.createElement('div');
		author.className = 'cc-set__author';
		author.textContent = `${t('by')} ${meta.name}`;
		metaBox.appendChild(title);
		metaBox.appendChild(author);
		head.appendChild(metaBox);
		card.appendChild(head);

		const kofi = document.createElement('a');
		kofi.className = 'cc-set__kofi';
		kofi.href = meta.kofi;
		kofi.target = '_blank';
		kofi.rel = 'noopener noreferrer';
		kofi.textContent = `\u2615 ${t('supportKofi')}`;
		kofi.addEventListener('click', (e) => e.stopPropagation());
		card.appendChild(kofi);

		card.appendChild(goalBlock(meta));

		const divider = document.createElement('div');
		divider.className = 'cc-set__divider';
		card.appendChild(divider);

		const rerender = () => {
			const fresh = buildPanel();
			card.replaceWith(fresh);
		};

		// Language
		card.appendChild(
			segRow(
				t('language'),
				LANGS.map((code) => ({ value: code, label: LANG_LABELS[code] })),
				settings.lang,
				(v) => { set({ lang: v }); rerender(); }
			)
		);

		// Bar color
		card.appendChild(
			segRow(
				t('barColor'),
				[
					{ value: 'blue', label: t('colorBlue'), swatch: COLOR_PRESETS.blue.dark },
					{ value: 'claude', label: t('colorClaude'), swatch: COLOR_PRESETS.claude.dark },
					{ value: 'green', label: t('colorGreen'), swatch: COLOR_PRESETS.green.dark },
					{ value: 'purple', label: t('colorPurple'), swatch: COLOR_PRESETS.purple.dark }
				],
				settings.color,
				(v) => { set({ color: v }); rerender(); }
			)
		);

		// Layout
		card.appendChild(
			segRow(
				t('layout'),
				[
					{ value: 'auto', label: t('optAuto') },
					{ value: 'inline', label: t('optInline') },
					{ value: 'stacked', label: t('optStacked') }
				],
				settings.layout,
				(v) => { set({ layout: v }); rerender(); }
			)
		);

		// Close
		const close = document.createElement('button');
		close.type = 'button';
		close.className = 'cc-set__close';
		close.textContent = t('close');
		close.addEventListener('click', (e) => {
			e.stopPropagation();
			closePanel();
		});
		card.appendChild(close);

		return card;
	}

	function openPanel() {
		markSeen();
		if (overlay) closePanel();
		overlay = document.createElement('div');
		overlay.className = 'cc-set__overlay';
		overlay.addEventListener('click', closePanel);
		overlay.appendChild(buildPanel());
		document.body.appendChild(overlay);

		// Refresh live meta; re-render panel when fresh data lands
		refreshMeta().then(() => {
			if (overlay) {
				const card = overlay.querySelector('.cc-set__card');
				if (card) card.replaceWith(buildPanel());
			}
		});
	}

	CC.settingsApi = {
		get, set, onChange, t, getFill, openPanel, closePanel, seenSettings
	};
})();
