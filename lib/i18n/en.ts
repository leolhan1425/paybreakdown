export const en = {
  siteName: "SalaryHog",
  siteTagline: "Free Salary & Take-Home Pay Calculator",
  nav: {
    home: "Home",
    hourlyToSalary: "Hourly to Salary",
    byState: "By State",
    compare: "Compare",
    relocate: "Relocate",
    afford: "Afford",
    freelance: "1099 vs W2",
    blog: "Blog",
    about: "About",
  },

  hero: {
    title: "How Much Do You Actually Take Home?",
    subtitle: "Free salary calculator with federal & state tax breakdowns for all 50 states. Updated for 2025.",
  },

  calc: {
    hourly: "Hourly",
    annual: "Annual",
    compare: "Compare",
    hourlyRate: "Hourly Rate",
    annualSalary: "Annual Salary",
    state: "State",
    filingStatus: "Filing Status",
    single: "Single",
    married: "Married",
    advancedShow: "Advanced options",
    advancedHide: "Hide",
    hoursPerWeek: "Hours per week",
    noStateTax: "No state income tax",
    calculate: "Calculate",
    compareStates: "Compare States",
  },

  tax: {
    youTakeHome: "You take home",
    year: "year",
    month: "mo",
    paycheck: "paycheck",
    week: "wk",
    hour: "hr",
    taxBreakdown: "Tax Breakdown",
    category: "Category",
    annual: "Annual",
    monthly: "Monthly",
    percentOfGross: "% of Gross",
    grossPay: "Gross Pay",
    federalIncomeTax: "Federal Income Tax",
    stateIncomeTax: "State Tax",
    socialSecurity: "Social Security",
    medicare: "Medicare",
    totalTax: "Total Tax",
    takeHomePay: "Take-Home Pay",
    noStateTaxInsight: (stateName: string) =>
      `${stateName || 'This state'} has no state income tax — you keep more of every paycheck.`,
    highTaxInsight: (rate: string) =>
      `Your effective tax rate is ${rate}. Consider maximizing pre-tax deductions like 401(k) contributions to lower your taxable income.`,
    normalTaxInsight: (rate: string, cents: string) =>
      `Your effective tax rate is ${rate}, meaning you keep ${cents} cents of every dollar earned.`,
  },

  salary: {
    title: "Salary Breakdown by Period",
    period: "Period",
    gross: "Gross",
    taxes: "Taxes",
    takeHome: "Take-Home",
    hourly: "Hourly",
    daily: "Daily",
    weekly: "Weekly",
    biweekly: "Bi-weekly",
    monthly: "Monthly",
    annually: "Annual",
    yourInput: "your input",
  },

  stateInfo: {
    noIncomeTax: "has no state income tax",
    noIncomeTaxBadge: "No State Income Tax",
    flatTax: "Flat Tax",
    progressiveTax: "Progressive Tax",
  },

  popular: {
    title: "Popular Salary Calculations",
    takeHomeApprox: "Take-home ~",
    inState: "in TX",
  },

  browseStates: {
    title: "Browse by State",
    subtitle: "Select a state to see salary calculations with state-specific tax rates.",
  },

  relocating: {
    title: "Thinking About Relocating?",
    subtitle: "See what salary you'd need in a new city to maintain your lifestyle.",
    calculator: "Calculator",
  },

  blog: {
    title: "From the Blog",
    viewAll: "View all",
    minRead: "min read",
    byLine: "By SalaryHog",
    updated: "Updated for 2025 Tax Year",
  },

  faq: {
    title: "Frequently Asked Questions",
    items: [
      {
        question: "How is take-home pay calculated?",
        answer: "Your take-home pay is your gross salary minus all tax withholdings. This includes federal income tax (based on IRS tax brackets), Social Security tax (6.2% up to $176,100), Medicare tax (1.45% plus 0.9% on income over $200,000), and state income tax (varies by state). Our calculator applies the 2025 standard deduction before calculating federal income tax.",
      },
      {
        question: "What taxes are deducted from my paycheck?",
        answer: "Four main taxes are deducted: federal income tax, Social Security (6.2%), Medicare (1.45%), and state income tax (if your state has one). Nine states — Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming — have no state income tax.",
      },
      {
        question: "Which states have no income tax?",
        answer: "Nine states have no state income tax: Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming. This means residents of these states only pay federal taxes, keeping more of their gross pay.",
      },
      {
        question: "How accurate is this calculator?",
        answer: "Our calculator uses 2025 federal and state tax brackets and provides a close estimate of your take-home pay. Actual amounts may vary due to pre-tax deductions (401k, health insurance), local/city taxes, tax credits, and your specific tax situation. For precise calculations, consult a tax professional.",
      },
      {
        question: "What's the difference between gross and net pay?",
        answer: "Gross pay is your total earnings before any deductions. Net pay (take-home pay) is what you actually receive after federal, state, and payroll taxes are withheld. For example, a $50,000 gross salary might result in approximately $39,000-$42,000 in take-home pay depending on your state.",
      },
    ],
  },

  cta: {
    calculateNow: "Calculate Now",
    readyToCalculate: "Ready to calculate your take-home pay?",
    seeFullBreakdown: "See full breakdown",
    viewAllStates: "View all states",
  },

  footer: {
    tagline: "Free salary & take-home pay calculator for all 50 states.",
    popular: "Popular",
    states: "States",
    resources: "Resources",
    disclaimer: "This calculator provides estimates for informational purposes only. Actual take-home pay may vary based on additional deductions, local taxes, pre-tax contributions, and individual circumstances. This is not tax advice. Consult a tax professional.",
    copyright: "2025 SalaryHog. Data updated for the 2025 tax year.",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
  },

  monetization: {
    title: "Ways to Keep More of Your Paycheck",
    hysa: {
      title: "Open a High-Yield Savings Account",
      body: (tenPercent: string, interest: string) =>
        `The best high-yield savings accounts pay 4.5%+ APY. Parking just 10% of your take-home (${tenPercent}) earns ~${interest}/year in interest.`,
      cta: "Compare Savings Rates",
    },
    retirement: {
      title: "Max Your 401(k) Match",
      body: (match3: string, match6: string) =>
        `If your employer matches 3-6% of your salary, you're leaving ${match3} to ${match6} in free money on the table every year. Plus, contributions reduce your taxable income.`,
      cta: "Learn how 401(k) affects take-home",
    },
    noTaxState: {
      title: "Consider a No-Income-Tax State",
      body: (amount: string, stateName: string) =>
        `You're paying ${amount} in ${stateName} income tax this year. In a no-tax state, you'd keep all of it.`,
    },
    alreadyNoTax: {
      title: "You're in a No-Tax State",
      body: (stateName: string) =>
        `${stateName} has no state income tax — you're already keeping more than most. The average state tax would cost you an extra $2,000-$5,000/year on this salary.`,
      cta: "Read: 9 States With No Income Tax",
    },
  },

  seo: {
    understandingTitle: (periodLabel: string, stateLabel: string) =>
      `Understanding Your ${periodLabel} Salary${stateLabel}`,
    hourlyExplanation: (amount: number, grossAnnual: string, stateName: string, takeHome: string, monthly: string) =>
      `At $${amount} per hour working 40 hours a week, your gross annual salary is ${grossAnnual}. After federal${stateName ? ` and ${stateName}` : ''} taxes, you bring home approximately ${takeHome} per year, or ${monthly} per month.`,
    annualExplanation: (amount: string, stateLabel: string, monthlyGross: string, takeHome: string, monthly: string) =>
      `On a ${amount} annual salary${stateLabel}, your gross monthly earnings come to ${monthlyGross}. After federal${stateLabel ? ' and state' : ''} taxes, you take home approximately ${takeHome} per year, or ${monthly} per month.`,
    taxBreakdownTitle: (stateName: string) => `Tax Breakdown for ${stateName}`,
    compareTitle: "Compare Across States",
    compareIntro: (periodLabel: string) =>
      `The same ${periodLabel} salary would net you different amounts depending on where you live:`,
    inYourState: "(your state)",
    noStateTax: "(no state tax)",
    relatedTitle: "Related Calculations",
    nearbyRates: "Nearby hourly rates",
    nearbySalaries: "Nearby salaries",
    inOtherStates: "in other states",
    viewAllState: (stateName: string) => `View all ${stateName} salary calculations`,
  },

  statePage: {
    calculatorTitle: (stateName: string) => `${stateName} Salary & Take-Home Pay Calculator`,
    commonSalaries: (stateName: string) => `Common Salaries in ${stateName}`,
    hourlyWages: "Hourly Wages",
    annualSalaries: "Annual Salaries",
    rate: "Rate",
    salary: "Salary",
    annualGross: "Annual Gross",
    takeHome: "Take-Home",
    monthlyTakeHome: "Monthly",
    annualTakeHome: "Annual Take-Home",
    effRate: "Eff. Rate",
    howTaxesWork: (stateName: string) => `How ${stateName} Taxes Work`,
    noIncomeTaxDesc: (stateName: string) =>
      `${stateName} is one of nine states with no state income tax. Residents only pay federal taxes: federal income tax (based on IRS brackets), Social Security (6.2%), and Medicare (1.45%).`,
    noIncomeTaxCompare: (stateName: string) =>
      `Compared to California — where top earners pay 13.3% state tax — living in ${stateName} can mean thousands more in take-home pay each year. On a $75,000 salary, the difference can be over $3,000 annually.`,
    flatTaxDesc: (stateName: string, rate: string) =>
      `${stateName} uses a flat income tax rate of ${rate}% on all taxable income. Unlike progressive states, every dollar is taxed at the same rate regardless of your income level.`,
    flatTaxExtra: "On top of this, all residents pay federal income tax, Social Security (6.2%), and Medicare (1.45%).",
    progressiveTaxDesc: (stateName: string) =>
      `${stateName} uses progressive tax brackets — higher earners pay a higher marginal rate. Here are the ${stateName} income tax brackets for single filers:`,
    incomeRange: "Income Range",
    taxRate: "Tax Rate",
    bracketNote: "Rates shown are marginal — you only pay each rate on the portion of income within that bracket. Social Security (6.2%) and Medicare (1.45%) apply in addition to these rates.",
    compareToStates: (stateName: string) => `Compare ${stateName} to Other States`,
    compareSubtitle: "Take-home pay on a $60,000 salary (single filer, 2025)",
    current: "(current)",
    compareWithOther: "Compare with Other States",
  },
};
