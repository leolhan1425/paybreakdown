import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Import the existing tax engine
import { calculateTakeHome } from '../lib/tax-engine';
import statesData from '../data/states.json';

// ── Config ──
const SALARY = 75000;
const FILING = 'single' as const;
const OUT_DIR = join(__dirname, '..', 'public', 'charts');

// ── Calculate take-home for all states ──
interface StateResult {
  name: string;
  code: string;
  takeHome: number;
  totalTax: number;
  effectiveRate: number;
  hasStateTax: boolean;
  stateIncomeTax: number;
  taxType: 'none' | 'flat' | 'progressive';
}

const results: StateResult[] = statesData.map((s: any) => {
  const r = calculateTakeHome({
    amount: SALARY,
    period: 'annual',
    stateCode: s.code,
    filingStatus: FILING,
  });
  let taxType: 'none' | 'flat' | 'progressive' = 'progressive';
  if (!s.hasIncomeTax) taxType = 'none';
  else if (s.taxType === 'flat') taxType = 'flat';
  return {
    name: r.stateName,
    code: s.code,
    takeHome: r.takeHome.annual,
    totalTax: r.totalTax,
    effectiveRate: r.effectiveRate,
    hasStateTax: r.hasStateTax,
    stateIncomeTax: r.stateIncomeTax,
    taxType,
  };
});

// Sort highest take-home first
results.sort((a, b) => b.takeHome - a.takeHome);

const noTaxStates = results.filter(s => s.taxType === 'none');
const worst = results[results.length - 1];
const gap = Math.round(noTaxStates[0].takeHome - worst.takeHome);

// ── Console table ──
console.log(`\n${'#'.padStart(3)}  ${'State'.padEnd(22)} ${'Take-Home'.padStart(10)}  ${'Tax'.padStart(10)}  ${'Rate'.padStart(7)}  Type`);
console.log('─'.repeat(72));
results.forEach((s, i) => {
  const rank = String(i + 1).padStart(3);
  const name = s.name.padEnd(22);
  const th = `$${s.takeHome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`.padStart(10);
  const tax = `$${s.totalTax.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`.padStart(10);
  const rate = `${(s.effectiveRate * 100).toFixed(1)}%`.padStart(7);
  console.log(`${rank}  ${name} ${th}  ${tax}  ${rate}  ${s.taxType}`);
});
console.log(`\nTop (9 no-tax states tied): $${noTaxStates[0].takeHome.toLocaleString()}`);
console.log(`Worst: ${worst.name} — $${worst.takeHome.toLocaleString()}`);
console.log(`Gap:   $${gap.toLocaleString()}/year\n`);

// ── Color by tax type (the second dimension) ──
const TAX_COLORS = {
  none: '#22c55e',        // Green — no state income tax
  flat: '#3b82f6',        // Blue — flat rate
  progressive: '#f97316', // Orange — progressive brackets
};

function getBarColor(s: StateResult): string {
  return TAX_COLORS[s.taxType];
}

// ── Dollar formatter ──
const usd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

// ── Chart 1: Full chart ──
mkdirSync(OUT_DIR, { recursive: true });

async function renderFullChart() {
  const WIDTH = 1800;
  const HEIGHT = 3600;
  const canvas = new ChartJSNodeCanvas({
    width: WIDTH,
    height: HEIGHT,
    backgroundColour: '#FFFFFF',
  });

  // Reversed for horizontal bar (Chart.js renders bottom-to-top)
  const reversedResults = [...results].reverse();

  const labels = reversedResults.map(s => s.name);
  const data = reversedResults.map(s => s.takeHome);
  const colors = reversedResults.map(s => getBarColor(s));

  const maxVal = Math.ceil(noTaxStates[0].takeHome / 5000) * 5000 + 2000;

  const config: ChartConfiguration = {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 0,
        barPercentage: 0.82,
        categoryPercentage: 0.92,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: false,
      layout: {
        padding: { top: 200, bottom: 110, left: 20, right: 60 },
      },
      scales: {
        x: {
          min: 0,
          max: maxVal,
          ticks: {
            callback: (val) => usd(val as number),
            font: { size: 20, family: 'Helvetica Neue' },
            color: '#666',
            stepSize: 10000,
          },
          grid: { color: '#f0f0f0' },
          title: {
            display: true,
            text: 'Annual Take-Home Pay',
            font: { size: 22, family: 'Helvetica Neue' },
            color: '#888',
          },
        },
        y: {
          ticks: {
            font: { size: 23, family: 'Helvetica Neue', weight: 'bold' as any },
            color: '#222',
          },
          grid: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
        title: { display: false },
      },
    },
    plugins: [{
      id: 'customText',
      afterDraw(chart) {
        const ctx = chart.ctx;
        ctx.save();

        // Title
        ctx.font = 'bold 48px "Helvetica Neue"';
        ctx.fillStyle = '#111';
        ctx.textAlign = 'center';
        ctx.fillText('Take-Home Pay on a $75,000 Salary in Every U.S. State', WIDTH / 2, 52);

        // Subtitle
        ctx.font = '26px "Helvetica Neue"';
        ctx.fillStyle = '#666';
        ctx.fillText('Single filer, standard deduction, 2025 tax brackets', WIDTH / 2, 92);

        // Legend — color = tax type
        const legendY = 135;
        const legendItems = [
          { color: TAX_COLORS.none, label: 'No state income tax' },
          { color: TAX_COLORS.flat, label: 'Flat state income tax' },
          { color: TAX_COLORS.progressive, label: 'Progressive state income tax' },
        ];
        ctx.font = 'bold 22px "Helvetica Neue"';
        const totalLegendWidth = legendItems.reduce((w, item) => {
          return w + 28 + ctx.measureText(item.label).width + 40;
        }, -40);
        let legendX = (WIDTH - totalLegendWidth) / 2;
        for (const item of legendItems) {
          ctx.fillStyle = item.color;
          ctx.fillRect(legendX, legendY - 16, 22, 22);
          ctx.fillStyle = '#444';
          ctx.textAlign = 'left';
          ctx.fillText(item.label, legendX + 28, legendY + 3);
          legendX += 28 + ctx.measureText(item.label).width + 40;
        }

        // Gap callout
        ctx.font = 'bold 24px "Helvetica Neue"';
        ctx.fillStyle = '#7c3aed';
        ctx.textAlign = 'center';
        ctx.fillText(`Difference between highest and lowest: ${usd(gap)}/year`, WIDTH / 2, 175);

        // Footer left
        ctx.font = '20px "Helvetica Neue"';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'left';
        ctx.fillText('Source: salaryhog.com', 30, HEIGHT - 30);

        // Footer right
        ctx.font = '18px "Helvetica Neue"';
        ctx.textAlign = 'right';
        ctx.fillText('Includes federal income tax, state income tax, Social Security (6.2%), Medicare (1.45%)', WIDTH - 30, HEIGHT - 30);

        // Branding
        ctx.font = '18px "Helvetica Neue"';
        ctx.fillStyle = '#bbb';
        ctx.textAlign = 'right';
        ctx.fillText('SalaryHog', WIDTH - 30, HEIGHT - 60);

        // Bar value labels
        const meta = chart.getDatasetMeta(0);
        ctx.font = 'bold 19px "Helvetica Neue"';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#333';
        meta.data.forEach((bar, i) => {
          const val = reversedResults[i].takeHome;
          const x = (bar as any).x + 10;
          const y = (bar as any).y + 6;
          ctx.fillText(usd(val), x, y);
        });

        // Bracket annotation: 9 no-tax states tied
        const noTaxIndices = reversedResults
          .map((s, i) => s.taxType === 'none' ? i : -1)
          .filter(i => i >= 0);
        if (noTaxIndices.length > 0) {
          const firstIdx = noTaxIndices[0];
          const lastIdx = noTaxIndices[noTaxIndices.length - 1];
          const firstBar = meta.data[firstIdx];
          const lastBar = meta.data[lastIdx];
          const bracketX = (lastBar as any).x + 100;
          const topY = (firstBar as any).y;
          const bottomY = (lastBar as any).y;
          const midY = (topY + bottomY) / 2;

          ctx.strokeStyle = '#16a34a';
          ctx.lineWidth = 2.5;
          // Vertical line
          ctx.beginPath();
          ctx.moveTo(bracketX, topY);
          ctx.lineTo(bracketX, bottomY);
          ctx.stroke();
          // Top tick
          ctx.beginPath();
          ctx.moveTo(bracketX - 8, topY);
          ctx.lineTo(bracketX, topY);
          ctx.stroke();
          // Bottom tick
          ctx.beginPath();
          ctx.moveTo(bracketX - 8, bottomY);
          ctx.lineTo(bracketX, bottomY);
          ctx.stroke();

          ctx.font = 'bold 20px "Helvetica Neue"';
          ctx.fillStyle = '#16a34a';
          ctx.textAlign = 'left';
          ctx.fillText('9 states tied', bracketX + 12, midY - 6);
          ctx.fillText('(no state income tax)', bracketX + 12, midY + 18);
        }

        // Callout: Worst
        const bottomBar = meta.data[0];
        ctx.font = 'bold 20px "Helvetica Neue"';
        ctx.fillStyle = '#dc2626';
        ctx.textAlign = 'left';
        const worstX = (bottomBar as any).x + 10;
        const worstY = (bottomBar as any).y - 18;
        ctx.fillText(`Highest taxed: ${worst.name}`, worstX, worstY);

        ctx.restore();
      },
    }],
  };

  const buf = await canvas.renderToBuffer(config);
  const path = join(OUT_DIR, 'takehome-75k-all-states.png');
  writeFileSync(path, buf);
  console.log(`✓ Full chart saved: ${path}`);
}

// ── Chart 2: Square 1080x1080 (top 20 + bottom 5) ──
async function renderSquareChart() {
  const WIDTH = 1080;
  const HEIGHT = 1080;
  const canvas = new ChartJSNodeCanvas({
    width: WIDTH,
    height: HEIGHT,
    backgroundColour: '#FFFFFF',
  });

  const top20 = results.slice(0, 20);
  const bottom5 = results.slice(-5);
  const subset = [...top20, ...bottom5];

  const reversedSubset = [...subset].reverse();
  const subColors = reversedSubset.map(s => getBarColor(s));

  const labels = reversedSubset.map(s => s.name);
  const data = reversedSubset.map(s => s.takeHome);

  const maxVal = Math.ceil(noTaxStates[0].takeHome / 5000) * 5000 + 2000;

  const config: ChartConfiguration = {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: subColors,
        borderWidth: 0,
        barPercentage: 0.80,
        categoryPercentage: 0.90,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: false,
      layout: {
        padding: { top: 100, bottom: 60, left: 15, right: 20 },
      },
      scales: {
        x: {
          min: 0,
          max: maxVal,
          ticks: {
            callback: (val) => usd(val as number),
            font: { size: 11, family: 'Helvetica Neue' },
            color: '#666',
            stepSize: 10000,
          },
          grid: { color: '#f0f0f0' },
        },
        y: {
          ticks: {
            font: { size: 12, family: 'Helvetica Neue', weight: 'bold' as any },
            color: '#333',
          },
          grid: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
      },
    },
    plugins: [{
      id: 'squareText',
      afterDraw(chart) {
        const ctx = chart.ctx;
        ctx.save();

        // Title
        ctx.font = 'bold 22px "Helvetica Neue"';
        ctx.fillStyle = '#111';
        ctx.textAlign = 'center';
        ctx.fillText('Take-Home Pay on $75K: Top 20 & Bottom 5 States', WIDTH / 2, 28);

        // Subtitle
        ctx.font = '13px "Helvetica Neue"';
        ctx.fillStyle = '#666';
        ctx.fillText('Single filer, standard deduction, 2025', WIDTH / 2, 48);

        // Legend
        const legendY = 70;
        ctx.font = 'bold 12px "Helvetica Neue"';
        const items = [
          { color: TAX_COLORS.none, label: 'No state tax' },
          { color: TAX_COLORS.flat, label: 'Flat' },
          { color: TAX_COLORS.progressive, label: 'Progressive' },
        ];
        let lx = WIDTH / 2 - 150;
        for (const item of items) {
          ctx.fillStyle = item.color;
          ctx.fillRect(lx, legendY - 9, 12, 12);
          ctx.fillStyle = '#444';
          ctx.textAlign = 'left';
          ctx.fillText(item.label, lx + 16, legendY);
          lx += 16 + ctx.measureText(item.label).width + 20;
        }

        // Gap
        ctx.font = '12px "Helvetica Neue"';
        ctx.fillStyle = '#7c3aed';
        ctx.textAlign = 'center';
        ctx.fillText(`Difference: ${usd(gap)}/year`, WIDTH / 2, 90);

        // Separator line
        const meta = chart.getDatasetMeta(0);
        const bar5 = meta.data[4];
        const bar6 = meta.data[5];
        if (bar5 && bar6) {
          const lineY = ((bar5 as any).y + (bar6 as any).y) / 2;
          ctx.strokeStyle = '#ccc';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(chart.chartArea.left, lineY);
          ctx.lineTo(chart.chartArea.right, lineY);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.font = '10px "Helvetica Neue"';
          ctx.fillStyle = '#999';
          ctx.textAlign = 'right';
          ctx.fillText('· · · 26 states omitted · · ·', chart.chartArea.right, lineY - 4);
        }

        // Value labels
        ctx.font = 'bold 10.5px "Helvetica Neue"';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#444';
        meta.data.forEach((bar, i) => {
          const val = reversedSubset[i].takeHome;
          ctx.fillText(usd(val), (bar as any).x + 5, (bar as any).y + 3.5);
        });

        // Footer
        ctx.font = '12px "Helvetica Neue"';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'left';
        ctx.fillText('Source: salaryhog.com', 20, HEIGHT - 16);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#bbb';
        ctx.fillText('SalaryHog', WIDTH - 20, HEIGHT - 16);

        ctx.restore();
      },
    }],
  };

  const buf = await canvas.renderToBuffer(config);
  const path = join(OUT_DIR, 'takehome-75k-square.png');
  writeFileSync(path, buf);
  console.log(`✓ Square chart saved: ${path}`);
}

// ── Generate Reddit post markdown ──
function generateRedditPost() {
  const noTaxNotTop10 = noTaxStates.filter(s => results.indexOf(s) >= 10);

  const flatTaxStates = results.filter(s => s.taxType === 'flat');
  const flatTaxSorted = [...flatTaxStates].sort((a, b) => a.takeHome - b.takeHome);
  const bestFlat = flatTaxSorted[flatTaxSorted.length - 1];
  const worstFlat = flatTaxSorted[0];

  const median = results[25];

  let noTaxObservation: string;
  if (noTaxNotTop10.length > 0) {
    noTaxObservation = `All 9 no-income-tax states land in the top ${results.indexOf(noTaxStates[noTaxStates.length - 1]) + 1}, but they're not all in the top 10 — ${noTaxNotTop10.map(s => s.name).join(', ')} ${noTaxNotTop10.length === 1 ? 'falls' : 'fall'} just outside`;
  } else {
    noTaxObservation = `All 9 no-income-tax states are tied at #1 with identical take-home — the only difference between them is cost of living (not shown here)`;
  }

  let flatTaxObservation = '';
  if (bestFlat && worstFlat && bestFlat.code !== worstFlat.code) {
    const bestRank = results.indexOf(bestFlat) + 1;
    const worstRank = results.indexOf(worstFlat) + 1;
    flatTaxObservation = `${bestFlat.name} (#${bestRank}) and ${worstFlat.name} (#${worstRank}) both have flat income taxes but end up in very different spots`;
  }

  const post = `**Title:** [OC] I calculated the actual take-home pay for a $75,000 salary in all 50 states + DC

**Body:**

I kept seeing people argue about which states are "actually cheaper" when you factor in taxes, so I ran the numbers.

This shows the take-home pay for a $75,000 salary (single filer, standard deduction) in all 50 states + DC, using 2025 federal brackets, state income tax rates, Social Security (6.2%), and Medicare (1.45%).

**Color = tax type:** Green = no state income tax, Blue = flat rate, Orange = progressive brackets.

Some things that surprised me:

- The gap between the 9 tied no-tax states and #51 ${worst.name} is only $${gap.toLocaleString()}/year — that's $${Math.round(gap / 12).toLocaleString()}/month
- ${noTaxObservation}
- ${flatTaxObservation}
- The median state (${median.name}) takes home ${usd(median.takeHome)}, an effective total tax rate of ${(median.effectiveRate * 100).toFixed(1)}%

A few caveats: this doesn't include local/city taxes (looking at you, NYC), property taxes, or cost of living. Just pure paycheck math.

**Source:** Built a calculator at salaryhog.com that does this for any salary/state combo
**Tools:** Next.js, Node.js, Chart.js
`;

  const path = join(__dirname, 'reddit-post.md');
  writeFileSync(path, post);
  console.log(`✓ Reddit post saved: ${path}`);
}

// ── Run ──
async function main() {
  await renderFullChart();
  await renderSquareChart();
  generateRedditPost();
  console.log('\nDone!');
}
main();
