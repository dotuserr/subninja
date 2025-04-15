interface SubnetInfo {
  network: string;
  mask: string;
  firstHost: string;
  lastHost: string;
  broadcast: string;
  nextNetwork: string;
  totalHosts: number;
  cidr: number;
}

export function calculateSubnet(ipAddress: string, subnetMask?: string): SubnetInfo {
  // Séparer l'adresse IP et le CIDR si fourni au format IP/CIDR
  const [ip, cidrFromIp] = ipAddress.split('/');
  const cidr = cidrFromIp ? parseInt(cidrFromIp) : subnetMaskToCidr(subnetMask || '');

  if (!isValidIp(ip) || (cidr < 0 || cidr > 32)) {
    throw new Error('Format d\'adresse IP ou de masque invalide');
  }

  // Convertir l'IP en nombre binaire
  const ipBinary = ipToBinary(ip);
  
  // Calculer le masque en binaire
  const maskBinary = '1'.repeat(cidr) + '0'.repeat(32 - cidr);
  
  // Calculer l'adresse réseau
  const networkBinary = applyAnd(ipBinary, maskBinary);
  const network = binaryToIp(networkBinary);
  
  // Calculer l'adresse de broadcast
  const broadcastBinary = networkBinary.substring(0, cidr) + '1'.repeat(32 - cidr);
  const broadcast = binaryToIp(broadcastBinary);
  
  // Calculer la première et dernière adresse utilisable
  const firstHostBinary = addOneToBinary(networkBinary);
  const lastHostBinary = subtractOneFromBinary(broadcastBinary);
  
  // Calculer le prochain réseau (broadcast + 1)
  const nextNetworkBinary = addOneToBinary(broadcastBinary);
  
  // Calculer le nombre total d'hôtes utilisables
  const totalHosts = Math.pow(2, 32 - cidr) - 2;

  return {
    network,
    mask: cidrToSubnetMask(cidr),
    firstHost: binaryToIp(firstHostBinary),
    lastHost: binaryToIp(lastHostBinary),
    broadcast,
    nextNetwork: binaryToIp(nextNetworkBinary),
    totalHosts: totalHosts > 0 ? totalHosts : 0,
    cidr
  };
}

function isValidIp(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  
  return parts.every(part => {
    const num = parseInt(part);
    return !isNaN(num) && num >= 0 && num <= 255;
  });
}

function ipToBinary(ip: string): string {
  return ip.split('.')
    .map(num => parseInt(num).toString(2).padStart(8, '0'))
    .join('');
}

function binaryToIp(binary: string): string {
  return binary.match(/.{8}/g)!
    .map(bin => parseInt(bin, 2).toString())
    .join('.');
}

function applyAnd(bin1: string, bin2: string): string {
  let result = '';
  for (let i = 0; i < bin1.length; i++) {
    result += (bin1[i] === '1' && bin2[i] === '1') ? '1' : '0';
  }
  return result;
}

function addOneToBinary(binary: string): string {
  const num = parseInt(binary, 2) + 1;
  return num.toString(2).padStart(32, '0');
}

function subtractOneFromBinary(binary: string): string {
  const num = parseInt(binary, 2) - 1;
  return num.toString(2).padStart(32, '0');
}

function subnetMaskToCidr(subnetMask: string): number {
  if (!subnetMask) return 24; // Valeur par défaut
  return subnetMask.split('.')
    .map(num => parseInt(num).toString(2))
    .join('')
    .split('1').length - 1;
}

function cidrToSubnetMask(cidr: number): string {
  const binary = '1'.repeat(cidr) + '0'.repeat(32 - cidr);
  return binaryToIp(binary);
}

export function reverseSubnet(numHosts: number): number {
  // Calculer le CIDR nécessaire pour le nombre d'hôtes
  const hostBits = Math.ceil(Math.log2(numHosts + 2));
  return 32 - hostBits;
} 