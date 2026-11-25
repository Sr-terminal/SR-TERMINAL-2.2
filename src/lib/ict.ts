// @ts-nocheck
import type { Candle } from "./market"
import type { ConceptSelection } from "./concepts"
import { etTime as is } from "./clock"

function ah(r, e) {
  const s = new Array(r.length).fill(NaN);
  if (r.length < e) return s;
  const l = 2 / (e + 1);
  let u = 0;
  for (let c = 0; c < e; c++) u += r[c];
  s[e - 1] = u / e;
  for (let c = e; c < r.length; c++) s[c] = r[c] * l + s[c - 1] * (1 - l);
  return s;
}
function Ox(r, e = 14) {
  const s = new Array(r.length).fill(NaN);
  if (r.length < e + 1) return s;
  const l = [0];
  for (let c = 1; c < r.length; c++)
    l.push(
      Math.max(
        r[c].h - r[c].l,
        Math.abs(r[c].h - r[c - 1].c),
        Math.abs(r[c].l - r[c - 1].c),
      ),
    );
  let u = 0;
  for (let c = 1; c <= e; c++) u += l[c];
  s[e] = u / e;
  for (let c = e + 1; c < r.length; c++) s[c] = (s[c - 1] * (e - 1) + l[c]) / e;
  return s;
}
function Rx(r, e = 14) {
  const s = new Array(r.length).fill(NaN);
  if (r.length < e + 1) return s;
  let l = 0,
    u = 0;
  for (let f = 1; f <= e; f++) {
    const m = r[f] - r[f - 1];
    m >= 0 ? (l += m) : (u -= m);
  }
  let c = l / e,
    d = u / e;
  s[e] = d === 0 ? 100 : 100 - 100 / (1 + c / d);
  for (let f = e + 1; f < r.length; f++) {
    const m = r[f] - r[f - 1];
    ((c = (c * (e - 1) + Math.max(0, m)) / e),
      (d = (d * (e - 1) + Math.max(0, -m)) / e),
      (s[f] = d === 0 ? 100 : 100 - 100 / (1 + c / d)));
  }
  return s;
}
function zx(r, e = 14) {
  const s = new Array(r.length).fill(null);
  if (r.length < 2 * e) return s;
  const l = [0],
    u = [0],
    c = [0];
  for (let x = 1; x < r.length; x++) {
    const M = r[x].h - r[x - 1].h,
      w = r[x - 1].l - r[x].l;
    (u.push(M > w && M > 0 ? M : 0),
      c.push(w > M && w > 0 ? w : 0),
      l.push(
        Math.max(
          r[x].h - r[x].l,
          Math.abs(r[x].h - r[x - 1].c),
          Math.abs(r[x].l - r[x - 1].c),
        ),
      ));
  }
  let d = 0,
    f = 0,
    m = 0;
  for (let x = 1; x <= e; x++) ((d += l[x]), (f += u[x]), (m += c[x]));
  const b = [];
  let v = 0,
    y = !1;
  for (let x = e + 1; x < r.length; x++) {
    ((d = d - d / e + l[x]), (f = f - f / e + u[x]), (m = m - m / e + c[x]));
    const M = d === 0 ? 0 : (100 * f) / d,
      w = d === 0 ? 0 : (100 * m) / d,
      O = M + w,
      _ = O === 0 ? 0 : (100 * Math.abs(M - w)) / O;
    if ((b.push({ dx: _, i: x }), b.length >= e)) {
      if (y) v = (v * (e - 1) + _) / e;
      else {
        let L = 0;
        for (let K = b.length - e; K < b.length; K++) L += b[K].dx;
        ((v = L / e), (y = !0));
      }
      s[x] = { adx: v, pdi: M, mdi: w };
    }
  }
  return s;
}
function Dx(r, e = 2) {
  const s = [];
  for (let l = e; l < r.length - e; l++) {
    let u = !0,
      c = !0;
    for (let d = 1; d <= e; d++)
      ((r[l].h <= r[l - d].h || r[l].h < r[l + d].h) && (u = !1),
        (r[l].l >= r[l - d].l || r[l].l > r[l + d].l) && (c = !1));
    (u && s.push({ i: l, price: r[l].h, kind: "H", swept: !1, sweptAt: -1 }),
      c && s.push({ i: l, price: r[l].l, kind: "L", swept: !1, sweptAt: -1 }));
  }
  for (const l of s)
    for (let u = l.i + e + 1; u < r.length; u++) {
      if (l.kind === "H" && r[u].h > l.price) {
        ((l.swept = !0), (l.sweptAt = u));
        break;
      }
      if (l.kind === "L" && r[u].l < l.price) {
        ((l.swept = !0), (l.sweptAt = u));
        break;
      }
    }
  return s;
}
function Lx(r, e) {
  const s = r.length,
    l = (m, b) => {
      let v;
      for (const y of e)
        y.kind !== m || y.i < b || ((!v || y.i > v.i) && (v = y));
      return v;
    },
    u = (m, b) => {
      let v;
      for (const y of e)
        y.kind !== m ||
          y.i < b ||
          (v
            ? ((m === "H" && y.price > v.price) ||
                (m === "L" && y.price < v.price)) &&
              (v = y)
            : (v = y));
      return v;
    },
    c = Math.max(0, s - 150),
    d = Math.max(0, s - 60),
    f = Math.max(0, s - 25);
  return {
    sth: l("H", f),
    stl: l("L", f),
    ith: u("H", d) ?? l("H", d),
    itl: u("L", d) ?? l("L", d),
    lth: u("H", c) ?? l("H", c),
    ltl: u("L", c) ?? l("L", c),
  };
}
function kx(r, e, s) {
  const l = [],
    u = 0.35 * s,
    c = (f, m) => {
      if (m.length === 0) return;
      const b = m.reduce((x, M) => x + M.price, 0) / m.length;
      let v = !1;
      for (const x of m) {
        x.swept && (v = !0);
        for (let M = x.i + 3; M < r.length; M++) {
          if (f === "BSL" && r[M].h > x.price + u * 0.2) {
            v = !0;
            break;
          }
          if (f === "SSL" && r[M].l < x.price - u * 0.2) {
            v = !0;
            break;
          }
        }
        if (v) break;
      }
      const y = m[m.length - 1].i;
      l.push({
        kind: f,
        price: b,
        touches: m.length,
        strength: m.length,
        i: y,
        swept: v,
      });
    },
    d = new Set();
  for (const f of e) {
    if (d.has(f.i)) continue;
    const m = e.filter(
      (b) =>
        b.kind === f.kind && Math.abs(b.price - f.price) <= u && !d.has(b.i),
    );
    for (const b of m) d.add(b.i);
    f.kind === "H" ? c("BSL", m) : c("SSL", m);
  }
  return l.sort((f, m) => m.i - f.i);
}
function Hv(r, e) {
  const s = [];
  for (let l = 2; l < r.length; l++) {
    const u = r[l - 1],
      c = Math.abs(u.c - u.o),
      d = u.h - u.l;
    if (!(d <= 0) && !(c < 0.55 * e || c / d < 0.52)) {
      if (r[l].l > r[l - 2].h) {
        const f = r[l].l,
          m = r[l - 2].h;
        let b = !1;
        for (let v = l + 1; v < r.length; v++)
          if (r[v].l <= (f + m) / 2) {
            b = !0;
            break;
          }
        s.push({
          dir: "bull",
          top: f,
          bottom: m,
          ce: (f + m) / 2,
          i: l,
          mitigated: b,
        });
      } else if (r[l].h < r[l - 2].l) {
        const f = r[l - 2].l,
          m = r[l].h;
        let b = !1;
        for (let v = l + 1; v < r.length; v++)
          if (r[v].h >= (f + m) / 2) {
            b = !0;
            break;
          }
        s.push({
          dir: "bear",
          top: f,
          bottom: m,
          ce: (f + m) / 2,
          i: l,
          mitigated: b,
        });
      }
    }
  }
  return s;
}
function Ux(r, e) {
  const s = [];
  for (let l = 1; l < r.length; l++) {
    const u = r[l];
    if (Math.abs(u.c - u.o) < 1 * e) continue;
    const d = u.c > u.o ? "bull" : "bear";
    for (let f = l - 1; f >= Math.max(0, l - 4); f--)
      if (d === "bull" ? r[f].c < r[f].o : r[f].c > r[f].o) {
        const b = Math.max(r[f].h, r[f].o, r[f].c),
          v = Math.min(r[f].l, r[f].o, r[f].c);
        let y = !1;
        for (let x = l + 1; x < r.length; x++) {
          if (d === "bull" && r[x].c < v) {
            y = !0;
            break;
          }
          if (d === "bear" && r[x].c > b) {
            y = !0;
            break;
          }
        }
        s.push({ dir: d, top: b, bottom: v, i: f, mitigated: y });
        break;
      }
  }
  return s.filter((l) => !l.mitigated).sort((l, u) => u.i - l.i);
}
function Bx(r, e, s = 2) {
  const l = [];
  let u = null,
    c = null,
    d = null;
  const f = new Map();
  for (const m of e) {
    const b = f.get(m.i) ?? [];
    (b.push(m), f.set(m.i, b));
  }
  for (let m = 0; m < r.length; m++) {
    const b = f.get(m - s - 1);
    if (b)
      for (const v of b)
        (v.kind === "H" && (!c || v.i > c.i) && (c = v),
          v.kind === "L" && (!d || v.i > d.i) && (d = v));
    c && r[m].c > c.price
      ? (l.push({
          type: u === "bull" ? "BOS" : "CHoCH",
          dir: "bull",
          i: m,
          level: c.price,
        }),
        (u = "bull"),
        (c = null))
      : d &&
        r[m].c < d.price &&
        (l.push({
          type: u === "bear" ? "BOS" : "CHoCH",
          dir: "bear",
          i: m,
          level: d.price,
        }),
        (u = "bear"),
        (d = null));
  }
  return l;
}
function Hx(r, e, s) {
  const l = [];
  for (const u of e)
    for (let c = u.i + 3; c < r.length; c++)
      if (u.kind === "H") {
        if (r[c].h > u.price && r[c].c < u.price) {
          let d = !1;
          for (let f = c + 1; f < Math.min(r.length, c + 5); f++)
            if (Math.abs(r[f].c - r[f].o) >= 0.75 * s && r[f].c < r[f].o) {
              d = !0;
              break;
            }
          l.push({
            dir: "bear",
            i: c,
            level: u.price,
            wick: r[c].h - u.price,
            displacementAfter: d,
          });
          break;
        }
        if (r[c].c > u.price) break;
      } else {
        if (r[c].l < u.price && r[c].c > u.price) {
          let d = !1;
          for (let f = c + 1; f < Math.min(r.length, c + 5); f++)
            if (Math.abs(r[f].c - r[f].o) >= 0.75 * s && r[f].c > r[f].o) {
              d = !0;
              break;
            }
          l.push({
            dir: "bull",
            i: c,
            level: u.price,
            wick: u.price - r[c].l,
            displacementAfter: d,
          });
          break;
        }
        if (r[c].c < u.price) break;
      }
  return l.sort((u, c) => c.i - u.i);
}
function qx(r, e) {
  const s = [];
  for (let l = 0; l < r.length; l++) {
    const u = Math.abs(r[l].c - r[l].o),
      c = r[l].h - r[l].l;
    if (c <= 0) continue;
    const d = u / c;
    u >= 0.75 * e &&
      d >= 0.58 &&
      s.push({ dir: r[l].c > r[l].o ? "bull" : "bear", i: l, body: u, eff: d });
  }
  return s;
}
function Yx(r, e) {
  const s = [];
  for (const l of e)
    for (let u = l.i + 1; u < Math.min(r.length, l.i + 7); u++) {
      const c = r[u].c > r[u].o,
        d = u + 1 < r.length ? r[u + 1].c > r[u + 1].o : null;
      if (l.dir === "bull" && c && d) {
        s.push({ dir: "bull", i: u + 1 });
        break;
      }
      if (l.dir === "bear" && !c && d === !1) {
        s.push({ dir: "bear", i: u + 1 });
        break;
      }
    }
  return s;
}
function Vx(r) {
  const e = [];
  for (let s = 0; s < r.length; s++)
    for (let l = 0; l < r.length; l++) {
      if (s === l || r[s].dir === r[l].dir || r[l].i <= r[s].i) continue;
      const u = Math.min(r[s].top, r[l].top),
        c = Math.max(r[s].bottom, r[l].bottom);
      u > c &&
        e.push({
          dir: r[l].dir,
          top: u,
          bottom: c,
          ce: (u + c) / 2,
          i: r[l].i,
        });
    }
  return e.sort((s, l) => l.i - s.i);
}
function Gx(r, e) {
  const s = [];
  let u = null,
    c = null;
  const d = (f) => {
    let m = -1 / 0,
      b = 1 / 0,
      v = -1,
      y = -1;
    for (let x = Math.max(0, f - 20); x < f; x++)
      (r[x].h > m && ((m = r[x].h), (v = x)),
        r[x].l < b && ((b = r[x].l), (y = x)));
    return { hh: m, ll: b, hhIdx: v, llIdx: y };
  };
  for (let f = 20; f < r.length; f++) {
    const { hh: m, ll: b, hhIdx: v, llIdx: y } = d(f),
      x = v >= 0 && v <= f - 4,
      M = y >= 0 && y <= f - 4;
    (x && r[f].h > m && r[f].c < m
      ? s.push({
          dir: "bear",
          i: f,
          level: m,
          wickExtreme: Math.max(r[f].h, m),
          plusOne: !1,
        })
      : x && r[f].c > m && (u = { level: m, i: f, wick: r[f].h }),
      M && r[f].l < b && r[f].c > b
        ? s.push({
            dir: "bull",
            i: f,
            level: b,
            wickExtreme: Math.min(r[f].l, b),
            plusOne: !1,
          })
        : M && r[f].c < b && (c = { level: b, i: f, wick: r[f].l }),
      u &&
        f > u.i &&
        f <= u.i + 3 &&
        ((u.wick = Math.max(u.wick, r[f].h)),
        r[f].c < u.level
          ? (s.push({
              dir: "bear",
              i: f,
              level: u.level,
              wickExtreme: u.wick,
              plusOne: !0,
            }),
            (u = null))
          : f === u.i + 3 && (u = null)),
      c &&
        f > c.i &&
        f <= c.i + 3 &&
        ((c.wick = Math.min(c.wick, r[f].l)),
        r[f].c > c.level
          ? (s.push({
              dir: "bull",
              i: f,
              level: c.level,
              wickExtreme: c.wick,
              plusOne: !0,
            }),
            (c = null))
          : f === c.i + 3 && (c = null)));
  }
  return s;
}
function Kx(r) {
  const e = r.length;
  if (e < 60) return { phase: "CONSOLIDATION", dir: "neutral" };
  const s = (b, v) => {
      let y = -1 / 0,
        x = 1 / 0,
        M = 0;
      for (let w = b; w < v; w++)
        ((y = Math.max(y, r[w].h)),
          (x = Math.min(x, r[w].l)),
          (M += r[w].c - r[w].o));
      return { range: y - x, net: M };
    },
    l = s(e - 60, e - 40),
    u = s(e - 40, e - 20),
    c = s(e - 20, e),
    d = u.range > 1.3 * Math.max(l.range, 1e-9),
    f = c.range > 1.2 * Math.max(u.range, 1e-9),
    m = c.net !== 0 && u.net !== 0 && Math.sign(c.net) !== Math.sign(u.net);
  return f && m
    ? { phase: "DISTRIBUTION", dir: c.net > 0 ? "bull" : "bear" }
    : d
      ? { phase: "MANIPULATION", dir: u.net < 0 ? "bull" : "bear" }
      : l.range < 0.6 * Math.max(u.range, 1e-9)
        ? { phase: "ACCUMULATION", dir: "neutral" }
        : { phase: "CONSOLIDATION", dir: "neutral" };
}
function Qx(r) {
  if (r.length < 10) return {};
  const e = (b) => {
      const v = new Date(b);
      is(v);
      const y = s(v);
      return Math.floor((b + y * 36e5) / 864e5);
    },
    s = (b) => {
      const v = b.getUTCFullYear(),
        x = 1 + ((7 - new Date(Date.UTC(v, 2, 1)).getUTCDay()) % 7) + 7,
        w = 1 + ((7 - new Date(Date.UTC(v, 10, 1)).getUTCDay()) % 7),
        O = Date.UTC(v, 2, x, 7),
        _ = Date.UTC(v, 10, w, 6),
        L = b.getTime();
      return L >= O && L < _ ? -4 : -5;
    },
    l = e(r[r.length - 1].t);
  let u = -1 / 0,
    c = 1 / 0,
    d,
    f = -1 / 0,
    m = 1 / 0;
  for (const b of r.slice(-600)) {
    const v = e(b.t),
      { h: y } = is(new Date(b.t));
    (v === l - 1 && ((u = Math.max(u, b.h)), (c = Math.min(c, b.l))),
      v === l &&
        (d === void 0 && (d = b.o),
        (y >= 20 || y < 0) &&
          ((f = Math.max(f, b.h)), (m = Math.min(m, b.l)))));
  }
  for (const b of r.slice(-600)) {
    const v = e(b.t),
      { h: y } = is(new Date(b.t));
    v === l - 1 && y >= 20 && ((f = Math.max(f, b.h)), (m = Math.min(m, b.l)));
  }
  return {
    pdh: u > -1 / 0 ? u : void 0,
    pdl: c < 1 / 0 ? c : void 0,
    dayOpen: d,
    asiaH: f > -1 / 0 ? f : void 0,
    asiaL: m < 1 / 0 ? m : void 0,
  };
}
function detectIfvgs(r, fvgs) {
  const out = [];
  for (const g of fvgs) {
    for (let k = g.i + 1; k < r.length; k++) {
      if (g.dir === "bull" && r[k].c < g.bottom) {
        out.push({
          dir: "bear",
          top: g.top,
          bottom: g.bottom,
          ce: g.ce,
          i: k,
          originIdx: g.i,
        });
        break;
      }
      if (g.dir === "bear" && r[k].c > g.top) {
        out.push({
          dir: "bull",
          top: g.top,
          bottom: g.bottom,
          ce: g.ce,
          i: k,
          originIdx: g.i,
        });
        break;
      }
    }
  }
  return out.sort((a, b) => b.i - a.i);
}

function detectBreakersAndUnicorns(r, atr, fvgs) {
  const breakers = [];
  const unicorns = [];
  for (let l = 2; l < r.length - 1; l++) {
    const u = r[l];
    if (Math.abs(u.c - u.o) < 0.85 * atr) continue;
    const dispDir = u.c > u.o ? "bull" : "bear";
    for (let f = l - 1; f >= Math.max(0, l - 8); f--) {
      const cand = r[f];
      const isLastBullBeforeDrop = dispDir === "bull" && cand.c > cand.o;
      const isLastBearBeforeRally = dispDir === "bear" && cand.c < cand.o;
      if (isLastBullBeforeDrop || isLastBearBeforeRally) {
        const top = Math.max(cand.o, cand.c, cand.h);
        const bottom = Math.min(cand.o, cand.c, cand.l);
        if (dispDir === "bull" && u.c > top) {
          breakers.push({ dir: "bull", top, bottom, ce: (top + bottom) / 2, i: l });
          const overlapFvg = fvgs.find(
            (g) => g.dir === "bull" && Math.abs(g.i - l) <= 3 && Math.min(top, g.top) > Math.max(bottom, g.bottom)
          );
          if (overlapFvg) {
            const uTop = Math.min(top, overlapFvg.top);
            const uBot = Math.max(bottom, overlapFvg.bottom);
            unicorns.push({ dir: "bull", top: uTop, bottom: uBot, ce: (uTop + uBot) / 2, i: l });
          }
          break;
        }
        if (dispDir === "bear" && u.c < bottom) {
          breakers.push({ dir: "bear", top, bottom, ce: (top + bottom) / 2, i: l });
          const overlapFvg = fvgs.find(
            (g) => g.dir === "bear" && Math.abs(g.i - l) <= 3 && Math.min(top, g.top) > Math.max(bottom, g.bottom)
          );
          if (overlapFvg) {
            const uTop = Math.min(top, overlapFvg.top);
            const uBot = Math.max(bottom, overlapFvg.bottom);
            unicorns.push({ dir: "bear", top: uTop, bottom: uBot, ce: (uTop + uBot) / 2, i: l });
          }
          break;
        }
      }
    }
  }
  return {
    breakers: breakers.sort((a, b) => b.i - a.i),
    unicorns: unicorns.sort((a, b) => b.i - a.i),
  };
}

function detectVolumeImbalances(r, atr) {
  const vis = [];
  for (let i = 1; i < r.length; i++) {
    const prev = r[i - 1];
    const curr = r[i];
    const prevBodyHigh = Math.max(prev.o, prev.c);
    const prevBodyLow = Math.min(prev.o, prev.c);
    const currBodyHigh = Math.max(curr.o, curr.c);
    const currBodyLow = Math.min(curr.o, curr.c);
    if (currBodyLow > prevBodyHigh && curr.l <= prev.h) {
      vis.push({
        dir: "bull",
        top: currBodyLow,
        bottom: prevBodyHigh,
        ce: (currBodyLow + prevBodyHigh) / 2,
        i,
      });
    } else if (currBodyHigh < prevBodyLow && curr.h >= prev.l) {
      vis.push({
        dir: "bear",
        top: prevBodyLow,
        bottom: currBodyHigh,
        ce: (prevBodyLow + currBodyHigh) / 2,
        i,
      });
    }
  }
  return vis.filter((v) => Math.abs(v.top - v.bottom) >= 0.02 * atr).sort((a, b) => b.i - a.i);
}

function Xx(r, e, s, l, u) {
  const c = r,
    d = c.length,
    minBars = e === "1w" || e === "1m" || e === "5m" ? 40 : 60;
  if (d < minBars) return null;
  const f = c.map(($) => $.c),
    m = ah(f, 20),
    b = ah(f, 50),
    v = ah(f, 200),
    y = Ox(c, 14),
    x = Rx(f, 14),
    M = zx(c, 14),
    w = y[d - 1];
  if (!isFinite(w) || w <= 0) return null;
  const O = y.slice(-100).filter(($) => isFinite($)),
    _ = O.length ? O.reduce(($, G) => $ + G, 0) / O.length : w,
    L = c.slice(-21, -1).reduce(($, G) => $ + G.v, 0) / 20,
    K = L > 0 ? c[d - 1].v / L : 1,
    X = Dx(c, 2),
    Q = c.slice(-Math.min(d, 90)),
    rt = Math.max(...Q.map(($) => $.h)),
    ct = Math.min(...Q.map(($) => $.l)),
    P = Hx(c, X, w),
    allFvgs = Hv(c, w),
    ifvgs = detectIfvgs(c, allFvgs),
    { breakers, unicorns } = detectBreakersAndUnicorns(c, w, allFvgs),
    vis = detectVolumeImbalances(c, w),
    sessions = Qx(c),
    pools = kx(c, X, w);
  return {
    c,
    n: d,
    price: c[d - 1].c,
    atr: w,
    atrAvg: _,
    ema20: m,
    ema50: b,
    ema200: v,
    rsi: x[d - 1],
    adx: M[d - 1]?.adx ?? 0,
    pdi: M[d - 1]?.pdi ?? 0,
    mdi: M[d - 1]?.mdi ?? 0,
    volRatio: K,
    swings: X,
    hierarchy: Lx(c, X),
    pools,
    fvgs: allFvgs,
    ifvgs,
    breakers,
    unicorns,
    vis,
    obs: Ux(c, w),
    struct: Bx(c, X, 2),
    sweeps: P,
    disps: qx(c, w),
    cisds: Yx(c, P),
    bprs: Vx(allFvgs),
    turtles: Gx(c),
    amd: Kx(c),
    sessions,
    interval: e,
    rangeHigh: rt,
    rangeLow: ct,
    eq: (rt + ct) / 2,
    digits: s,
    fractal: Array.isArray(l) ? l : [],
    news: u,
  };
}
function Tn(r) {
  return Math.max(0, Math.min(100, Math.round(r)));
}
function Ix(r) {
  const e = r.n,
    s = r.sweeps.find((b) => e - b.i <= 12),
    l = r.hierarchy;
  let u = "neutral",
    c = "";
  if (
    (l.itl?.swept &&
      e - (l.itl.sweptAt ?? 0) <= 20 &&
      ((u = "bull"), (c = "ITL RAID")),
    l.ith?.swept &&
      e - (l.ith.sweptAt ?? 0) <= 20 &&
      ((u = "bear"), (c = "ITH RAID")),
    !s && u === "neutral")
  ) {
    const b = r.pools.some((x) => x.kind === "BSL" && !x.swept),
      v = r.pools.some((x) => x.kind === "SSL" && !x.swept);
    let y = "no raid yet";
    return (
      b && v
        ? (y = "BSL + SSL resting — wait for the raid")
        : b
          ? (y = "BSL resting above")
          : v && (y = "SSL resting below"),
      { vote: "neutral", score: 30, reason: y }
    );
  }
  const d = s ? s.dir : u;
  let f = 55;
  const m = [];
  if (s) {
    const b = e - s.i;
    ((f += Math.max(0, 10 - b * 0.8)),
      m.push(`${s.dir === "bull" ? "SSL" : "BSL"} SWEEP ${b}b ago`),
      s.displacementAfter && ((f += 12), m.push("DISPLACEMENT")),
      r.cisds.find((x) => x.dir === s.dir && x.i >= s.i) &&
        ((f += 15), m.push("CISD")));
    const y = r.pools.find(
      (x) => x.kind === (s.dir === "bull" ? "BSL" : "SSL") && !x.swept,
    );
    y && ((f += Math.min(15, y.strength * 5)), m.push("DRAWDOWN TARGET"));
  }
  return (
    u === d && s && ((f += 10), m.push(c)),
    !s && u !== "neutral" && ((f += 8), m.push(c)),
    { vote: d, score: Tn(f), reason: m.join(" + ") || "raid context" }
  );
}
function Zx(r) {
  const e = r.n,
    s = r.turtles.find((c) => e - c.i <= 6);
  if (!s)
    return {
      vote: "neutral",
      score: 28,
      reason: "no false breakout in window",
    };
  let l = 60;
  return (
    s.plusOne && (l += 10),
    s.dir === "bull" && r.rsi < 42 && (l += 8),
    s.dir === "bear" && r.rsi > 58 && (l += 8),
    r.sweeps.find((c) => c.dir === s.dir && Math.abs(c.i - s.i) <= 3) &&
      (l += 8),
    r.adx > 0 && r.adx < 20 && (l += 6),
    {
      vote: s.dir,
      score: Tn(l),
      reason: `${s.plusOne ? "LIQUIDITY SWEEP + CISD" : "LIQUIDITY SWEEP"} ${s.dir === "bull" ? "LONG" : "SHORT"} ${e - s.i}b ago`,
    }
  );
}
function Px(r) {
  const e = r.n,
    s = r.c,
    l = r.ema20[e - 1];
  if (!isFinite(l))
    return { vote: "neutral", score: 25, reason: "PD Array warming up" };
  if (r.adx < 18)
    return {
      vote: "neutral",
      score: 30,
      reason: `chop — ADX ${r.adx.toFixed(0)} < 18`,
    };
  const u = r.pdi > r.mdi ? "bull" : "bear";
  if (r.adx < 25)
    return {
      vote: u,
      score: 45,
      reason: `trend building — ADX ${r.adx.toFixed(0)}`,
    };
  const c = s[e - 1],
    d = u === "bull" ? c.c > c.o : c.c < c.o,
    f = u === "bull" ? c.l <= l + 0.15 * r.atr : c.h >= l - 0.15 * r.atr,
    m = u === "bull" ? c.c > l : c.c < l;
  if (d && f && m) {
    let b = 62 + Math.min(14, (r.adx - 25) * 0.8);
    return (
      (u === "bull"
        ? l > (r.ema50[e - 1] ?? -1 / 0) &&
          (r.ema50[e - 1] ?? 0) > (r.ema200[e - 1] ?? 0)
        : l < (r.ema50[e - 1] ?? 1 / 0) &&
          (r.ema50[e - 1] ?? 0) < (r.ema200[e - 1] ?? 0)) && (b += 8),
      r.volRatio < 0.8 && (b += 6),
      {
        vote: u,
        score: Tn(b),
        reason: `ADX ${r.adx.toFixed(0)} pullback + resume close`,
      }
    );
  }
  return {
    vote: u,
    score: 50,
    reason: `ADX ${r.adx.toFixed(0)} trend — waiting PD Array pullback`,
  };
}
function Jx(r) {
  const e = r.n,
    s = r.disps.filter((v) => e - v.i <= 10);
  if (s.length === 0)
    return { vote: "neutral", score: 32, reason: "no displacement in window" };
  const l = s.filter((v) => v.dir === "bull").reduce((v, y) => v + y.body, 0),
    u = s.filter((v) => v.dir === "bear").reduce((v, y) => v + y.body, 0);
  if (l === u)
    return { vote: "neutral", score: 40, reason: "two-sided delivery" };
  const c = l > u ? "bull" : "bear";
  let d = 52;
  const f = Math.abs(l - u) / r.atr;
  ((d += Math.min(18, f * 6)),
    r.volRatio > 1.5 && (d += 10),
    r.volRatio > 2.5 && (d += 5),
    r.cisds.find((v) => v.dir === c && e - v.i <= 10) && (d += 8));
  const b =
    s.filter((v) => v.dir === c).reduce((v, y) => v + y.eff, 0) /
    s.filter((v) => v.dir === c).length;
  return (
    (d += Math.min(8, b * 8)),
    {
      vote: c,
      score: Tn(d),
      reason: `${c === "bull" ? "BID" : "OFFER"} dominance ${f.toFixed(1)} ATR${r.volRatio > 1.5 ? " + VOLUME" : ""}`,
    }
  );
}
function Fx(r) {
  const e = r.n,
    s = r.price,
    l = s < r.eq,
    u = s > r.eq,
    c = r.fvgs.filter((v) => !v.mitigated && e - v.i <= 60),
    d = c
      .filter((v) => v.dir === "bull" && v.ce < s)
      .sort((v, y) => y.i - v.i)[0],
    f = c
      .filter((v) => v.dir === "bear" && v.ce > s)
      .sort((v, y) => y.i - v.i)[0],
    m = r.obs.filter((v) => v.dir === "bull" && v.top < s)[0],
    b = r.obs.filter((v) => v.dir === "bear" && v.bottom > s)[0];
  if (l && (d || m)) {
    let v = 60;
    (d && (v += 10), m && (v += 8));
    const y = r.rangeHigh - r.rangeLow;
    return (
      (y > 0 ? (s - r.rangeLow) / y : 0.5) < 0.35 && (v += 8),
      {
        vote: "bull",
        score: Tn(v),
        reason: `DISCOUNT + ${d ? "FVG" : "OB"} below price`,
      }
    );
  }
  if (u && (f || b)) {
    let v = 60;
    (f && (v += 10), b && (v += 8));
    const y = r.rangeHigh - r.rangeLow;
    return (
      (y > 0 ? (s - r.rangeLow) / y : 0.5) > 0.65 && (v += 8),
      {
        vote: "bear",
        score: Tn(v),
        reason: `PREMIUM + ${f ? "FVG" : "OB"} above price`,
      }
    );
  }
  return { vote: "neutral", score: 38, reason: "no PD-correct array in range" };
}
function $x(r) {
  if (!r.fractal || !Array.isArray(r.fractal) || r.fractal.length === 0)
    return { vote: "neutral", score: 40, reason: "HTF map loading" };
  const e = { "1w": 0.6, "4h": 0.5, "1d": 0.5, "1h": 0.3, "15m": 0.2, "5m": 0.2, "1m": 0.15 };
  let s = 0,
    l = 0;
  const u = [];
  for (const m of r.fractal) {
    if (!m || typeof m !== "object") continue;
    const b = e[m.tf] ?? 0.2;
    const sc = typeof m.score === "number" ? m.score : 0;
    ((s += sc * b),
      (l += b),
      u.push(`${m.tf}:${sc > 0 ? "+" : ""}${sc.toFixed(0)}`));
  }
  const c = l > 0 ? s / l : 0;
  if (Math.abs(c) < 20)
    return { vote: "neutral", score: 42, reason: `HTF mixed (${u.join(" ")})` };
  const d = c > 0 ? "bull" : "bear",
    f = 50 + Math.min(45, Math.abs(c) * 0.55);
  return {
    vote: d,
    score: Tn(f),
    reason: `HTF ${d === "bull" ? "BULL" : "BEAR"} (${u.join(" ")})`,
  };
}
const Wx = /unemployment|jobless|claims|layoff|inventor|deficit/i;
function t2(r) {
  if (!r.news || !r.news.loaded)
    return {
      vote: "neutral",
      score: 40,
      reason: "calendar offline — no gating",
    };
  const e = r.news.events;
  if (e.length === 0)
    return { vote: "neutral", score: 45, reason: "calendar clear" };
  const s = Date.now(),
    l = e
      .filter(
        (v) =>
          v.impact === "high" &&
          v.actual &&
          v.forecast &&
          v.time <= s &&
          s - v.time <= 120 * 6e4,
      )
      .sort((v, y) => y.time - v.time)[0];
  if (!l)
    return {
      vote: "neutral",
      score: 45,
      reason: `${e.length} events — none in surprise window`,
    };
  const u = (v) => {
      const y = v.replace(/[%,KMB]/g, "").trim(),
        x = parseFloat(y);
      return isNaN(x) ? null : x;
    },
    c = u(l.actual ?? ""),
    d = u(l.forecast ?? "");
  if (c === null || d === null)
    return {
      vote: "neutral",
      score: 45,
      reason: `${l.title}: surprise unreadable`,
    };
  let f = c > d;
  Wx.test(l.title) && (f = !f);
  const m = f ? "bear" : "bull",
    b = Math.min(1, Math.abs(c - d) / Math.max(Math.abs(d), 0.01));
  return {
    vote: m,
    score: Tn(55 + b * 20),
    reason: `${l.title}: USD ${f ? "STRONGER" : "WEAKER"} -> ${m === "bull" ? "RISK-ON" : "RISK-OFF"}`,
  };
}
function e2(r) {
  const e = r.n;
  let s = 0;
  const l = r.struct[r.struct.length - 1];
  if (l) {
    const _ = e - l.i,
      L = Math.max(0.4, 1 - _ / 60);
    s += (l.type === "CHoCH" ? 32 : 34) * (l.dir === "bull" ? 1 : -1) * L;
  }
  const u = r.ema20[e - 1],
    c = r.ema50[e - 1],
    d = r.ema200[e - 1];
  (isFinite(u) &&
    isFinite(c) &&
    isFinite(d) &&
    (u > c && c > d ? (s += 16) : u < c && c < d && (s -= 16),
    (s += r.price > d ? 8 : -8)),
    (s += r.price < r.eq ? 14 : -14));
  const f = r.sweeps.find((_) => e - _.i <= 10);
  if (f) {
    let _ = 8 + Math.min(6, (f.wick / Math.max(r.atr, 1e-9)) * 3);
    (f.displacementAfter && (_ += 4),
      (s += (f.dir === "bull" ? 1 : -1) * Math.min(18, _)));
  }
  const m = r.cisds.find((_) => e - _.i <= 12);
  m && (s += (m.dir === "bull" ? 1 : -1) * 15);
  const b = r.disps.find((_) => e - _.i <= 8);
  b && (s += (b.dir === "bull" ? 1 : -1) * (7 + Math.min(5, b.eff * 5)));
  const v = r.bprs.find((_) => e - _.i <= 30);
  v && (s += (v.dir === "bull" ? 1 : -1) * 8);
  const y = r.fvgs.find((_) => !_.mitigated && e - _.i <= 12);
  y && (s += (y.dir === "bull" ? 1 : -1) * 12);
  const x = r.obs[0];
  (x && e - x.i <= 20 && (s += (x.dir === "bull" ? 1 : -1) * 8),
    r.rsi > 70 ? (s -= 6) : r.rsi < 30 && (s += 6),
    r.amd.dir !== "neutral" &&
      (s +=
        (r.amd.dir === "bull" ? 1 : -1) *
        (r.amd.phase === "DISTRIBUTION" ? 14 : 10)));
  const M = r.hierarchy.stl?.swept && !r.hierarchy.itl?.swept,
    w = r.hierarchy.sth?.swept && !r.hierarchy.ith?.swept;
  (M && (s += 10),
    w && (s -= 10),
    r.hierarchy.itl?.swept &&
      e - (r.hierarchy.itl.sweptAt ?? 0) <= 20 &&
      (s += 12),
    r.hierarchy.ith?.swept &&
      e - (r.hierarchy.ith.sweptAt ?? 0) <= 20 &&
      (s -= 12));
  const O = r.turtles.find((_) => e - _.i <= 6);
  if (
    (O && (s += (O.dir === "bull" ? 1 : -1) * (O.plusOne ? 18 : 12)),
    r.adx >= 25)
  ) {
    const _ = r.c[e - 1],
      L = r.pdi > r.mdi ? _.c > _.o : _.c < _.o,
      K = r.pdi > r.mdi ? _.l <= u + 0.15 * r.atr : _.h >= u - 0.15 * r.atr;
    L && K && (s += (r.pdi > r.mdi ? 1 : -1) * 16);
  }
  if (r.fractal && Array.isArray(r.fractal) && r.fractal.length) {
    const _ = r.fractal.reduce(
        (K, X) => K + (X && (X.tf === "4h" || X.tf === "1d" || X.tf === "1w") ? 0.5 : 0.25),
        0,
      ),
      L = r.fractal.reduce(
        (K, X) => K + (X && typeof X.score === "number" ? X.score : 0) * (X && (X.tf === "4h" || X.tf === "1d" || X.tf === "1w") ? 0.5 : 0.25),
        0,
      );
    _ > 0 && (s += 0.32 * (L / _));
  }
  return Math.max(-100, Math.min(100, s));
}
function i2(r) {
  return r >= 55
    ? "STRONG BUY"
    : r >= 22
      ? "BUY"
      : r <= -55
        ? "STRONG SELL"
        : r <= -22
          ? "SELL"
          : "NEUTRAL";
}
function n2(r, e, s, l) {
  const u = (l && l.keys) ? Object.keys(l.keys).filter((Q) => (l.keys as any)[Q]) : ['liquidity', 'turtleSoup', 'adxTrend', 'orderFlow', 'pdArrays', 'fractal', 'news'],
    c = u.filter((Q) => Q !== "risk"),
    d = [],
    f = [],
    m = [];
  for (const Q of c) {
    const rt = s[Q];
    rt && rt.vote === "neutral" && m.push(Q);
  }
  const b = c.filter((Q) => s[Q] && s[Q].vote !== "neutral"),
    v = b.filter((Q) => s[Q].vote === "bull" && s[Q].score >= 55),
    y = b.filter((Q) => s[Q].vote === "bear" && s[Q].score >= 55),
    x = b.filter((Q) => s[Q].vote === "bear" && s[Q].score >= 50),
    M = b.filter((Q) => s[Q].vote === "bull" && s[Q].score >= 50);
  let w = "STAND ASIDE",
    O = "neutral";
  const _ = Math.max(1, Math.ceil(b.length * 0.4)),
    L = c.filter((Q) => Q !== "news");
  if (!l || c.length === 0)
    e >= 30
      ? ((w = "LONG"), (O = "bull"))
      : e <= -30 && ((w = "SHORT"), (O = "bear"));
  else if (l.mode === "STRICT") {
    const Q = !s.news || s.news.vote !== "bear" || s.news.score < 50,
      rt = !s.news || s.news.vote !== "bull" || s.news.score < 50;
    L.length > 0 &&
    L.every((ct) => s[ct]?.vote === "bull" && s[ct].score >= 65) &&
    Q
      ? ((w = "LONG"), (O = "bull"), d.push(...L))
      : L.length > 0 &&
        L.every((ct) => s[ct]?.vote === "bear" && s[ct].score >= 65) &&
        rt &&
        ((w = "SHORT"), (O = "bear"), d.push(...L));
  } else
    v.length >= _ && x.length === 0
      ? ((w = "LONG"), (O = "bull"), d.push(...v))
      : y.length >= _ &&
        M.length === 0 &&
        ((w = "SHORT"), (O = "bear"), d.push(...y));
  (w === "LONG" && f.push(...x), w === "SHORT" && f.push(...M));
  for (const Q of d) {
    const rt = m.indexOf(Q);
    rt >= 0 && m.splice(rt, 1);
  }
  const K = {};
  for (const Q of u) K[Q] = s[Q]?.score ?? 0;
  const X =
    w === "STAND ASIDE"
      ? c.length === 0
        ? "No direction — composite bias below ±30"
        : l?.mode === "STRICT"
          ? `STRICT AND not met (${v.length}↑/${y.length}↓ of ${L.length} — all must align ≥65)`
          : b.length === 0
            ? `No directional signal — all ${c.length} selected concepts neutral`
            : `Quorum not met — ${Math.max(v.length, y.length)}/${_} aligned, ${x.length + M.length} opposing`
      : `${w} — ${d.length} concept${d.length === 1 ? "" : "s"} aligned, 0 opposing (${l?.mode ?? "SCORE"} mode)`;
  return {
    dir: w,
    vote: O,
    logic: {
      summary: X,
      mode: l?.mode ?? "BALANCED",
      selected: u,
      aligned: [...new Set(d)],
      opposing: [...new Set(f)],
      neutral: m,
      quorum: _,
      conceptScores: K,
      windowOk: !0,
      blackout: !1,
    },
  };
}
function s2(r, e) {
  if (r === "4h" || r === "1d" || r === "1w") return !0;
  const { h: s, m: min } = is(new Date(e));
  const hm = s * 60 + (min || 0);
  // Trade Window 1: London Open SB (02:00 - 05:00 EST)
  // Trade Window 2: NY AM Session SB (09:30 - 11:00 EST)
  // Trade Window 3: NY PM Macro SB (13:30 - 15:00 EST)
  const inApexSb =
    (hm >= 120 && hm < 300) ||
    (hm >= 570 && hm < 660) ||
    (hm >= 810 && hm < 900);
  return inApexSb || (s >= 2 && s < 5) || (s >= 7 && s < 11) || (s >= 13 && s < 16);
}
function l2(r, e) {
  const s = r.n,
    l = r.turtles.find((O) => O.dir === e && s - O.i <= 8);
  if (l)
    return {
      name: l.plusOne ? "LIQUIDITY SWEEP + CISD" : "LIQUIDITY SWEEP",
      kind: "reversal",
      ready: !0,
      reason: "liquidity sweep + false breakout reclaimed",
    };
  const u = r.c[s - 1],
    c = r.ema20[s - 1],
    d = r.ema50[s - 1],
    f = r.ema200[s - 1];
  if (r.adx >= 25 && isFinite(c)) {
    const O = r.pdi > r.mdi ? "bull" : "bear",
      _ = O === "bull" ? u.c > u.o : u.c < u.o,
      L = O === "bull" ? u.l <= c + 0.15 * r.atr : u.h >= c - 0.15 * r.atr;
    if (O === e && _ && L)
      return {
        name: "PD ARRAY CONTINUATION",
        kind: "continuation",
        ready: !0,
        reason: `ADX ${r.adx.toFixed(0)} + PD Array mitigation`,
      };
  }
  const m = r.sweeps.find((O) => O.dir === e && s - O.i <= 15),
    b =
      (e === "bull" &&
        r.hierarchy.itl?.swept &&
        s - (r.hierarchy.itl.sweptAt ?? 1e9) <= 20) ||
      (e === "bear" &&
        r.hierarchy.ith?.swept &&
        s - (r.hierarchy.ith.sweptAt ?? 1e9) <= 20),
    v = !!m || b,
    y = r.struct[r.struct.length - 1],
    x = r.cisds.find((O) => O.dir === e && s - O.i <= 15),
    M = y && y.dir === e && s - y.i <= 25,
    hasUnicorn = (r.unicorns || []).some((O) => O.dir === e && s - O.i <= 35);
  if (v && hasUnicorn && (M || x))
    return {
      name: "ICT UNICORN MODEL",
      kind: "reversal",
      ready: !0,
      reason: "liquidity sweep + Breaker Block & FVG overlap",
    };
  if (v && M)
    return {
      name: "LIQUIDITY SWEEP",
      kind: "reversal",
      ready: !0,
      reason: m ? "raid + structure shift" : "hierarchy raid + structure shift",
    };
  if (v && (m?.displacementAfter || x || (m && m.wick >= 0.3 * r.atr)))
    return {
      name: "LIQUIDITY SWEEP + CISD",
      kind: "reversal",
      ready: !0,
      reason: "raid + displacement/CISD, waiting shift",
    };
  const w =
    isFinite(c) &&
    isFinite(d) &&
    isFinite(f) &&
    (e === "bull" ? c > d && d > f : c < d && d < f);
  return y &&
    y.type === "BOS" &&
    y.dir === e &&
    s - y.i <= 20 &&
    (r.adx >= 20 || w)
    ? {
        name: "MSS + PD ARRAY",
        kind: "continuation",
        ready: !0,
        reason: "BOS + trend delivery",
      }
    : { name: "WAIT", kind: "none", ready: !1, reason: "no armed model" };
}
function a2(r, e, s) {
  const l = r.n,
    u = r.atr,
    c = [],
    d = e === "bull",
    f =
      s.startsWith("LIQUIDITY SWEEP") ||
      s.startsWith("TURTLE") ||
      s.startsWith("ICT UNICORN") ||
      s === "PD ARRAY CONTINUATION" ||
      s === "ADX TREND PULLBACK",
    m = (w, O, _, L, K, X, Q) => {
      const rt = (O + _) / 2;
      (Q && !f && ((d && rt > r.eq) || (!d && rt < r.eq))) ||
        Math.abs(r.price - rt) > 3 * u ||
        (d && rt > r.price + 0.15 * u) ||
        (!d && rt < r.price - 0.15 * u) ||
        c.push({
          source: w,
          price: rt,
          top: O,
          bottom: _,
          rank: L,
          label: K,
          i: X,
        });
    },
    b = r.turtles.find((w) => w.dir === e && l - w.i <= 6);
  b &&
    m(
      "turtle",
      b.level + 0.15 * u,
      b.level - 0.15 * u,
      10,
      "Liquidity Sweep Reclaim",
      b.i,
      !1,
    );
  const unicorn = (r.unicorns || [])
    .filter((w) => w.dir === e && l - w.i <= 50)
    .sort((w, O) => O.i - w.i)[0];
  unicorn &&
    m(
      "unicorn",
      unicorn.top,
      unicorn.bottom,
      9,
      "Unicorn (Breaker + FVG Overlap)",
      unicorn.i,
      !1,
    );
  const v = r.bprs.find((w) => w.dir === e && l - w.i <= 40);
  if (
    (v && m("bpr", v.top, v.bottom, 8, "BPR consequent encroachment", v.i, !0),
    s === "PD ARRAY CONTINUATION" || s === "ADX TREND PULLBACK")
  ) {
    const w = r.ema20[l - 1];
    isFinite(w) &&
      m("adx", w + 0.2 * u, w - 0.2 * u, 7, "PD Array mitigation band", l - 1, !1);
  }
  const ifvg = (r.ifvgs || [])
    .filter((w) => w.dir === e && l - w.i <= 50)
    .filter((w) =>
      d ? w.ce <= r.price + 0.15 * u : w.ce >= r.price - 0.15 * u,
    )
    .sort((w, O) => O.i - w.i)[0];
  ifvg && m("ifvg", ifvg.top, ifvg.bottom, 7, "Inversion FVG (IFVG)", ifvg.i, !0);
  const y = r.fvgs
    .filter((w) => w.dir === e && !w.mitigated && l - w.i <= 60)
    .filter((w) =>
      d ? w.ce <= r.price + 0.15 * u : w.ce >= r.price - 0.15 * u,
    )
    .sort((w, O) => O.i - w.i)[0];
  y && m("fvg", y.top, y.bottom, 6, "FVG 50% (CE)", y.i, !0);
  const breaker = (r.breakers || [])
    .filter((w) => w.dir === e && l - w.i <= 60)
    .sort((w, O) => O.i - w.i)[0];
  breaker &&
    m("breaker", breaker.top, breaker.bottom, 5, "Breaker Block", breaker.i, !0);
  const x = r.obs
    .filter((w) => w.dir === e && l - w.i <= 60)
    .filter((w) =>
      d
        ? (w.top + w.bottom) / 2 <= r.price + 0.15 * u
        : (w.top + w.bottom) / 2 >= r.price - 0.15 * u,
    )
    .sort((w, O) => O.i - w.i)[0];
  x && m("ob", x.top, x.bottom, 4, "Order Block mean threshold", x.i, !0);
  const vi = (r.vis || [])
    .filter((w) => w.dir === e && l - w.i <= 35)
    .sort((w, O) => O.i - w.i)[0];
  vi && m("vi", vi.top, vi.bottom, 3.5, "Volume Imbalance (VI)", vi.i, !0);
  const M = r.rangeHigh - r.rangeLow;
  if (M > 2 * u)
    if (d) {
      const w = r.rangeHigh - 0.62 * M,
        O = r.rangeHigh - 0.79 * M;
      m("ote", w, O, 3, "OTE 62–79%", l, !0);
    } else {
      const w = r.rangeLow + 0.62 * M,
        O = r.rangeLow + 0.79 * M;
      m("ote", O, w, 3, "OTE 62–79%", l, !0);
    }
  return c.sort((w, O) => O.rank - w.rank);
}
function wt(r, e) {
  const s = 10 ** e;
  return Math.round(r * s) / s;
}
function rh(r, e, s) {
  return {
    valid: !1,
    direction: "STAND ASIDE",
    model: "WAIT",
    modelKind: "none",
    entry: 0,
    entryZone: [0, 0],
    stop: 0,
    tp1: 0,
    tp2: 0,
    tp3: 0,
    rr: 0,
    rr1: 0,
    riskATR: 0,
    grade: "C",
    confidence: 0,
    confluences: [],
    sweptLiquidityType: "NONE",
    primaryPdArray: "NONE",
    blockers: r,
    logic: s ?? {
      summary: r[0] ?? "No setup",
      mode: "BALANCED",
      selected: [],
      aligned: [],
      opposing: [],
      neutral: [],
      quorum: 0,
      conceptScores: {},
      windowOk: !0,
      blackout: !1,
    },
    createdTs: e,
  };
}
function classifySweptLiquidity(f, x, at) {
  const isBull = x === "bull";
  const tol = 0.35 * f.atr;
  if (isBull) {
    if (
      f.sessions.pdl !== void 0 &&
      (Math.abs((at?.level ?? f.price) - f.sessions.pdl) <= tol ||
        f.c.slice(-12).some((b) => b.l <= f.sessions.pdl && b.c > f.sessions.pdl))
    ) {
      return "SSL (PDL)";
    }
    if (
      f.sessions.asiaL !== void 0 &&
      (Math.abs((at?.level ?? f.price) - f.sessions.asiaL) <= tol ||
        f.c.slice(-12).some((b) => b.l <= f.sessions.asiaL && b.c > f.sessions.asiaL))
    ) {
      return "SSL (Asian Low)";
    }
    if (f.pools.some((p) => p.kind === "SSL" && p.swept)) {
      return "SSL (EQL)";
    }
    if (f.hierarchy.itl?.swept) {
      return "SSL (ITL)";
    }
    return "SSL";
  } else {
    if (
      f.sessions.pdh !== void 0 &&
      (Math.abs((at?.level ?? f.price) - f.sessions.pdh) <= tol ||
        f.c.slice(-12).some((b) => b.h >= f.sessions.pdh && b.c < f.sessions.pdh))
    ) {
      return "BSL (PDH)";
    }
    if (
      f.sessions.asiaH !== void 0 &&
      (Math.abs((at?.level ?? f.price) - f.sessions.asiaH) <= tol ||
        f.c.slice(-12).some((b) => b.h >= f.sessions.asiaH && b.c < f.sessions.asiaH))
    ) {
      return "BSL (Asian High)";
    }
    if (f.pools.some((p) => p.kind === "BSL" && p.swept)) {
      return "BSL (EQH)";
    }
    if (f.hierarchy.ith?.swept) {
      return "BSL (ITH)";
    }
    return "BSL";
  }
}
function mapPrimaryPdArrayLabel(source, dir) {
  const bull = dir === "bull";
  switch (source) {
    case "unicorn":
      return "Unicorn (Breaker + FVG)";
    case "breaker":
      return bull ? "Bullish Breaker (+BB)" : "Bearish Breaker (-BB)";
    case "ifvg":
      return bull ? "Bullish IFVG" : "Bearish IFVG";
    case "fvg":
      return bull ? "Bullish FVG (BISI)" : "Bearish FVG (SIBI)";
    case "ob":
      return bull ? "Bullish OB (+OB)" : "Bearish OB (-OB)";
    case "bpr":
      return "Balanced Price Range (BPR)";
    case "vi":
      return "Volume Imbalance (VI)";
    case "ote":
      return bull ? "Discount OTE (62-79%)" : "Premium OTE (62-79%)";
    case "turtle":
      return bull ? "SSL Sweep Reclaim (+OB/FVG)" : "BSL Sweep Reclaim (-OB/FVG)";
    default:
      return bull ? "Bullish FVG / +OB" : "Bearish FVG / -OB";
  }
}
function _h(r, e, s, l, u, c = 2) {
  // Defensive normalize: if s is conceptSelection object, remap to l
  if (s && !Array.isArray(s) && typeof s === "object" && ("mode" in s || "keys" in s)) {
    if (!l) l = s;
    s = [];
  }
  if (!Array.isArray(s)) s = [];
  const d = r.length ? r[r.length - 1].t : Date.now(),
    minBars = e === "1w" || e === "1m" || e === "5m" ? 40 : 60;
  if (r.length < minBars)
    return {
      ok: !1,
      interval: e,
      price: r.length ? r[r.length - 1].c : 0,
      score: 0,
      bias: "NEUTRAL",
      confidence: 0,
      concepts: {},
      plan: rh([`ENGINE WARMING UP — need ≥${minBars} candles`], d),
      levels: {
        eq: 0,
        rangeHigh: 0,
        rangeLow: 0,
        bsl: [],
        ssl: [],
        sweptPools: [],
        fvgZones: [],
        ifvgZones: [],
        obZones: [],
        breakerZones: [],
        unicornZones: [],
        viZones: [],
      },
      phase: {
        amd: "CONSOLIDATION",
        amdDir: "neutral",
        cisd: !1,
        displaced: !1,
        adx: 0,
        pdi: 0,
        mdi: 0,
        rsi: 0,
        atr: 0,
        regime: "—",
      },
      reasons: ["collecting candles…"],
      signals: [],
      rangePos: 50,
    };
  const f = Xx(r, e, c, s, u);
  if (!f)
    return {
      ok: !1,
      interval: e,
      price: r[r.length - 1].c,
      score: 0,
      bias: "NEUTRAL",
      confidence: 0,
      concepts: {},
      plan: rh(["VOLATILITY UNAVAILABLE — ATR dead"], d),
      levels: {
        eq: 0,
        rangeHigh: 0,
        rangeLow: 0,
        bsl: [],
        ssl: [],
        sweptPools: [],
        fvgZones: [],
        ifvgZones: [],
        obZones: [],
        breakerZones: [],
        unicornZones: [],
        viZones: [],
      },
      phase: {
        amd: "CONSOLIDATION",
        amdDir: "neutral",
        cisd: !1,
        displaced: !1,
        adx: 0,
        pdi: 0,
        mdi: 0,
        rsi: 0,
        atr: 0,
        regime: "—",
      },
      reasons: ["ATR unavailable"],
      signals: [],
      rangePos: 50,
    };
  const apexVote = (() => {
    const n = f.n
    const u = (f.unicorns || []).find((z) => n - z.i <= 35)
    const br = (f.breakers || []).find((z) => n - z.i <= 35)
    const ifvg = (f.ifvgs || []).find((z) => n - z.i <= 25)
    const sw = f.sweeps.find((z) => n - z.i <= 14)
    const cisd = f.cisds.find((z) => n - z.i <= 12)
    const disp = f.disps.find((z) => n - z.i <= 10)
    const dir = u?.dir || br?.dir || ifvg?.dir || sw?.dir || cisd?.dir || disp?.dir || (f.price < f.eq ? 'bull' : 'bear')
    let sc = 52
    if (u) sc += 20
    if (br) sc += 10
    if (ifvg) sc += 8
    if (sw) sc += 10
    if (cisd) sc += 7
    if (disp) sc += 6
    const finalScore = Tn(sc)
    return {
      vote: finalScore >= 58 ? dir : 'neutral',
      score: finalScore,
      reason: u
        ? `Unicorn Overlap (${u.dir.toUpperCase()}) + Killzone Matrix`
        : br || ifvg
        ? `Breaker / IFVG confluence (${dir.toUpperCase()})`
        : sw
        ? `Liquidity sweep + PD array (${dir.toUpperCase()})`
        : 'Scanning Killzone PD arrays',
    }
  })()
  const apexEnabled = l?.keys?.apexPulse !== false
  const m = {
      apexPulse: apexVote,
      liquidity: Ix(f),
      turtleSoup: Zx(f),
      adxTrend: Px(f),
      orderFlow: Jx(f),
      pdArrays: Fx(f),
      fractal: $x(f),
      news: t2(f),
    },
    b = e2(f),
    v = i2(b),
    { dir: y, vote: x, logic: M } = n2(f, b, m, l);
  let w = !1;
  if (l?.keys.news && u?.loaded) {
    const H = Date.now();
    w = u.events.some(
      (ht) =>
        ht.impact === "high" &&
        H >= ht.time - 15 * 6e4 &&
        H <= ht.time + 5 * 6e4,
    );
  }
  M.blackout = w;
  const O = s2(e, d);
  M.windowOk = O;
  if (!apexEnabled) {
    f.unicorns = [];
    f.breakers = [];
    f.ifvgs = [];
    f.vis = [];
  }
  const _ = l2(f, x),
    L = [],
    K = [];
  (y === "STAND ASIDE" && L.push(M.summary),
    w && L.push("NEWS FILTER — Tier-1 Red Folder release in -15m/+5m window"),
    !_.ready && y !== "STAND ASIDE" && L.push(`MODEL ${_.name} — ${_.reason}`));
  let X = 0,
    Q = 0,
    rt = 0,
    ct = 0,
    P = 0,
    $ = 0,
    G = 0,
    et = 0,
    J = [],
    lt = "C",
    mt = 0,
    yt = 0,
    nt = 0,
    q = 0,
    k = !1,
    sweptLiqLabel = classifySweptLiquidity(f, x, null),
    pdArrayLabel = mapPrimaryPdArrayLabel("fvg", x);
  if (y !== "STAND ASIDE" && _.ready && !w) {
    const H = y === "LONG",
      ht = a2(f, x, _.name),
      at = f.sweeps.find((ot) => ot.dir === x && f.n - ot.i <= 15),
      tt =
        (_.kind === "reversal" && at
          ? ht.filter((ot) => ot.i >= at.i - 2)
          : ht)[0] ?? ht[0];
    sweptLiqLabel = classifySweptLiquidity(f, x, at);
    if (!tt) L.push("NO PD-CORRECT ENTRY ARRAY in reach");
    else {
      ((X = tt.price), (Q = tt.top), (rt = tt.bottom));
      pdArrayLabel = mapPrimaryPdArrayLabel(tt.source, x);
      const ot = f.turtles.find((pt) => pt.dir === x && f.n - pt.i <= 8);
      let Ee;
      const _n = H ? rt : Q;
      if (ot)
        Ee = H ? Math.min(ot.wickExtreme, _n) : Math.max(ot.wickExtreme, _n);
      else {
        const pt = [];
        at && pt.push(H ? f.c[at.i].l : f.c[at.i].h);
        const Je = H
          ? (f.hierarchy.stl ?? f.hierarchy.itl)
          : (f.hierarchy.sth ?? f.hierarchy.ith);
        Je && pt.push(Je.price);
        const hl = pt.filter((ye) => {
          const xa = H ? X - ye : ye - X;
          return xa >= 0 && xa <= 1.2 * f.atr;
        });
        Ee = hl.length ? (H ? Math.min(...hl) : Math.max(...hl)) : _n;
      }
      // Point 5 of 6-Point Pure ICT Engine: Protected Stop Loss placed beyond the sweep wick
      // plus 1.5x ATR + Live Spread buffer to minimize premature SL hits
      const liveSpreadEst = c === 5 ? 0.00014 : c === 3 ? 0.014 : 0.25;
      const De = 1.5 * f.atr + liveSpreadEst;
      ((ct = H ? Ee - De : Ee + De),
        (P = Math.abs(X - ct)),
        P < 1.5 * f.atr &&
          ((ct = H ? X - (1.5 * f.atr + liveSpreadEst) : X + (1.5 * f.atr + liveSpreadEst)),
          (P = 1.5 * f.atr + liveSpreadEst)),
        P > 2.6 * f.atr &&
          ((ct = H ? X - (2.2 * f.atr + liveSpreadEst) : X + (2.2 * f.atr + liveSpreadEst)),
          (P = 2.2 * f.atr + liveSpreadEst)),
        (q = P / f.atr));
      if (!isFinite(ct) || ct <= 0 || (H && ct >= X) || (!H && ct <= X)) {
        L.push("INVALID STOP LOSS — structural invalidation on wrong side of entry");
      }
      const Kt = [];
      if (H) {
        for (const pt of f.pools)
          pt.kind === "BSL" &&
            !pt.swept &&
            pt.price > X + P * 0.5 &&
            Kt.push(pt.price);
        for (const pt of [
          f.hierarchy.ith?.price,
          f.hierarchy.lth?.price,
          f.sessions.pdh,
          f.rangeHigh,
        ])
          pt !== void 0 && pt > X + P * 0.5 && Kt.push(pt);
      } else {
        for (const pt of f.pools)
          pt.kind === "SSL" &&
            !pt.swept &&
            pt.price < X - P * 0.5 &&
            Kt.push(pt.price);
        for (const pt of [
          f.hierarchy.itl?.price,
          f.hierarchy.ltl?.price,
          f.sessions.pdl,
          f.rangeLow,
        ])
          pt !== void 0 && pt < X - P * 0.5 && Kt.push(pt);
      }
      const Ut = [...new Set(Kt.map((pt) => wt(pt, c)))].sort((pt, Je) =>
          H ? pt - Je : Je - pt,
        ),
        ae = [];
      for (const pt of Ut)
        (!ae.length || Math.abs(pt - ae[ae.length - 1]) > 0.3 * f.atr) &&
          ae.push(pt);
      const di = ae[0],
        Ze = ae[1],
        ai = di !== void 0 ? Math.abs(di - X) / P : 1 / 0;
      ai < 1.35
        ? L.push(
            `RR SPACE — first obstacle only ${ai.toFixed(2)}R (need ≥1.35R)`,
          )
        : (
            // Module 4 Dynamic Risk Management:
            // TP1: Internal Range Liquidity (1:2 RR) -> Move SL to Breakeven
            // TP2: External Range Liquidity / Opposite Session High-Low (1:3.5 RR)
            // TP3: Runner for Daily Draw on Liquidity (1:5+ RR)
            ($ = H ? X + 2.0 * P : X - 2.0 * P),
            (G =
              di !== void 0 && ai >= 3.0 && ai <= 4.0
                ? di
                : H
                  ? X + 3.5 * P
                  : X - 3.5 * P),
            (et =
              Ze !== void 0 && Math.abs(Ze - X) / P >= 4.8 && Math.abs(Ze - X) / P <= 6.5
                ? Ze
                : H
                  ? X + 5.0 * P
                  : X - 5.0 * P),
            (yt = Math.abs(G - X) / P),
            (nt = Math.abs($ - X) / P)
          );
      const Le = f.n,
        ge = f.struct[f.struct.length - 1];
      (ge && ge.dir === x && Le - ge.i <= 18 && J.push("MSS"),
        at && J.push("LIQUIDITY SWEEP"),
        f.cisds.find((pt) => pt.dir === x && Le - pt.i <= 12) && J.push("CISD"),
        f.disps.find((pt) => pt.dir === x && Le - pt.i <= 8) &&
          J.push("MSS"),
        tt.source === "unicorn" && (J.push("ORDER BLOCK (OB)"), J.push("FVG / IFVG")),
        tt.source === "breaker" && J.push("ORDER BLOCK (OB)"),
        tt.source === "ifvg" && J.push("FVG / IFVG"),
        tt.source === "fvg" && J.push("FVG / IFVG"),
        tt.source === "ob" && J.push("ORDER BLOCK (OB)"),
        tt.source === "bpr" && J.push("FVG / IFVG"),
        tt.source === "vi" && J.push("FVG / IFVG"),
        tt.source === "ote" && J.push("OTE"),
        tt.source === "adx" && J.push("PD ARRAY"),
        tt.source === "turtle" && J.push("LIQUIDITY SWEEP"),
        (H ? X < f.eq : X > f.eq) && J.push("PD ARRAY"),
        f.hierarchy.itl?.swept && x === "bull" && J.push("ITL/ITH RAID"),
        f.hierarchy.ith?.swept && x === "bear" && J.push("ITL/ITH RAID"),
        O && J.push("KILLZONE"),
        s &&
          s.length > 0 &&
          s.every((Je) => Je.vote === x || Je.vote === "neutral") &&
          s.some((Je) => Je.vote === x) &&
          J.push("PD ARRAY"),
        (J = [...new Set(J)]));
      if (J.length > 0 && y !== "STAND ASIDE") {
        M.summary = `${y} — ${J.length} concept${J.length === 1 ? "" : "s"} aligned, ${M.opposing?.length ?? 0} opposing (${l?.mode ?? "BALANCED"} mode)`;
      }
      const ol = ge && ge.dir === x && Le - ge.i <= 30,
        cl =
          _.name.startsWith("LIQUIDITY SWEEP") ||
          _.name.startsWith("TURTLE") ||
          _.name.startsWith("ICT UNICORN") ||
          _.name === "PD ARRAY CONTINUATION" ||
          _.name === "ADX TREND PULLBACK";
      (!ol &&
        !cl &&
        _.kind !== "continuation" &&
        L.push(
          `STRUCTURE STALE — last shift ${ge ? Le - ge.i : "—"} bars ago (need ≤30)`,
        ),
        q > 2.65 &&
          L.push(
            `STOP TOO WIDE — ${q.toFixed(2)} ATR (max 2.65) — never widen`,
          ));
      const ya = Math.abs(f.price - X) / Math.max(P, 1e-9),
        favorableMoveR = (H ? f.price - X : X - f.price) / Math.max(P, 1e-9);
      (ya > 1.15 &&
        L.push(`CHASING — price ${ya.toFixed(2)}R beyond entry (max 1.15R)`),
        favorableMoveR > 0.65 &&
          L.push(`CHASING — price already ran +${favorableMoveR.toFixed(2)}R toward target (wait pullback)`),
        (H ? f.price <= ct : f.price >= ct) &&
          L.push("PRICE ALREADY THROUGH STOP"),
        (l?.keys.risk ?? !1) &&
          (q > 2.65 && L.push("RISK FILTER — stop width"),
          f.atr < 0.55 * f.atrAvg &&
            L.push("RISK FILTER — volatility collapsed (ATR squeeze)"),
          (!isFinite(yt) || yt < 1.35) &&
            L.push("RISK FILTER — RR below floor")),
        (mt = Math.min(
          95,
          44 +
            J.length * 4.8 +
            (_.name.startsWith("LIQUIDITY SWEEP") || _.name.startsWith("TURTLE") || _.name.startsWith("ICT UNICORN") ? 6 : 0) +
            (O ? 4 : 0),
        )));
      const Xi = J.length;
      (Xi >= 6 && yt >= 2.5 && mt >= 80
        ? (lt = "A+")
        : Xi >= 5 && yt >= 2 && mt >= 68
          ? (lt = "A")
          : Xi >= 4 && yt >= 1.8 && mt >= 55
            ? (lt = "B")
            : (lt = "C"),
        lt === "C" &&
          yt > 0 &&
          L.push(
            `GRADE C — confluences ${Xi}, RR ${yt.toFixed(2)} (need B or better)`,
          ),
        !O &&
          (e === "5m" || e === "15m" || e === "1h") &&
          lt !== "A" &&
          lt !== "A+" &&
          L.push("OUTSIDE KILLZONE — intraday allows A/A+ only"),
        (k = L.length === 0 && yt >= 1.35 && q > 0));
    }
  }
  const Z = f.n,
    dt = f.struct[f.struct.length - 1];
  dt &&
    K.push(
      `Structure: ${dt.type} ${dt.dir === "bull" ? "↑" : "↓"} through ${wt(dt.level, c)} (${Z - dt.i} bars ago)`,
    );
  const vt = f.sweeps.find((H) => Z - H.i <= 12);
  (vt &&
    K.push(
      `Liquidity: ${vt.dir === "bull" ? "SSL" : "BSL"} raided ${Z - vt.i} bars ago${vt.displacementAfter ? " with displacement" : ""}`,
    ),
    K.push(`AMD phase: ${f.amd.phase}`),
    K.push(
      `Protected Stop Loss: Sweep Wick + 1.5x ATR (${wt(1.5 * f.atr, c)}) + Live Spread Buffer`,
    ),
    K.push(
      `Dealing Range Position: ${(((f.price - f.rangeLow) / Math.max(f.rangeHigh - f.rangeLow, 1e-9)) * 100).toFixed(0)}% (${f.price < f.eq ? "DISCOUNT < 50% EQ" : "PREMIUM > 50% EQ"} @ ${wt(f.eq, c)})`,
    ),
    _.ready && K.push(`Model: ${_.name} — ${_.reason}`));
  for (const H of Object.keys(m))
    l?.keys[H] &&
      K.push(`${H}: ${m[H].vote.toUpperCase()} ${m[H].score} — ${m[H].reason}`);
  const le = [],
    Ie = f.c.slice(-14),
    Ti = Z - Ie.length;
  for (let H = 0; H < Ie.length; H++) {
    const ht = Ti + H;
    for (const at of f.struct)
      at.i === ht &&
        le.push({
          t: f.c[ht].t,
          text: `${at.type} · ${at.dir === "bull" ? "BULL" : "BEAR"} · ${wt(at.level, c)}`,
        });
    for (const at of f.sweeps)
      at.i === ht &&
        le.push({
          t: f.c[ht].t,
          text: `${at.dir === "bull" ? "SSL" : "BSL"} SWEEP · ${at.dir === "bull" ? "BULL" : "BEAR"} · ${wt(at.level, c)}`,
        });
    for (const at of f.disps)
      at.i === ht &&
        le.push({
          t: f.c[ht].t,
          text: `DISPLACEMENT · ${at.dir === "bull" ? "BULL" : "BEAR"} · ${at.body.toFixed(c)}`,
        });
    for (const at of f.turtles)
      at.i === ht &&
        le.push({
          t: f.c[ht].t,
          text: `${at.plusOne ? "LIQUIDITY SWEEP + CISD" : "LIQUIDITY SWEEP"} · ${at.dir === "bull" ? "LONG" : "SHORT"} · ${wt(at.level, c)}`,
        });
  }
  const T = f.adx >= 25 ? "TREND" : f.adx >= 18 ? "BUILDING" : "CHOP",
    Y = Math.max(
      0,
      Math.min(
        100,
        ((f.price - f.rangeLow) / Math.max(f.rangeHigh - f.rangeLow, 1e-9)) *
          100,
      ),
    ),
    W = k
      ? {
          valid: !0,
          direction: y,
          model: _.name,
          modelKind: _.kind,
          entry: wt(X, c),
          entryZone: [wt(Math.min(Q, rt), c), wt(Math.max(Q, rt), c)],
          stop: wt(ct, c),
          tp1: wt($, c),
          tp2: wt(G, c),
          tp3: wt(et, c),
          rr: Math.round(yt * 100) / 100,
          rr1: Math.round(nt * 100) / 100,
          riskATR: Math.round(q * 100) / 100,
          grade: lt,
          confidence: Math.round(mt),
          confluences: J,
          sweptLiquidityType: sweptLiqLabel,
          primaryPdArray: pdArrayLabel,
          blockers: [],
          logic: M,
          createdTs: d,
        }
      : rh(L.length ? L : ["NO VALID SETUP — standing aside"], d, M);
  return {
    ok: !0,
    interval: e,
    price: f.price,
    score: Math.round(b),
    bias: v,
    confidence: Math.round(mt),
    concepts: m,
    plan: W,
    levels: {
      eq: wt(f.eq, c),
      rangeHigh: wt(f.rangeHigh, c),
      rangeLow: wt(f.rangeLow, c),
      bsl: f.pools
        .filter((H) => H.kind === "BSL" && !H.swept)
        .map((H) => wt(H.price, c))
        .slice(0, 4),
      ssl: f.pools
        .filter((H) => H.kind === "SSL" && !H.swept)
        .map((H) => wt(H.price, c))
        .slice(0, 4),
      sweptPools: f.pools
        .filter((H) => H.swept)
        .map((H) => ({
          kind: H.kind,
          price: wt(H.price, c),
          touches: H.touches,
        }))
        .slice(0, 4),
      pdh: f.sessions.pdh !== void 0 ? wt(f.sessions.pdh, c) : void 0,
      pdl: f.sessions.pdl !== void 0 ? wt(f.sessions.pdl, c) : void 0,
      dayOpen:
        f.sessions.dayOpen !== void 0 ? wt(f.sessions.dayOpen, c) : void 0,
      asiaH: f.sessions.asiaH !== void 0 ? wt(f.sessions.asiaH, c) : void 0,
      asiaL: f.sessions.asiaL !== void 0 ? wt(f.sessions.asiaL, c) : void 0,
      sth:
        f.hierarchy.sth?.price !== void 0
          ? wt(f.hierarchy.sth.price, c)
          : void 0,
      stl:
        f.hierarchy.stl?.price !== void 0
          ? wt(f.hierarchy.stl.price, c)
          : void 0,
      ith:
        f.hierarchy.ith?.price !== void 0
          ? wt(f.hierarchy.ith.price, c)
          : void 0,
      itl:
        f.hierarchy.itl?.price !== void 0
          ? wt(f.hierarchy.itl.price, c)
          : void 0,
      fvgZones: f.fvgs
        .filter((H) => !H.mitigated && Z - H.i <= 60)
        .slice(-6)
        .map((H) => ({
          dir: H.dir,
          top: wt(H.top, c),
          bottom: wt(H.bottom, c),
        })),
      ifvgZones: (f.ifvgs || [])
        .filter((H) => Z - H.i <= 60)
        .slice(-4)
        .map((H) => ({
          dir: H.dir,
          top: wt(H.top, c),
          bottom: wt(H.bottom, c),
        })),
      obZones: f.obs
        .slice(0, 4)
        .map((H) => ({
          dir: H.dir,
          top: wt(H.top, c),
          bottom: wt(H.bottom, c),
        })),
      breakerZones: (f.breakers || [])
        .slice(0, 4)
        .map((H) => ({
          dir: H.dir,
          top: wt(H.top, c),
          bottom: wt(H.bottom, c),
        })),
      unicornZones: (f.unicorns || [])
        .slice(0, 4)
        .map((H) => ({
          dir: H.dir,
          top: wt(H.top, c),
          bottom: wt(H.bottom, c),
        })),
      viZones: (f.vis || [])
        .slice(0, 3)
        .map((H) => ({
          dir: H.dir,
          top: wt(H.top, c),
          bottom: wt(H.bottom, c),
        })),
    },
    phase: {
      amd: f.amd.phase,
      amdDir: f.amd.dir,
      sweep: vt,
      sweptLiquidityType: sweptLiqLabel,
      primaryPdArray: pdArrayLabel,
      lastStruct: dt,
      cisd: f.cisds.some((H) => Z - H.i <= 12),
      displaced: f.disps.some((H) => Z - H.i <= 8),
      turtle: f.turtles.find((H) => Z - H.i <= 6),
      adx: f.adx,
      pdi: f.pdi,
      mdi: f.mdi,
      rsi: f.rsi,
      atr: f.atr,
      regime: T,
    },
    reasons: K,
    signals: le.reverse(),
    rangePos: Math.round(Y),
  };
}

export const analyse = _h;
export type Analysis = any;
