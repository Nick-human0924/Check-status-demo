export async function identityKey(name,suffix){
 const text=JSON.stringify([name.normalize('NFKC').trim(),suffix.normalize('NFKC').trim().toUpperCase()]);
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));
 return Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
}
export async function lookupRecords(data,name,suffix){
 return data[await identityKey(name,suffix)]||[];
}
