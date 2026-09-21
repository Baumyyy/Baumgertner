import React, { useState, useRef } from 'react';

/**
 * Daily page views for the last 30 days.
 *
 * Replaces a row of divs with percentage heights. That version had no axis,
 * so a bar's height meant nothing you could read a number off, and it drew
 * only the days the query returned - which were only the days with traffic.
 * Five busy days in a month rendered as five evenly spaced bars and read as
 * five consecutive days. The query now zero-fills (see /api/admin/pageviews)
 * and this draws a real time axis, so a gap looks like a gap.
 *
 * Built as SVG rather than pulled from a charting library: two charts do not
 * justify 200-500 KB of dependency, and the specs that make a chart look
 * professional - 2px line, 10% area wash, hairline solid grid, crosshair
 * tooltip, selective labels - are a few lines each when you own the markup.
 */

var LEVEYS = 760;
var KORKEUS = 260;
// Room for the y-axis labels on the left and the date band underneath. The
// band is inside the viewBox on purpose: a container sized to the plot alone
// crops the axis and the card grows a nested scrollbar.
var MARGIN = { ylos: 16, oikea: 16, alas: 28, vasen: 44 };

var PIIRTO_L = LEVEYS - MARGIN.vasen - MARGIN.oikea;
var PIIRTO_K = KORKEUS - MARGIN.ylos - MARGIN.alas;

/**
 * Ticks on clean numbers. Dividing the peak into four equal parts is the
 * obvious approach and it is wrong: a peak of 41 gives 0/11/23/34/45, which
 * is arithmetically fine and unreadable. Pick a round step first, then let
 * the ceiling fall where it falls.
 */
var ASKELEET = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000];

function asteikko(maksimi) {
  var kohde = Math.max(maksimi, 1) / 4;
  var askel = ASKELEET[ASKELEET.length - 1];
  for (var i = 0; i < ASKELEET.length; i++) {
    if (ASKELEET[i] >= kohde) { askel = ASKELEET[i]; break; }
  }
  var katto = Math.max(Math.ceil(maksimi / askel) * askel, askel);
  var ticks = [];
  for (var t = 0; t <= katto; t += askel) ticks.push(t);
  return { katto: katto, ticks: ticks };
}

function pvmLyhyt(arvo) {
  return new Date(arvo).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

var TrafficChart = function(props) {
  var data = props.data || [];
  var taulukkoTila = useState(false);
  var taulukko = taulukkoTila[0];
  var setTaulukko = taulukkoTila[1];

  var osoitinTila = useState(null);
  var osoitin = osoitinTila[0];
  var setOsoitin = osoitinTila[1];

  var svgRef = useRef(null);

  var pisteet = data.map(function(d) {
    return { pvm: d.date, arvo: parseInt(d.count, 10) || 0 };
  });

  var huippu = pisteet.reduce(function(a, p) { return Math.max(a, p.arvo); }, 0);
  var mitta = asteikko(huippu);
  var katto = mitta.katto;

  // Plain functions: thirty points recomputed on render costs nothing, and
  // useCallback here only fought the compiler for no measurable gain.
  function x(i) {
    if (pisteet.length < 2) return MARGIN.vasen + PIIRTO_L / 2;
    return MARGIN.vasen + (i / (pisteet.length - 1)) * PIIRTO_L;
  }

  function y(arvo) {
    return MARGIN.ylos + PIIRTO_K - (arvo / katto) * PIIRTO_K;
  }

  // Nearest-point lookup across the full plot, so the hit area is the whole
  // column rather than the 8px dot - see the pinpoint-hover anti-pattern.
  var liiku = function(e) {
    var svg = svgRef.current;
    if (!svg || pisteet.length === 0) return;
    var laatikko = svg.getBoundingClientRect();
    var suhde = LEVEYS / laatikko.width;
    var sx = (e.clientX - laatikko.left) * suhde;
    var i = Math.round(((sx - MARGIN.vasen) / PIIRTO_L) * (pisteet.length - 1));
    if (i < 0) i = 0;
    if (i > pisteet.length - 1) i = pisteet.length - 1;
    setOsoitin(i);
  };

  if (pisteet.length === 0) return <p className="chart-empty">No visitor data yet</p>;

  var viiva = pisteet.map(function(p, i) { return (i ? 'L' : 'M') + x(i) + ' ' + y(p.arvo); }).join(' ');
  var alue = viiva +
    ' L' + x(pisteet.length - 1) + ' ' + y(0) +
    ' L' + x(0) + ' ' + y(0) + ' Z';

  var ticks = mitta.ticks;
  var viimeinen = pisteet[pisteet.length - 1];

  // Sparse date labels - one every ~7 days plus the last, so 30 dates never
  // collide along the axis.
  var viimeinenIdx = pisteet.length - 1;
  var pvmIndeksit = [];
  for (var i = 0; i < pisteet.length; i += 7) {
    // A stepped label landing within four points of the end would overlap
    // the endpoint label, which is always drawn. "20 Sept" printed on top
    // of "21 Sept" is worse than one fewer tick.
    if (viimeinenIdx - i < 4) continue;
    pvmIndeksit.push(i);
  }
  pvmIndeksit.push(viimeinenIdx);

  var aktiivinen = osoitin !== null ? pisteet[osoitin] : null;

  return (
    <div className="tc">
      <div className="tc-tools">
        <button
          type="button"
          className="tc-toggle"
          onClick={function() { setTaulukko(!taulukko); }}
          aria-pressed={taulukko}
        >
          {taulukko ? 'Chart' : 'Table'}
        </button>
      </div>

      {taulukko ? (
        // Every value reachable without hovering anything. The tooltip
        // enhances; it never gates.
        <div className="tc-table-wrap">
          <table className="tc-table">
            <caption className="sr-only">Daily page views, last 30 days</caption>
            <thead>
              <tr><th scope="col">Date</th><th scope="col">Views</th></tr>
            </thead>
            <tbody>
              {pisteet.map(function(p, i) {
                return (
                  <tr key={i}>
                    <td>{pvmLyhyt(p.pvm)}</td>
                    <td className="tc-num">{p.arvo}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="tc-plot">
          <svg
            ref={svgRef}
            viewBox={'0 0 ' + LEVEYS + ' ' + KORKEUS}
            className="tc-svg"
            role="img"
            aria-label={'Daily page views for the last 30 days. Peak ' + huippu + ' views.'}
            onMouseMove={liiku}
            onMouseLeave={function() { setOsoitin(null); }}
          >
            {/* Hairline, solid, one step off the surface. Never dashed. */}
            {ticks.map(function(t, i) {
              return (
                <g key={i}>
                  <line className="tc-grid" x1={MARGIN.vasen} y1={y(t)} x2={LEVEYS - MARGIN.oikea} y2={y(t)} />
                  <text className="tc-tick" x={MARGIN.vasen - 10} y={y(t) + 4} textAnchor="end">
                    {Math.round(t)}
                  </text>
                </g>
              );
            })}

            <path className="tc-area" d={alue} />
            <path className="tc-line" d={viiva} />

            {pvmIndeksit.map(function(idx) {
              return (
                <text
                  key={idx}
                  className="tc-date"
                  x={x(idx)}
                  y={KORKEUS - 8}
                  textAnchor={idx === 0 ? 'start' : idx === pisteet.length - 1 ? 'end' : 'middle'}
                >
                  {pvmLyhyt(pisteet[idx].pvm)}
                </text>
              );
            })}

            {/* The endpoint is the one point worth labelling directly. */}
            <circle className="tc-end" cx={x(pisteet.length - 1)} cy={y(viimeinen.arvo)} r="4" />

            {aktiivinen && (
              <g>
                <line className="tc-cross" x1={x(osoitin)} y1={MARGIN.ylos} x2={x(osoitin)} y2={MARGIN.ylos + PIIRTO_K} />
                <circle className="tc-dot" cx={x(osoitin)} cy={y(aktiivinen.arvo)} r="4.5" />
              </g>
            )}
          </svg>

          {aktiivinen && (
            <div
              className="tc-tip"
              style={{
                left: (x(osoitin) / LEVEYS) * 100 + '%',
                // Flip the anchor near the edges so the tooltip never leaves
                // the card.
                transform: 'translate(' +
                  (osoitin < 3 ? '0' : osoitin > pisteet.length - 4 ? '-100%' : '-50%') + ', 0)'
              }}
            >
              <span className="tc-tip-date">{pvmLyhyt(aktiivinen.pvm)}</span>
              <span className="tc-tip-val">{aktiivinen.arvo} view{aktiivinen.arvo === 1 ? '' : 's'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrafficChart;
