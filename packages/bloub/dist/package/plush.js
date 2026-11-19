import { A as e, E as t, G as n, J as r, K as i, L as a, N as o, U as s, V as c, W as l, X as u, Y as d, Z as f, j as p, q as m, t as h, x as g, z as _ } from "./chunks/BloubBot-KsuzYZcf.js";
import { createComponent as v, effect as y, insert as b, memo as x, mergeProps as S, ref as C, setAttribute as w, setStyleProperty as T, style as E, template as D } from "@solidjs/web";
import { For as O, Show as k, createEffect as A, createMemo as j, createSignal as M, createUniqueId as ee, onCleanup as te, untrack as N } from "solid-js";
//#region src/plush/assets.ts
var ne = {
	"boule.webp": new URL("./assets/boule.webp", import.meta.url).href,
	"cloe-corps.webp": new URL("./assets/cloe-corps.webp", import.meta.url).href,
	"cloe-oeil0-x.webp": new URL("./assets/cloe-oeil0-x.webp", import.meta.url).href,
	"cloe-oeil0-y.webp": new URL("./assets/cloe-oeil0-y.webp", import.meta.url).href,
	"cloe-oeil1-x.webp": new URL("./assets/cloe-oeil1-x.webp", import.meta.url).href,
	"cloe-oeil1-y.webp": new URL("./assets/cloe-oeil1-y.webp", import.meta.url).href,
	"forme-capsule.webp": new URL("./assets/forme-capsule.webp", import.meta.url).href,
	"forme-carre.webp": new URL("./assets/forme-carre.webp", import.meta.url).href,
	"forme-cercle.webp": new URL("./assets/forme-cercle.webp", import.meta.url).href,
	"forme-galet.webp": new URL("./assets/forme-galet.webp", import.meta.url).href,
	"forme-goutte.webp": new URL("./assets/forme-goutte.webp", import.meta.url).href,
	"forme-hexagone.webp": new URL("./assets/forme-hexagone.webp", import.meta.url).href,
	"forme-losange.webp": new URL("./assets/forme-losange.webp", import.meta.url).href,
	"forme-nuage.webp": new URL("./assets/forme-nuage.webp", import.meta.url).href,
	"forme-pentagone.webp": new URL("./assets/forme-pentagone.webp", import.meta.url).href,
	"forme-squircle.webp": new URL("./assets/forme-squircle.webp", import.meta.url).href,
	"forme-triangle.webp": new URL("./assets/forme-triangle.webp", import.meta.url).href,
	"fred-corps.webp": new URL("./assets/fred-corps.webp", import.meta.url).href,
	"fred-oeil0-x.webp": new URL("./assets/fred-oeil0-x.webp", import.meta.url).href,
	"fred-oeil0-y.webp": new URL("./assets/fred-oeil0-y.webp", import.meta.url).href,
	"fred-oeil1-x.webp": new URL("./assets/fred-oeil1-x.webp", import.meta.url).href,
	"fred-oeil1-y.webp": new URL("./assets/fred-oeil1-y.webp", import.meta.url).href,
	"malu-corps.webp": new URL("./assets/malu-corps.webp", import.meta.url).href,
	"malu-oeil0-x.webp": new URL("./assets/malu-oeil0-x.webp", import.meta.url).href,
	"malu-oeil0-y.webp": new URL("./assets/malu-oeil0-y.webp", import.meta.url).href,
	"malu-oeil1-x.webp": new URL("./assets/malu-oeil1-x.webp", import.meta.url).href,
	"malu-oeil1-y.webp": new URL("./assets/malu-oeil1-y.webp", import.meta.url).href,
	"nexo-corps.webp": new URL("./assets/nexo-corps.webp", import.meta.url).href,
	"nexo-oeil0-x.webp": new URL("./assets/nexo-oeil0-x.webp", import.meta.url).href,
	"nexo-oeil0-y.webp": new URL("./assets/nexo-oeil0-y.webp", import.meta.url).href,
	"nexo-oeil1-x.webp": new URL("./assets/nexo-oeil1-x.webp", import.meta.url).href,
	"nexo-oeil1-y.webp": new URL("./assets/nexo-oeil1-y.webp", import.meta.url).href,
	"vita-corps.webp": new URL("./assets/vita-corps.webp", import.meta.url).href,
	"vita-oeil0-x.webp": new URL("./assets/vita-oeil0-x.webp", import.meta.url).href,
	"vita-oeil0-y.webp": new URL("./assets/vita-oeil0-y.webp", import.meta.url).href,
	"vita-oeil1-x.webp": new URL("./assets/vita-oeil1-x.webp", import.meta.url).href,
	"vita-oeil1-y.webp": new URL("./assets/vita-oeil1-y.webp", import.meta.url).href,
	"yoshi-corps.webp": new URL("./assets/yoshi-corps.webp", import.meta.url).href,
	"yoshi-oeil0-x.webp": new URL("./assets/yoshi-oeil0-x.webp", import.meta.url).href,
	"yoshi-oeil0-y.webp": new URL("./assets/yoshi-oeil0-y.webp", import.meta.url).href,
	"yoshi-oeil1-x.webp": new URL("./assets/yoshi-oeil1-x.webp", import.meta.url).href,
	"yoshi-oeil1-y.webp": new URL("./assets/yoshi-oeil1-y.webp", import.meta.url).href
}, re = [
	"cercle",
	"galet",
	"squircle",
	"capsule",
	"triangle",
	"hexagone",
	"nuage",
	"goutte",
	"carre",
	"losange",
	"pentagone"
], ie = [
	"idle",
	"wink",
	"wide",
	"thinking",
	"notify",
	"asleep",
	"failed"
], P = (e, t, n = 0) => ({
	w: e,
	h: t,
	tilt: n,
	open: 1
}), ae = {
	nexo: [[
		.8463031722054379,
		1.1432813538461537,
		.035,
		-.065
	], [
		.8463031722054379,
		1.1432813538461537,
		-.015,
		-.058
	]],
	vita: [[
		1.1065201648485468,
		1.3715440577454037,
		.034055756216271146,
		-.05281578999623958
	], [
		.9879326262863181,
		.704834060505008,
		-.026029860323685244,
		-.05510519721699535
	]],
	cloe: [[
		.7330933320692096,
		.5707016106480031,
		.024552162164021694,
		-.038398427223289566
	], [
		.7626944185432071,
		.5431152830931956,
		-.041541687753233185,
		-.03950575553898529
	]],
	malu: [[
		1.0586630508735577,
		1.201687371851717,
		.009231984564124829,
		-.0044476764477897265
	], [
		.8266234890168364,
		.8621901641452211,
		-.026116871314858032,
		.0003016649469345866
	]],
	yoshi: [[
		.8527194256418902,
		.7757119056093287,
		.03916727618687797,
		.007869041986432974
	], [
		.8797267768823489,
		.7829079218623657,
		-.028381687537700435,
		.012892774756514975
	]],
	fred: [[
		1.7586780224155572,
		1.667393362265376,
		.039353114938410254,
		-.035566855454058126
	], [
		1.8556643796915675,
		1.6423739844251715,
		-.055407781997306026,
		-.03778285688705488
	]]
}, F = (e, t, n, [r, i, a, o]) => {
	let s = Math.min(n.w, n.h), c = n.w > n.h ? n.w - s : 0, l = n.h > n.w ? n.h - s : 0, u = `${e}-oeil${t}`;
	return {
		file: `${u}-x.webp`,
		images: {
			x: `${u}-x.webp`,
			y: `${u}-y.webp`
		},
		court: s,
		kw: (r - c) / s,
		kh: (i - l) / s,
		dx: a,
		dy: o
	};
};
function I(e, t, n, r, i, a, o, s = 0) {
	let [c, l] = ae[e];
	return {
		id: e,
		shape: t,
		ink: n,
		body: `${e}-corps.webp`,
		pads: [F(e, 0, i[0], c), F(e, 1, i[1], l)],
		face: {
			id: `plush-${e}`,
			gaze: {
				yaw: a,
				pitch: o,
				roll: s
			},
			split: r,
			eyes: i
		}
	};
}
var L = [
	I("nexo", "squircle", "#e45206", 16, [P(.205, .43, -28), P(.205, .43, 35)], 1, -7, -1),
	I("vita", "hexagone", "#22c377", 17, [P(.27, .51, 3), P(.49, .13, -4)], -4, 5, 8),
	I("cloe", "triangle", "#df2986", 20, [P(.33, .12, 28), P(.34, .11, -26)], 3, 16),
	I("malu", "cercle", "#9a55ef", 15, [P(.23, .42, -3), P(.19, .18)], 9, 4, -8),
	I("yoshi", "capsule", "#e94741", 18, [P(.3, .16, 17), P(.31, .15, -18)], 11, 20, 2),
	I("fred", "hexagone", "#efb428", 21, [P(.46, .5), P(.48, .5)], 7, -3)
], R = new Map(L.map((e) => [e.id, e])), oe = {
	...R.get("fred").pads[0],
	dx: 0,
	dy: 0
}, se = (e) => `forme-${e}.webp`, ce = "boule.webp", le = [
	"flip",
	"pop",
	"warp",
	"dissolve",
	"cut"
], z = "flip", B = t.SHAPE_MORPH, V = e.get("notify"), H = (e) => V.pose(e).notif?.r ?? 0, U = H(10), ue = (e) => H(e) / U, W = (() => {
	for (let e = 1; e < 5e3; e++) if (H(e / 1e3) === U && H((e - 1) / 1e3) !== U) return e / 1e3;
	return B;
})(), G = B / 2, de = {
	cut: B,
	warp: B,
	dissolve: B,
	flip: B * 2,
	pop: G + W
}, fe = {
	corps: "avant",
	melange: 0,
	sx: 1,
	sy: 1,
	bascule: !1,
	fini: !1
}, K = {
	corps: "apres",
	melange: 1,
	sx: 1,
	sy: 1,
	bascule: !0,
	fini: !0
};
function pe(e, t) {
	if (t < 0) return fe;
	let n = de[e];
	if (t >= n) return K;
	let r = t / n;
	switch (e) {
		case "cut": return {
			...K,
			fini: !1
		};
		case "warp":
		case "dissolve": return {
			corps: "deux",
			melange: u.easeOutQuint(r),
			sx: 1,
			sy: 1,
			bascule: !0,
			fini: !1
		};
		case "flip": {
			let e = u.easeInOutCubic(r), t = e >= .5;
			return {
				corps: t ? "apres" : "avant",
				melange: +!!t,
				sx: Math.abs(Math.cos(Math.PI * e)),
				sy: 1,
				bascule: t,
				fini: !1
			};
		}
		case "pop": {
			if (t < G) {
				let e = 1 - u.easeInOutCubic(t / G);
				return {
					corps: "avant",
					melange: 0,
					sx: e,
					sy: e,
					bascule: !1,
					fini: !1
				};
			}
			let e = t - G, n = u.easeOutQuint(d(e / W)) * ue(e);
			return {
				corps: "apres",
				melange: 1,
				sx: n,
				sy: n,
				bascule: !0,
				fini: !1
			};
		}
	}
}
function me(e, t, n) {
	let r = u.easeOutQuint(d(n / B));
	return t.map((t, n) => f(e[n] ?? t, t, r));
}
//#endregion
//#region src/plush/warp.ts
var he = "#version 300 es\nin vec2 p;\nout vec2 v;\nvoid main() {\n  v = p;\n  gl_Position = vec4(p, 0.0, 1.0);\n}", ge = "#version 300 es\nprecision highp float;\n#define N 64\nin vec2 v;\nout vec4 couleur;\nuniform sampler2D ta;\nuniform sampler2D tb;\nuniform float ra[N];\nuniform float rb[N];\nuniform float rc[N];\nuniform float melange;\nconst float TAU = 6.283185307179586;\n\n// comme radiusAtAngle : interpolation lineaire entre deux echantillons voisins\nfloat rayon(float r[N], float t) {\n  int i = int(floor(t));\n  float f = t - floor(t);\n  return mix(r[i % N], r[(i + 1) % N], f);\n}\n\nvoid main() {\n  // repere du viewBox : y vers le bas, comme le moteur\n  vec2 q = vec2(v.x, -v.y);\n  float ang = atan(q.y, q.x);\n  float t = fract(ang / TAU) * float(N);\n  float r = rayon(rc, t);\n  vec2 qa = q * rayon(ra, t) / r;\n  vec2 qb = q * rayon(rb, t) / r;\n  // l'image couvre le viewBox ; sa premiere ligne est le haut\n  vec4 a = texture(ta, (qa + 1.0) * 0.5);\n  vec4 b = texture(tb, (qb + 1.0) * 0.5);\n  couleur = mix(a, b, melange);\n}";
function q(e) {
	return new Promise((t, n) => {
		let r = new Image();
		r.onload = () => t(r), r.onerror = () => n(/* @__PURE__ */ Error(`warp: image introuvable ${e}`)), r.src = e;
	});
}
function _e(e) {
	let t = e.getContext("webgl2", {
		premultipliedAlpha: !0,
		alpha: !0
	});
	if (!t) return null;
	let n = (e, n) => {
		let r = t.createShader(e);
		if (t.shaderSource(r, n), t.compileShader(r), !t.getShaderParameter(r, t.COMPILE_STATUS)) throw Error(t.getShaderInfoLog(r) ?? "shader");
		return r;
	}, r = t.createProgram();
	if (t.attachShader(r, n(t.VERTEX_SHADER, he)), t.attachShader(r, n(t.FRAGMENT_SHADER, ge)), t.linkProgram(r), !t.getProgramParameter(r, t.LINK_STATUS)) throw Error(t.getProgramInfoLog(r) ?? "programme");
	t.useProgram(r);
	let i = t.createBuffer();
	t.bindBuffer(t.ARRAY_BUFFER, i), t.bufferData(t.ARRAY_BUFFER, new Float32Array([
		-1,
		-1,
		1,
		-1,
		-1,
		1,
		1,
		1
	]), t.STATIC_DRAW);
	let a = t.getAttribLocation(r, "p");
	t.enableVertexAttribArray(a), t.vertexAttribPointer(a, 2, t.FLOAT, !1, 0, 0);
	let o = (e, n) => {
		let i = t.createTexture();
		return t.activeTexture(t.TEXTURE0 + e), t.bindTexture(t.TEXTURE_2D, i), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.LINEAR), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.LINEAR), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), t.uniform1i(t.getUniformLocation(r, n), e), i;
	}, s = o(0, "ta"), c = o(1, "tb"), l = {
		ra: t.getUniformLocation(r, "ra"),
		rb: t.getUniformLocation(r, "rb"),
		rc: t.getUniformLocation(r, "rc"),
		melange: t.getUniformLocation(r, "melange")
	}, u = (e, n, r) => {
		t.activeTexture(t.TEXTURE0 + e), t.bindTexture(t.TEXTURE_2D, n), t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !0), t.texImage2D(t.TEXTURE_2D, 0, t.RGBA, t.RGBA, t.UNSIGNED_BYTE, r);
	}, d = 0;
	return {
		async corps(e, t) {
			let n = ++d, [r, i] = await Promise.all([q(e), q(t)]);
			n === d && (u(0, s, r), u(1, c, i));
		},
		dessine(n, r, i, a) {
			t.viewport(0, 0, e.width, e.height), t.clearColor(0, 0, 0, 0), t.clear(t.COLOR_BUFFER_BIT), t.uniform1fv(l.ra, n), t.uniform1fv(l.rb, r), t.uniform1fv(l.rc, i), t.uniform1f(l.melange, a), t.drawArrays(t.TRIANGLE_STRIP, 0, 4);
		},
		detruit() {
			d++, t.getExtension("WEBGL_lose_context")?.loseContext();
		}
	};
}
var J = 316, ve = /* @__PURE__ */ D("<svg><image></svg>", 2), ye = /* @__PURE__ */ D("<svg><foreignObject><canvas style=width:100%;height:100%;display:block></svg>", 2), be = /* @__PURE__ */ D("<svg><filter filterUnits=userSpaceOnUse primitiveUnits=userSpaceOnUse color-interpolation-filters=sRGB><feTurbulence type=fractalNoise baseFrequency=0.05 numOctaves=4 seed=7></feTurbulence><feColorMatrix type=matrix values=\"1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1\"></feColorMatrix><feComponentTransfer><feFuncR type=linear></feFuncR><feFuncG type=linear></feFuncG><feFuncB type=linear></svg>", 2), xe = /* @__PURE__ */ D("<svg><mask maskUnits=userSpaceOnUse><rect></svg>", 2), Se = /* @__PURE__ */ D("<svg><defs><!><!><!><!></svg>", 2), Ce = (e, t) => v(k, {
	when: e,
	children: (e) => (() => {
		var n = ve();
		return w(n, "x", -158), w(n, "y", -158), w(n, "width", J), w(n, "height", J), w(n, "mask", t ? `url(#${t})` : void 0), y(() => e(), (e) => {
			w(n, "href", e);
		}), n;
	})()
});
function we(e) {
	let t = () => e.rendu().corps === "deux", [n, r] = M(!1), i = () => e.transition === "warp" && t(), a = () => e.transition === "dissolve" && t();
	return [
		v(k, {
			get when() {
				return i();
			},
			get children() {
				return v(Te, S(e, { onPret: r }));
			}
		}),
		v(k, {
			get when() {
				return a();
			},
			get children() {
				return v(De, {
					get passage() {
						return e.passage;
					},
					melange: () => e.rendu().melange
				});
			}
		}),
		v(k, {
			get when() {
				return x(() => !(i() && n()))() && !a();
			},
			get children() {
				return Ce(e.rendu().corps === "avant" ? e.passage.avant.url : e.passage.apres.url);
			}
		})
	];
}
function Te(e) {
	let [t, n] = M(!1), r = Math.round((e.size ?? J) * (globalThis.devicePixelRatio || 1)), i, a = () => i ? _e(i) : null, o = null;
	te(() => {
		o?.detruit(), e.onPret(!1);
	}), A(() => e.passage, (t) => {
		o ??= a();
		let { avant: r, apres: i } = t;
		!o || !r.url || !i.url || (n(!1), e.onPret(!1), o.corps(r.url, i.url).then(() => {
			n(!0), e.onPret(!0);
		}));
	}), A(() => {
		if (!t()) return null;
		let n = e.passage;
		return {
			p: n,
			s: e.clock() - n.debut,
			melange: e.rendu().melange
		};
	}, (e) => {
		if (!e || !o) return;
		let { p: t, s: n, melange: r } = e;
		o.dessine(t.avant.radii, t.apres.radii, me(t.avant.radii, t.apres.radii, n), r);
	});
	var s = ye(), c = s.firstChild;
	w(s, "x", -158), w(s, "y", -158), w(s, "width", J), w(s, "height", J);
	var l = i;
	return typeof l == "function" || Array.isArray(l) ? C(() => l, c) : i = c, w(c, "width", r), w(c, "height", r), y(() => t() ? "inline" : "none", (e) => {
		T(s, "display", e);
	}), s;
}
var Ee = .12;
function De(e) {
	let t = ee(), n = (t) => {
		let n = e.melange(), r = -1 / (.4 * Ee), i = (n * 1.12 + .75) / Ee;
		return t ? {
			pente: 20.833333333333332,
			origine: 1 - i
		} : {
			pente: r,
			origine: i
		};
	}, r = (e, t) => (() => {
		var r = be(), i = r.firstChild.nextSibling.nextSibling.firstChild, a = i.nextSibling, o = a.nextSibling;
		return w(r, "id", e), w(r, "x", -158), w(r, "y", -158), w(r, "width", J), w(r, "height", J), y(() => ({
			e: n(t).pente,
			t: n(t).origine,
			a: n(t).pente,
			o: n(t).origine,
			i: n(t).pente,
			n: n(t).origine
		}), ({ e, t, a: n, o: r, i: s, n: c }, l) => {
			e !== l?.e && w(i, "slope", e), t !== l?.t && w(i, "intercept", t), n !== l?.a && w(a, "slope", n), r !== l?.o && w(a, "intercept", r), s !== l?.i && w(o, "slope", s), c !== l?.n && w(o, "intercept", c);
		}), r;
	})(), i = (e, t) => (() => {
		var n = xe(), r = n.firstChild;
		return w(n, "id", e), w(n, "x", -158), w(n, "y", -158), w(n, "width", J), w(n, "height", J), w(r, "x", -158), w(r, "y", -158), w(r, "width", J), w(r, "height", J), w(r, "filter", `url(#${t})`), n;
	})();
	return [
		(() => {
			var e = Se(), n = e.firstChild, a = n.nextSibling, o = a.nextSibling, s = o.nextSibling;
			return b(e, () => r(`${t}-fa`, !0), n), b(e, () => r(`${t}-fb`, !1), a), b(e, () => i(`${t}-ma`, `${t}-fa`), o), b(e, () => i(`${t}-mb`, `${t}-fb`), s), e;
		})(),
		x(() => Ce(e.passage.avant.url, `${t}-ma`)),
		x(() => Ce(e.passage.apres.url, `${t}-mb`))
	];
}
//#endregion
//#region src/plush/slices.ts
var Oe = .5;
function ke(e, t, n) {
	let r = Math.min(t, n), i = t >= n, a = (Math.max(t, n) - r) / 2, [o, s] = i ? [e.kw * r, e.kh * r] : [e.kh * r, e.kw * r], c = Oe * r, l = o + 2 * c, u = (e, t, n, r) => i ? {
		src: "x",
		x: e,
		y: -s / 2,
		w: t - e,
		h: s,
		viewBox: `${n / l} 0 ${(r - n) / l} 1`
	} : {
		src: "y",
		x: -s / 2,
		y: e,
		w: s,
		h: t - e,
		viewBox: `0 ${n / l} 1 ${(r - n) / l}`
	}, d = [], f = (e, t, n, r) => {
		d.push(u(e, t, n, r)), d.push(u(-t, -e, l - r, l - n));
	}, p = Math.max(c, a / 3);
	p === c ? f(-a - o / 2, Math.min(-a + c, 0), 0, o / 2 + Math.min(a, c)) : f(-a - o / 2, -a, 0, o / 2);
	for (let e = +(p === c); e * p < a - 1e-9 * r; e++) {
		let t = -a + e * p, n = Math.min(t + p, 0), r = o / 2 + e % 2 * c;
		f(t, n, r, r + (n - t) / p * c);
	}
	return d;
}
function Ae(e) {
	let t = 0, n = 0;
	for (let r of e) t = Math.max(t, Math.abs(r.x), Math.abs(r.x + r.w)), n = Math.max(n, Math.abs(r.y), Math.abs(r.y + r.h));
	return {
		x: t,
		y: n
	};
}
//#endregion
//#region src/plush/motion.ts
var je = (e) => e === "thinking" || e === "asleep" || e === "failed" ? "idle" : e, Me = (t) => e.get(t === "asleep" ? "sleep" : t === "failed" ? "idle" : t).morph, Ne = {
	yaw: 0,
	pitch: 0,
	mix: 0,
	spin: 0,
	wander: .4
}, Pe = {
	yaw: 18,
	pitch: 22,
	mix: 1,
	spin: 0,
	wander: .4
}, Fe = {
	yaw: 0,
	pitch: 0,
	mix: 0,
	spin: 0,
	wander: .15,
	blink: 0
}, Ie = (e) => e === "thinking" ? Pe : e === "asleep" ? Fe : Ne, Le = (e, t, n) => ({
	yaw: f(e.yaw, t.yaw, n),
	pitch: f(e.pitch, t.pitch, n),
	mix: f(e.mix, t.mix, n),
	spin: f(e.spin, t.spin, n),
	wander: f(e.wander, t.wander, n),
	...e.blink === void 0 && t.blink === void 0 ? {} : { blink: f(e.blink ?? 1, t.blink ?? 1, n) }
}), Re = (e, t, n) => (r) => Le(e, t, u.easeOutQuint(d(r / n))), ze = .8, Be = (e) => e <= 0 || e >= .8 ? 0 : 12 * Math.sin(2 * r * e / ze) * Math.sin(Math.PI * e / ze);
function Ve(e, t) {
	let n = Re(e, Ie(t), Me(t));
	return t === "failed" ? (e) => {
		let t = n(e);
		return {
			...t,
			spin: t.spin + Be(e)
		};
	} : n;
}
var He = c.get("somnolent"), Ue = {
	w: .3,
	h: e.get("wink").pose(0).eyes[1].h,
	open: 1,
	tilt: 0
}, We = {
	id: "plush-asleep",
	gaze: He.gaze,
	split: He.split,
	eyes: [{ ...Ue }, { ...Ue }]
}, Ge = c.get("triste"), Ke = 1.8, qe = [.6, 1.7], Je = (e) => +(e.eyes[1].w * e.eyes[1].h > e.eyes[0].w * e.eyes[0].h), Ye = /* @__PURE__ */ new WeakMap();
function Xe(e) {
	let t = Ye.get(e);
	if (!t) {
		let { w: n, h: r } = e.eyes[Je(e)], i = n / r > qe[0] && n / r < qe[1] ? n / Ke : r, a = (e) => ({
			w: n,
			h: i,
			tilt: Ge.eyes[e].tilt,
			open: 1
		});
		t = {
			id: `${e.id}-failed`,
			gaze: { ...Ge.gaze },
			split: e.split,
			eyes: [a(0), a(1)]
		}, Ye.set(e, t);
	}
	return t;
}
var Ze = /* @__PURE__ */ new WeakMap();
function Qe(e, t) {
	let n = Ze.get(e);
	if (!n) {
		let r = e[Je(t)];
		n = [{
			...r,
			dx: e[0].dx,
			dy: e[0].dy
		}, {
			...r,
			dx: e[1].dx,
			dy: e[1].dy
		}], Ze.set(e, n);
	}
	return n;
}
var $e = {
	from: null,
	at: -Infinity,
	start: 1
}, et = (e, n) => e.from ? e.start + (1 - e.start) * u.easeOutQuint(d((n - e.at) / t.SHAPE_MORPH)) : 1, tt = (e, t, n) => ({
	from: t,
	at: n,
	start: 1 - et(e, n)
});
function nt(e, t) {
	let n = e.map(() => ({
		x: 0,
		y: 0
	}));
	if (t === 1 || !e.length) return n;
	let r = 0, i = 0;
	for (let { m: t } of e) r += (t[4] ?? 0) / e.length, i += (t[5] ?? 0) / e.length;
	let a = Math.hypot(r, i);
	if (a < 1e-6) return n;
	let o = r / a, s = i / a, c = -Infinity;
	for (let { m: t, w: n, h: r } of e) {
		let [e = 1, i = 0, a = 0, l = 1, u = 0, d = 0] = t, f = Math.hypot(n / 2 * (e * o + i * s), r / 2 * (a * o + l * s));
		c = Math.max(c, u * o + d * s + f);
	}
	let l = r + (c - a) * o, u = i + (c - a) * s;
	return e.map(({ m: e }) => ({
		x: (t - 1) * ((e[4] ?? 0) - l),
		y: (t - 1) * ((e[5] ?? 0) - u)
	}));
}
var rt = (e) => (e.match(/-?[\d.]+(?:e-?\d+)?/g) ?? []).map(Number), it = 30 / 205, at = .1, ot = s(0);
function st(e, t) {
	if (t >= 1) return;
	let [n = 1, r = 0, i = 0, a = 1] = e, o = r / t, s = a / t, c = n * a - r * i;
	return `matrix(${(a * n - i * o) / c},${(n * o - r * n) / c},${(a * i - i * s) / c},${(n * s - r * i) / c},0,0)`;
}
function ct(e, t, n, r, i) {
	if (n >= 1) return {
		w: r,
		h: i
	};
	let [a = 1, o = 0, s = 0, c = 1] = e, l = o / t, u = c / t;
	return {
		w: r * Math.hypot(a, l * n) / Math.hypot(a, l),
		h: i * Math.hypot(s, u * n) / Math.hypot(s, u)
	};
}
function lt(e, t, n, r, i) {
	if (t >= n) return null;
	let [, , , , a = 0, o = 0] = e, s = d((t - ot) / (n - ot)), c = Math.min(r.x, r.y), l = it * 2 * c, u = Math.max(l, Math.hypot(i.x - r.x + c, i.y - r.y + c) - c), f = l + s ** 8 * (u - l), p = at * 2 * c, m = [];
	for (let e = 3; e >= 0; e--) {
		let t = f + p * e / 4;
		m.push({
			w: r.x + t,
			h: r.y + t,
			r: c + t,
			alpha: 1 / (e + 1)
		});
	}
	return {
		x: a,
		y: o,
		s,
		bands: m
	};
}
var ut = (e, t) => e === "asleep" ? We : e === "failed" ? Xe(t) : null, dt = .62, ft = -1.3, pt = .6, mt = .3, Y = {
	phase: 0,
	at: -Infinity,
	from: 0,
	on: !1,
	exit: 1
};
function X(e, t) {
	let n = t - e.at;
	return e.on ? e.from + (1 - e.from) * u.easeOutCubic(d(n / mt)) : e.from * (1 - u.easeOutQuint(d(n / e.exit)));
}
function ht(e, t, n, r) {
	if (t === e.on) return e;
	let i = X(e, n);
	return {
		phase: t && i < .001 ? n : e.phase,
		at: n,
		from: i,
		on: t,
		exit: Me(r)
	};
}
function gt(e, t) {
	let r = X(e, t);
	return r < .001 ? [] : i.map((i, a) => {
		let o = p(t - e.phase, a);
		return {
			x: dt + i * pt,
			y: ft,
			r: n * pt * (1 + (l - 1) * o) * (.5 + .5 * r),
			opacity: r * (.55 + .45 * o)
		};
	});
}
var _t = 3, vt = {
	x: .55,
	y: -.74
}, yt = {
	x: 1.25,
	y: -1.38
}, bt = [.1, .2];
function xt(e, t) {
	let n = X(e, t);
	if (n < .001) return [];
	let i = [];
	for (let a = 0; a < _t; a++) {
		let o = (((t - e.phase) / 3 - a / _t) % 1 + 1) % 1, s = d(o / .15) * d((1 - o) / .45);
		s * n < .001 || i.push({
			x: f(vt.x, yt.x, o) + Math.sin(o * r) * .04,
			y: f(vt.y, yt.y, o),
			size: f(bt[0], bt[1], o),
			opacity: s * n
		});
	}
	return i;
}
//#endregion
//#region src/plush/layer.tsx
var St = /* @__PURE__ */ D("<svg><g><g><!><!></g><!><!><!></svg>", 2), Ct = /* @__PURE__ */ D("<svg><g></svg>", 2), wt = /* @__PURE__ */ D("<svg preserveAspectRatio=none><image width=1 height=1 preserveAspectRatio=none>"), Tt = /* @__PURE__ */ D("<svg><g><g><!><!></svg>", 2), Et = /* @__PURE__ */ D("<svg><g><path fill=none stroke=#1c1a1d stroke-linecap=round></svg>", 2), Dt = /* @__PURE__ */ D("<svg><mask><g><g><g></svg>", 2), Ot = /* @__PURE__ */ D("<svg><rect fill=#fff></svg>", 2), kt = /* @__PURE__ */ D("<svg><image></svg>", 2), At = /* @__PURE__ */ D("<svg><path fill=none stroke-linecap=round stroke-linejoin=round></svg>", 2), Z = .8, jt = .24, Q = (e) => Math.round(e * 10) / 10, Mt = .42, Nt = .2, Pt = "mix-blend-mode:plus-lighter", Ft = "isolation:isolate";
function It(e) {
	let t = () => e.context.frame(), n = () => e.notif ? t().notif : null, r = j(() => (t(), e.frozen ? K : pe(e.transition, e.context.clock() - e.passage.debut)));
	A(() => {
		let { bascule: e, fini: t } = r();
		return `${e}|${t}`;
	}, (t) => {
		let [n, r] = t.split("|");
		e.onStep?.({
			bascule: n === "true",
			fini: r === "true"
		});
	});
	let i = () => {
		let { sx: e, sy: t } = r();
		return e === 1 && t === 1 ? void 0 : `scale(${e},${t})`;
	}, a = j(() => (t(), gt(e.dots, e.context.time()))), o = j(() => (t(), xt(e.zs, e.context.time()))), s = j(() => (t(), e.padFade ? et(e.padFade, e.context.clock()) : 1)), c = j(() => (t(), X(e.zs, e.context.time()))), l = j(() => {
		let n = e.eyeScale ?? 1;
		return n === 1 ? null : nt(t().eyes.map((t, n) => {
			let r = e.pads[n] ?? e.pads[0], i = rt(t.matrix);
			return i[4] = (i[4] ?? 0) + r.dx * 100, i[5] = (i[5] ?? 0) + r.dy * 100, {
				m: i,
				w: t.w,
				h: t.h
			};
		}), n);
	}), u = () => e.eyeScale && e.eyeScale !== 1 ? ` scale(${e.eyeScale})` : "", d = () => e.passage.apres.url === null;
	var f = St(), p = f.firstChild, m = p.firstChild, h = m.nextSibling, _ = p.nextSibling, x = _.nextSibling, S = x.nextSibling;
	return b(p, v(we, {
		get passage() {
			return e.passage;
		},
		get transition() {
			return e.transition;
		},
		rendu: r,
		get clock() {
			return e.context.clock;
		},
		get size() {
			return e.size;
		}
	}), m), b(p, v(O, {
		get each() {
			return t().eyes;
		},
		keyed: !1,
		children: (t, n) => {
			let r = () => e.pads[n] ?? e.pads[0], i = () => {
				let t = e.padFade?.from, i = t?.[n] ?? t?.[0];
				return i && i.file !== r().file && s() < 1 ? i : null;
			}, a = j(() => rt(t().matrix)), o = j(() => ct(a(), t().open, t().rest, t().w, t().h)), d = j(() => ke(r(), o().w, o().h)), f = j(() => st(a(), t().open)), p = j(() => {
				let e = {
					x: o().w / 2,
					y: o().h / 2
				};
				return lt(a(), t().open, t().rest, e, Ae(d()));
			}), m = `${e.context.uid}-paupiere-${n}`, h = () => r().dx * 100 + (l()?.[n]?.x ?? 0), _ = () => r().dy * 100 + (l()?.[n]?.y ?? 0), x = (t, n, r) => {
				let i = () => n().length > 1;
				var a = Ct();
				return b(a, v(O, {
					get each() {
						return n();
					},
					keyed: !1,
					children: (n) => (() => {
						var r = wt(), a = r.firstChild;
						return y(() => ({
							e: n().x,
							t: n().y,
							a: n().w,
							o: n().h,
							i: n().viewBox,
							n: i() ? Pt : void 0,
							s: e.padHref(t().images[n().src])
						}), ({ e, t, a: n, o: i, i: o, n: s, s: c }, l) => {
							e !== l?.e && w(r, "x", e), t !== l?.t && w(r, "y", t), n !== l?.a && w(r, "width", n), i !== l?.o && w(r, "height", i), o !== l?.i && w(r, "viewBox", o), E(r, s, l?.n), c !== l?.s && w(a, "href", c);
						}), r;
					})()
				})), y(() => ({
					e: r() < 1 ? r() : void 0,
					t: f(),
					a: i() ? Ft : void 0
				}), ({ e, t, a: n }, r) => {
					e !== r?.e && w(a, "opacity", e), t !== r?.t && w(a, "transform", t), E(a, n, r?.a);
				}), a;
			}, S = () => `translate(${h()},${_()}) ${t().matrix}${u()}`;
			return [v(k, {
				get when() {
					return c() < 1;
				},
				get children() {
					var e = Tt(), n = e.firstChild, a = n.firstChild, l = a.nextSibling;
					return b(e, v(k, {
						get when() {
							return p();
						},
						children: (e) => {
							let t = g(p), n = () => h() + t().x, r = () => _() + t().y;
							var i = Dt(), a = i.firstChild, o = a.firstChild, s = o.firstChild;
							return w(i, "id", m), b(s, v(O, {
								get each() {
									return t().bands;
								},
								keyed: !1,
								children: (e) => (() => {
									var t = Ot();
									return y(() => ({
										e: -e().w,
										t: -e().h,
										a: 2 * e().w,
										o: 2 * e().h,
										i: e().r,
										n: e().alpha
									}), ({ e, t: n, a: r, o: i, i: a, n: o }, s) => {
										e !== s?.e && w(t, "x", e), n !== s?.t && w(t, "y", n), r !== s?.a && w(t, "width", r), i !== s?.o && w(t, "height", i), a !== s?.i && w(t, "rx", a), o !== s?.n && w(t, "fill-opacity", o);
									}), t;
								})()
							})), y(() => ({
								e: `translate(${n()},${r()}) scale(1,${t().s}) translate(${-n()},${-r()})`,
								t: S(),
								a: f()
							}), ({ e, t, a: n }, r) => {
								e !== r?.e && w(a, "transform", e), t !== r?.t && w(o, "transform", t), n !== r?.a && w(s, "transform", n);
							}), i;
						}
					}), e.firstChild), b(n, v(k, {
						get when() {
							return i();
						},
						children: (e) => {
							let t = g(i), n = j(() => ke(t(), o().w, o().h));
							return x(t, n, () => (1 - c()) * (1 - s()));
						}
					}), a), b(n, () => x(r, d, () => (1 - c()) * (i() ? s() : 1)), l), y(() => ({
						e: p() ? `url(#${m})` : void 0,
						t: S(),
						a: t().alpha
					}), ({ e: t, t: r, a: i }, a) => {
						t !== a?.e && w(e, "mask", t), r !== a?.t && w(n, "transform", r), i !== a?.a && w(n, "opacity", i);
					}), e;
				}
			}), v(k, {
				get when() {
					return c() > 0;
				},
				get children() {
					var e = Et(), n = e.firstChild;
					return y(() => ({
						e: S(),
						t: t().alpha,
						a: `M${Q(-t().w / 2)},0Q0,${Q(t().w * Mt)} ${Q(t().w / 2)},0`,
						o: Q(t().w * Nt),
						i: c()
					}), ({ e: t, t: r, a: i, o: a, i: o }, s) => {
						t !== s?.e && w(e, "transform", t), r !== s?.t && w(e, "opacity", r), i !== s?.a && w(n, "d", i), a !== s?.o && w(n, "stroke-width", a), o !== s?.i && w(n, "opacity", o);
					}), e;
				}
			})];
		}
	}), h), b(f, v(k, {
		get when() {
			return e.dot;
		},
		children: (e) => v(O, {
			get each() {
				return a();
			},
			keyed: !1,
			children: (t) => (() => {
				var n = kt();
				return y(() => ({
					e: e(),
					t: (t().x - t().r / Z) * 100,
					a: (t().y - t().r / Z) * 100,
					o: 2 * t().r / Z * 100,
					i: 2 * t().r / Z * 100,
					n: t().opacity
				}), ({ e, t, a: r, o: i, i: a, n: o }, s) => {
					e !== s?.e && w(n, "href", e), t !== s?.t && w(n, "x", t), r !== s?.a && w(n, "y", r), i !== s?.o && w(n, "width", i), a !== s?.i && w(n, "height", a), o !== s?.n && w(n, "opacity", o);
				}), n;
			})()
		})
	}), _), b(f, v(O, {
		get each() {
			return o();
		},
		keyed: !1,
		children: (t) => {
			let n = () => {
				let { x: e, y: n, size: r } = t(), i = r * 100 / 2, a = e * 100, o = n * 100;
				return `M${Q(a - i)},${Q(o - i)}H${Q(a + i)}L${Q(a - i)},${Q(o + i)}H${Q(a + i)}`;
			};
			var r = At();
			return y(() => ({
				e: n(),
				t: e.context.ink(),
				a: Q(t().size * 100 * jt),
				o: t().opacity
			}), ({ e, t, a: n, o: i }, a) => {
				e !== a?.e && w(r, "d", e), t !== a?.t && w(r, "stroke", t), n !== a?.a && w(r, "stroke-width", n), i !== a?.o && w(r, "opacity", i);
			}), r;
		}
	}), x), b(f, v(k, {
		get when() {
			return n();
		},
		children: (t) => {
			let r = g(n);
			var i = kt();
			return y(() => ({
				e: e.notif,
				t: r().x - r().r / Z,
				a: r().y - r().r / Z,
				o: 2 * r().r / Z,
				i: 2 * r().r / Z
			}), ({ e, t, a: n, o: r, i: a }, o) => {
				e !== o?.e && w(i, "href", e), t !== o?.t && w(i, "x", t), n !== o?.a && w(i, "y", n), r !== o?.o && w(i, "width", r), a !== o?.i && w(i, "height", a);
			}), i;
		}
	}), S), y(() => ({
		e: d() ? "hidden" : void 0,
		t: t().bodyAlpha,
		a: i()
	}), ({ e, t, a: n }, r) => {
		e !== r?.e && w(f, "visibility", e), t !== r?.t && w(p, "opacity", t), n !== r?.a && w(p, "transform", n);
	}), f;
}
//#endregion
//#region src/plush/tint.ts
var Lt = .55, Rt = {
	gamma: .6,
	sheen: .08
}, zt = (e) => e <= .04045 ? e / 12.92 : ((e + .055) / 1.055) ** 2.4, Bt = (e) => e <= .0031308 ? e * 12.92 : 1.055 * e ** (1 / 2.4) - .055;
function Vt(e) {
	let t = Number.parseInt(e.slice(1), 16);
	return [
		t >> 16 & 255,
		t >> 8 & 255,
		t & 255
	];
}
function Ht(e, { gamma: t, sheen: n } = Rt) {
	let r = Vt(e).map((e) => zt(e / 255)), i = zt(Lt), a = /* @__PURE__ */ new Uint8ClampedArray(768);
	for (let e = 0; e < 256; e++) {
		let o = (zt(e / 255) / i) ** t, s = n * Math.max(0, (e / 255 - Lt) / .44999999999999996) ** 2;
		for (let t = 0; t < 3; t++) {
			let n = Math.min(1, r[t] * o);
			a[e * 3 + t] = Math.round(Bt(n + (1 - n) * s) * 255);
		}
	}
	return a;
}
var $ = /* @__PURE__ */ new Map();
function Ut(e) {
	return new Promise((t, n) => {
		let r = new FileReader();
		r.onload = () => typeof r.result == "string" ? t(r.result) : n(/* @__PURE__ */ Error("plush: teinture illisible")), r.onerror = () => n(r.error ?? /* @__PURE__ */ Error("plush: teinture illisible")), r.readAsDataURL(e);
	});
}
function Wt(e) {
	return new Promise((t, n) => {
		let r = new Image();
		r.crossOrigin = "anonymous", r.onload = () => t(r), r.onerror = () => n(/* @__PURE__ */ Error(`plush: image introuvable ${e}`)), r.src = e;
	});
}
function Gt(e, t) {
	let n = `${t.toLowerCase()} ${e}`, r = $.get(n);
	return r || (r = Wt(e).then((e) => {
		let n = document.createElement("canvas");
		n.width = e.naturalWidth, n.height = e.naturalHeight;
		let r = n.getContext("2d", { willReadFrequently: !0 });
		r.drawImage(e, 0, 0);
		let i = r.getImageData(0, 0, n.width, n.height), a = Ht(t), o = i.data;
		for (let e = 0; e < o.length; e += 4) {
			let t = o[e] * 3;
			o[e] = a[t], o[e + 1] = a[t + 1], o[e + 2] = a[t + 2];
		}
		return r.putImageData(i, 0, 0), new Promise((e) => n.toBlob(e, "image/webp", .92)).then((e) => e ? Ut(e) : n.toDataURL());
	}), r.catch(() => $.delete(n)), $.set(n, r)), r;
}
//#endregion
//#region src/plush/PlushBot.tsx
var Kt = 2.4;
function qt(e) {
	let n = j(() => e.character ? R.get(e.character) ?? null : null), r = (t) => e.assetBase ? `${e.assetBase}${t}` : ne[t] ?? "", i = j(() => {
		let t = n();
		if (t) return t.ink;
		let r = e.color ?? "encre";
		return o.get(r)?.hex ?? (/^#[0-9a-f]{6}$/i.test(r) ? r : "#0a0a0c");
	}), s = j(() => n()?.shape ?? e.shape ?? "cercle"), l = c.get(_), u = () => e.state ?? "idle", d = () => e.transition ?? "flip", f = j(() => {
		let e = n(), t = e ? {
			url: r(e.body),
			hex: null
		} : {
			url: r(se(s())),
			hex: i()
		};
		return {
			clef: `${t.hex ?? ""}|${t.url}`,
			source: t,
			shape: s(),
			pads: e?.pads ?? [oe, oe],
			face: e?.face ?? null
		};
	}), p = (e) => ({
		url: e.url,
		radii: a.get(e.shape)?.radii ?? []
	}), g = N(() => {
		let { source: e, ...t } = f();
		return {
			...t,
			url: null
		};
	}), [y, b] = M({
		avant: g,
		apres: g,
		debut: -Infinity
	}), [S, C] = M(!0), w = null, T = !1, E = null;
	function D(t) {
		let n = N(y);
		if (n.apres.clef === t.clef) {
			w = null, b({
				avant: n.avant.clef === t.clef ? t : n.avant,
				apres: t,
				debut: n.debut
			});
			return;
		}
		if (T && N(d) !== "cut") {
			w = t;
			return;
		}
		if (w = null, !E || N(() => e.frozenAt) !== void 0 || n.apres.url === null || N(d) === "cut") {
			b({
				avant: t,
				apres: t,
				debut: -Infinity
			}), C(!0);
			return;
		}
		T = !0, E.hold(de[N(d)]), b({
			avant: n.apres,
			apres: t,
			debut: E.clock()
		}), C(pe(N(d), 0).bascule);
	}
	function O(e) {
		C(e.bascule), e.fini && (T = !1, w && D(w));
	}
	let k = () => {
		let e = y();
		return S() ? e.apres : e.avant;
	}, ee = j(() => {
		let t = ut(u(), k().face ?? l);
		if (t) return t;
		let n = e.expression;
		return n === void 0 ? k().face ?? l : typeof n == "string" ? c.get(n) ?? l : n;
	}), re = (e) => e === "failed" ? Qe(k().pads, k().face ?? l) : k().pads, ie = j(() => re(u())), P = /* @__PURE__ */ new Set();
	A(() => k().pads.flatMap((e) => [r(e.images.x), r(e.images.y)]).join("|"), (e) => {
		if (!(typeof Image > "u")) {
			P.clear();
			for (let t of e.split("|")) {
				if (!t) continue;
				let e = new Image();
				e.src = t, P.add(e);
			}
		}
	}), te(() => P.clear());
	let ae = j(() => {
		let e = y();
		return {
			avant: p(e.avant),
			apres: p(e.apres),
			debut: e.debut
		};
	}), [F, I] = M(null), [L, le] = M(null), z = !0;
	te(() => {
		z = !1;
	});
	function B(e, t) {
		let n = 0;
		A(() => {
			let { url: t, hex: n } = e();
			return `${n ?? ""}|${t}`;
		}, (e) => {
			let [r, i] = e.split("|"), a = ++n;
			if (!r) return void t(i);
			typeof document > "u" || Gt(i, r).then((e) => z && a === n && t(e), () => z && a === n && t(null));
		});
	}
	B(() => f().source, (e) => {
		let { source: t, ...n } = N(f);
		D({
			...n,
			url: e
		});
	}), B(() => ({
		url: r(ce),
		hex: i()
	}), I), B(() => ({
		url: r(ce),
		hex: m
	}), le);
	let V = Ie(N(u)), H = V, U = (e) => ({ run: (t) => H = e(t) }), [ue, W] = M(U(() => V));
	A(u, (e, t) => {
		t !== void 0 && W(U(Ve(H, e)));
	});
	let [G, fe] = M(N(u) === "thinking" ? {
		...Y,
		from: 1,
		on: !0
	} : Y), [K, me] = M(N(u) === "asleep" ? {
		...Y,
		from: 1,
		on: !0
	} : Y), [he, ge] = M($e);
	A(u, (t, n) => {
		if (!E || n === void 0 || t === "failed" == (n === "failed") || N(() => e.frozenAt) !== void 0) return;
		let r = N(() => re(n));
		ge((e) => tt(e, r, E.clock()));
	}), A(u, (e) => {
		E && (E.hold(Math.max(Me(e), e === "failed" ? ze : 0, mt, t.SHAPE_MORPH)), fe((t) => ht(t, e === "thinking", E.clock(), e)), me((t) => ht(t, e === "asleep", E.clock(), e)));
	});
	let q = N(() => [{
		state: je(u()),
		duration: Kt
	}]);
	return v(h, {
		get size() {
			return e.size;
		},
		get shape() {
			return k().shape;
		},
		get color() {
			return i();
		},
		get expression() {
			return ee();
		},
		get state() {
			return je(u());
		},
		cycle: q,
		get fps() {
			return e.fps;
		},
		get autoPause() {
			return e.autoPause;
		},
		get paused() {
			return e.paused;
		},
		get frozenAt() {
			return e.frozenAt;
		},
		get follow() {
			return x(() => !!e.follow)() ? u() === "idle" || u() === "wink" || u() === "wide" || u() === "notify" : e.follow;
		},
		get gaze() {
			return ue().run;
		},
		get initialPhase() {
			return e.initialPhase;
		},
		get ariaLabel() {
			return e.ariaLabel ?? "Animated plush Bloub avatar";
		},
		get class() {
			return e.class;
		},
		get style() {
			return e.style;
		},
		layer: (t) => (E = t, v(It, {
			context: t,
			get passage() {
				return ae();
			},
			get transition() {
				return d();
			},
			get frozen() {
				return e.frozenAt !== void 0;
			},
			onStep: O,
			get size() {
				return e.size;
			},
			get pads() {
				return ie();
			},
			get eyeScale() {
				return e.eyeScale;
			},
			get padFade() {
				return he();
			},
			padHref: r,
			get dot() {
				return F();
			},
			get notif() {
				return L();
			},
			get dots() {
				return G();
			},
			get zs() {
				return K();
			}
		}))
	});
}
//#endregion
export { z as DEFAULT_TRANSITION, L as PLUSH_CHARACTERS, R as PLUSH_CHARACTER_BY_ID, re as PLUSH_SHAPES, ie as PLUSH_STATES, le as PLUSH_TRANSITIONS, qt as PlushBot, Ht as tintRamp };
