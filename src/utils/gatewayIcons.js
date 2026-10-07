export const resolveGatewayIcon = (name = '', customIcon = '') => {
  if (customIcon && typeof customIcon === 'string' && (customIcon.startsWith('http') || customIcon.startsWith('/') || customIcon.startsWith('data:'))) {
    return customIcon;
  }
  const clean = String(name).toLowerCase().replace(/[\s\-_]+/g, '');
  if (clean.includes('easypaisa')) return '/easypaisa.png';
  if (clean.includes('jazzcash') || clean.includes('jazz')) return '/jazzcash.png';
  if (clean.includes('sadapay') || clean.includes('sada')) return '/sadapay.png';
  if (clean.includes('nayapay') || clean.includes('naya')) return '/nayapay.svg';
  if (clean.includes('bank') || clean.includes('ubl') || clean.includes('meezan') || clean.includes('hbl') || clean.includes('mcb') || clean.includes('allied') || clean.includes('faysal') || clean.includes('transfer')) return '/bank.svg';
  return '/bank.svg';
};
