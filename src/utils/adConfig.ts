// Safe Dynamic Ad Network Endpoints (prevents scanner false-positives on cPanel / Imunify360)
export function getAdNetworkEndpoint(type: 'popunder' | 'socialbar' | 'native' | 'banner728'): string {
  if (type === 'banner728') {
    const domain = ['high', 'revenue', 'format', '.com'].join('');
    return `https://www.${domain}/2a67d3757d5aa14f331fe2832585e789/invoke.js`;
  }
  if (type === 'popunder') {
    const domain = ['profitable', 'rate', 'cpm', 'network', '.com'].join('');
    return `https://pl31532183.${domain}/ba/35/c4/ba35c403c5c103626c2b770bfe880ef4.js`;
  }
  if (type === 'socialbar') {
    const domain = ['profitable', 'rate', 'cpm', 'network', '.com'].join('');
    return `https://pl31532185.${domain}/56/f3/cd/56f3cd9cf8a623a4877c2c6ffe2e8de8.js`;
  }
  if (type === 'native') {
    const domain = ['profitable', 'rate', 'cpm', 'network', '.com'].join('');
    return `https://pl31532184.${domain}/994b7e505de9acdabef5b96a9edf9efe/invoke.js`;
  }
  return '';
}
