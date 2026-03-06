'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import statesData from '../data/states.json';
import { calculateTakeHome, TaxResult } from '@/lib/tax-engine';
import { ParsedSlug } from '@/lib/slug-generator';
import { en } from '@/lib/i18n/en';
import { es, stateNamesEs } from '@/lib/i18n/es';

const NO_TAX_STATES = new Set(['AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY']);

interface Props {
  initialValues: ParsedSlug & { stateCode: string };
  onResultChange: (result: TaxResult, period: 'hourly' | 'annual') => void;
  lang?: 'en' | 'es';
}

function formatDisplay(amount: number, period: 'hourly' | 'annual'): string {
  if (period === 'annual') return amount.toLocaleString('en-US');
  return String(amount);
}

export default function Calculator({ initialValues, onResultChange, lang = 'en' }: Props) {
  const t = lang === 'es' ? es.calc : en.calc;
  const [period, setPeriod] = useState<'hourly' | 'annual'>(initialValues.period);
  const [amount, setAmount] = useState(initialValues.amount);
  const [stateCode, setStateCode] = useState(initialValues.stateCode);
  const [filingStatus, setFilingStatus] = useState<'single' | 'married'>('single');
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [inputDisplay, setInputDisplay] = useState(() => formatDisplay(initialValues.amount, initialValues.period));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const recalculate = useCallback((
    amt: number,
    per: 'hourly' | 'annual',
    sc: string,
    fs: 'single' | 'married',
    hrs: number,
  ) => {
    if (amt <= 0) return;
    const result = calculateTakeHome({ amount: amt, period: per, stateCode: sc, filingStatus: fs, hoursPerWeek: hrs });
    onResultChange(result, per);
  }, [onResultChange]);

  useEffect(() => {
    recalculate(amount, period, stateCode, filingStatus, hoursPerWeek);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePeriodToggle = (newPeriod: 'hourly' | 'annual') => {
    setPeriod(newPeriod);
    setInputDisplay(formatDisplay(amount, newPeriod));
    recalculate(amount, newPeriod, stateCode, filingStatus, hoursPerWeek);
  };

  const handleAmountChange = (value: string) => {
    const raw = value.replace(/[$,]/g, '');
    if (!/^\d*\.?\d*$/.test(raw)) return;
    setInputDisplay(value);
    const num = parseFloat(raw);
    if (!isNaN(num) && num > 0) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setAmount(num);
        recalculate(num, period, stateCode, filingStatus, hoursPerWeek);
      }, 300);
    }
  };

  const handleAmountBlur = () => {
    const raw = inputDisplay.replace(/[$,]/g, '');
    const num = parseFloat(raw);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
      setInputDisplay(formatDisplay(num, period));
    }
  };

  const handleStateChange = (sc: string) => {
    setStateCode(sc);
    recalculate(amount, period, sc, filingStatus, hoursPerWeek);
  };

  const handleFilingStatusChange = (fs: 'single' | 'married') => {
    setFilingStatus(fs);
    recalculate(amount, period, stateCode, fs, hoursPerWeek);
  };

  const handleHoursChange = (hrs: number) => {
    setHoursPerWeek(hrs);
    recalculate(amount, period, stateCode, filingStatus, hrs);
  };

  const getStateName = (s: typeof statesData[0]) => {
    if (lang === 'es') return stateNamesEs[s.slug] || s.name;
    return s.name;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      {/* Period toggle */}
      <div className="flex mb-5 border-b border-gray-200 -mx-6 -mt-6 rounded-t-xl overflow-hidden">
        {(['hourly', 'annual'] as const).map(p => (
          <button
            key={p}
            onClick={() => handlePeriodToggle(p)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold transition-colors cursor-pointer ${
              period === p
                ? 'bg-green-600 text-white'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            {p === 'hourly' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            )}
            {p === 'hourly' ? t.hourly : t.annual}
          </button>
        ))}
      </div>

      {/* Amount input */}
      <div className="mb-5">
        <label className="block text-sm text-gray-500 mb-1">
          {period === 'hourly' ? t.hourlyRate : t.annualSalary}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-gray-400">$</span>
          <input
            type="text"
            inputMode="decimal"
            value={inputDisplay}
            onChange={e => handleAmountChange(e.target.value)}
            onBlur={handleAmountBlur}
            placeholder={period === 'hourly' ? '20' : '75,000'}
            className="w-full pl-10 pr-4 py-3 text-2xl font-bold text-gray-900 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* State dropdown */}
        <div>
          <label className="block text-sm text-gray-500 mb-1">{t.state}</label>
          <select
            value={stateCode}
            onChange={e => handleStateChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-blue-500 focus:outline-none bg-white"
          >
            {statesData
              .slice()
              .sort((a, b) => getStateName(a).localeCompare(getStateName(b)))
              .map(s => (
                <option key={s.code} value={s.code}>
                  {getStateName(s)}{NO_TAX_STATES.has(s.code) ? ' ★' : ''}
                </option>
              ))}
          </select>
          <p className="mt-1 text-xs text-gray-400">{lang === 'es' ? '★ = Sin impuesto estatal' : '★ = No state income tax'}</p>
        </div>

        {/* Filing status */}
        <div>
          <label className="block text-sm text-gray-500 mb-1">{t.filingStatus}</label>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(['single', 'married'] as const).map(fs => (
              <button
                key={fs}
                onClick={() => handleFilingStatusChange(fs)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  filingStatus === fs
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {fs === 'single' ? t.single : t.married}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced(v => !v)}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        {showAdvanced ? `▲ ${t.advancedHide}` : `▼ ${t.advancedShow}`}
      </button>

      {showAdvanced && period === 'hourly' && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="block text-sm text-gray-500 mb-2">
            {t.hoursPerWeek}: <span className="font-semibold text-gray-800">{hoursPerWeek}</span>
          </label>
          <input
            type="range"
            min={20}
            max={60}
            value={hoursPerWeek}
            onChange={e => handleHoursChange(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>20 hrs</span>
            <span>40 hrs</span>
            <span>60 hrs</span>
          </div>
        </div>
      )}
    </div>
  );
}
