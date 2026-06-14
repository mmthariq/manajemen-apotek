const fs = require('fs');

const files = [
  'front-end/src/pages/SupplierPage.jsx',
  'front-end/src/pages/ManajemenPengadaan.jsx',
  'front-end/src/pages/ManajemenObatRacikan.jsx',
  'front-end/src/pages/LaporanPenjualanKasir.jsx',
  'front-end/src/pages/TransaksiPenjualan.jsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) {
      console.log('Not found:', file);
      continue;
  }
  let content = fs.readFileSync(file, 'utf-8');
  if (content.includes('import Pagination')) {
      console.log('Skipping (already paginated):', file);
      continue;
  }

  // Find the exact name of the main array being mapped
  const tblMatch = content.match(/<tbody>[\s\S]*?{([a-zA-Z0-9_]+(\?\.)?[a-zA-Z0-9_]*)\.map\(/);
  
  if (!tblMatch) {
      console.log('No table map found in', file);
      continue;
  }
  
  // Clean up array name (e.g., filteredSuppliers or historyData)
  let rawArrayName = tblMatch[1]; // might be `filteredSuppliers`
  
  // special case for filteredSuppliers?.map
  if(rawArrayName.includes('?.') || rawArrayName.includes(')')) {
     const cleanMatch = content.match(/{([a-zA-Z0-9_]+)\.map\(/);
     if (cleanMatch) rawArrayName = cleanMatch[1];
  }
  
  const arrayName = rawArrayName.replace('?.', '');

  console.log(`Processing ${file} (Array target: ${arrayName})`);

  // add import
  content = content.replace(
    /(import React.*?;\n)/, 
    `$1import Pagination from '../components/Pagination';\n`
  );

  // find useState placement to inject currentPage
  content = content.replace(
    /(const \[.*?, set.*?\] = useState\(.*?\);\n)/,
    `$1  const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 10;\n`
  );

  // insert logic before return (
  content = content.replace(
    /(\s*)(return\s*\(\s*<div)/,
    `$1const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = (${arrayName} || []).slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((${arrayName} || []).length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);$1$2`
  );
  
  // replace array.map with currentItems.map
  // Needs to be robust. We only replace the exact match.
  content = content.replace(
    new RegExp(`{${arrayName}(\\?\\.)?\\.map\\(`, 'g'),
    `{currentItems.map(`
  );

  // inject Pagination component after </table>
  content = content.replace(
    /<\/table>\s*<\/div>/,
    `</table>\n          </div>\n          <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />`
  );

  fs.writeFileSync(file, content);
  console.log('Processed', file);
}
