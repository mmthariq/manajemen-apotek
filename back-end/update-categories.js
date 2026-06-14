const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const drugs = [
  ['Meloxicam 15 mg', 'KERAS'],
  ['Methylprednisolone 4mg', 'KERAS'],
  ['Methylprednisolone 8mg', 'KERAS'],
  ['Methylprednisolone 16mg', 'KERAS'],
  ['Nifedipine 10mg', 'KERAS'],
  ['Piroxicam 10mg', 'KERAS'],
  ['Piroxicam 20mg', 'KERAS'],
  ['Propranolol 10mg', 'KERAS'],
  ['Pyrazinamide 500mg', 'KERAS'],
  ['Propylthiouracil 100mg', 'KERAS'],
  ['Spironolactone 100mg', 'KERAS'],
  ['Simvastatin 10mg', 'KERAS'],
  ['Simvastatin 20mg', 'KERAS'],
  ['Salbutamol 2mg', 'KERAS'],
  ['Salbutamol 4mg', 'KERAS'],
  ['Omeprazole', 'KERAS'],
  ['Ondansetron 4mg', 'KERAS'],
  ['Ondansetron 8mg', 'KERAS'],
  ['Rifampicin 450mg', 'KERAS'],
  ['Piracetam 400mg', 'KERAS'],
  ['Ranitidine', 'KERAS'],
  ['Diabetasol Vanilla 180gr', 'BEBAS'],
  ['Sari Kurma Sahara Original', 'BEBAS'],
  ['Cotrimoxazole', 'KERAS'],
  ['Digoxin', 'KERAS'],
  ['Doxycycline 100mg', 'KERAS'],
  ['Domperidone', 'KERAS'],
  ['Diclofenac Sodium', 'KERAS'],
  ['Furosemide', 'KERAS'],
  ['Glimepiride 1mg', 'KERAS'],
  ['Glimepiride 2mg', 'KERAS'],
  ['Glimepiride 3mg', 'KERAS'],
  ['Glimepiride 4mg', 'KERAS'],
  ['Glibenclamide', 'KERAS'],
  ['Ibuprofen 400mg', 'BEBAS_TERBATAS'],
  ['Ketoconazole 200mg', 'KERAS'],
  ['Lansoprazole', 'KERAS'],
  ['Levofloxacin 500mg', 'KERAS'],
  ['Metronidazole 500 mg', 'KERAS'],
  ['Metformin 500 mg', 'KERAS'],
  ['Diabetasol Gula isi 25', 'BEBAS'],
  ['Tropicana Slim isi 50', 'BEBAS'],
  ['Biolysin Multivitamin', 'BEBAS'],
  ['Cerebrofort Gold', 'BEBAS'],
  ['Sanmol Sirup', 'BEBAS'],
  ['Stimuno Original 60ml', 'BEBAS']
];
async function main() {
  for (const [name, cat] of drugs) {
    await pool.query('UPDATE "drugs" SET category = $1::"DrugCategory" WHERE name = $2', [cat, name]);
  }
  console.log('Categories updated successfully!');
  pool.end();
}
main();
