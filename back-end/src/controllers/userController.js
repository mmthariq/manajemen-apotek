const getAllUsers = async (req, res, next) => {
  try {
    // Mock data
    const mockUsers = [
      { id: 1, name: 'Lionel Messi', email: 'leomessi@example.com', role: 'admin' },
      { id: 2, name: 'Lamine Yamal', email: 'lyamal@example.com', role: 'kasir' },
    ];
    res.status(200).json({ message: 'Data semua pengguna berhasil diambil.', data: mockUsers, query: req.query });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    res.status(201).json({ message: 'Pengguna baru berhasil ditambahkan.', body: req.body });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { idUser } = req.params;
    // Mock data
    const mockUser = { id: parseInt(idUser), name: 'Lionel Messi', email: 'leomessi@example.com', role: 'admin' };
    if (mockUser.id !== 1 && mockUser.id !== 2) { // Assuming IDs 1 and 2 exist from getAllUsers mock
      return res.status(404).json({ message: `Pengguna dengan ID ${idUser} tidak ditemukan.` });
    }
    res.status(200).json({ message: `Data pengguna dengan ID ${idUser} berhasil diambil.`, data: mockUser });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { idUser } = req.params;
    const { name, email, role } = req.body;

    // Mock data - check if user exists
    const existingUser = [
      { id: 1, name: 'Lionel Messi', email: 'leomessi@example.com', role: 'admin' },
      { id: 2, name: 'Lamine Yamal', email: 'lyamal@example.com', role: 'kasir' },
    ].find(user => user.id === parseInt(idUser));

    if (!existingUser) {
      return res.status(404).json({ message: `Pengguna dengan ID ${idUser} tidak ditemukan.` });
    }

    // Mock updated user
    const updatedUserMock = {
      ...existingUser,
      name: name || existingUser.name,
      email: email || existingUser.email,
      role: role || existingUser.role,
      updatedAt: new Date().toISOString()
    };

    res.status(200).json({ message: `Data pengguna dengan ID ${idUser} berhasil diperbarui.`, data: updatedUserMock });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { idUser } = req.params;
    res.status(200).json({ message: `Pengguna dengan ID ${idUser} berhasil dihapus.` }); 
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};