export function exportToCSV(data, columns, filename = 'export.csv') {
  if (!data || !data.length) return;

  // Montar o cabeçalho (Headers correspondentes a cada Key ou Title)
  const header = columns.map(col => `"${col.title.replace(/"/g, '""')}"`).join(';');

  // Extrair os dados na mesma ordem
  const rows = data.map(item => {
    return columns.map(col => {
      let val = '';
      if (typeof col.getValue === 'function') {
        val = col.getValue(item);
      } else if (item[col.key] !== undefined && item[col.key] !== null) {
        val = item[col.key];
      }
      
      // Sanitizar texto para CSV (adicionar aspas e escapar aspas duplas internas)
      const stringVal = String(val).replace(/"/g, '""');
      return `"${stringVal}"`;
    }).join(';');
  });

  // Somando o cabeçalho MAIS os dados
  const csvContent = [header, ...rows].join('\r\n');

  // Codificação necessária para caracteres acentuados funcionarem no Excel do Windows
  const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Criar o link fantasma para dar trigger no download do browser
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
