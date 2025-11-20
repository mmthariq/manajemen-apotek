const getAllDrugs = async (req, res, next) => {
  try {
    // Mock data
    const mockDrugs = [
      { id: 1, nama: 'Paracetamol 500mg', deskripsi: 'Meredakan demam dan nyeri', harga: 5000, stok: 100, kategori: 'Analgesik', supplierId: 1 },
      { id: 2, nama: 'Amoxicillin 250mg', deskripsi: 'Antibiotik spektrum luas', harga: 15000, stok: 50, kategori: 'Antibiotik', supplierId: 2 },
    ];
    res.status(200).json({ message: 'Data semua obat berhasil diambil.', data: mockDrugs, query: req.query });
  } catch (error) {
    next(error);
  }
};

const createDrug = async (req, res, next) => {
  try {
    res.status(201).json({ message: 'Obat baru berhasil ditambahkan.', body: req.body });
  } catch (error) {
    next(error);
  }
};

const getDrugById = async (req, res, next) => {
  try {
    const { idObat } = req.params;
    // Mock data
    const mockDrug = { id: parseInt(idObat), nama: 'Paracetamol 500mg', deskripsi: 'Meredakan demam dan nyeri', harga: 5000, stok: 100, kategori: 'Analgesik', supplierId: 1 };
    if (mockDrug.id !== 1 && mockDrug.id !== 2) { // Assuming IDs 1 and 2 exist from getAllDrugs mock
      return res.status(404).json({ message: `Obat dengan ID ${idObat} tidak ditemukan.` });
    }
    res.status(200).json({ message: `Data obat dengan ID ${idObat} berhasil diambil.`, data: mockDrug });
  } catch (error) {
    next(error);
  }
};

const updateDrug = async (req, res, next) => {
  try {
    const { idObat } = req.params;
    const { nama, deskripsi, harga, stok, kategori, supplierId } = req.body;

    // Mock data - check if drug exists
    const existingDrug = [
      { id: 1, nama: 'Paracetamol 500mg', deskripsi: 'Meredakan demam dan nyeri', harga: 5000, stok: 100, kategori: 'Analgesik', supplierId: 1 },
      { id: 2, nama: 'Amoxicillin 250mg', deskripsi: 'Antibiotik spektrum luas', harga: 15000, stok: 50, kategori: 'Antibiotik', supplierId: 2 },
    ].find(drug => drug.id === parseInt(idObat));

    if (!existingDrug) {
      return res.status(404).json({ message: `Obat dengan ID ${idObat} tidak ditemukan.` });
    }

    // Mock updated drug
    const updatedDrugMock = {
      ...existingDrug,
      nama: nama || existingDrug.nama,
      deskripsi: deskripsi || existingDrug.deskripsi,
      harga: harga || existingDrug.harga,
      stok: stok || existingDrug.stok,
      kategori: kategori || existingDrug.kategori,
      supplierId: supplierId || existingDrug.supplierId,
      updatedAt: new Date().toISOString()
    };

    res.status(200).json({ message: `Data obat dengan ID ${idObat} berhasil diperbarui.`, data: updatedDrugMock });
  } catch (error) {
    next(error);
  }
};

const deleteDrug = async (req, res, next) => {
  try {
    const { idObat } = req.params;
    res.status(200).json({ message: `Obat dengan ID ${idObat} berhasil dihapus.` }); // Sebaiknya 204 jika tidak ada body, atau 200 dengan pesan sukses
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDrugs,
  createDrug,
  getDrugById,
  updateDrug,
  deleteDrug,
};