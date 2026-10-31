let raw = '';
for await (const chunk of process.stdin) raw += chunk;
let report;
try { report = JSON.parse(raw); } catch { console.error('Auditoría incompleta: respuesta JSON inválida'); process.exit(2); }
if (report.error || !report.vulnerabilities || !report.metadata) {
  console.error('Auditoría incompleta: npm no devolvió resultados válidos');
  process.exit(2);
}
for (const [name, v] of Object.entries(report.vulnerabilities)) {
  const direct = (v.via || []).filter(x => typeof x === 'object').map(x => ({ title: x.title, url: x.url, range: x.range }));
  console.log(JSON.stringify({ name, severity: v.severity, isDirect: v.isDirect, range: v.range, nodes: v.nodes, fixAvailable: v.fixAvailable, via: v.via, directAdvisories: direct }));
}
console.log('TOTALS ' + JSON.stringify(report.metadata.vulnerabilities));
if (report.metadata.vulnerabilities.total > 0) process.exit(1);
