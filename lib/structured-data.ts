export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function webAppSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PayBreakdown Salary Calculator',
    url: 'https://paybreakdown.com',
    applicationCategory: 'FinanceApplication',
    description: 'Free salary and take-home pay calculator for all 50 states.',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PayBreakdown',
    url: 'https://paybreakdown.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://paybreakdown.com/salary/{search_term_string}-an-hour',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
