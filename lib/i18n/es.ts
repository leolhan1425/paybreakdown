export const es = {
  // Site chrome
  siteName: "SalaryHog",
  siteTagline: "Calculadora Gratuita de Sueldo Neto",
  nav: {
    home: "Inicio",
    hourlyToSalary: "Por Hora a Salario",
    byState: "Por Estado",
    compare: "Comparar",
    relocate: "Reubicacion",
    afford: "Renta",
    freelance: "Freelance",
    blog: "Blog",
    about: "Acerca de",
  },

  // Homepage
  hero: {
    title: "Cuanto Ganas Realmente?",
    subtitle: "Calculadora gratuita de sueldo con desglose de impuestos federales y estatales para los 50 estados. Actualizada para 2025.",
  },

  // Calculator
  calc: {
    hourly: "Por Hora",
    annual: "Anual",
    compare: "Comparar",
    hourlyRate: "Tarifa por Hora",
    annualSalary: "Salario Anual",
    state: "Estado",
    filingStatus: "Estado Civil",
    single: "Soltero/a",
    married: "Casado/a",
    advancedShow: "Opciones avanzadas",
    advancedHide: "Ocultar",
    hoursPerWeek: "Horas por semana",
    noStateTax: "Sin impuesto estatal sobre la renta",
    calculate: "Calcular",
    compareStates: "Comparar Estados",
  },

  // Tax breakdown table
  tax: {
    youTakeHome: "Tu sueldo neto es",
    year: "ano",
    month: "mes",
    paycheck: "cheque quincenal",
    week: "sem",
    hour: "hora",
    taxBreakdown: "Desglose de Impuestos",
    category: "Categoria",
    annual: "Anual",
    monthly: "Mensual",
    percentOfGross: "% del Bruto",
    grossPay: "Sueldo Bruto",
    federalIncomeTax: "Impuesto Federal sobre la Renta",
    stateIncomeTax: "Impuesto Estatal",
    socialSecurity: "Seguro Social",
    medicare: "Medicare",
    totalTax: "Total de Impuestos",
    takeHomePay: "Sueldo Neto",
    noStateTaxInsight: (stateName: string) =>
      `${stateName || 'Este estado'} no tiene impuesto estatal sobre la renta — te quedas con mas de cada cheque.`,
    highTaxInsight: (rate: string) =>
      `Tu tasa efectiva de impuestos es ${rate}. Considera maximizar deducciones antes de impuestos como contribuciones al 401(k) para reducir tu ingreso gravable.`,
    normalTaxInsight: (rate: string, cents: string) =>
      `Tu tasa efectiva de impuestos es ${rate}, lo que significa que te quedas con ${cents} centavos de cada dolar ganado.`,
  },

  // Salary breakdown table
  salary: {
    title: "Desglose de Sueldo por Periodo",
    period: "Periodo",
    gross: "Bruto",
    taxes: "Impuestos",
    takeHome: "Neto",
    hourly: "Por Hora",
    daily: "Diario",
    weekly: "Semanal",
    biweekly: "Quincenal",
    monthly: "Mensual",
    annually: "Anual",
    yourInput: "tu dato",
  },

  // State info
  stateInfo: {
    noIncomeTax: "no tiene impuesto estatal sobre la renta",
    noIncomeTaxBadge: "Sin Impuesto sobre la Renta",
    flatTax: "Tasa fija",
    progressiveTax: "Tasa progresiva",
  },

  // Popular calculations
  popular: {
    title: "Calculos Populares de Sueldo",
    takeHomeApprox: "Sueldo neto ~",
    inState: "en TX",
  },

  // Browse by state
  browseStates: {
    title: "Buscar por Estado",
    subtitle: "Selecciona un estado para ver calculos de sueldo con tasas de impuesto especificas.",
  },

  // Relocating
  relocating: {
    title: "Pensando en Reubicarte?",
    subtitle: "Descubre que salario necesitarias en una nueva ciudad para mantener tu estilo de vida.",
    calculator: "Calculadora",
  },

  // Blog
  blog: {
    title: "Del Blog",
    viewAll: "Ver todo",
    minRead: "min de lectura",
    byLine: "Por SalaryHog",
    updated: "Actualizada para el ano fiscal 2025",
  },

  // FAQ
  faq: {
    title: "Preguntas Frecuentes",
    items: [
      {
        question: "Como se calcula el sueldo neto?",
        answer: "El sueldo neto se calcula restando todos los impuestos (federal, estatal, Seguro Social y Medicare) de tu sueldo bruto. Nuestra calculadora usa las tasas de impuestos federales y estatales de 2025 para darte un estimado preciso.",
      },
      {
        question: "Que impuestos se descuentan de mi cheque?",
        answer: "Los descuentos principales son: impuesto federal sobre la renta (10-37% dependiendo de tus ingresos), impuesto estatal sobre la renta (varia por estado, algunos no lo cobran), Seguro Social (6.2%), y Medicare (1.45%).",
      },
      {
        question: "Cuales estados no tienen impuesto sobre la renta?",
        answer: "Nueve estados no cobran impuesto estatal sobre la renta: Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington y Wyoming.",
      },
      {
        question: "Que tan precisa es esta calculadora?",
        answer: "Nuestra calculadora proporciona estimados basados en las tasas de impuestos federales y estatales de 2025. Tu sueldo neto real puede variar dependiendo de deducciones adicionales, impuestos locales, contribuciones antes de impuestos y otras circunstancias individuales.",
      },
      {
        question: "Cual es la diferencia entre sueldo bruto y neto?",
        answer: "El sueldo bruto es el total que ganas antes de cualquier deduccion. El sueldo neto es lo que realmente recibes en tu cuenta bancaria despues de que se descuentan todos los impuestos y deducciones.",
      },
    ],
  },

  // CTA
  cta: {
    calculateNow: "Calcula Ahora",
    readyToCalculate: "Listo para calcular tu sueldo neto?",
    seeFullBreakdown: "Ver desglose completo",
    viewAllStates: "Ver todos los estados",
  },

  // Footer
  footer: {
    tagline: "Calculadora gratuita de sueldo neto para los 50 estados.",
    popular: "Popular",
    states: "Estados",
    resources: "Recursos",
    disclaimer: "Esta calculadora proporciona estimados con fines informativos solamente. El sueldo neto real puede variar segun deducciones adicionales, impuestos locales, contribuciones antes de impuestos y circunstancias individuales. Esto no es asesoria fiscal. Consulta a un profesional de impuestos.",
    copyright: "2025 SalaryHog. Datos actualizados para el ano fiscal 2025.",
    privacyPolicy: "Politica de Privacidad",
    termsOfService: "Terminos de Servicio",
  },

  // Monetization block
  monetization: {
    title: "Formas de Quedarte con Mas de tu Sueldo",
    hysa: {
      title: "Abre una Cuenta de Ahorros de Alto Rendimiento",
      body: (tenPercent: string, interest: string) =>
        `Las mejores cuentas de ahorro pagan mas del 4.5% APY. Depositar solo el 10% de tu sueldo neto (${tenPercent}) genera ~${interest}/ano en intereses.`,
      cta: "Comparar Tasas de Ahorro",
    },
    retirement: {
      title: "Maximiza tu 401(k)",
      body: (match3: string, match6: string) =>
        `Si tu empleador iguala tu contribucion al 3-6%, estas dejando ${match3} a ${match6} en dinero gratis sobre la mesa cada ano. Ademas, las contribuciones reducen tu ingreso gravable.`,
      cta: "Aprende como el 401(k) afecta tu sueldo neto",
    },
    noTaxState: {
      title: "Considera un Estado Sin Impuesto sobre la Renta",
      body: (amount: string, stateName: string) =>
        `Estas pagando ${amount} en impuesto estatal en ${stateName} este ano. En un estado sin impuestos, te quedarias con todo.`,
    },
    alreadyNoTax: {
      title: "Estas en un Estado Sin Impuesto sobre la Renta!",
      body: (stateName: string) =>
        `${stateName} no tiene impuesto estatal sobre la renta — ya te estas quedando con mas que la mayoria. El impuesto estatal promedio te costaria $2,000-$5,000/ano adicionales con este salario.`,
      cta: "Leer: 9 Estados Sin Impuesto sobre la Renta",
    },
  },

  // SEO content for salary pages
  seo: {
    understandingTitle: (periodLabel: string, stateLabel: string) =>
      `Entendiendo Tu Sueldo de ${periodLabel}${stateLabel}`,
    hourlyExplanation: (amount: number, grossAnnual: string, stateName: string, takeHome: string, monthly: string) =>
      `A $${amount} por hora trabajando 40 horas a la semana, tu sueldo bruto anual es ${grossAnnual}. Despues de impuestos federales${stateName ? ` y de ${stateName}` : ''}, tu sueldo neto es aproximadamente ${takeHome} al ano, o ${monthly} al mes.`,
    annualExplanation: (amount: string, stateLabel: string, monthlyGross: string, takeHome: string, monthly: string) =>
      `Con un salario de ${amount} al ano${stateLabel}, tu ingreso bruto mensual es ${monthlyGross}. Despues de impuestos federales${stateLabel ? ' y estatales' : ''}, tu sueldo neto es aproximadamente ${takeHome} al ano, o ${monthly} al mes.`,
    taxBreakdownTitle: (stateName: string) => `Desglose de Impuestos de ${stateName}`,
    compareTitle: "Comparar Entre Estados",
    compareIntro: (periodLabel: string) =>
      `El mismo sueldo de ${periodLabel} te daria diferentes montos netos dependiendo de donde vivas:`,
    inYourState: "(tu estado)",
    noStateTax: "(sin impuesto estatal)",
    relatedTitle: "Calculos Relacionados",
    nearbyRates: "Tarifas por hora similares",
    nearbySalaries: "Salarios similares",
    inOtherStates: "en otros estados",
    viewAllState: (stateName: string) => `Ver todos los calculos de sueldo en ${stateName}`,
  },

  // State page
  statePage: {
    calculatorTitle: (stateName: string) => `Calculadora de Sueldo en ${stateName}`,
    commonSalaries: (stateName: string) => `Salarios Comunes en ${stateName}`,
    hourlyWages: "Sueldos por Hora",
    annualSalaries: "Salarios Anuales",
    rate: "Tarifa",
    salary: "Salario",
    annualGross: "Bruto Anual",
    takeHome: "Neto",
    monthlyTakeHome: "Neto Mensual",
    annualTakeHome: "Neto Anual",
    effRate: "Tasa Ef.",
    howTaxesWork: (stateName: string) => `Como Funcionan los Impuestos en ${stateName}`,
    noIncomeTaxDesc: (stateName: string) =>
      `${stateName} es uno de los nueve estados sin impuesto estatal sobre la renta. Los residentes solo pagan impuestos federales: impuesto federal sobre la renta (basado en las tablas del IRS), Seguro Social (6.2%) y Medicare (1.45%).`,
    noIncomeTaxCompare: (stateName: string) =>
      `Comparado con California — donde los que mas ganan pagan 13.3% de impuesto estatal — vivir en ${stateName} puede significar miles de dolares mas en sueldo neto cada ano. Con un salario de $75,000, la diferencia puede ser de mas de $3,000 anuales.`,
    flatTaxDesc: (stateName: string, rate: string) =>
      `${stateName} usa una tasa fija de impuesto sobre la renta de ${rate}% sobre todos los ingresos gravables. A diferencia de los estados progresivos, cada dolar se grava a la misma tasa independientemente de tu nivel de ingresos.`,
    flatTaxExtra: "Ademas, todos los residentes pagan impuesto federal sobre la renta, Seguro Social (6.2%) y Medicare (1.45%).",
    progressiveTaxDesc: (stateName: string) =>
      `${stateName} usa tablas progresivas de impuestos — los que mas ganan pagan una tasa marginal mas alta. Estas son las tablas de impuesto sobre la renta de ${stateName} para contribuyentes solteros:`,
    incomeRange: "Rango de Ingresos",
    taxRate: "Tasa de Impuesto",
    bracketNote: "Las tasas mostradas son marginales — solo pagas cada tasa sobre la porcion de ingresos dentro de ese rango. El Seguro Social (6.2%) y Medicare (1.45%) se aplican ademas de estas tasas.",
    compareToStates: (stateName: string) => `Comparar ${stateName} con Otros Estados`,
    compareSubtitle: "Sueldo neto con un salario de $60,000 (soltero, 2025)",
    current: "(actual)",
    compareWithOther: "Comparar con Otros Estados",
  },
};

// State names in Spanish (most identical, some differ)
export const stateNamesEs: Record<string, string> = {
  "alabama": "Alabama",
  "alaska": "Alaska",
  "arizona": "Arizona",
  "arkansas": "Arkansas",
  "california": "California",
  "colorado": "Colorado",
  "connecticut": "Connecticut",
  "delaware": "Delaware",
  "district-of-columbia": "Distrito de Columbia",
  "florida": "Florida",
  "georgia": "Georgia",
  "hawaii": "Hawaii",
  "idaho": "Idaho",
  "illinois": "Illinois",
  "indiana": "Indiana",
  "iowa": "Iowa",
  "kansas": "Kansas",
  "kentucky": "Kentucky",
  "louisiana": "Luisiana",
  "maine": "Maine",
  "maryland": "Maryland",
  "massachusetts": "Massachusetts",
  "michigan": "Michigan",
  "minnesota": "Minnesota",
  "mississippi": "Misisipi",
  "missouri": "Misuri",
  "montana": "Montana",
  "nebraska": "Nebraska",
  "nevada": "Nevada",
  "new-hampshire": "Nuevo Hampshire",
  "new-jersey": "Nueva Jersey",
  "new-mexico": "Nuevo Mexico",
  "new-york": "Nueva York",
  "north-carolina": "Carolina del Norte",
  "north-dakota": "Dakota del Norte",
  "ohio": "Ohio",
  "oklahoma": "Oklahoma",
  "oregon": "Oregon",
  "pennsylvania": "Pensilvania",
  "rhode-island": "Rhode Island",
  "south-carolina": "Carolina del Sur",
  "south-dakota": "Dakota del Sur",
  "tennessee": "Tennessee",
  "texas": "Texas",
  "utah": "Utah",
  "vermont": "Vermont",
  "virginia": "Virginia",
  "washington": "Washington",
  "west-virginia": "Virginia Occidental",
  "wisconsin": "Wisconsin",
  "wyoming": "Wyoming",
};
